"use client";

import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, ArrowUpRight } from "lucide-react";
import {
  FILES_SKIPPED_MESSAGE,
  RESULT_DISCLAIMER,
  REVIEW_BADGE,
  type CheckStatus,
  type ScanResult,
} from "@/lib/security-check/types";
import { OFFERS, REVIEW_CTA_LABEL } from "@/lib/security-check/offers";
import { BOOKING_URL } from "@/lib/site-config";

/**
 * The scan result. Every string shown here was produced by our own code from
 * fixed vocabulary; nothing fetched from the scanned site is rendered.
 */

const STATUS: Record<CheckStatus, { word: string; className: string; Icon: typeof CheckCircle2 }> = {
  pass: { word: "Pass", className: "text-green-700 dark:text-green-400", Icon: CheckCircle2 },
  warn: { word: "Warning", className: "text-amber-700 dark:text-amber-300", Icon: AlertTriangle },
  fail: { word: "Fail", className: "text-red-700 dark:text-red-400", Icon: XCircle },
  skipped: { word: "Not run", className: "text-faded", Icon: MinusCircle },
  error: { word: "Could not check", className: "text-faded", Icon: MinusCircle },
};

export function StatusLabel({ status }: { status: CheckStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${s.className}`}>
      <s.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {s.word}
    </span>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-sm text-faded [text-wrap:pretty] ${className}`}>{RESULT_DISCLAIMER}</p>;
}

export function ReviewCta() {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <h3 className="mb-2 text-xl font-semibold text-ink">Want help with these?</h3>
      <p className="mb-6 text-sm text-secondary">Go through the results with us. We will tell you what to fix first and what can wait.</p>
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] sm:w-auto"
      >
        {REVIEW_CTA_LABEL}
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {OFFERS.map((o) => (
          <li key={o.name} className="rounded-xl border border-line p-4">
            <p className="text-base font-semibold text-ink">{o.price}</p>
            <p className="text-sm text-secondary">{o.name.charAt(0).toUpperCase() + o.name.slice(1)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScanResults({ result, note }: { result: ScanResult; note?: string | null }) {
  const scanned = new Date(result.scannedAt);
  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Your result</p>
            <h2 className="mt-1 break-words text-2xl font-bold text-ink md:text-3xl">{result.host}</h2>
            <p className="mt-1 text-sm text-faded">
              Checked {scanned.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <div className="flex items-center gap-4" aria-label={`Score ${result.score} out of 100, grade ${result.grade}`}>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-accent">
              <span className="text-3xl font-bold text-ink" aria-hidden="true">{result.score}</span>
              <span className="text-xs text-faded" aria-hidden="true">of 100</span>
            </div>
            <div aria-hidden="true">
              <p className="text-sm text-faded">Grade</p>
              <p className="text-5xl font-bold text-ink">{result.grade}</p>
            </div>
          </div>
        </div>
        {note && <p className="mt-6 rounded-xl bg-raised p-4 text-sm text-secondary">{note}</p>}
        <Disclaimer className="mt-6" />
        <p className="mt-2 text-sm font-semibold text-secondary">{REVIEW_BADGE}</p>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-ink">
          {result.findings.length ? "What to fix first" : "What we found"}
        </h3>
        <ol className="space-y-4">
          {result.findings.map((f, i) => (
            <li key={`${f.id}-${i}`} className="glass-card rounded-2xl p-6">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusLabel status={f.severity} />
                <h4 className="text-base font-semibold text-ink">{f.title}</h4>
              </div>
              {f.detail && <p className="mb-2 break-words text-sm text-faded">What we saw: {f.detail}</p>}
              <p className="mb-2 text-sm text-secondary [text-wrap:pretty]">
                <span className="font-semibold text-ink">Why it matters to a dental office: </span>
                {f.why}
              </p>
              <p className="text-sm text-secondary [text-wrap:pretty]">
                <span className="font-semibold text-ink">Fix: </span>
                {f.fix}
              </p>
            </li>
          ))}
          {result.strengths.map((s) => (
            <li key={s.check} className="glass-card rounded-2xl p-6">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusLabel status="pass" />
                <h4 className="text-base font-semibold text-ink">{s.title}</h4>
              </div>
              <p className="text-sm text-secondary">{s.summary}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-ink">Every check</h3>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {result.checks.map((c, i) => (
            <li key={c.id} className="p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-ink">
                  {i + 1}. {c.label}
                </p>
                <StatusLabel status={c.status} />
              </div>
              <p className="mt-1 break-words text-sm text-secondary">
                {c.id === "files" && c.status === "skipped" ? `${FILES_SKIPPED_MESSAGE}.` : c.summary}
              </p>
              {c.details.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                    Show details
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-faded">
                    {c.details.map((d) => (
                      <li key={d} className="break-words">{d}</li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Everything this check requested ({result.requests.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-faded">
            {result.requests.map((r, i) => (
              <li key={i} className="break-all font-mono">
                {r.method === "DNS"
                  ? `DNS ${r.url}: ${r.error ? "no record" : `${r.status} record${r.status === 1 ? "" : "s"}`}`
                  : `${r.method} ${r.url}: ${r.status ?? r.error ?? "no answer"}`}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <ReviewCta />
    </div>
  );
}
