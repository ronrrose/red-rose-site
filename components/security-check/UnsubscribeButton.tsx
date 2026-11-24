"use client";

import { useState } from "react";

export default function UnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function go() {
    setState("busy");
    try {
      const res = await fetch("/api/security-check/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) setState("done");
      else {
        setMessage(data?.error ?? "That did not work. Reply to any of our emails and we will remove you by hand.");
        setState("error");
      }
    } catch {
      setMessage("That did not work. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="glass-card rounded-2xl p-6 text-base text-ink">
        You are unsubscribed. We will not send you any more follow-up emails about the security check.
      </p>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={state === "busy" || !token}
        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] disabled:opacity-60"
      >
        {state === "busy" ? "Unsubscribing" : "Unsubscribe me"}
      </button>
      {!token && <p className="mt-4 text-sm text-secondary">This link is missing its code. Use the link in your email.</p>}
      {state === "error" && (
        <p role="alert" className="mt-4 rounded-xl bg-raised p-4 text-sm font-medium text-ink">
          {message}
        </p>
      )}
    </div>
  );
}
