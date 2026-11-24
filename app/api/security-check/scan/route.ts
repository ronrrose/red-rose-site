import type { NextRequest } from "next/server";
import { z } from "zod";
import { parseTarget, TARGET_REFUSAL_MESSAGES } from "@/lib/security-check/target";
import { runScan } from "@/lib/security-check/scan";
import { getStore } from "@/lib/security-check/store";
import { signResult } from "@/lib/security-check/tokens";
import { followupConfig, sendScanRecord } from "@/lib/security-check/emails";
import { clientIp, json, minutes, readJson, sameOrigin, userAgent } from "@/lib/security-check/http";
import { AUTHORIZATION_TEXT, AUTHORIZATION_VERSION } from "@/lib/security-check/types";
import { waitUntil } from "@vercel/functions";
import { DOMAIN_WINDOW_MS, HOUR_MS, SCANS_PER_IP_PER_HOUR } from "@/lib/security-check/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** 25 s scan budget plus DNS and storage. */
export const maxDuration = 40;


const bodySchema = z.object({
  domain: z.string().max(300),
  /** The authorization checkbox. Must be exactly true. */
  authorized: z.literal(true),
  /** Honeypot: a real browser leaves it empty. */
  website: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Refused." }, 403);

  const raw = await readJson(req, 4_000);
  const authorizedFlag = raw && typeof raw === "object" ? (raw as Record<string, unknown>).authorized : undefined;
  if (authorizedFlag !== true) {
    return json({ error: "Tick the box to confirm you own or manage this domain and authorize the check." }, 400);
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Enter your practice's website address, for example smiledental.com." }, 400);
  if (parsed.data.website) return json({ error: "Something went wrong. Please try again." }, 400);

  const target = parseTarget(parsed.data.domain);
  if (!target.ok) return json({ error: TARGET_REFUSAL_MESSAGES[target.reason] }, 400);

  const ip = clientIp(req);
  const store = await getStore();
  const followups = followupConfig().enabled && store.kind === "postgres";

  try {
    const slot = await store.takeSlot("scan-ip", ip, SCANS_PER_IP_PER_HOUR, HOUR_MS);
    if (!slot.allowed) {
      return json(
        { error: `You can run ${SCANS_PER_IP_PER_HOUR} checks an hour. Try again in ${minutes(slot.retryAfterSeconds)}.` },
        429,
        { "Retry-After": String(slot.retryAfterSeconds) }
      );
    }

    // One fresh scan per domain per 24 hours. Inside the window the stored
    // result is shown again, so nothing is sent to the site twice.
    const won = await store.claimDomain(target.limitKey, "scan", DOMAIN_WINDOW_MS);
    if (!won) {
      const recent = await store.latestScan(target.limitKey, DOMAIN_WINDOW_MS);
      // Only the connection that ran the check sees it again. Anyone else
      // is told to wait, so results never pass between strangers.
      if (recent && recent.ip === ip) {
        const resultJson = JSON.stringify(recent.result);
        return json({
          scanId: recent.id,
          result: recent.result,
          signature: signResult(resultJson),
          cached: true,
          followups,
          message: "This domain was checked in the last 24 hours, so here is that result. A domain can be checked once a day.",
        });
      }
      return json(
        { error: "This website was checked in the last 24 hours, and each website can be checked once a day. Please try again tomorrow, or call us and we will go through it with you." },
        429
      );
    }

    const authorizedAt = new Date();
    const outcome = await runScan(target.host);
    if (!outcome.ok) {
      // A name that does not resolve or is refused was never scanned, so it
      // does not use up the domain's daily check.
      await store.releaseDomain(target.limitKey, "scan");
      return json({ error: outcome.message }, outcome.reason === "refused" ? 422 : 400);
    }

    const record = {
      host: target.host,
      // Stored under the registrable domain: it is the rate-limit key.
      domain: target.limitKey,
      ip,
      userAgent: userAgent(req),
      authorizationText: AUTHORIZATION_TEXT,
      authorizationVersion: AUTHORIZATION_VERSION,
      authorizedAt,
      result: outcome.result,
    };
    const scanId = await store.saveScan(record);

    if (store.kind === "memory") {
      // No database yet: email the authorization record so it is kept.
      waitUntil(
        sendScanRecord(
          {
            scanId,
            host: record.host,
            domain: record.domain,
            ip: record.ip,
            userAgent: record.userAgent,
            authorizedAt: authorizedAt.toISOString(),
            authorizationText: record.authorizationText,
            authorizationVersion: record.authorizationVersion,
          },
          outcome.result,
          "scan"
        ).catch(() => undefined)
      );
    }

    return json({
      scanId,
      result: outcome.result,
      signature: signResult(JSON.stringify(outcome.result)),
      cached: false,
      followups,
    });
  } catch (err) {
    console.error("security-check scan failed:", err instanceof Error ? err.message : "unknown");
    return json({ error: "The check could not run just now. Please try again in a few minutes." }, 503);
  }
}
