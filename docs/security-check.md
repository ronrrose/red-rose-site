# Free Practice Security Check: how it works and what Ron needs to set

Page: `/free-security-check`. Linked from the homepage hero, `/dental` and the
footer. Add a link from `/security-reviews` when that page exists.

## What runs where

| Piece | Where | Notes |
|---|---|---|
| Website Exposure Scan | `lib/security-check/scan.ts`, `POST /api/security-check/scan` | Passive. GET of the homepage and its redirects, DNS TXT lookups. Nothing else |
| Exposed-files check (check 5) | `POST /api/security-check/full` | HEAD of `/.git/HEAD`, `/.env`, `/wp-config.php.bak` only, and only from the signed link emailed to an address at the scanned domain |
| SSRF fences | `lib/security-check/target.ts`, `ip.ts`, `safe-fetch.ts` | Bare public hostname only; every resolved address vetted; socket pinned to the vetted address; at most 3 redirects, each re-vetted; timeouts and byte caps |
| Shadow AI quiz | `lib/security-check/quiz.ts`, browser only | Answers leave the browser only if the visitor ticks the box to add them to the report |
| Wording | `lib/security-check/finding-library.ts` | Static, reviewed copy. No model call per scan |
| PDF | `lib/security-check/pdf.ts` | pdf-lib (MIT), built in the function. No PDF service |
| Emails | `lib/security-check/emails.ts` via Resend | Report to the visitor, alert to the inbox in `SECURITY_CHECK_ALERT_TO` |
| Storage | `lib/security-check/store.ts` | The CRM's existing Neon Postgres when migrated, memory otherwise |
| Follow-ups | `GET /api/cron/security-check-followups`, daily 14:00 UTC | Off until switched on (below) |

## 1. Storage (Ron)

The site already has an in-house CRM on Neon Postgres (`lib/db`, `/admin/crm`),
so the check uses that instead of adding Upstash. No new account or service.

1. If `DATABASE_URL` is not on the Vercel project yet: Vercel dashboard >
   redrosetechnologies-site > Storage > Create Database > Neon (free plan) >
   connect it to **Production and Preview**. Vercel adds `DATABASE_URL`.
2. Put the same connection string in `.env.local` (gitignored) and run:

   ```
   npm run migrate
   ```

   Expect `applied 0002_security_check.sql` (and `0001_init.sql` if the CRM
   was never migrated).

Until both are done, the check still works: rate limits are held in memory per
server instance (best effort), and every scan's authorization record and every
lead is emailed in full so nothing is lost.

## 2. Environment variables (Ron, Vercel > Settings > Environment Variables)

| Variable | Needed for | Value |
|---|---|---|
| `SECURITY_CHECK_ALERT_TO` | Lead alerts | The inbox that should get leads. Until set, alerts go to the public contact inbox |
| `RESEND_API_KEY` | All email | Already set on Production. Add to Preview to test emails on a preview |
| `SECURITY_CHECK_SECRET` | Signed links | Optional. Any random 32+ characters. Without it, a key is derived from `ADMIN_SESSION_SECRET` or `CRON_SECRET` |
| `SECURITY_CHECK_POSTAL_ADDRESS` | Day 3 and day 7 emails | A real mailing address, a PO box is fine. Required by CAN-SPAM |
| `SECURITY_CHECK_FOLLOWUPS_ENABLED` | Day 3 and day 7 emails | `true` to switch them on, only after the postal address is set |
| `CRON_SECRET` | Cron auth | Already used by the Quo reconcile cron |

## 3. Follow-up emails

Day 0 is the report the visitor asked for. Days 3 and 7 are marketing email:
each carries the postal address, a "this is a marketing email" line, a working
unsubscribe link and RFC 8058 one-click unsubscribe headers.

They are scheduled with **Vercel Cron**, not Resend scheduled sends: the cron
reads the unsubscribe state, the on/off switch and the postal address on the
day it sends, so an unsubscribe is always honoured and nothing sits queued at
Resend that would need cancelling. It needs the database.

## 4. Copy approval (Ron)

Read and approve, or edit:

- every entry in `lib/security-check/finding-library.ts`
- the quiz answer options, points and risk explanations in `lib/security-check/quiz.ts`
- the `/dental` page and the `/free-security-check` page

To redraft the finding library with Claude, run
`ANTHROPIC_API_KEY=... node scripts/generate-finding-library.mjs > draft.json`.
It prints a draft and writes nothing.

## 5. Rose Standard kit

- `scripts/rose_gate_scan.py` and `scripts/rose_fast_index.py` are byte-identical
  to the kit. Run Python with `-I`.
- Fast Index is off until these are set in GitHub > Settings > Secrets and
  variables > Actions:
  - secret `INDEXNOW_KEY`: the key already published at
    `/0d855a4472bb486aabe5c6488d6c4937.txt` (the same value as `INDEXNOW_KEY` in
    `lib/site-config.ts`; it is public by design)
  - variable `SITE_URL`: `https://www.redrosetechnologies.com`
  - variable `ROSE_DOMAINS`: `redrosetechnologies.com` (nightly gate scan)
  - variable `FAST_INDEX_ENABLED`: `true`. While it is `true`, the older
    `indexnow.yml` stands down so URLs are not submitted twice.
