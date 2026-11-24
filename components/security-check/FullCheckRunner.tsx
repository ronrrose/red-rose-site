"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ScanResults from "@/components/security-check/ScanResults";
import type { ScanResult } from "@/lib/security-check/types";

/**
 * A button, not an automatic run: email security gateways open links to
 * inspect them, and that must never trigger requests to the practice's site.
 */
export default function FullCheckRunner({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setState("busy");
    try {
      const res = await fetch("/api/security-check/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.result) {
        setMessage(data?.error ?? "The check could not run just now. Please try again.");
        setState("error");
        return;
      }
      setResult(data.result);
      setEmailed(data.emailed === true);
      setState("done");
    } catch {
      setMessage("The check could not run just now. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "done" && result) {
    return (
      <div>
        <p role="status" className="mb-6 rounded-xl bg-raised p-4 text-sm text-ink">
          {emailed ? "Done. We emailed you the updated report." : "Done. The updated email could not be sent, but your result is below."}
        </p>
        <ScanResults result={result} />
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={state === "busy" || !token}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] disabled:opacity-60"
      >
        {state === "busy" && <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {state === "busy" ? "Running the full check" : "Run the exposed-files check"}
      </button>
      {!token && <p className="mt-4 text-sm text-secondary">This link is missing its code. Use the link in your report email.</p>}
      {state === "error" && (
        <p role="alert" className="mt-4 rounded-xl bg-raised p-4 text-sm font-medium text-ink">
          {message}
        </p>
      )}
    </div>
  );
}
