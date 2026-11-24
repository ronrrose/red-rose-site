import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { RESULT_DISCLAIMER, REVIEW_BADGE, type ScanResult } from "@/lib/security-check/types";
import { QUIZ, QUIZ_TIE_IN, scoreQuiz, type QuizAnswers } from "@/lib/security-check/quiz";
import { BOOKING_URL, PHONE_DISPLAY, SITE_URL } from "@/lib/site-config";
import { OFFERS } from "@/lib/security-check/offers";

/**
 * The emailed report, built in-house with pdf-lib (MIT, pure JavaScript, no
 * service call). Standard Helvetica, so no font files ship with the function.
 */

const PAGE = { w: 612, h: 792, margin: 54 };
const INK = rgb(0.1, 0.1, 0.12);
const MUTED = rgb(0.35, 0.35, 0.4);
const BRAND = rgb(0.6, 0.07, 0.12);
const FAIL = rgb(0.68, 0.1, 0.1);
const WARN = rgb(0.55, 0.36, 0.0);
const PASS = rgb(0.1, 0.45, 0.2);

/** Helvetica in pdf-lib speaks WinAnsi only. Map the common typographic characters, drop the rest. */
export function toWinAnsi(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7E¡-ÿ\n]/g, "");
}

type Ctx = { doc: PDFDocument; page: PDFPage; y: number; font: PDFFont; bold: PDFFont };

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE.w, PAGE.h]);
  ctx.y = PAGE.h - PAGE.margin;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < PAGE.margin) newPage(ctx);
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of toWinAnsi(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const trial = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(trial, size) <= width) line = trial;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

function text(ctx: Ctx, s: string, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) {
  const size = opts.size ?? 10.5;
  const font = opts.bold ? ctx.bold : ctx.font;
  const indent = opts.indent ?? 0;
  const lh = size * 1.4;
  for (const line of wrap(s, font, size, PAGE.w - PAGE.margin * 2 - indent)) {
    ensure(ctx, lh);
    ctx.page.drawText(line, { x: PAGE.margin + indent, y: ctx.y - size, size, font, color: opts.color ?? INK });
    ctx.y -= lh;
  }
  ctx.y -= opts.gap ?? 4;
}

function rule(ctx: Ctx) {
  ensure(ctx, 12);
  ctx.page.drawLine({
    start: { x: PAGE.margin, y: ctx.y - 4 },
    end: { x: PAGE.w - PAGE.margin, y: ctx.y - 4 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.82),
  });
  ctx.y -= 14;
}

const STATUS_WORD: Record<string, string> = { pass: "Pass", warn: "Warning", fail: "Fail", skipped: "Not run", error: "Could not check" };
const STATUS_COLOR: Record<string, ReturnType<typeof rgb>> = { pass: PASS, warn: WARN, fail: FAIL, skipped: MUTED, error: MUTED };

export type ReportInput = {
  scan: ScanResult;
  practice: string;
  preparedFor: string;
  quiz: QuizAnswers | null;
};

export async function buildReportPdf(input: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(toWinAnsi(`Free Practice Security Check: ${input.scan.host}`));
  doc.setAuthor("Red Rose Technologies LLC");
  doc.setCreator("Red Rose Technologies Free Practice Security Check");
  doc.setProducer("pdf-lib");
  const ctx: Ctx = {
    doc,
    page: doc.addPage([PAGE.w, PAGE.h]),
    y: PAGE.h - PAGE.margin,
    font: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const { scan } = input;

  text(ctx, "Red Rose Technologies", { size: 11, bold: true, color: BRAND, gap: 2 });
  text(ctx, "Free Practice Security Check", { size: 20, bold: true, gap: 6 });
  text(ctx, `Website: ${scan.host}`, { size: 11, gap: 0 });
  text(ctx, `Practice: ${input.practice}`, { size: 11, gap: 0 });
  text(ctx, `Prepared for: ${input.preparedFor}`, { size: 11, gap: 0 });
  text(ctx, `Checked: ${new Date(scan.scannedAt).toUTCString()}`, { size: 11, color: MUTED, gap: 10 });

  text(ctx, `Score: ${scan.score} out of 100, grade ${scan.grade}`, { size: 16, bold: true, gap: 6 });
  text(ctx, RESULT_DISCLAIMER, { size: 10, color: MUTED, gap: 10 });
  rule(ctx);

  text(ctx, scan.findings.length ? "What to fix first" : "What we found", { size: 14, bold: true, gap: 6 });
  if (!scan.findings.length) text(ctx, "No problems turned up in the public signals we check.", { gap: 8 });
  scan.findings.forEach((f, i) => {
    ensure(ctx, 70);
    text(ctx, `${i + 1}. ${f.title}`, { bold: true, size: 11.5, color: f.severity === "fail" ? FAIL : WARN, gap: 2 });
    if (f.detail) text(ctx, `What we saw: ${f.detail}`, { size: 10, color: MUTED, indent: 14, gap: 2 });
    text(ctx, `Why it matters to a dental office: ${f.why}`, { size: 10.5, indent: 14, gap: 2 });
    text(ctx, `Fix: ${f.fix}`, { size: 10.5, indent: 14, gap: 10 });
  });
  for (const s of scan.strengths) {
    text(ctx, `Working well: ${s.title}. ${s.summary}`, { size: 10.5, color: PASS, gap: 6 });
  }
  rule(ctx);

  text(ctx, "Every check", { size: 14, bold: true, gap: 6 });
  scan.checks.forEach((c, i) => {
    ensure(ctx, 40);
    text(ctx, `${i + 1}. ${c.label}: ${STATUS_WORD[c.status]}`, { bold: true, size: 11, color: STATUS_COLOR[c.status], gap: 2 });
    text(ctx, c.summary, { size: 10, indent: 14, gap: 2 });
    for (const d of c.details) text(ctx, `- ${d}`, { size: 9.5, color: MUTED, indent: 14, gap: 0 });
    ctx.y -= 6;
  });

  if (input.quiz && Object.keys(input.quiz).length) {
    const q = scoreQuiz(input.quiz);
    rule(ctx);
    text(ctx, `Shadow AI Risk Check: ${q.level} risk`, { size: 14, bold: true, gap: 6 });
    text(ctx, QUIZ_TIE_IN, { size: 10.5, gap: 6 });
    q.topRisks.forEach((r, i) => {
      text(ctx, `${i + 1}. ${r.title}`, { bold: true, size: 11, gap: 2 });
      text(ctx, r.explanation, { size: 10.5, indent: 14, gap: 6 });
    });
    text(ctx, "Your answers", { bold: true, size: 11, gap: 2 });
    for (const question of QUIZ) {
      const a = question.options.find((o) => o.id === input.quiz?.[question.id]);
      if (a) text(ctx, `${question.text} ${a.label}.`, { size: 9.5, color: MUTED, indent: 14, gap: 1 });
    }
    ctx.y -= 6;
  }

  rule(ctx);
  text(ctx, "Next step", { size: 14, bold: true, gap: 6 });
  text(ctx, `Book a free 30-minute review of your results: ${BOOKING_URL}`, { gap: 2 });
  text(ctx, `Or call us at ${PHONE_DISPLAY}.`, { gap: 6 });
  for (const o of OFFERS) text(ctx, `${o.price}: ${o.name}`, { size: 10.5, gap: 2 });
  ctx.y -= 8;

  rule(ctx);
  text(ctx, "What this check did", { size: 12, bold: true, gap: 4 });
  text(
    ctx,
    "Passive checks only. We read what any browser can see: the homepage, its redirects, and public DNS records. " +
      (scan.exposedFilesChecked
        ? "Because the request came from an email address at this domain, we also asked whether three common sensitive files answer, using HEAD requests that never download them."
        : "The exposed-files check was not run, because it is only available when the request comes from an email address at this domain."),
    { size: 9.5, color: MUTED, gap: 4 }
  );
  const reqs = scan.requests.filter((r) => r.method !== "DNS");
  for (const r of reqs) text(ctx, `${r.method} ${r.url}: ${r.status ?? r.error ?? "no answer"}`, { size: 8.5, color: MUTED, gap: 0 });
  text(ctx, `Plus ${scan.requests.length - reqs.length} DNS lookups for email records.`, { size: 8.5, color: MUTED, gap: 8 });
  text(ctx, REVIEW_BADGE, { size: 9.5, bold: true, gap: 2 });
  text(ctx, RESULT_DISCLAIMER, { size: 9.5, color: MUTED, gap: 2 });
  text(ctx, `Red Rose Technologies LLC, ${SITE_URL.replace("https://", "")}`, { size: 9.5, color: MUTED });

  return doc.save();
}
