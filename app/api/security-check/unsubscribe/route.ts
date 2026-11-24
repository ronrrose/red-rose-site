import type { NextRequest } from "next/server";
import { getStore } from "@/lib/security-check/store";
import { verifyToken } from "@/lib/security-check/tokens";
import { sendUnsubscribeNotice } from "@/lib/security-check/emails";
import { json } from "@/lib/security-check/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Unsubscribe from the day 3 and day 7 follow-ups.
 *
 * Accepts the token from the query string (RFC 8058 one-click POST from the
 * mail client) or from a form/JSON body (the button on the unsubscribe page).
 * Never on GET: link scanners open every URL in an email.
 */
export async function POST(req: NextRequest) {
  let token: string | null = req.nextUrl.searchParams.get("t");
  if (!token) {
    const type = req.headers.get("content-type") ?? "";
    try {
      if (type.includes("application/json")) token = ((await req.json()) as { token?: string }).token ?? null;
      else token = String((await req.formData()).get("t") ?? "") || null;
    } catch {
      token = null;
    }
  }
  const claims = verifyToken<{ l: string; e: string }>("unsub", token);
  if (!claims || typeof claims.l !== "string") {
    return json({ error: "This unsubscribe link is not valid. Reply to any of our emails and we will remove you by hand." }, 400);
  }
  const store = await getStore();
  const email = typeof claims.e === "string" ? claims.e : "";
  // Suppress the address itself, so every lead for it stops, including later ones.
  let done = false;
  try {
    if (email) await store.suppress(email, "unsubscribe_link");
    await store.markUnsubscribed(claims.l);
    done = store.kind === "postgres" && Boolean(email);
  } catch (err) {
    console.error("security-check: unsubscribe store failed:", err instanceof Error ? err.message : "unknown");
  }
  // Without the database the suppression only lives in memory, so it also
  // goes to the inbox to be recorded by hand.
  if (!done) await sendUnsubscribeNotice(email, claims.l).catch(() => undefined);
  return json({ ok: true });
}
