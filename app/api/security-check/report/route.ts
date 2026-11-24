import type { NextRequest } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/security-check/store";
import { signToken, verifyResult } from "@/lib/security-check/tokens";
import { emailMatchesDomain } from "@/lib/security-check/target";
import { sanitizeAnswers } from "@/lib/security-check/quiz";
import { buildReportPdf } from "@/lib/security-check/pdf";
import { followupConfig, sendLeadAlert, sendReportEmail } from "@/lib/security-check/emails";
import { clientIp, json, minutes, readJson, sameOrigin, siteBase } from "@/lib/security-check/http";
import { HOUR_MS, REPORTS_PER_IP_PER_HOUR, UNLOCK_TTL_SECONDS } from "@/lib/security-check/limits";
import { AUTHORIZATION_TEXT, AUTHORIZATION_VERSION, type ScanResult } from "@/lib/security-check/types";
import { createLead } from "@/lib/leads/create-lead";
import { normalizeEmail } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ROLES = ["Owner or dentist", "Office manager", "Front desk", "IT contact", "Other"] as const;

const bodySchema = z.object({
  scanId: z.string().max(100),
  /** The result exactly as the scan route returned it, plus its signature. */
  result: z.unknown(),
  signature: z.string().max(200).nullable().optional(),
  name: z.string().trim().min(2).max(100),
  practice: z.string().trim().min(2).max(150),
  email: z.string().trim().min(5).max(254).email(),
  phone: z.string().trim().max(40).optional().default(""),
  role: z.enum(ROLES),
  quiz: z.unknown().optional(),
  website: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Refused." }, 403);
  const parsed = bodySchema.safeParse(await readJson(req, 120_000));
  if (!parsed.success) {
    return json({ error: "Please fill in your name, practice name, a valid email and your role." }, 400);
  }
  const body = parsed.data;
  if (body.website) return json({ error: "Something went wrong. Please try again." }, 400);
  if (/[<>]/.test(body.name + body.practice)) {
    return json({ error: "Please use plain text for your name and practice name." }, 400);
  }

  const ip = clientIp(req);
  const store = await getStore();

  try {
    const slot = await store.takeSlot("report-ip", ip, REPORTS_PER_IP_PER_HOUR, HOUR_MS);
    if (!slot.allowed) {
      return json({ error: `Too many report requests. Try again in ${minutes(slot.retryAfterSeconds)}.` }, 429);
    }

    // Trust the stored scan first; fall back to the signed copy the browser
    // returned (needed when there is no database and this is another instance).
    const stored = await store.getScan(body.scanId);
    let scan: ScanResult | null = stored?.result ?? null;
    if (!scan && verifyResult(JSON.stringify(body.result), body.signature)) {
      scan = body.result as ScanResult;
    }
    if (!scan) {
      return json({ error: "That check has expired. Please run the check again to get your report." }, 410);
    }

    const email = normalizeEmail(body.email) ?? body.email.toLowerCase();
    const quiz = sanitizeAnswers(body.quiz);
    const hasQuiz = Object.keys(quiz).length > 0;
    const matches = emailMatchesDomain(email, scan.host);

    // Into the CRM, when it exists. A failure here never blocks the report.
    let crm = "not configured";
    let contactId: string | null = null;
    try {
      const lead = await createLead({
        source: "security_check",
        name: body.name,
        email,
        phone: body.phone || null,
        company: body.practice,
        role: body.role,
        summary: `Free Practice Security Check for ${scan.host}: ${scan.score}/100 (${scan.grade}).${hasQuiz ? " Took the Shadow AI quiz." : ""}`,
        pageUrl: "/free-security-check",
        activityType: "form",
        consentSms: false,
      });
      if (lead.ok) {
        contactId = lead.contactId;
        crm = lead.created ? "new contact" : "merged into existing contact";
      } else crm = lead.reason;
    } catch (err) {
      crm = "error";
      console.error("security-check: createLead failed:", err instanceof Error ? err.message : "unknown");
    }

    const leadId = await store.saveLead({
      scanId: stored ? body.scanId : null,
      contactId,
      name: body.name,
      practice: body.practice,
      email,
      phone: body.phone || null,
      role: body.role,
      quiz: hasQuiz ? quiz : null,
      ip,
    });

    const pdf = await buildReportPdf({ scan, practice: body.practice, preparedFor: body.name, quiz: hasQuiz ? quiz : null });

    const unlockToken =
      matches && !scan.exposedFilesChecked
        ? signToken("files", { s: body.scanId, h: scan.host, e: email }, UNLOCK_TTL_SECONDS)
        : null;
    const unlockUrl = unlockToken ? `${siteBase(req)}/free-security-check/full?t=${encodeURIComponent(unlockToken)}` : null;
    const followupsPlanned = followupConfig().enabled && store.kind === "postgres";

    const sent = await sendReportEmail({
      to: email,
      name: body.name,
      practice: body.practice,
      scan,
      pdf,
      unlockUrl,
      followupsPlanned,
    });
    if (sent.ok) await store.markReportSent(leadId);
    else console.error("security-check: report email failed:", sent.error);

    const authorization = {
      scanId: body.scanId,
      host: scan.host,
      domain: scan.domain,
      ip: stored?.ip ?? null,
      userAgent: stored?.userAgent ?? null,
      authorizedAt: stored?.authorizedAt.toISOString() ?? scan.scannedAt,
      authorizationText: stored?.authorizationText ?? AUTHORIZATION_TEXT,
      authorizationVersion: stored?.authorizationVersion ?? AUTHORIZATION_VERSION,
    };
    const alerted = await sendLeadAlert({
      lead: { name: body.name, practice: body.practice, email, phone: body.phone || null, role: body.role },
      scan,
      authorization,
      quiz: hasQuiz ? quiz : null,
      storeKind: store.kind,
      crm,
      emailMatchesDomain: matches,
      reportStatus: sent.ok ? `sent (${sent.id ?? "no id"})` : `FAILED: ${sent.error ?? "unknown"}`,
      pdf,
    });

    if (!sent.ok) {
      return json(
        {
          error: alerted
            ? "We could not send the report just now. Our team has your request and will email it to you."
            : "We could not send the report just now. Please try again in a few minutes.",
        },
        502
      );
    }
    return json({
      ok: true,
      emailedTo: email,
      filesCheck: scan.exposedFilesChecked ? "done" : matches ? (unlockUrl ? "link_sent" : "unavailable") : "email_mismatch",
    });
  } catch (err) {
    console.error("security-check report failed:", err instanceof Error ? err.message : "unknown");
    return json({ error: "We could not send the report just now. Please try again in a few minutes." }, 503);
  }
}
