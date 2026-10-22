import { waitUntil } from "@vercel/functions";
import { verifyQuoSignature } from "@/lib/quo/signature";
import { envelopeSchema, extractEvent, type QuoEnvelope } from "@/lib/quo/events";
import { createLead } from "@/lib/leads/create-lead";
import { isOptOutMessage } from "@/lib/quo/messages";
import { normalizePhone } from "@/lib/phone";
import { PHONE_E164 } from "@/lib/site-config";
import { isDbConfigured } from "@/lib/db/client";
import {
  findContact,
  insertActivity,
  logEvent,
  setDoNotContact,
  hasProcessedDelivery,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Quo webhook receiver.
 *
 * Shape of the handler is dictated by two constraints:
 *
 *   1. Signature verification needs the exact raw body bytes. So we read
 *      req.text() and never req.json(); re-serialising a parsed object
 *      changes whitespace and key order and the HMAC stops matching.
 *   2. Any non-2xx triggers Quo's retry schedule (8 attempts over ~27h). So
 *      we answer 200 immediately and do the work in waitUntil. A slow
 *      database must not turn into a retry storm.
 *
 * No automatic reply is ever sent from here. A missed call or inbound text
 * creates or updates a lead and nothing else.
 */
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();

  const verification = verifyQuoSignature(
    rawBody,
    {
      id: req.headers.get("webhook-id"),
      timestamp: req.headers.get("webhook-timestamp"),
      signature: req.headers.get("webhook-signature"),
    },
    process.env.QUO_WEBHOOK_SECRET
  );

  if (!verification.ok) {
    // 401 for anything we cannot authenticate. Quo will retry, which is
    // correct: if the secret is merely misconfigured on our side, the retry
    // window gives us time to fix it without losing the event.
    console.warn(`Quo webhook rejected: ${verification.reason}`);
    return new Response(JSON.stringify({ error: verification.reason }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const deliveryId = verification.deliveryId;

  let envelope: QuoEnvelope;
  try {
    const parsed = envelopeSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      // Signed by Quo but not a shape we understand. Acknowledge so it is not
      // retried forever, and keep the payload for inspection.
      waitUntil(
        logEvent({
          source: "quo_webhook",
          payload: { deliveryId, body: safeJson(rawBody) },
          error: "envelope_parse_failed",
        }).catch(() => {})
      );
      return ok();
    }
    envelope = parsed.data;
  } catch {
    return ok();
  }

  waitUntil(
    processDelivery(deliveryId, envelope).catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`Quo webhook processing failed (${envelope.type}): ${message}`);
      if (isDbConfigured()) {
        await logEvent({
          source: "quo_webhook",
          payload: { deliveryId, type: envelope.type },
          error: message,
        }).catch(() => {});
      }
    })
  );

  return ok();
}

function ok(): Response {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function processDelivery(deliveryId: string, envelope: QuoEnvelope): Promise<void> {
  if (!isDbConfigured()) {
    console.error("Quo webhook: DATABASE_URL not configured, event dropped");
    return;
  }

  // Idempotency. The key is the webhook-id header, not the envelope's own id:
  // the envelope id identifies the *event* and is identical across every
  // subscription that receives it, while webhook-id is per delivery and
  // stable across retries of that delivery.
  if (await hasProcessedDelivery(deliveryId)) return;

  const extracted = extractEvent(envelope);
  if (!extracted) {
    await logEvent({
      source: "quo_webhook",
      payload: { deliveryId, type: envelope.type },
      processed: true,
      error: "unhandled_event_type",
    });
    return;
  }

  const phone = normalizePhone(extracted.phone);

  // Our own number shows up in participant lists. It is never the lead.
  const counterparty = phone === PHONE_E164 ? null : phone;

  // Record an opt-out before anything else can decide to text this number.
  if (
    envelope.type === "message.received" &&
    counterparty &&
    isOptOutMessage(stripPrefix(extracted.summary))
  ) {
    await setDoNotContact(counterparty);
  }

  if (!counterparty) {
    // Nothing to attach the activity to. Keep it for debugging rather than
    // discarding a signed event.
    await logEvent({
      source: "quo_webhook",
      payload: { deliveryId, type: envelope.type, resource: envelope.data?.resource ?? null },
      processed: true,
      error: "no_counterparty_phone",
    });
    return;
  }

  const existing = await findContact(counterparty, null);

  if (!existing && extracted.createsLead) {
    // An inbound call or text from a number we have never seen is a lead.
    const result = await createLead({
      source: "quo_inbound",
      phone: counterparty,
      summary: extracted.summary,
      activityType: extracted.activityType,
      activityDirection: extracted.direction ?? "inbound",
      activityOccurredAt: extracted.occurredAt,
      activityDurationS: extracted.durationS,
      quoEventId: deliveryId,
      raw: envelope,
    });
    if (!result.ok) {
      await logEvent({
        source: "quo_webhook",
        payload: { deliveryId, type: envelope.type },
        error: `create_lead_failed:${result.reason}`,
      });
    }
    return;
  }

  if (!existing) {
    // An event that does not mint leads, for a number we do not know. Log and
    // move on; the matching call event will have created the contact.
    await logEvent({
      source: "quo_webhook",
      payload: { deliveryId, type: envelope.type, phone: counterparty },
      processed: true,
      error: "unknown_contact",
    });
    return;
  }

  await insertActivity({
    contactId: existing.id,
    type: extracted.activityType,
    direction: extracted.direction,
    occurredAt: extracted.occurredAt,
    durationS: extracted.durationS,
    summary: extracted.summary,
    quoEventId: deliveryId,
    raw: envelope,
  });
}

/** Voicemail and summary bodies carry a label prefix we added; strip it for keyword checks. */
function stripPrefix(summary: string | null): string | null {
  if (!summary) return null;
  return summary.replace(/^(Voicemail|Call summary):\s*/, "");
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return { unparsed: raw.slice(0, 2000) };
  }
}
