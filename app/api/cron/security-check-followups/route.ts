import { getStore } from "@/lib/security-check/store";
import { signToken } from "@/lib/security-check/tokens";
import { followupConfig, sendFollowup } from "@/lib/security-check/emails";
import { UNSUB_TTL_SECONDS } from "@/lib/security-check/limits";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily: send the day 3 and day 7 follow-ups that are due.
 *
 * Vercel Cron rather than Resend scheduled sends, because the decision to
 * send is made on the day: an unsubscribe since the report, the feature
 * switch, and the postal address are all read at send time, and nothing sits
 * queued at Resend that would have to be found and cancelled.
 *
 * Off until SECURITY_CHECK_FOLLOWUPS_ENABLED=true and
 * SECURITY_CHECK_POSTAL_ADDRESS are set, and only with the database.
 */
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const config = followupConfig();
  if (!config.enabled) return Response.json({ ok: true, skipped: config.reason });

  const store = await getStore();
  if (store.kind !== "postgres") return Response.json({ ok: true, skipped: "no database" });

  const due = await store.dueFollowups();
  let sent = 0;
  let failed = 0;
  for (const { lead, day } of due) {
    const token = signToken("unsub", { l: lead.id, e: lead.email }, UNSUB_TTL_SECONDS);
    if (!token) return Response.json({ ok: false, skipped: "no signing secret, cannot build unsubscribe links" });
    const scan = lead.scanId ? await store.getScan(lead.scanId) : null;
    const ok = await sendFollowup({
      day,
      to: lead.email,
      name: lead.name,
      scan: scan?.result ?? null,
      postalAddress: config.postalAddress,
      unsubscribeUrl: `${SITE_URL}/free-security-check/unsubscribe?t=${encodeURIComponent(token)}`,
      oneClickUrl: `${SITE_URL}/api/security-check/unsubscribe?t=${encodeURIComponent(token)}`,
    });
    if (ok) {
      // Day 7 marks day 3 too, so a late start never sends both at once.
      await store.markFollowupSent(lead.id, day);
      if (day === 7) await store.markFollowupSent(lead.id, 3);
      sent += 1;
    } else failed += 1;
  }
  return Response.json({ ok: true, due: due.length, sent, failed });
}
