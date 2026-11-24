"use client";

import { useRef, useState, type FormEvent } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { AUTHORIZATION_TEXT } from "@/lib/security-check/types";
import { useSecurityCheck } from "@/components/security-check/SecurityCheckState";
import Unavailable from "@/components/security-check/Unavailable";

export default function ScanForm() {
  const { setScan } = useSecurityCheck();
  const [domain, setDomain] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: "domain" | "authorized" | "form" | "unavailable"; message: string } | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const domainRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!domain.trim()) {
      setError({ field: "domain", message: "Enter your practice's website address, for example smiledental.com." });
      domainRef.current?.focus();
      return;
    }
    if (!authorized) {
      setError({ field: "authorized", message: "Tick the box to confirm you own or manage this domain and authorize the check." });
      boxRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/security-check/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), authorized: true, website: honeypot.current?.value ?? "" }),
      });
      const data = await res.json().catch(() => null);
      if (data?.unavailable) {
        setError({ field: "unavailable", message: "" });
        return;
      }
      if (!res.ok || !data?.result) {
        setError({ field: res.status === 400 ? "domain" : "form", message: data?.error ?? "The check could not run just now. Please try again." });
        return;
      }
      setScan({
        scanId: data.scanId,
        result: data.result,
        signature: data.signature ?? null,
        note: data.cached ? data.message : null,
        followups: data.followups === true,
      });
      requestAnimationFrame(() => {
        const el = document.getElementById("results-heading");
        el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        el?.focus({ preventScroll: true });
      });
    } catch {
      setError({ field: "form", message: "The check could not run just now. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass-card mx-auto max-w-2xl rounded-2xl p-6 text-left md:p-8" aria-describedby="scan-help">
      <label htmlFor="sc-domain" className="mb-2 block text-base font-semibold text-ink">
        Your practice&apos;s website
      </label>
      <input
        ref={domainRef}
        id="sc-domain"
        name="domain"
        type="text"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="smiledental.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        aria-invalid={error?.field === "domain" || undefined}
        aria-describedby={error?.field === "domain" ? "sc-domain-error" : undefined}
        className="min-h-[48px] w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-base text-ink placeholder:text-faded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {error?.field === "domain" && (
        <p id="sc-domain-error" className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
          {error.message}
        </p>
      )}

      <div className="mt-4 flex items-start gap-3">
        <input
          ref={boxRef}
          id="sc-authorize"
          type="checkbox"
          checked={authorized}
          onChange={(e) => setAuthorized(e.target.checked)}
          aria-invalid={error?.field === "authorized" || undefined}
          aria-describedby={error?.field === "authorized" ? "sc-authorize-error" : undefined}
          className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--color-accent))]"
        />
        <label htmlFor="sc-authorize" className="text-sm text-secondary [text-wrap:pretty]">
          {AUTHORIZATION_TEXT}
        </label>
      </div>
      {error?.field === "authorized" && (
        <p id="sc-authorize-error" className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
          {error.message}
        </p>
      )}

      {/* Honeypot. Hidden from people and from assistive technology. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="sc-website">Leave this empty</label>
        <input ref={honeypot} id="sc-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] disabled:cursor-wait disabled:opacity-80"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Checking your website
          </>
        ) : (
          <>
            Run the free check
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </button>
      <p id="scan-help" className="mt-3 text-center text-sm text-faded">
        Passive and public only. Most checks finish in under 30 seconds.
      </p>
      <div role="status" aria-live="polite" className="sr-only">
        {busy ? "Checking your website. This can take up to 30 seconds." : ""}
      </div>
      {error?.field === "unavailable" && <Unavailable />}
      {error?.field === "form" && (
        <p role="alert" className="mt-4 rounded-xl bg-raised p-4 text-sm font-medium text-ink">
          {error.message}
        </p>
      )}
    </form>
  );
}
