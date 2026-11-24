import type { NextRequest } from "next/server";
import { getStore } from "@/lib/security-check/store";
import { verifyToken } from "@/lib/security-check/tokens";
import { addExposedFilesToResult, runScan } from "@/lib/security-check/scan";
import { emailMatchesDomain, registrableDomain } from "@/lib/security-check/target";
import { buildReportPdf } from "@/lib/security-check/pdf";
import { sendReportEmail, sendScanRecord } from "@/lib/security-check/emails";
import { clientIp, json, minutes, readJson, sameOrigin, userAgent } from "@/lib/security-check/http";
import { DOMAIN_WINDOW_MS, FILES_RUNS_PER_IP_PER_HOUR, HOUR_MS } from "@/lib/security-check/limits";
import { AUTHORIZATION_TEXT, AUTHORIZATION_VERSION } from "@/lib/security-check/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

/**
 * Check 5, the exposed-files check.
 *
 * It runs only from the signed link in the report email, and the link is
 * only issued when the visitor's email is at the scanned domain. Clicking it
 * proves the inbox; ticking a box alone does not. The page asks for a button
 * press before calling this, so a mail scanner that opens links cannot
 * trigger it. Once per domain per 24 hours, like the main scan.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Refused." }, 403);
  const body = (await readJson(req, 4_000)) as { token?: unknown } | null;
  const claims = verifyToken<{ s: string; h: string; e: string }>("files", body?.token);
  if (!claims || typeof claims.h !== "string" || typeof claims.e !== "string" || !emailMatchesDomain(claims.e, claims.h)) {
    return json({ error: "This link is not valid or has expired. Run the check again to get a new one." }, 400);
  }

  const ip = clientIp(req);
  const store = await getStore();
  try {
    const slot = await store.takeSlot("files-ip", ip, FILES_RUNS_PER_IP_PER_HOUR, HOUR_MS);
    if (!slot.allowed) return json({ error: `Too many requests. Try again in ${minutes(slot.retryAfterSeconds)}.` }, 429);

    const stored = typeof claims.s === "string" ? await store.getScan(claims.s) : null;
    const domain = stored?.domain ?? registrableDomain(claims.h);
    if (!(await store.claimDomain(domain, "files", DOMAIN_WINDOW_MS))) {
      return json({ error: "The full check already ran for this domain in the last 24 hours. Check your email for that report." }, 429);
    }

    // With the stored scan, only the three HEAD requests are new. Without it
    // (no database, another instance), run the whole check once.
    let result;
    if (stored && stored.host === claims.h) {
      result = await addExposedFilesToResult(stored.result);
      await store.updateScanResult(stored.id, result);
    } else {
      const outcome = await runScan(claims.h, { includeExposedFiles: true });
      if (!outcome.ok) {
        await store.releaseDomain(domain, "files");
        return json({ error: outcome.message }, 400);
      }
      result = outcome.result;
    }

    if (store.kind === "memory") {
      await sendScanRecord(
        {
          scanId: claims.s ?? "none",
          host: claims.h,
          domain,
          ip,
          userAgent: userAgent(req),
          authorizedAt: new Date().toISOString(),
          authorizationText: `${AUTHORIZATION_TEXT} (confirmed by the emailed link sent to ${claims.e})`,
          authorizationVersion: AUTHORIZATION_VERSION,
        },
        result,
        "files"
      ).catch(() => undefined);
    }

    const pdf = await buildReportPdf({ scan: result, practice: domain, preparedFor: claims.e, quiz: null });
    const sent = await sendReportEmail({
      to: claims.e,
      name: "",
      practice: domain,
      scan: result,
      pdf,
      unlockUrl: null,
      followupsPlanned: false,
    });
    return json({ ok: true, result, emailed: sent.ok });
  } catch (err) {
    console.error("security-check full run failed:", err instanceof Error ? err.message : "unknown");
    return json({ error: "The check could not run just now. Please try again in a few minutes." }, 503);
  }
}
