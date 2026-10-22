import { z } from "zod";

/**
 * Quo webhook envelope and the event shapes we act on.
 *
 * Everything is optional and permissive on purpose: a webhook payload is
 * untrusted input from outside, and Quo may add fields at any time. A strict
 * schema that rejects an unknown field would drop real events.
 */

export const envelopeSchema = z.object({
  id: z.string().optional(),
  apiVersion: z.string().optional(),
  createdAt: z.string().optional(),
  type: z.string(),
  data: z
    .object({
      resource: z.record(z.string(), z.unknown()).optional(),
      context: z.record(z.string(), z.unknown()).optional(),
      links: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export type QuoEnvelope = z.infer<typeof envelopeSchema>;

/** The events this integration subscribes to. */
export const SUBSCRIBED_EVENTS = [
  "message.received",
  "call.completed",
  "call.missed",
  "call.voicemail.completed",
  // Business/Scale plans only. On a lower plan the event simply never
  // arrives; nothing here needs to change when it does.
  "call.summary.completed",
  "contact.updated",
] as const;

export type ActivityKind = "call" | "text" | "note";

export type ExtractedEvent = {
  /** The counterparty's phone number, which is how we find the lead. */
  phone: string | null;
  activityType: ActivityKind;
  direction: "inbound" | "outbound" | null;
  occurredAt: string | null;
  durationS: number | null;
  summary: string | null;
  /** True when this event alone should create a lead for an unknown number. */
  createsLead: boolean;
};

/**
 * Pull the fields we store out of an event, per type.
 *
 * Handlers must be order-independent: Quo does not guarantee delivery order,
 * and a transcript can arrive before the summary for the same call. Nothing
 * here depends on having seen a previous event.
 */
export function extractEvent(env: QuoEnvelope): ExtractedEvent | null {
  const resource = (env.data?.resource ?? {}) as Record<string, unknown>;
  const context = (env.data?.context ?? {}) as Record<string, unknown>;

  switch (env.type) {
    case "message.received": {
      return {
        phone: str(resource.from) ?? counterpartyFromContext(context),
        activityType: "text",
        direction: "inbound",
        occurredAt: str(resource.createdAt) ?? env.createdAt ?? null,
        durationS: null,
        summary: truncate(str(resource.text) ?? str(resource.body), 2000),
        createsLead: true,
      };
    }

    case "call.completed":
    case "call.missed": {
      const direction = callDirection(resource);
      return {
        phone: callCounterparty(resource, direction) ?? counterpartyFromContext(context),
        activityType: "call",
        direction,
        occurredAt:
          str(resource.completedAt) ??
          str(resource.answeredAt) ??
          str(resource.createdAt) ??
          env.createdAt ??
          null,
        durationS: num(resource.duration) ?? num(resource.durationSeconds),
        summary:
          env.type === "call.missed"
            ? "Missed call"
            : `Call completed${
                num(resource.duration) !== null ? ` (${num(resource.duration)}s)` : ""
              }`,
        // A missed call from an unknown number is a lead. No automatic reply
        // is ever sent for one.
        createsLead: true,
      };
    }

    case "call.voicemail.completed": {
      const transcript =
        str(resource.transcript) ??
        str((resource.voicemail as Record<string, unknown> | undefined)?.transcript);
      return {
        phone: callCounterparty(resource, "inbound") ?? counterpartyFromContext(context),
        activityType: "call",
        direction: "inbound",
        occurredAt: str(resource.createdAt) ?? env.createdAt ?? null,
        durationS: num(resource.duration),
        summary: transcript
          ? `Voicemail: ${truncate(transcript, 2000)}`
          : "Voicemail received",
        createsLead: true,
      };
    }

    case "call.summary.completed": {
      const summary = summaryText(resource);
      return {
        phone: counterpartyFromContext(context),
        activityType: "note",
        direction: null,
        occurredAt: str(resource.createdAt) ?? env.createdAt ?? null,
        durationS: null,
        summary: summary ? `Call summary: ${truncate(summary, 3000)}` : "Call summary received",
        // A summary always follows a call we have already seen, so it should
        // never mint a new lead on its own.
        createsLead: false,
      };
    }

    case "contact.updated": {
      return {
        phone: contactPhone(resource),
        activityType: "note",
        direction: null,
        occurredAt: str(resource.updatedAt) ?? env.createdAt ?? null,
        durationS: null,
        summary: "Contact updated in Quo",
        createsLead: false,
      };
    }

    default:
      return null;
  }
}

/** A call summary's text lives under one of several keys depending on plan. */
function summaryText(resource: Record<string, unknown>): string | null {
  const direct = str(resource.summary);
  if (direct) return direct;
  const nested = resource.summary as Record<string, unknown> | undefined;
  if (nested) {
    const text = str(nested.text) ?? str(nested.body);
    if (text) return text;
    if (Array.isArray(nested.bullets)) {
      return nested.bullets.filter((b): b is string => typeof b === "string").join("; ");
    }
  }
  if (Array.isArray(resource.nextSteps)) {
    return resource.nextSteps.filter((b): b is string => typeof b === "string").join("; ");
  }
  return null;
}

function callDirection(resource: Record<string, unknown>): "inbound" | "outbound" | null {
  const d = str(resource.direction);
  if (d === "incoming" || d === "inbound") return "inbound";
  if (d === "outgoing" || d === "outbound") return "outbound";
  return null;
}

/** On an inbound call the counterparty is `from`; on an outbound one it is `to`. */
function callCounterparty(
  resource: Record<string, unknown>,
  direction: "inbound" | "outbound" | null
): string | null {
  const from = str(resource.from) ?? str((resource.from as Record<string, unknown> | undefined)?.phoneNumber);
  const to =
    str(resource.to) ??
    (Array.isArray(resource.to) ? str(resource.to[0]) : null) ??
    str((resource.to as Record<string, unknown> | undefined)?.phoneNumber);
  if (direction === "outbound") return to ?? from;
  return from ?? to;
}

/**
 * Fall back to the participant list in `data.context`.
 *
 * Participants include our own Quo number, so anything matching it is
 * filtered out by the caller through phone normalisation plus a comparison
 * against PHONE_E164.
 */
function counterpartyFromContext(context: Record<string, unknown>): string | null {
  const participants = context.participants;
  if (Array.isArray(participants)) {
    for (const p of participants) {
      const value = typeof p === "string" ? p : str((p as Record<string, unknown>)?.phoneNumber);
      if (value) return value;
    }
  }
  const contact = context.contact as Record<string, unknown> | undefined;
  if (contact) return contactPhone(contact);
  return null;
}

function contactPhone(resource: Record<string, unknown>): string | null {
  const direct = str(resource.phoneNumber);
  if (direct) return direct;

  // v1-style shape.
  const defaults = resource.defaultFields as Record<string, unknown> | undefined;
  const list = (defaults?.phoneNumbers ?? resource.phoneNumbers) as unknown;
  if (Array.isArray(list)) {
    for (const entry of list) {
      const value =
        typeof entry === "string" ? entry : str((entry as Record<string, unknown>)?.value);
      if (value) return value;
    }
  }

  // Dated-API shape: typed properties.
  const properties = resource.properties as unknown;
  if (Array.isArray(properties)) {
    for (const entry of properties) {
      const prop = entry as Record<string, unknown>;
      if (prop?.type === "phone-number") {
        const value = str(prop.value);
        if (value) return value;
      }
    }
  }
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Math.trunc(v) : null;
}

function truncate(v: string | null, max: number): string | null {
  if (!v) return null;
  return v.length > max ? `${v.slice(0, max)}...` : v;
}
