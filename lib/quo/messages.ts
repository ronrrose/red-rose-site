import { quoFetch } from "@/lib/quo/client";
import { PHONE_E164 } from "@/lib/site-config";

/**
 * Outbound SMS.
 *
 * POST /v1/messages is the only send endpoint Quo exposes: the dated
 * 2026-03-30 API can list, read and retry messages but cannot create one.
 */

type SendResponse = { data?: { id?: string } };

export async function sendQuoSms(to: string, content: string): Promise<string | null> {
  const res = await quoFetch<SendResponse>("/messages", {
    version: "v1",
    method: "POST",
    body: {
      from: PHONE_E164,
      to: [to],
      content,
    },
  });
  return res?.data?.id ?? null;
}

/**
 * Inbound text that should stop all future messaging to a number.
 *
 * Carriers and Quo handle STOP at their own level, but we record it too: our
 * own send path checks do_not_contact, and relying solely on the carrier
 * would mean a number we believe is contactable.
 */
const OPT_OUT_WORDS = new Set([
  "stop",
  "stopall",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
  "optout",
  "opt-out",
  "revoke",
]);

export function isOptOutMessage(text: string | null | undefined): boolean {
  if (!text) return false;
  // Carriers match the keyword as the whole message, allowing for
  // punctuation and case. "please stop calling me" is a complaint, not a
  // compliant opt-out keyword, but treating it as one is the safe error.
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[.!,?'"]/g, "");
  if (OPT_OUT_WORDS.has(normalized)) return true;
  if (normalized.replace(/\s+/g, "") === "optout") return true;
  return false;
}
