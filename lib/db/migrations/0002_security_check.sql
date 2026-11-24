-- Free Practice Security Check.
--
-- Scans hold the authorization record (timestamp, IP, domain and the exact
-- checkbox wording) next to the public result, so every scan Red Rose ran can
-- be shown to have been asked for. No patient data is ever stored here: the
-- quiz holds answer ids only, and the lead holds who asked for the report.

CREATE TABLE IF NOT EXISTS security_check_scans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host                   TEXT NOT NULL,
  domain                 TEXT NOT NULL,  -- registrable domain: the per-day limit key
  ip                     TEXT,
  user_agent             TEXT,
  authorization_text     TEXT NOT NULL,
  authorization_version  TEXT NOT NULL,
  authorized_at          TIMESTAMPTZ NOT NULL,
  exposed_files_checked  BOOLEAN NOT NULL DEFAULT FALSE,
  score                  INTEGER NOT NULL,
  grade                  TEXT NOT NULL,
  result                 JSONB NOT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_check_scans_domain_idx ON security_check_scans (domain, created_at DESC);
CREATE INDEX IF NOT EXISTS security_check_scans_ip_idx     ON security_check_scans (ip, created_at DESC);

-- Every rate-limited attempt, allowed or not. Counting rows in a window is
-- what makes the limit hold across serverless instances.
CREATE TABLE IF NOT EXISTS security_check_attempts (
  id          BIGSERIAL PRIMARY KEY,
  bucket      TEXT NOT NULL,
  key         TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_check_attempts_idx ON security_check_attempts (bucket, key, created_at DESC);

-- One row per domain and kind. Claimed with a single conditional upsert, so
-- two simultaneous requests cannot both win the 24 hour slot.
CREATE TABLE IF NOT EXISTS security_check_domain_slots (
  domain      TEXT NOT NULL,
  kind        TEXT NOT NULL,
  claimed_at  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (domain, kind)
);

CREATE TABLE IF NOT EXISTS security_check_leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id          UUID REFERENCES security_check_scans(id) ON DELETE SET NULL,
  contact_id       BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  practice         TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  role             TEXT,
  quiz             JSONB,
  ip               TEXT,
  report_sent_at   TIMESTAMPTZ,
  day3_sent_at     TIMESTAMPTZ,
  day7_sent_at     TIMESTAMPTZ,
  unsubscribed_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_check_leads_due_idx ON security_check_leads (created_at)
  WHERE unsubscribed_at IS NULL AND (day3_sent_at IS NULL OR day7_sent_at IS NULL);
