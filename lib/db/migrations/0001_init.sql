-- CRM schema. Our database is the source of truth for leads; Quo is a
-- downstream mirror that may be out of date or temporarily unreachable.

CREATE TABLE IF NOT EXISTS companies (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  industry       TEXT,
  size           TEXT,
  software_stack TEXT,
  address        TEXT,
  website        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT,
  phone_e164     TEXT,
  email          TEXT,
  company        TEXT,
  company_id     BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  role           TEXT,
  source         TEXT NOT NULL,
  source_url     TEXT,
  status         TEXT NOT NULL DEFAULT 'new',
  owner          TEXT,
  -- SMS consent, captured verbatim so we can prove what was agreed to.
  consent_sms    BOOLEAN NOT NULL DEFAULT FALSE,
  consent_text   TEXT,
  consent_at     TIMESTAMPTZ,
  consent_ip     TEXT,
  do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
  -- Mirror state for Quo. 'failed' means the lead is safe here but absent there.
  quo_contact_id TEXT,
  quo_sync       TEXT NOT NULL DEFAULT 'pending',
  quo_synced_at  TIMESTAMPTZ,
  quo_sync_error TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dedupe keys. Partial unique indexes so multiple contacts may have a NULL
-- phone or email without colliding with each other.
CREATE UNIQUE INDEX IF NOT EXISTS contacts_phone_key
  ON contacts (phone_e164) WHERE phone_e164 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_key
  ON contacts (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_created_idx ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_status_idx  ON contacts (status);
CREATE INDEX IF NOT EXISTS contacts_quo_sync_idx ON contacts (quo_sync)
  WHERE quo_sync <> 'ok';

CREATE TABLE IF NOT EXISTS deals (
  id              BIGSERIAL PRIMARY KEY,
  contact_id      BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  company_id      BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  stage           TEXT NOT NULL DEFAULT 'new',
  value_monthly   NUMERIC(12,2),
  value_onetime   NUMERIC(12,2),
  service_line    TEXT,
  expected_close  DATE,
  lost_reason     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deals_stage_idx   ON deals (stage);
CREATE INDEX IF NOT EXISTS deals_contact_idx ON deals (contact_id);

CREATE TABLE IF NOT EXISTS activities (
  id           BIGSERIAL PRIMARY KEY,
  contact_id   BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id      BIGINT REFERENCES deals(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('call','text','email','form','chat','note','task')),
  direction    TEXT CHECK (direction IN ('inbound','outbound')),
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_s   INTEGER,
  summary      TEXT,
  -- Quo's per-delivery id (the webhook-id header), which is what makes a
  -- redelivery a no-op. The envelope's own id is the event id and is shared
  -- across every subscription, so it cannot be the idempotency key.
  quo_event_id TEXT UNIQUE,
  raw          JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activities_contact_idx  ON activities (contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS activities_occurred_idx ON activities (occurred_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id         BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id    BIGINT REFERENCES deals(id) ON DELETE SET NULL,
  due_at     TIMESTAMPTZ,
  title      TEXT NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_due_idx ON tasks (due_at) WHERE done = FALSE;

CREATE TABLE IF NOT EXISTS events_log (
  id           BIGSERIAL PRIMARY KEY,
  source       TEXT NOT NULL,
  payload      JSONB,
  processed_at TIMESTAMPTZ,
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_log_created_idx ON events_log (created_at DESC);
CREATE INDEX IF NOT EXISTS events_log_error_idx   ON events_log (created_at DESC)
  WHERE error IS NOT NULL;

-- One outbound SMS per lead, ever. A unique row here is what makes the
-- confirmation text un-repeatable even if createLead runs twice.
CREATE TABLE IF NOT EXISTS sms_sends (
  id          BIGSERIAL PRIMARY KEY,
  contact_id  BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  phone_e164  TEXT NOT NULL,
  quo_message_id TEXT,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, kind)
);
