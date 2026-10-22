import { z } from "zod";
import { waitUntil } from "@vercel/functions";
import { normalizePhone, normalizeEmail, firstNameOf } from "@/lib/phone";
import {
  upsertContact,
  insertActivity,
  markQuoSynced,
  markQuoFailed,
  claimSmsSend,
  recordSmsMessageId,
  releaseSmsSend,
  logEvent,
  type ContactRow,
} from "@/lib/db/queries";
import { isDbConfigured } from "@/lib/db/client";
import { upsertQuoContact, externalIdFor } from "@/lib/quo/contacts";
import { isQuoConfigured } from "@/lib/quo/client";
import { sendQuoSms } from "@/lib/quo/messages";
import { isA2pApproved, getA2pStatus } from "@/lib/quo/a2p";

/**
 * The one entry point every lead source calls.
 *
 * Ordering is the whole point of this module: the lead is written to our own
 * database first and the response returns immediately, then Quo is mirrored
 * in the background. If Quo is down, slow, or rejecting, the lead is already
 * safe and marked quo_sync = 'failed' for the reconciliation job to pick up.
 * A lead is never lost because a third party had a bad afternoon.
 */

export const LEAD_SOURCES = [
  "website_form",
  "chat",
  "quo_inbound",
  "quo_reconcile",
] as const;

export const leadInputSchema = z.object({
  source: z.enum(LEAD_SOURCES),
  name: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  email: z.string().trim().max(254).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  role: z.string().trim().max(120).optional().nullable(),
  /** Short description of the need. Shown in Quo's note and the admin inbox. */
  summary: z.string().trim().max(4000).optional().nullable(),
  pageUrl: z.string().trim().max(500).optional().nullable(),
  utm: z.record(z.string(), z.string().max(200)).optional().nullable(),
  consentSms: z.boolean().optional().default(false),
  /** The exact consent wording shown, stored so we can prove what was agreed. */
  consentText: z.string().max(1000).optional().nullable(),
  consentIp: z.string().max(100).optional().nullable(),
  /** Activity type to log alongside the contact. */
  activityType: z.enum(["form", "chat", "call", "text", "note"]).optional(),
  activityDirection: z.enum(["inbound", "outbound"]).optional(),
  activityOccurredAt: z.string().optional().nullable(),
  activityDurationS: z.number().int().nonnegative().optional().nullable(),
  /** Quo delivery id, when this lead originates from a webhook. */
  quoEventId: z.string().max(200).optional().nullable(),
  raw: z.unknown().optional(),
});

export type LeadInput = z.input<typeof leadInputSchema>;

export type CreateLeadResult =
  | { ok: true; contactId: string; created: boolean; deduped: boolean }
  | { ok: false; reason: "no_identity" | "db_unavailable" | "invalid" };

/**
 * Create or merge a lead.
 *
 * Returns as soon as our database is written. Quo work is handed to
 * waitUntil, which keeps the function alive after the response is sent.
 * (Next 14.2 has no `after()`; that landed in 15. waitUntil is the
 * equivalent on Vercel.)
 */
export async function createLead(input: LeadInput): Promise<CreateLeadResult> {
  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const lead = parsed.data;

  const phoneE164 = normalizePhone(lead.phone);
  const email = normalizeEmail(lead.email);

  // Without a phone or an email there is nobody to call back, and no key to
  // dedupe on. Better to reject than to accumulate anonymous rows.
  if (!phoneE164 && !email) return { ok: false, reason: "no_identity" };

  if (!isDbConfigured()) {
    // Nothing to write to. Say so rather than silently dropping the lead.
    console.error("createLead: DATABASE_URL not configured, lead not stored");
    return { ok: false, reason: "db_unavailable" };
  }

  const { contact, created } = await upsertContact({
    name: lead.name ?? null,
    phoneE164,
    email,
    company: lead.company ?? null,
    role: lead.role ?? null,
    source: lead.source,
    sourceUrl: lead.pageUrl ?? null,
    consentSms: lead.consentSms ?? false,
    consentText: lead.consentText ?? null,
    consentIp: lead.consentIp ?? null,
  });

  await insertActivity({
    contactId: contact.id,
    type: lead.activityType ?? "form",
    direction: lead.activityDirection ?? "inbound",
    occurredAt: lead.activityOccurredAt ?? null,
    durationS: lead.activityDurationS ?? null,
    summary: lead.summary ?? null,
    quoEventId: lead.quoEventId ?? null,
    raw: lead.raw ?? null,
  });

  // Everything past here is best-effort and must never fail the caller.
  waitUntil(
    syncLeadToQuo(contact, lead).catch((error: unknown) => {
      console.error(
        "createLead background sync failed:",
        error instanceof Error ? error.message : "unknown error"
      );
    })
  );

  return {
    ok: true,
    contactId: contact.id,
    created,
    deduped: !created,
  };
}

/** Mirror into Quo, then consider the confirmation text. */
async function syncLeadToQuo(contact: ContactRow, lead: z.output<typeof leadInputSchema>): Promise<void> {
  if (!isQuoConfigured()) return;

  const externalId = externalIdFor(contact.phone_e164, contact.email);
  if (!externalId) return;

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
      note: buildNote(contact, lead),
    });
    await markQuoSynced(contact.id, result.contactId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown Quo error";
    await markQuoFailed(contact.id, message);
    await logEvent({
      source: "quo_sync",
      payload: { contactId: contact.id, externalId },
      error: message,
    });
    // The contact is not in Quo, so there is nothing to attach a text to and
    // no confirmed record of consent on their side. Stop here.
    return;
  }

  await maybeSendConfirmation(contact);
}

/**
 * The single confirmation text, behind three independent gates.
 *
 * All three must hold: the feature flag is on, this lead ticked the consent
 * box, and Quo reports the A2P 10DLC registration as approved. The third gate
 * exists because the flag is a human decision and carrier registration is a
 * fact; sending into an unregistered campaign gets filtered, not delivered.
 *
 * Exactly one message, ever. No sequences, no follow-ups, no missed-call
 * auto-replies anywhere in this codebase.
 */
async function maybeSendConfirmation(contact: ContactRow): Promise<void> {
  if (process.env.SMS_CONFIRMATIONS_ENABLED !== "true") return;
  if (!contact.consent_sms) return;
  if (contact.do_not_contact) return;
  if (!contact.phone_e164) return;

  if (!(await isA2pApproved())) {
    await logEvent({
      source: "sms_blocked",
      payload: { contactId: contact.id, a2pStatus: await getA2pStatus() },
      error: "a2p_not_approved",
    });
    return;
  }

  // Claim first, send second. The unique row is what makes a duplicate
  // createLead for the same person a no-op rather than a second text.
  const claimed = await claimSmsSend(contact.id, "lead_confirmation", contact.phone_e164);
  if (!claimed) return;

  const body = confirmationMessage(contact.name);

  try {
    const messageId = await sendQuoSms(contact.phone_e164, body);
    if (messageId) await recordSmsMessageId(contact.id, "lead_confirmation", messageId);
  } catch (error) {
    // Give the claim back so a retry is possible, and record why.
    await releaseSmsSend(contact.id, "lead_confirmation");
    await logEvent({
      source: "sms_send",
      payload: { contactId: contact.id },
      error: error instanceof Error ? error.message : "unknown send error",
    });
  }
}

/** The only outbound SMS body in the codebase. */
export function confirmationMessage(name: string | null): string {
  return `Hi ${firstNameOf(name)}, this is Red Rose Technologies. We got your request and someone from our team will call you. Reply STOP to opt out.`;
}

/**
 * The Quo note.
 *
 * Quo cannot create custom contact fields through the API, so the structured
 * detail that does not fit a standard field or a typed property goes here as
 * labelled plain text.
 */
export function buildNote(
  contact: Pick<ContactRow, "source" | "source_url" | "consent_sms" | "company" | "role">,
  lead: Pick<z.output<typeof leadInputSchema>, "summary" | "utm" | "pageUrl">
): string {
  const lines: string[] = [`Source: ${contact.source}`];

  if (lead.pageUrl ?? contact.source_url) {
    lines.push(`Page: ${lead.pageUrl ?? contact.source_url}`);
  }
  if (contact.company) lines.push(`Company: ${contact.company}`);
  if (contact.role) lines.push(`Role: ${contact.role}`);

  const utm = lead.utm ?? {};
  const utmKeys = Object.keys(utm).sort();
  if (utmKeys.length > 0) {
    lines.push(`UTM: ${utmKeys.map((k) => `${k}=${utm[k]}`).join(" ")}`);
  }

  lines.push(`SMS consent: ${contact.consent_sms ? "yes" : "no"}`);

  if (lead.summary) {
    lines.push("", "Need:", lead.summary);
  }

  return lines.join("\n");
}

/** Quo requires firstName; everything after the first token becomes lastName. */
export function splitName(name: string | null): { firstName: string; lastName: string | null } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "Website", lastName: "Lead" };
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { firstName, lastName };
}
