import { quoFetch } from "@/lib/quo/client";
import { isQuoConfigured } from "@/lib/quo/client";
import { isDbConfigured } from "@/lib/db/client";
import {
  findContact,
  insertActivity,
  listUnsyncedContacts,
  markQuoSynced,
  markQuoFailed,
  logEvent,
} from "@/lib/db/queries";
import { upsertQuoContact, externalIdFor } from "@/lib/quo/contacts";
import { createLead } from "@/lib/leads/create-lead";
import { normalizePhone } from "@/lib/phone";
import { PHONE_E164 } from "@/lib/site-config";
import { splitName } from "@/lib/leads/create-lead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
/** Reconciliation walks several pages; the default 10s is not enough. */
export const maxDuration = 60;

/**
 * Daily reconciliation.
 *
 * Quo's dated webhook API does retry (8 attempts over roughly 27 hours), so
 * this is not the primary safety net it would have been on the old v1
 * webhooks. It still earns its place for two cases the retry schedule cannot
 * cover: activity that happened before the webhook existed, and a delivery
 * that exhausted all 8 attempts while we were down.
 *
 * It also retries contacts whose mirror into Quo failed.
 */

/** How far back to look. A day plus the full retry window, plus slack. */
const LOOKBACK_HOURS = 48;
const PAGE_LIMIT = 50;
const MAX_PAGES = 10;

export async function GET(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  /*
   * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Require it: this
   * route reads the Quo API and writes to the CRM, so it must not be callable
   * by anyone who finds the URL.
   */
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isDbConfigured() || !isQuoConfigured()) {
    return Response.json({ skipped: "not_configured" });
  }

  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();

  const report = {
    since,
    callsSeen: 0,
    messagesSeen: 0,
    activitiesAdded: 0,
    leadsCreated: 0,
    contactsResynced: 0,
    errors: [] as string[],
  };

  try {
    await backfill("calls", since, report);
  } catch (error) {
    report.errors.push(`calls: ${msg(error)}`);
  }

  try {
    await backfill("messages", since, report);
  } catch (error) {
    report.errors.push(`messages: ${msg(error)}`);
  }

  try {
    report.contactsResynced = await retryFailedSyncs();
  } catch (error) {
    report.errors.push(`resync: ${msg(error)}`);
  }

  await logEvent({
    source: "quo_reconcile",
    payload: report,
    processed: true,
    error: report.errors.length > 0 ? report.errors.join("; ").slice(0, 500) : null,
  }).catch(() => {});

  return Response.json(report);
}

type Report = {
  callsSeen: number;
  messagesSeen: number;
  activitiesAdded: number;
  leadsCreated: number;
  errors: string[];
};

type ListResponse = {
  data?: Array<Record<string, unknown>>;
  /** Cursor pagination, per Quo's list conventions. */
  meta?: { nextPageToken?: string | null };
  nextPageToken?: string | null;
};

/**
 * Walk a list endpoint and record anything we are missing.
 *
 * Idempotency comes from activities.quo_event_id: here it holds a synthetic
 * `reconcile:<resourceId>` key rather than a delivery id, so a webhook that
 * already landed and a backfill of the same resource do not collide on the
 * same row, but two backfills of it do.
 */
async function backfill(
  kind: "calls" | "messages",
  since: string,
  report: Report
): Promise<void> {
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await quoFetch<ListResponse>(`/${kind}`, {
      query: { limit: PAGE_LIMIT, after, "createdAt[gte]": since },
    });

    const rows = res?.data ?? [];
    if (kind === "calls") report.callsSeen += rows.length;
    else report.messagesSeen += rows.length;

    for (const row of rows) {
      try {
        const added = await recordRow(kind, row, report);
        if (added) report.activitiesAdded += 1;
      } catch (error) {
        report.errors.push(`${kind}:${String(row.id)}: ${msg(error)}`);
      }
    }

    const next = res?.meta?.nextPageToken ?? res?.nextPageToken ?? null;
    if (!next || rows.length === 0) return;
    after = next;
  }
}

async function recordRow(
  kind: "calls" | "messages",
  row: Record<string, unknown>,
  report: Report
): Promise<boolean> {
  const resourceId = typeof row.id === "string" ? row.id : null;
  if (!resourceId) return false;

  const direction = directionOf(row);
  const phone = normalizePhone(counterparty(row, direction));

  // Our own number is never the lead.
  if (!phone || phone === PHONE_E164) return false;

  const occurredAt =
    pick(row, "completedAt") ?? pick(row, "createdAt") ?? null;
  const summary =
    kind === "messages"
      ? truncate(pick(row, "text") ?? pick(row, "body"))
      : `Call ${String(row.status ?? "completed")}`;

  const existing = await findContact(phone, null);

  if (!existing) {
    const result = await createLead({
      source: "quo_reconcile",
      phone,
      summary,
      activityType: kind === "messages" ? "text" : "call",
      activityDirection: direction ?? "inbound",
      activityOccurredAt: occurredAt,
      activityDurationS: typeof row.duration === "number" ? Math.trunc(row.duration) : null,
      quoEventId: `reconcile:${resourceId}`,
      raw: row,
    });
    if (result.ok) report.leadsCreated += 1;
    return result.ok;
  }

  const inserted = await insertActivity({
    contactId: existing.id,
    type: kind === "messages" ? "text" : "call",
    direction,
    occurredAt,
    durationS: typeof row.duration === "number" ? Math.trunc(row.duration) : null,
    summary,
    quoEventId: `reconcile:${resourceId}`,
    raw: row,
  });
  return inserted !== null;
}

/** Retry the Quo mirror for contacts whose earlier push failed. */
async function retryFailedSyncs(): Promise<number> {
  const pending = await listUnsyncedContacts(25);
  let fixed = 0;

  for (const contact of pending) {
    const externalId = externalIdFor(contact.phone_e164, contact.email);
    if (!externalId) continue;

    try {
      const { firstName, lastName } = splitName(contact.name);
      const result = await upsertQuoContact({
        externalId,
        firstName,
        lastName,
        company: contact.company,
        role: contact.role,
        phoneE164: contact.phone_e164,
        email: contact.email,
        sourceUrl: contact.source_url,
        note: `Source: ${contact.source}\nBackfilled by reconciliation.`,
      });
      await markQuoSynced(contact.id, result.contactId);
      fixed += 1;
    } catch (error) {
      await markQuoFailed(contact.id, msg(error));
    }
  }

  return fixed;
}

function directionOf(row: Record<string, unknown>): "inbound" | "outbound" | null {
  const d = typeof row.direction === "string" ? row.direction : null;
  if (d === "incoming" || d === "inbound") return "inbound";
  if (d === "outgoing" || d === "outbound") return "outbound";
  return null;
}

function counterparty(
  row: Record<string, unknown>,
  direction: "inbound" | "outbound" | null
): string | null {
  const from = pick(row, "from");
  const to = Array.isArray(row.to)
    ? (typeof row.to[0] === "string" ? row.to[0] : null)
    : pick(row, "to");
  if (direction === "outbound") return to ?? from;
  return from ?? to;
}

function pick(row: Record<string, unknown>, key: string): string | null {
  const v = row[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function truncate(v: string | null): string | null {
  if (!v) return null;
  return v.length > 2000 ? `${v.slice(0, 2000)}...` : v;
}

function msg(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
