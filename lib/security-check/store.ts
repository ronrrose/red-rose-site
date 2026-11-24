import { getDb } from "@/lib/db/client";
import type { ScanResult } from "@/lib/security-check/types";
import type { QuizAnswers } from "@/lib/security-check/quiz";

/**
 * Where the Security Check keeps scans, authorizations, rate limits and leads.
 *
 * Two implementations behind one interface:
 *   - postgres: the CRM's existing Neon database (DATABASE_URL), tables from
 *     lib/db/migrations/0002_security_check.sql. Limits hold across every
 *     serverless instance. This is the real one.
 *   - memory: used when there is no database or the tables are not migrated
 *     yet. Limits hold only within one instance, so they are best effort,
 *     and the route emails Ron the full record so nothing is lost.
 *
 * If the database cannot be reached when the store is chosen, memory is used
 * and the reason is logged. An error during a call fails that one request
 * with a calm message; it never falls through to "no limit".
 */

export type NewScan = {
  host: string;
  domain: string;
  ip: string | null;
  userAgent: string | null;
  authorizationText: string;
  authorizationVersion: string;
  authorizedAt: Date;
  result: ScanResult;
};

export type StoredScan = NewScan & { id: string; createdAt: Date };

export type NewLead = {
  scanId: string | null;
  contactId: string | null;
  name: string;
  practice: string;
  email: string;
  phone: string | null;
  role: string | null;
  quiz: QuizAnswers | null;
  ip: string | null;
  /** True only when the email is at the scanned domain. */
  followupsOk: boolean;
};

export type StoredLead = NewLead & {
  id: string;
  createdAt: Date;
  day3SentAt: Date | null;
  day7SentAt: Date | null;
  unsubscribedAt: Date | null;
};

export type SlotResult = { allowed: boolean; retryAfterSeconds: number };

export interface SecurityCheckStore {
  readonly kind: "postgres" | "memory";
  /** Record an attempt in a bucket, then say whether it is within `max` per window. */
  takeSlot(bucket: string, key: string, max: number, windowMs: number, now?: Date): Promise<SlotResult>;
  /** Claim the once-per-window slot for a domain. False if already claimed inside the window. */
  claimDomain(domain: string, kind: "scan", windowMs: number, now?: Date): Promise<boolean>;
  releaseDomain(domain: string, kind: "scan"): Promise<void>;
  saveScan(scan: NewScan): Promise<string>;
  updateScanResult(id: string, result: ScanResult): Promise<void>;
  getScan(id: string): Promise<StoredScan | null>;
  latestScan(domain: string, withinMs: number, now?: Date): Promise<StoredScan | null>;
  saveLead(lead: NewLead): Promise<string>;
  markReportSent(leadId: string): Promise<void>;
  getLead(id: string): Promise<StoredLead | null>;
  markUnsubscribed(leadId: string): Promise<boolean>;
  /** Add an address to the suppression list. Idempotent. */
  suppress(email: string, source: string): Promise<void>;
  isSuppressed(email: string): Promise<boolean>;
  dueFollowups(now?: Date): Promise<Array<{ lead: StoredLead; day: 3 | 7 }>>;
  markFollowupSent(leadId: string, day: 3 | 7): Promise<void>;
}

/* ── Memory ─────────────────────────────────────────────────────────────── */

export class MemoryStore implements SecurityCheckStore {
  readonly kind = "memory" as const;
  private attempts = new Map<string, number[]>();
  private slots = new Map<string, number>();
  private scans = new Map<string, StoredScan>();
  private leads = new Map<string, StoredLead>();
  private suppressed = new Set<string>();

  async takeSlot(bucket: string, key: string, max: number, windowMs: number, now = new Date()): Promise<SlotResult> {
    const k = `${bucket}:${key}`;
    const t = now.getTime();
    const list = (this.attempts.get(k) ?? []).filter((x) => x > t - windowMs);
    list.push(t);
    this.attempts.set(k, list);
    if (list.length <= max) return { allowed: true, retryAfterSeconds: 0 };
    const oldestInWindow = list[list.length - 1 - max];
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldestInWindow + windowMs - t) / 1000)) };
  }

  async claimDomain(domain: string, kind: "scan", windowMs: number, now = new Date()): Promise<boolean> {
    const k = `${kind}:${domain}`;
    const prev = this.slots.get(k);
    if (prev !== undefined && prev > now.getTime() - windowMs) return false;
    this.slots.set(k, now.getTime());
    return true;
  }

  async releaseDomain(domain: string, kind: "scan"): Promise<void> {
    this.slots.delete(`${kind}:${domain}`);
  }

  async saveScan(scan: NewScan): Promise<string> {
    const id = crypto.randomUUID();
    this.scans.set(id, { ...scan, id, createdAt: new Date() });
    return id;
  }

  async updateScanResult(id: string, result: ScanResult): Promise<void> {
    const s = this.scans.get(id);
    if (s) s.result = result;
  }

  async getScan(id: string): Promise<StoredScan | null> {
    return this.scans.get(id) ?? null;
  }

  async latestScan(domain: string, withinMs: number, now = new Date()): Promise<StoredScan | null> {
    let best: StoredScan | null = null;
    for (const s of Array.from(this.scans.values())) {
      if (s.domain !== domain || s.createdAt.getTime() < now.getTime() - withinMs) continue;
      if (!best || s.createdAt > best.createdAt) best = s;
    }
    return best;
  }

  async saveLead(lead: NewLead): Promise<string> {
    const id = crypto.randomUUID();
    this.leads.set(id, { ...lead, id, createdAt: new Date(), day3SentAt: null, day7SentAt: null, unsubscribedAt: null });
    return id;
  }

  async markReportSent(): Promise<void> {}

  async getLead(id: string): Promise<StoredLead | null> {
    return this.leads.get(id) ?? null;
  }

  async markUnsubscribed(leadId: string): Promise<boolean> {
    const l = this.leads.get(leadId);
    if (!l) return false;
    l.unsubscribedAt = new Date();
    return true;
  }

  async suppress(email: string): Promise<void> {
    this.suppressed.add(email.trim().toLowerCase());
  }

  async isSuppressed(email: string): Promise<boolean> {
    return this.suppressed.has(email.trim().toLowerCase());
  }

  /** Follow-ups need a database; memory never schedules any. */
  async dueFollowups(): Promise<Array<{ lead: StoredLead; day: 3 | 7 }>> {
    return [];
  }

  async markFollowupSent(): Promise<void> {}
}

/* ── Postgres ───────────────────────────────────────────────────────────── */

type Sql = { query: (text: string, params?: unknown[]) => Promise<unknown> };

type ScanRow = {
  id: string;
  host: string;
  domain: string;
  ip: string | null;
  user_agent: string | null;
  authorization_text: string;
  authorization_version: string;
  authorized_at: string;
  result: ScanResult;
  created_at: string;
};

type LeadRow = {
  id: string;
  scan_id: string | null;
  contact_id: string | null;
  name: string;
  practice: string;
  email: string;
  phone: string | null;
  role: string | null;
  quiz: QuizAnswers | null;
  ip: string | null;
  followups_ok: boolean;
  created_at: string;
  day3_sent_at: string | null;
  day7_sent_at: string | null;
  unsubscribed_at: string | null;
};

const d = (s: string | null) => (s ? new Date(s) : null);

function toScan(r: ScanRow): StoredScan {
  return {
    id: r.id,
    host: r.host,
    domain: r.domain,
    ip: r.ip,
    userAgent: r.user_agent,
    authorizationText: r.authorization_text,
    authorizationVersion: r.authorization_version,
    authorizedAt: new Date(r.authorized_at),
    result: r.result,
    createdAt: new Date(r.created_at),
  };
}

function toLead(r: LeadRow): StoredLead {
  return {
    id: r.id,
    scanId: r.scan_id,
    contactId: r.contact_id,
    name: r.name,
    practice: r.practice,
    email: r.email,
    phone: r.phone,
    role: r.role,
    quiz: r.quiz,
    ip: r.ip,
    followupsOk: r.followups_ok === true,
    createdAt: new Date(r.created_at),
    day3SentAt: d(r.day3_sent_at),
    day7SentAt: d(r.day7_sent_at),
    unsubscribedAt: d(r.unsubscribed_at),
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PostgresStore implements SecurityCheckStore {
  readonly kind = "postgres" as const;
  constructor(private sql: Sql) {}

  private async rows<T>(text: string, params: unknown[] = []): Promise<T[]> {
    return (await this.sql.query(text, params)) as T[];
  }

  async takeSlot(bucket: string, key: string, max: number, windowMs: number, now = new Date()): Promise<SlotResult> {
    // Insert first, then count: two racing requests both see each other.
    await this.rows("INSERT INTO security_check_attempts (bucket, key, created_at) VALUES ($1, $2, $3)", [bucket, key, now.toISOString()]);
    const since = new Date(now.getTime() - windowMs).toISOString();
    const recent = await this.rows<{ created_at: string }>(
      `SELECT created_at FROM security_check_attempts
        WHERE bucket = $1 AND key = $2 AND created_at > $3
        ORDER BY created_at DESC LIMIT $4`,
      [bucket, key, since, max + 1]
    );
    if (recent.length <= max) return { allowed: true, retryAfterSeconds: 0 };
    const oldest = new Date(recent[max].created_at).getTime();
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now.getTime()) / 1000)) };
  }

  async claimDomain(domain: string, kind: "scan", windowMs: number, now = new Date()): Promise<boolean> {
    const cutoff = new Date(now.getTime() - windowMs).toISOString();
    const won = await this.rows(
      `INSERT INTO security_check_domain_slots (domain, kind, claimed_at) VALUES ($1, $2, $3)
       ON CONFLICT (domain, kind) DO UPDATE SET claimed_at = EXCLUDED.claimed_at
         WHERE security_check_domain_slots.claimed_at <= $4
       RETURNING domain`,
      [domain, kind, now.toISOString(), cutoff]
    );
    return won.length === 1;
  }

  async releaseDomain(domain: string, kind: "scan"): Promise<void> {
    await this.rows("DELETE FROM security_check_domain_slots WHERE domain = $1 AND kind = $2", [domain, kind]);
  }

  async saveScan(s: NewScan): Promise<string> {
    const r = await this.rows<{ id: string }>(
      `INSERT INTO security_check_scans
         (host, domain, ip, user_agent, authorization_text, authorization_version, authorized_at,
          score, grade, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        s.host, s.domain, s.ip, s.userAgent, s.authorizationText, s.authorizationVersion,
        s.authorizedAt.toISOString(), s.result.score, s.result.grade,
        JSON.stringify(s.result),
      ]
    );
    return r[0].id;
  }

  async updateScanResult(id: string, result: ScanResult): Promise<void> {
    if (!UUID.test(id)) return;
    await this.rows(
      "UPDATE security_check_scans SET result = $2, score = $3, grade = $4 WHERE id = $1",
      [id, JSON.stringify(result), result.score, result.grade]
    );
  }

  async getScan(id: string): Promise<StoredScan | null> {
    if (!UUID.test(id)) return null;
    const r = await this.rows<ScanRow>("SELECT * FROM security_check_scans WHERE id = $1", [id]);
    return r[0] ? toScan(r[0]) : null;
  }

  async latestScan(domain: string, withinMs: number, now = new Date()): Promise<StoredScan | null> {
    const r = await this.rows<ScanRow>(
      "SELECT * FROM security_check_scans WHERE domain = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 1",
      [domain, new Date(now.getTime() - withinMs).toISOString()]
    );
    return r[0] ? toScan(r[0]) : null;
  }

  async saveLead(l: NewLead): Promise<string> {
    const r = await this.rows<{ id: string }>(
      `INSERT INTO security_check_leads (scan_id, contact_id, name, practice, email, phone, role, quiz, ip, followups_ok)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        l.scanId && UUID.test(l.scanId) ? l.scanId : null,
        l.contactId, l.name, l.practice, l.email, l.phone, l.role,
        l.quiz ? JSON.stringify(l.quiz) : null, l.ip, l.followupsOk,
      ]
    );
    return r[0].id;
  }

  async markReportSent(leadId: string): Promise<void> {
    if (!UUID.test(leadId)) return;
    await this.rows("UPDATE security_check_leads SET report_sent_at = now() WHERE id = $1", [leadId]);
  }

  async getLead(id: string): Promise<StoredLead | null> {
    if (!UUID.test(id)) return null;
    const r = await this.rows<LeadRow>("SELECT * FROM security_check_leads WHERE id = $1", [id]);
    return r[0] ? toLead(r[0]) : null;
  }

  async markUnsubscribed(leadId: string): Promise<boolean> {
    if (!UUID.test(leadId)) return false;
    const r = await this.rows(
      "UPDATE security_check_leads SET unsubscribed_at = COALESCE(unsubscribed_at, now()) WHERE id = $1 RETURNING id",
      [leadId]
    );
    return r.length === 1;
  }

  async suppress(email: string, source: string): Promise<void> {
    await this.rows(
      `INSERT INTO security_check_suppressions (email, source) VALUES (lower($1), $2)
       ON CONFLICT (email) DO NOTHING`,
      [email.trim(), source]
    );
  }

  async isSuppressed(email: string): Promise<boolean> {
    const r = await this.rows("SELECT 1 FROM security_check_suppressions WHERE email = lower($1)", [email.trim()]);
    return r.length > 0;
  }

  async dueFollowups(now = new Date()): Promise<Array<{ lead: StoredLead; day: 3 | 7 }>> {
    const day = 86_400_000;
    const rows = await this.rows<LeadRow>(
      `SELECT l.* FROM security_check_leads l
        WHERE l.unsubscribed_at IS NULL AND l.report_sent_at IS NOT NULL AND l.followups_ok
          AND NOT EXISTS (SELECT 1 FROM security_check_suppressions s WHERE s.email = lower(l.email))
          AND ((l.day3_sent_at IS NULL AND l.created_at <= $1) OR (l.day7_sent_at IS NULL AND l.created_at <= $2))
          AND l.created_at > $3
        ORDER BY l.created_at LIMIT 200`,
      [
        new Date(now.getTime() - 3 * day).toISOString(),
        new Date(now.getTime() - 7 * day).toISOString(),
        // Never mail someone weeks later because the feature was switched on late.
        new Date(now.getTime() - 14 * day).toISOString(),
      ]
    );
    const out: Array<{ lead: StoredLead; day: 3 | 7 }> = [];
    for (const r of rows) {
      const lead = toLead(r);
      const age = now.getTime() - lead.createdAt.getTime();
      if (!lead.day7SentAt && age >= 7 * day) out.push({ lead, day: 7 });
      else if (!lead.day3SentAt && age >= 3 * day) out.push({ lead, day: 3 });
    }
    return out;
  }

  async markFollowupSent(leadId: string, dayN: 3 | 7): Promise<void> {
    const col = dayN === 3 ? "day3_sent_at" : "day7_sent_at";
    await this.rows(`UPDATE security_check_leads SET ${col} = now() WHERE id = $1`, [leadId]);
  }
}

/* ── Selection ──────────────────────────────────────────────────────────── */

let memory: MemoryStore | null = null;
let checked: { store: SecurityCheckStore; at: number } | null = null;

function memoryStore(): MemoryStore {
  if (!memory) memory = new MemoryStore();
  return memory;
}

/**
 * Postgres when DATABASE_URL is set and the 0002 tables exist; memory
 * otherwise. The table probe is cached for five minutes per instance so a
 * migration applied while running is picked up without a redeploy.
 */
export async function getStore(): Promise<SecurityCheckStore> {
  if (checked && Date.now() - checked.at < 5 * 60_000) return checked.store;
  const db = getDb();
  let store: SecurityCheckStore = memoryStore();
  if (db) {
    try {
      const r = (await db.query("SELECT to_regclass('public.security_check_domain_slots') AS t")) as Array<{ t: string | null }>;
      if (r[0]?.t) store = new PostgresStore(db as unknown as Sql);
      else console.warn("security-check: DATABASE_URL is set but migration 0002 is not applied; using memory store");
    } catch (err) {
      console.error("security-check: database unreachable, using memory store:", err instanceof Error ? err.message : "unknown");
    }
  }
  checked = { store, at: Date.now() };
  return store;
}

/** For tests. */
export function resetStoreCache(): void {
  checked = null;
  memory = null;
}
