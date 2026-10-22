import { requireDb } from "@/lib/db/client";

/** Row shapes. Hand-written rather than generated: six tables does not need a codegen step. */

export type ContactRow = {
  id: string;
  name: string | null;
  phone_e164: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  source: string;
  source_url: string | null;
  status: string;
  owner: string | null;
  consent_sms: boolean;
  consent_text: string | null;
  consent_at: string | null;
  consent_ip: string | null;
  do_not_contact: boolean;
  quo_contact_id: string | null;
  quo_sync: string;
  quo_synced_at: string | null;
  quo_sync_error: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityRow = {
  id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: string;
  direction: string | null;
  occurred_at: string;
  duration_s: number | null;
  summary: string | null;
  quo_event_id: string | null;
};

export type DealRow = {
  id: string;
  contact_id: string | null;
  stage: string;
  value_monthly: string | null;
  value_onetime: string | null;
  service_line: string | null;
  expected_close: string | null;
};

/**
 * Find an existing contact by phone, then by email.
 *
 * Order matters and is the dedupe rule: phone first because it is the
 * stronger identity signal and the channel calls and texts arrive on.
 */
export async function findContact(
  phoneE164: string | null,
  email: string | null
): Promise<ContactRow | null> {
  const db = requireDb();

  if (phoneE164) {
    const byPhone = (await db.query(
      "SELECT * FROM contacts WHERE phone_e164 = $1 LIMIT 1",
      [phoneE164]
    )) as ContactRow[];
    if (byPhone.length > 0) return byPhone[0];
  }

  if (email) {
    const byEmail = (await db.query(
      "SELECT * FROM contacts WHERE lower(email) = lower($1) LIMIT 1",
      [email]
    )) as ContactRow[];
    if (byEmail.length > 0) return byEmail[0];
  }

  return null;
}

export type UpsertContactFields = {
  name: string | null;
  phoneE164: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  source: string;
  sourceUrl: string | null;
  consentSms: boolean;
  consentText: string | null;
  consentIp: string | null;
};

/**
 * Insert or merge a contact and return the stored row.
 *
 * COALESCE on update rather than overwrite: a later submission that omits a
 * field must not erase what an earlier one told us. The exception is consent,
 * which only ever moves from false to true and records when and from where.
 */
export type UpsertResult = { contact: ContactRow; created: boolean };

export async function upsertContact(fields: UpsertContactFields): Promise<UpsertResult> {
  const db = requireDb();
  const existing = await findContact(fields.phoneE164, fields.email);

  if (existing) {
    const rows = (await db.query(
      `UPDATE contacts SET
         name        = COALESCE($2, name),
         phone_e164  = COALESCE(phone_e164, $3),
         email       = COALESCE(email, $4),
         company     = COALESCE($5, company),
         role        = COALESCE($6, role),
         source_url  = COALESCE(source_url, $7),
         consent_sms  = contacts.consent_sms OR $8,
         consent_text = CASE WHEN $8 AND NOT contacts.consent_sms THEN $9  ELSE contacts.consent_text END,
         consent_at   = CASE WHEN $8 AND NOT contacts.consent_sms THEN now() ELSE contacts.consent_at END,
         consent_ip   = CASE WHEN $8 AND NOT contacts.consent_sms THEN $10 ELSE contacts.consent_ip END,
         updated_at  = now()
       WHERE id = $1
       RETURNING *`,
      [
        existing.id,
        fields.name,
        fields.phoneE164,
        fields.email,
        fields.company,
        fields.role,
        fields.sourceUrl,
        fields.consentSms,
        fields.consentText,
        fields.consentIp,
      ]
    )) as ContactRow[];
    return { contact: rows[0], created: false };
  }

  const rows = (await db.query(
    `INSERT INTO contacts
       (name, phone_e164, email, company, role, source, source_url,
        consent_sms, consent_text, consent_at, consent_ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,
             CASE WHEN $8 THEN now() ELSE NULL END, $10)
     RETURNING *`,
    [
      fields.name,
      fields.phoneE164,
      fields.email,
      fields.company,
      fields.role,
      fields.source,
      fields.sourceUrl,
      fields.consentSms,
      fields.consentText,
      fields.consentIp,
    ]
  )) as ContactRow[];
  return { contact: rows[0], created: true };
}

/**
 * Record an activity, ignoring a repeat of one we already have.
 *
 * ON CONFLICT on quo_event_id is the idempotency guarantee for webhooks:
 * a redelivery inserts nothing and returns no row.
 */
export async function insertActivity(input: {
  contactId: string | null;
  type: string;
  direction: string | null;
  occurredAt: string | null;
  durationS: number | null;
  summary: string | null;
  quoEventId: string | null;
  raw: unknown;
}): Promise<ActivityRow | null> {
  const db = requireDb();
  const rows = (await db.query(
    `INSERT INTO activities
       (contact_id, type, direction, occurred_at, duration_s, summary, quo_event_id, raw)
     VALUES ($1,$2,$3,COALESCE($4::timestamptz, now()),$5,$6,$7,$8)
     ON CONFLICT (quo_event_id) DO NOTHING
     RETURNING *`,
    [
      input.contactId,
      input.type,
      input.direction,
      input.occurredAt,
      input.durationS,
      input.summary,
      input.quoEventId,
      JSON.stringify(input.raw ?? null),
    ]
  )) as ActivityRow[];
  return rows[0] ?? null;
}

export async function markQuoSynced(
  contactId: string,
  quoContactId: string
): Promise<void> {
  const db = requireDb();
  await db.query(
    `UPDATE contacts
        SET quo_contact_id = $2, quo_sync = 'ok',
            quo_sync_error = NULL, quo_synced_at = now(), updated_at = now()
      WHERE id = $1`,
    [contactId, quoContactId]
  );
}

export async function markQuoFailed(contactId: string, error: string): Promise<void> {
  const db = requireDb();
  await db.query(
    `UPDATE contacts
        SET quo_sync = 'failed', quo_sync_error = $2, updated_at = now()
      WHERE id = $1`,
    [contactId, error.slice(0, 500)]
  );
}

export async function setDoNotContact(phoneE164: string): Promise<void> {
  const db = requireDb();
  await db.query(
    `UPDATE contacts
        SET do_not_contact = TRUE, consent_sms = FALSE, updated_at = now()
      WHERE phone_e164 = $1`,
    [phoneE164]
  );
}

/**
 * Claim the right to send one SMS of a given kind to a contact.
 *
 * Returns false if a row already exists, which is what stops a duplicate
 * confirmation text when createLead runs twice for the same person. The
 * unique constraint, not a prior SELECT, is what makes this safe under
 * concurrent requests.
 */
export async function claimSmsSend(
  contactId: string,
  kind: string,
  phoneE164: string
): Promise<boolean> {
  const db = requireDb();
  const rows = (await db.query(
    `INSERT INTO sms_sends (contact_id, kind, phone_e164)
     VALUES ($1,$2,$3)
     ON CONFLICT (contact_id, kind) DO NOTHING
     RETURNING id`,
    [contactId, kind, phoneE164]
  )) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function recordSmsMessageId(
  contactId: string,
  kind: string,
  messageId: string
): Promise<void> {
  const db = requireDb();
  await db.query(
    "UPDATE sms_sends SET quo_message_id = $3 WHERE contact_id = $1 AND kind = $2",
    [contactId, kind, messageId]
  );
}

/** Release a claimed send after a failure, so a retry can try again. */
export async function releaseSmsSend(contactId: string, kind: string): Promise<void> {
  const db = requireDb();
  await db.query(
    "DELETE FROM sms_sends WHERE contact_id = $1 AND kind = $2 AND quo_message_id IS NULL",
    [contactId, kind]
  );
}

export async function logEvent(input: {
  source: string;
  payload: unknown;
  error?: string | null;
  processed?: boolean;
}): Promise<void> {
  const db = requireDb();
  await db.query(
    `INSERT INTO events_log (source, payload, processed_at, error)
     VALUES ($1, $2, CASE WHEN $3 THEN now() ELSE NULL END, $4)`,
    [
      input.source,
      JSON.stringify(input.payload ?? null),
      input.processed ?? false,
      input.error ?? null,
    ]
  );
}

/** True when this delivery has already been recorded. */
export async function hasProcessedDelivery(deliveryId: string): Promise<boolean> {
  const db = requireDb();
  const rows = (await db.query(
    "SELECT 1 FROM activities WHERE quo_event_id = $1 LIMIT 1",
    [deliveryId]
  )) as unknown[];
  return rows.length > 0;
}

/* ── Admin reads ──────────────────────────────────────────────────────── */

export async function listRecentContacts(limit = 100): Promise<ContactRow[]> {
  const db = requireDb();
  return (await db.query(
    "SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1",
    [limit]
  )) as ContactRow[];
}

export async function getContact(id: string): Promise<ContactRow | null> {
  const db = requireDb();
  const rows = (await db.query("SELECT * FROM contacts WHERE id = $1", [
    id,
  ])) as ContactRow[];
  return rows[0] ?? null;
}

export async function listActivitiesForContact(contactId: string): Promise<ActivityRow[]> {
  const db = requireDb();
  return (await db.query(
    `SELECT id, contact_id, deal_id, type, direction, occurred_at,
            duration_s, summary, quo_event_id
       FROM activities WHERE contact_id = $1
      ORDER BY occurred_at DESC LIMIT 200`,
    [contactId]
  )) as ActivityRow[];
}

export type PipelineStage = {
  stage: string;
  deal_count: number;
  monthly_total: string | null;
};

export async function pipelineByStage(): Promise<PipelineStage[]> {
  const db = requireDb();
  return (await db.query(
    `SELECT stage,
            COUNT(*)::int        AS deal_count,
            SUM(value_monthly)   AS monthly_total
       FROM deals
      GROUP BY stage
      ORDER BY stage`
  )) as PipelineStage[];
}

export async function countsBySyncState(): Promise<Array<{ quo_sync: string; n: number }>> {
  const db = requireDb();
  return (await db.query(
    "SELECT quo_sync, COUNT(*)::int AS n FROM contacts GROUP BY quo_sync"
  )) as Array<{ quo_sync: string; n: number }>;
}

/** Contacts whose Quo mirror failed, for the reconciliation job to retry. */
export async function listUnsyncedContacts(limit = 25): Promise<ContactRow[]> {
  const db = requireDb();
  return (await db.query(
    `SELECT * FROM contacts
      WHERE quo_sync <> 'ok'
      ORDER BY created_at ASC
      LIMIT $1`,
    [limit]
  )) as ContactRow[];
}
