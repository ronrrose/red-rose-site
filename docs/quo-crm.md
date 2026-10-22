# Quo integration and CRM

How the lead pipeline works, what you have to set up by hand, and how to test
it safely with texting switched off.

## The shape of it

Every lead source funnels through one function, `createLead` in
`lib/leads/create-lead.ts`:

```
website form  ─┐
AI chat       ─┤
inbound call  ─┼──>  createLead()  ──>  Postgres (source of truth)
inbound text  ─┘                          │
                                          └─>  Quo mirror (background)
                                                 └─>  one confirmation text
                                                      (three gates, below)
```

The order is deliberate. The lead lands in our own database and the visitor
gets their response immediately; the Quo work happens afterwards via
`waitUntil`. If Quo is down, the lead is still captured and marked
`quo_sync = 'failed'`, and the daily reconciliation job retries it. A lead is
never lost because a third party had a bad afternoon.

## Which Quo API

Two versions are live and we use both on purpose.

| What | Version | Why |
| --- | --- | --- |
| Contacts, notes, properties, calls, webhooks, A2P status | `2026-03-30` | Only version with first-class notes, typed properties, a unified webhook endpoint, and a readable 10DLC status |
| Sending a text message | `v1` | `POST /v1/messages` is the only send endpoint Quo exposes; the dated version can list, read and retry messages but cannot create one |

Base URL is `https://api.quo.com`. Requests send `Authorization: <key>` with
**no** `Bearer` prefix, plus `Quo-Api-Version: 2026-03-30` on the dated API.
Rate limit is 10 requests per second per key; `lib/quo/client.ts` queues to
stay under it and backs off on 429.

### Dedupe note

`GET /contacts` cannot be filtered by phone number or email. The only filters
are `externalId` and `source`. So every contact we create carries
`externalId` set to our canonical key (the E.164 phone, or `email:<address>`
when there is no phone) and `source = "redrose-site"`. Looking a lead up in
Quo is then one exact request rather than a scan of the workspace.

## Manual setup

### 1. Database

In the Vercel dashboard, go to **Storage > Create Database > Neon** and pick
the free tier. The integration sets `DATABASE_URL` on the Vercel project for
you; add it to Preview as well as Production if you want the CRM working on
preview deployments.

To apply the schema you need that connection string locally. Copy it from the
Neon or Vercel storage panel and put it in `.env.local`, which is gitignored:

```
echo 'DATABASE_URL=the-connection-string-you-copied' >> .env.local
```

Then:

```
npm run migrate
```

That takes no arguments on purpose. A connection string passed on the command
line ends up in shell history, and a documented command containing a
placeholder is a command someone eventually runs with the placeholder still in
it. The script refuses anything placeholder-shaped and tells you what is
wrong rather than failing inside the database driver.

Expect `applied 0001_init.sql`. Running it again prints `skip 0001_init.sql`,
since migrations are recorded in a `schema_migrations` table.

### 2. Register the webhook

Either in the Quo UI (Workspace Settings > Webhooks) or via the API. The URL is:

```
https://www.redrosetechnologies.com/api/webhooks/quo
```

Subscribe to exactly these events:

- `message.received`
- `call.completed`
- `call.missed`
- `call.voicemail.completed`
- `call.summary.completed` (Business/Scale plans only; on a lower plan the
  event simply never arrives and nothing breaks)
- `contact.updated`

Via the API, pinning the payload version at creation:

```
curl -X POST https://api.quo.com/webhooks \
  -H "Authorization: $QUO_API_KEY" \
  -H "Quo-Api-Version: 2026-03-30" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.redrosetechnologies.com/api/webhooks/quo",
    "label": "redrose-site-crm",
    "events": ["message.received","call.completed","call.missed",
               "call.voicemail.completed","call.summary.completed","contact.updated"]
  }'
```

**Copy the `key` from the response** (it looks like `whsec_...`) and set it as
`QUO_WEBHOOK_SECRET` in Vercel. Store it exactly as returned: do not trim,
rewrap or lowercase it. Without it, the handler rejects every delivery with
401, which is the correct fail-closed behaviour.

### 3. Admin login

```
node scripts/hash-password.mjs      # prompts for a password, prints the hash
openssl rand -base64 32             # the session secret
```

Set `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` in Vercel. The CRM is at
`/admin/crm`, gated in `middleware.ts`.

### 4. Cron secret

Set `CRON_SECRET` to a random string. Vercel sends it as a Bearer token to
`/api/cron/quo-reconcile`, which runs daily at 09:00 UTC.

### 5. A2P 10DLC, before any texting

US carriers require a registered campaign before an application sends SMS to
US numbers. Red Rose's registration shows "Register now" in Quo's Trust
Center, which means it is not complete.

Complete it in Quo, then confirm it reads approved:

```
curl https://api.quo.com/a2p-registration \
  -H "Authorization: $QUO_API_KEY" \
  -H "Quo-Api-Version: 2026-03-30"
```

`/admin/crm` also shows this status on the dashboard.

### 6. Only then, enable texting

Set `SMS_CONFIRMATIONS_ENABLED=true`. Leave it unset or `false` until
registration is approved.

## The three SMS gates

A confirmation text is sent only when **all three** hold:

1. `SMS_CONFIRMATIONS_ENABLED === "true"`
2. The lead ticked the consent checkbox on the form
3. `GET /a2p-registration` reports `status: "approved"`

Gate 3 is checked in code, not just trusted to the flag, because the flag is a
human decision and carrier registration is a fact. Sending into an
unregistered campaign gets filtered, not delivered.

Exactly one message is ever sent, enforced by a unique row in `sms_sends`
claimed before the send. There are no sequences, no follow-ups, and no
missed-call auto-replies anywhere in this codebase. Inbound `STOP` sets
`do_not_contact`, which is checked before every send.

The message, and the only outbound SMS body in the codebase:

> Hi {first name}, this is Red Rose Technologies. We got your request and
> someone from our team will call you. Reply STOP to opt out.

## Idempotency

The key is the `webhook-id` **header**, not the envelope's `id`. The envelope
`id` identifies the event and is identical across every subscription that
receives it; `webhook-id` is per delivery and stable across retries of that
delivery. It is stored in `activities.quo_event_id`, which is `UNIQUE`, so a
redelivery inserts nothing.

Quo retries any non-2xx response 8 times over roughly 27.5 hours, so the
handler answers 200 immediately and processes in `waitUntil`. A slow database
must not turn into a retry storm.

## Live test plan, with SMS off

Confirm `SMS_CONFIRMATIONS_ENABLED` is unset or `false` before starting. With
the flag off, nothing can text anyone regardless of what you submit.

1. **Signature rejection.** Post an unsigned body and expect 401:

   ```
   curl -i -X POST https://www.redrosetechnologies.com/api/webhooks/quo \
     -H "Content-Type: application/json" -d '{"type":"message.received"}'
   ```

2. **Signed delivery.** Send a real signed test event from Quo:

   ```
   curl -X POST "https://api.quo.com/webhooks/$WEBHOOK_ID/events/test" \
     -H "Authorization: $QUO_API_KEY" \
     -H "Quo-Api-Version: 2026-03-30" \
     -H "Content-Type: application/json" \
     -d '{"type":"message.received"}'
   ```

   Then check `/admin/crm/leads` for the new row, and
   `/webhooks/$WEBHOOK_ID/events` for the delivery's response status.

3. **Throwaway form lead.** Submit the contact form with a number you control,
   **leaving the SMS consent box unticked**. Expect: a row in the lead inbox
   with source "Website form" and SMS "No"; a contact in Quo carrying the
   phone, the email and a note with the source, page, UTMs and consent state;
   no text message.

4. **Consent recorded, still no text.** Submit again with the same number and
   the box ticked. Expect: the same lead row, not a second one (dedupe by
   phone), now showing "Consented" with the exact wording and timestamp on the
   contact page. Still no text, because the flag is off.

5. **Inbound call.** Call +1 941 206-4709 from a number not in the CRM and
   hang up. Expect a new lead with source "Call or text" and a call entry on
   its timeline. Confirm no automatic reply was sent.

6. **Inbound text and opt-out.** Text the business number, then text `STOP`.
   Expect the lead's timeline to show both, and the contact page to show
   "Opted out of text messages".

7. **Chat capture.** Open the site chat, describe a problem, and give a name
   and phone number. Expect a lead with source "AI chat" and an AI-written
   summary. Confirm the closing line is "Someone from our team will call you."
   and that no booking link was offered.

8. **Reconciliation.** Trigger the cron by hand:

   ```
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://www.redrosetechnologies.com/api/cron/quo-reconcile
   ```

   Expect a JSON report. Re-run it: `activitiesAdded` should be 0 the second
   time, which is the idempotency key doing its job.

Only after all of that, and only once A2P reads approved, set
`SMS_CONFIRMATIONS_ENABLED=true` and repeat step 4 with your own number to see
the single confirmation text.
