"use client";

import { useRef, useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import ScanResults from "@/components/security-check/ScanResults";
import { useSecurityCheck } from "@/components/security-check/SecurityCheckState";
import Unavailable from "@/components/security-check/Unavailable";

const ROLES = ["Owner or dentist", "Office manager", "Front desk", "IT contact", "Other"] as const;

type Fields = { name: string; practice: string; email: string; phone: string; role: string };
type Errors = Partial<Record<keyof Fields, string>>;

/** Mirrors lib/security-check/lead-fields.ts closely enough to catch mistakes before sending. */
const LINK_LIKE = /(:\/\/|www\.|@|[a-z0-9-]\.[a-z]{2,24}(\b|$))/i;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  else if (/\d/.test(f.name) || LINK_LIKE.test(f.name)) e.name = "Please enter your name using letters only.";
  if (f.practice.trim().length < 2) e.practice = "Enter your practice's name.";
  else if (LINK_LIKE.test(f.practice) || /(\d\D{0,2}){7,}/.test(f.practice))
    e.practice = "Please enter your practice's name without a web address or phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.phone.trim() && f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10 digit phone number, or leave it blank.";
  if (!f.role) e.role = "Choose your role.";
  return e;
}

const LABELS: Record<keyof Fields, string> = {
  name: "Your name",
  practice: "Practice name",
  email: "Email",
  phone: "Phone (optional)",
  role: "Your role",
};

export default function ResultsSection() {
  const { scan, quiz } = useSecurityCheck();
  const [fields, setFields] = useState<Fields>({ name: "", practice: "", email: "", phone: "", role: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ to: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const refs = useRef<Partial<Record<keyof Fields, HTMLInputElement | HTMLSelectElement | null>>>({});

  if (!scan) return null;
  const domain = scan.result.domain;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy || !scan) return;
    const errs = validate(fields);
    setErrors(errs);
    const first = (Object.keys(LABELS) as Array<keyof Fields>).find((k) => errs[k]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/security-check/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId: scan.scanId,
          result: scan.result,
          signature: scan.signature,
          ...fields,
          quiz: includeQuiz && quiz ? quiz : undefined,
          website: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.unavailable) {
        setClosed(true);
        return;
      }
      if (data?.field === "name" || data?.field === "practice") {
        const key = data.field as "name" | "practice";
        setErrors({ [key]: data.error });
        refs.current[key]?.focus();
        return;
      }
      if (!res.ok || !data?.ok) {
        setFormError(data?.error ?? "We could not send the report just now. Please try again.");
        return;
      }
      setDone({ to: data.emailedTo });
    } catch {
      setFormError("We could not send the report just now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = (key: keyof Fields, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={`lf-${key}`} className="mb-1 block text-sm font-semibold text-ink">
        {LABELS[key]}
      </label>
      <input
        ref={(el) => {
          refs.current[key] = el;
        }}
        id={`lf-${key}`}
        type={type}
        autoComplete={autoComplete}
        value={fields[key]}
        onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `lf-${key}-error` : undefined}
        className="min-h-[44px] w-full rounded-xl border border-input-border bg-input-bg px-4 py-2 text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {errors[key] && (
        <p id={`lf-${key}-error`} className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <section aria-labelledby="results-heading" className="section-padding border-t border-line">
      <div className="container-site max-w-4xl">
        <h2 id="results-heading" tabIndex={-1} className="sr-only scroll-mt-28">
          Your security check result
        </h2>
        <ScanResults result={scan.result} note={scan.note} />

        <div className="glass-card mt-8 rounded-2xl p-6 md:p-8">
          <h3 className="mb-2 text-xl font-semibold text-ink">Get the full PDF report</h3>
          {done ? (
            <div role="status">
              <p className="text-base text-ink">Report sent to {done.to}. It should arrive within a minute.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <p className="mb-6 text-sm text-secondary [text-wrap:pretty]">
                We will email the report now.
                {scan.followups &&
                  ` If your email address is at ${domain}, we will also send two short follow-up emails over the next week, each with an unsubscribe link.`}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {input("name", "text", "name")}
                {input("practice", "text", "organization")}
                {input("email", "email", "email")}
                {input("phone", "tel", "tel")}
                <div>
                  <label htmlFor="lf-role" className="mb-1 block text-sm font-semibold text-ink">
                    {LABELS.role}
                  </label>
                  <select
                    ref={(el) => {
                      refs.current.role = el;
                    }}
                    id="lf-role"
                    value={fields.role}
                    onChange={(e) => setFields({ ...fields, role: e.target.value })}
                    aria-invalid={errors.role ? true : undefined}
                    aria-describedby={errors.role ? "lf-role-error" : undefined}
                    className="min-h-[44px] w-full rounded-xl border border-input-border bg-input-bg px-4 py-2 text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    <option value="">Choose one</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p id="lf-role-error" className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>
              {quiz && (
                <div className="mt-4 flex items-start gap-3">
                  <input
                    id="lf-quiz"
                    type="checkbox"
                    checked={includeQuiz}
                    onChange={(e) => setIncludeQuiz(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--color-accent))]"
                  />
                  <label htmlFor="lf-quiz" className="text-sm text-secondary">
                    Add my Shadow AI Risk Check answers to the report
                  </label>
                </div>
              )}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="lf-website">Leave this empty</label>
                <input ref={honeypot} id="lf-website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <p className="mt-4 text-xs text-faded">Do not enter any patient information. We never ask for it.</p>
              <button
                type="submit"
                disabled={busy}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
                {busy ? "Sending your report" : "Email me the full report"}
              </button>
              {closed && <Unavailable />}
              {formError && (
                <p role="alert" className="mt-4 rounded-xl bg-raised p-4 text-sm font-medium text-ink">
                  {formError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
