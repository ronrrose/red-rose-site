import { Resend } from "resend";
import { BOOKING_URL, CONTACT_EMAIL, PHONE_DISPLAY, SITE_URL } from "@/lib/site-config";
import { RESULT_DISCLAIMER, REVIEW_BADGE, type ScanResult } from "@/lib/security-check/types";
import { QUIZ, scoreQuiz, type QuizAnswers } from "@/lib/security-check/quiz";
import { OFFERS, REVIEW_CTA_LABEL } from "@/lib/security-check/offers";
import { hasDedicatedSecret } from "@/lib/security-check/tokens";

/**
 * Every email the Security Check sends, built here so the wording sits in
 * one reviewable place.
 *
 *   Day 0 report      transactional: the visitor asked for it
 *   Lead alert        to the address in SECURITY_CHECK_ALERT_TO
 *   Scan record       same inbox, only when there is no database yet
 *   Day 3 and day 7   marketing: off unless SECURITY_CHECK_FOLLOWUPS_ENABLED
 *                     is "true" AND SECURITY_CHECK_POSTAL_ADDRESS is set,
 *                     because CAN-SPAM requires a valid postal address and a
 *                     working unsubscribe in each one
 */

export const FROM = "Red Rose Technologies <noreply@redrosetechnologies.com>";
export const CHECK_URL = `${SITE_URL}/free-security-check`;

/**
 * Where lead alerts go. Set SECURITY_CHECK_ALERT_TO in Vercel to the inbox
 * that should get them; until then they go to the public contact inbox.
 */
export function alertTo(): string {
  return (process.env.SECURITY_CHECK_ALERT_TO || "").trim() || CONTACT_EMAIL;
}

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const WRAP_OPEN =
  '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1f;line-height:1.5;">';
const WRAP_CLOSE = "</div>";

function findingsHtml(scan: ScanResult): string {
  if (!scan.findings.length) {
    return `<p>No problems turned up in the public signals we check.</p>`;
  }
  return scan.findings
    .map(
      (f, i) => `
      <div style="margin:0 0 16px;">
        <p style="margin:0 0 4px;font-weight:600;color:${f.severity === "fail" ? "#a3161a" : "#8a5a00"};">${i + 1}. ${esc(f.title)}</p>
        ${f.detail ? `<p style="margin:0 0 4px;color:#555;font-size:14px;">What we saw: ${esc(f.detail)}</p>` : ""}
        <p style="margin:0 0 4px;font-size:14px;"><strong>Why it matters to a dental office:</strong> ${esc(f.why)}</p>
        <p style="margin:0;font-size:14px;"><strong>Fix:</strong> ${esc(f.fix)}</p>
      </div>`
    )
    .join("");
}

function ctaHtml(): string {
  return `
    <p style="margin:24px 0 8px;"><a href="${esc(BOOKING_URL)}" style="display:inline-block;background:#8f1219;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${esc(REVIEW_CTA_LABEL)}</a></p>
    <p style="margin:0 0 4px;font-size:14px;">Or call us at ${esc(PHONE_DISPLAY)}.</p>
    <p style="margin:12px 0 0;font-size:14px;color:#555;">${OFFERS.map((o) => `${esc(o.price)}: ${esc(o.name)}`).join("<br>")}</p>`;
}

function footerHtml(): string {
  return `
    <p style="margin:24px 0 4px;font-size:12px;color:#555;">${esc(REVIEW_BADGE)}</p>
    <p style="margin:0;font-size:12px;color:#555;">${esc(RESULT_DISCLAIMER)}</p>`;
}

/* ── Day 0: the report ──────────────────────────────────────────────────── */

export type ReportEmailInput = {
  to: string;
  name: string;
  practice: string;
  scan: ScanResult;
  pdf: Uint8Array;
  /** Signed link that unlocks check 5, when the email is at the scanned domain. */
  unlockUrl: string | null;
  followupsPlanned: boolean;
};

export function reportEmail(input: ReportEmailInput) {
  const { scan } = input;
  const first = input.name.trim().split(/\s+/)[0] || "there";
  const subject = `Your security check for ${scan.host}: ${scan.score}/100`;
  const unlock = input.unlockUrl
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f6f1f1;border-radius:8px;font-size:14px;">Your email is at ${esc(scan.domain)}, so you can also run the exposed-files check. <a href="${esc(input.unlockUrl)}">Run the full check</a>. The link works for 7 days.</p>`
    : scan.exposedFilesChecked
      ? ""
      : `<p style="margin:16px 0;font-size:14px;color:#555;">The exposed-files check was not run. Run the full check from an email address at this domain.</p>`;
  const html = `${WRAP_OPEN}
    <p>Hi ${esc(first)},</p>
    <p>Here is the free security check for <strong>${esc(scan.host)}</strong>, the website for ${esc(input.practice)}. The full report is attached as a PDF.</p>
    <p style="font-size:20px;font-weight:700;margin:16px 0 4px;">${scan.score} out of 100, grade ${scan.grade}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#555;">${esc(RESULT_DISCLAIMER)}</p>
    ${findingsHtml(scan)}
    ${unlock}
    ${ctaHtml()}
    ${input.followupsPlanned ? `<p style="margin:16px 0 0;font-size:13px;color:#555;">We will send two short follow-up emails over the next week. Each one has an unsubscribe link.</p>` : ""}
    ${footerHtml()}
    <p style="margin:12px 0 0;font-size:12px;color:#555;">You are receiving this because you asked for this report at ${esc(CHECK_URL)}.</p>
  ${WRAP_CLOSE}`;
  const text = [
    `Hi ${first},`,
    "",
    `Here is the free security check for ${scan.host}, the website for ${input.practice}. The full report is attached as a PDF.`,
    "",
    `${scan.score} out of 100, grade ${scan.grade}`,
    RESULT_DISCLAIMER,
    "",
    ...scan.findings.flatMap((f, i) => [
      `${i + 1}. ${f.title}`,
      ...(f.detail ? [`What we saw: ${f.detail}`] : []),
      `Why it matters to a dental office: ${f.why}`,
      `Fix: ${f.fix}`,
      "",
    ]),
    ...(input.unlockUrl ? [`Run the full check, including exposed files (link works for 7 days): ${input.unlockUrl}`, ""] : []),
    `${REVIEW_CTA_LABEL}: ${BOOKING_URL}`,
    `Or call us at ${PHONE_DISPLAY}.`,
    ...OFFERS.map((o) => `${o.price}: ${o.name}`),
    "",
    REVIEW_BADGE,
  ].join("\n");
  return { subject, html, text };
}

export async function sendReportEmail(input: ReportEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };
  const { subject, html, text } = reportEmail(input);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [input.to],
    replyTo: CONTACT_EMAIL,
    subject,
    html,
    text,
    attachments: [{ filename: `security-check-${input.scan.host}.pdf`, content: Buffer.from(input.pdf) }],
  });
  return error ? { ok: false, error: error.message } : { ok: true, id: data?.id };
}

/* ── Lead alert ─────────────────────────────────────────────────────────── */

export type AuthorizationRecord = {
  scanId: string;
  host: string;
  domain: string;
  ip: string | null;
  userAgent: string | null;
  authorizedAt: string;
  authorizationText: string;
  authorizationVersion: string;
};

export type LeadAlertInput = {
  lead: { name: string; practice: string; email: string; phone: string | null; role: string | null };
  scan: ScanResult;
  authorization: AuthorizationRecord;
  quiz: QuizAnswers | null;
  storeKind: "postgres" | "memory";
  crm: string;
  emailMatchesDomain: boolean;
  reportStatus: string;
  pdf: Uint8Array | null;
};

function rows(pairs: Array<[string, string]>, size = 14): string {
  return `<table style="border-collapse:collapse;font-size:${size}px;">${pairs
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;">${esc(v)}</td></tr>`)
    .join("")}</table>`;
}

function authorizationPairs(a: AuthorizationRecord): Array<[string, string]> {
  return [
    ["Scan id", a.scanId],
    ["Website", a.host],
    ["Domain", a.domain],
    ["Authorized at", a.authorizedAt],
    ["IP", a.ip ?? "unknown"],
    ["Browser", a.userAgent ?? "unknown"],
    ["Checkbox text", a.authorizationText],
    ["Checkbox version", a.authorizationVersion],
  ];
}

export function leadAlertEmail(input: LeadAlertInput) {
  const { lead, scan } = input;
  const quiz = input.quiz && Object.keys(input.quiz).length ? scoreQuiz(input.quiz) : null;
  const subject = `Security check lead: ${lead.practice} (${scan.host}, ${scan.score}/100)`;
  const quizHtml = quiz
    ? `<h3>Shadow AI Risk Check: ${quiz.level} (${quiz.points}/${quiz.maxPoints})</h3><ul>${QUIZ.map((q) => {
        const a = q.options.find((o) => o.id === input.quiz?.[q.id]);
        return a ? `<li>${esc(q.text)} <strong>${esc(a.label)}</strong></li>` : "";
      }).join("")}</ul>`
    : "<p>Quiz not taken.</p>";
  const html = `${WRAP_OPEN}
    <h2 style="margin:0 0 12px;">New Free Practice Security Check lead</h2>
    ${rows([
      ["Name", lead.name],
      ["Practice", lead.practice],
      ["Email", lead.email],
      ["Phone", lead.phone ?? ""],
      ["Role", lead.role ?? ""],
      ["Email at scanned domain", input.emailMatchesDomain ? "yes" : "no"],
      ["Report email", input.reportStatus],
      ["CRM", input.crm],
      ["Storage", input.storeKind === "postgres" ? "database" : "none yet: this email is the record"],
    ])}
    <h3>Scan: ${scan.score}/100, grade ${scan.grade}</h3>
    <ul>${scan.checks.map((c) => `<li><strong>${esc(c.label)}</strong>: ${esc(c.status)}. ${esc(c.summary)}</li>`).join("")}</ul>
    ${quizHtml}
    <h3>Authorization record</h3>
    ${rows(authorizationPairs(input.authorization), 13)}
  ${WRAP_CLOSE}`;
  return { subject, html };
}

export async function sendLeadAlert(input: LeadAlertInput): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const { subject, html } = leadAlertEmail(input);
  const { error } = await resend.emails.send({
    from: FROM,
    to: [alertTo()],
    replyTo: input.lead.email,
    subject,
    html,
    attachments: input.pdf ? [{ filename: `security-check-${input.scan.host}.pdf`, content: Buffer.from(input.pdf) }] : undefined,
  });
  if (error) console.error("security-check: lead alert failed:", error.message);
  return !error;
}

/** Sent only when there is no database, so the authorization record exists somewhere durable. */
export async function sendScanRecord(a: AuthorizationRecord, scan: ScanResult, kind: "scan" | "files"): Promise<void> {
  const resend = getResend();
  const what = kind === "files" ? "exposed-files run" : "scan";
  if (!resend) {
    console.error(`security-check: no database and no RESEND_API_KEY; ${what} record only in logs`, JSON.stringify(a));
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to: [alertTo()],
    subject: `Security check ${what} record: ${a.host} (${scan.score}/100)`,
    html: `${WRAP_OPEN}<p>There is no database yet, so this email is the authorization record for this ${what}.</p>${rows(authorizationPairs(a), 13)}${WRAP_CLOSE}`,
  });
  if (error) console.error("security-check: scan record email failed:", error.message);
}

/** Without a database an unsubscribe cannot be stored, so it is sent to the inbox to honor by hand. */
export async function sendUnsubscribeNotice(email: string, leadId: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: [alertTo()],
    subject: "Security check unsubscribe request",
    html: `${WRAP_OPEN}<p>Unsubscribe request from the Security Check follow-ups. There is no database, so please record it by hand.</p>${rows([["Email", email], ["Lead id", leadId]])}${WRAP_CLOSE}`,
  });
}

/* ── Day 3 and day 7 (marketing) ────────────────────────────────────────── */

export type FollowupConfig = { enabled: true; postalAddress: string } | { enabled: false; reason: string };

export function followupConfig(): FollowupConfig {
  if (process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED !== "true") {
    return { enabled: false, reason: "SECURITY_CHECK_FOLLOWUPS_ENABLED is not true" };
  }
  const postal = (process.env.SECURITY_CHECK_POSTAL_ADDRESS ?? "").trim();
  if (postal.length < 10) return { enabled: false, reason: "SECURITY_CHECK_POSTAL_ADDRESS is not set" };
  // Unsubscribe links are signed only with the dedicated secret; no links, no marketing mail.
  if (!hasDedicatedSecret()) return { enabled: false, reason: "SECURITY_CHECK_SECRET is not set" };
  return { enabled: true, postalAddress: postal };
}

export type FollowupInput = {
  day: 3 | 7;
  to: string;
  name: string;
  scan: ScanResult | null;
  postalAddress: string;
  /** The page with an unsubscribe button, linked in the body. */
  unsubscribeUrl: string;
  /** The API endpoint mail clients POST to for RFC 8058 one-click unsubscribe. */
  oneClickUrl: string;
};

export function followupEmail(input: FollowupInput) {
  const first = input.name.trim().split(/\s+/)[0] || "there";
  const top = input.scan?.findings[0] ?? null;
  let subject: string;
  let bodyHtml: string;
  let bodyText: string;

  if (input.day === 3 && top && input.scan) {
    subject = `One thing to fix on ${input.scan.host}`;
    bodyHtml = `
      <p>Hi ${esc(first)},</p>
      <p>Your security check flagged this as the first thing to fix:</p>
      <p style="font-weight:600;margin:16px 0 4px;">${esc(top.title)}</p>
      ${top.detail ? `<p style="margin:0 0 8px;color:#555;">What we saw: ${esc(top.detail)}</p>` : ""}
      <p><strong>Why it matters to a dental office:</strong> ${esc(top.why)}</p>
      <p><strong>The fix:</strong> ${esc(top.fix)}</p>
      <p>If you would like a hand, that is what the free review is for.</p>`;
    bodyText = `Hi ${first},\n\nYour security check flagged this as the first thing to fix:\n\n${top.title}\n${top.detail ? `What we saw: ${top.detail}\n` : ""}Why it matters to a dental office: ${top.why}\nThe fix: ${top.fix}\n\nIf you would like a hand, that is what the free review is for.`;
  } else if (input.day === 3) {
    subject = "Your security check, three days on";
    bodyHtml = `<p>Hi ${esc(first)},</p><p>Your check came back without problems in the public signals we look at. The next layer down, inside the office network, is where a full review looks.</p>`;
    bodyText = `Hi ${first},\n\nYour check came back without problems in the public signals we look at. The next layer down, inside the office network, is where a full review looks.`;
  } else {
    subject = "Want to go through your results together?";
    const on = input.scan ? ` on ${input.scan.host}` : "";
    bodyHtml = `<p>Hi ${esc(first)},</p><p>A week ago you ran the Free Practice Security Check${esc(on)}. If you would like to walk through the results and what to do first, book a free 30-minute review. No obligation.</p>`;
    bodyText = `Hi ${first},\n\nA week ago you ran the Free Practice Security Check${on}. If you would like to walk through the results and what to do first, book a free 30-minute review. No obligation.`;
  }

  const html = `${WRAP_OPEN}${bodyHtml}${ctaHtml()}
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0 12px;">
    <p style="font-size:12px;color:#555;margin:0 0 4px;">This is a marketing email from Red Rose Technologies LLC. You are receiving it because you asked for a Free Practice Security Check report.</p>
    <p style="font-size:12px;color:#555;margin:0 0 4px;">${esc(input.postalAddress)}</p>
    <p style="font-size:12px;margin:0;"><a href="${esc(input.unsubscribeUrl)}">Unsubscribe from these emails</a></p>
  ${WRAP_CLOSE}`;
  const text = `${bodyText}\n\n${REVIEW_CTA_LABEL}: ${BOOKING_URL}\n\n--\nThis is a marketing email from Red Rose Technologies LLC. You are receiving it because you asked for a Free Practice Security Check report.\n${input.postalAddress}\nUnsubscribe: ${input.unsubscribeUrl}`;
  return { subject, html, text };
}

export async function sendFollowup(input: FollowupInput): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const { subject, html, text } = followupEmail(input);
  const { error } = await resend.emails.send({
    from: FROM,
    to: [input.to],
    replyTo: CONTACT_EMAIL,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${input.oneClickUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (error) console.error("security-check: follow-up failed:", error.message);
  return !error;
}
