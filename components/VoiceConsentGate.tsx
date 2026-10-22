"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MessageSquare, X } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

const STORAGE_KEY = "rrt-voice-consent";

export type ConsentDecision = "granted" | "declined";

/**
 * Reads a previous decision. Browser storage can throw in private windows and
 * with site data blocked, so every read is guarded and an unreadable store is
 * treated as "never asked". Consent must be re-obtained rather than assumed.
 */
export function readStoredConsent(): ConsentDecision | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function storeConsent(decision: ConsentDecision) {
  try {
    window.localStorage.setItem(STORAGE_KEY, decision);
  } catch {
    // A viewer who blocks storage simply gets asked again. That is the correct
    // failure direction for consent: ask twice rather than assume once.
  }
}

type Props = {
  open: boolean;
  onDecision: (decision: ConsentDecision) => void;
  /** Where a declining visitor is sent instead. Text chat, always. */
  onUseText: () => void;
};

/**
 * Blocking consent gate shown before the microphone is ever requested.
 *
 * Florida is an all-party consent state (Fla. Stat. 934.03), and Red Rose's
 * visitors run medical and dental practices. A visitor who starts talking may
 * say something about a patient without thinking, and that audio would leave
 * their machine. So the microphone is gated behind an explicit, informed yes.
 *
 * Three deliberate properties:
 *
 * 1. It is a gate, not a notice. The caller must not request microphone access
 *    until onDecision has fired with "granted". A banner that explains
 *    recording while recording is not consent.
 * 2. Declining is a real, equal option that keeps the visitor in the
 *    conversation by text. Consent obtained by trapping someone is not
 *    consent, and a dark pattern here is worse than having no voice feature.
 * 3. It states what is actually known and nothing more. It does not promise
 *    encryption, deletion, HIPAA compliance or that data is never shared,
 *    because those are claims about systems this component cannot see.
 *
 * NOTE: this is a consent mechanism, not legal advice, and it is not wired to
 * anything yet because no microphone feature exists. Before any voice feature
 * ships, the wording below needs review by someone qualified, and the Spanish,
 * French and Portuguese versions need a human translator. Machine-translated
 * consent language is not consent.
 */
export default function VoiceConsentGate({ open, onDecision, onUseText }: Props) {
  const [understood, setUnderstood] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const declineRef = useRef<HTMLButtonElement>(null);

  const decline = useCallback(() => {
    storeConsent("declined");
    onDecision("declined");
  }, [onDecision]);

  const accept = useCallback(() => {
    if (!understood) return;
    storeConsent("granted");
    onDecision("granted");
  }, [understood, onDecision]);

  // Escape declines rather than silently dismissing. Closing the dialog must
  // never leave the caller unsure whether consent was given.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        decline();
      }
    };
    document.addEventListener("keydown", onKey);
    declineRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, decline]);

  useEffect(() => {
    if (!open) setUnderstood(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) decline();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-consent-title"
        aria-describedby="voice-consent-body"
        className="glass-card w-full max-w-md rounded-2xl p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="voice-consent-title" className="text-lg font-bold text-ink">
            Before you turn on the microphone
          </h2>
          <button
            type="button"
            onClick={decline}
            aria-label="Close and keep using text"
            className="shrink-0 rounded-lg p-1 text-faded transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div id="voice-consent-body" className="space-y-3 text-sm text-secondary">
          <p>
            Talking to Ava records your voice and sends the audio off your
            device to be transcribed and answered. Florida is an all party
            consent state, so we ask first.
          </p>
          <p>
            Please do not say anything about a patient, and do not read out
            passwords or account numbers. If you need to discuss either, call
            Ron directly at{" "}
            <a
              href={PHONE_HREF}
              className="font-semibold text-accent hover:underline whitespace-nowrap"
            >
              {PHONE_DISPLAY}
            </a>
            .
          </p>
          <p className="text-faded">
            Ava is an AI assistant, not a person. Typing works just as well and
            records nothing.
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-secondary">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[var(--accent)]"
          />
          <span>
            I understand my voice will be recorded, and I agree to it.
          </span>
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={accept}
            disabled={!understood}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Turn on the microphone
          </button>
          <button
            ref={declineRef}
            type="button"
            onClick={() => {
              decline();
              onUseText();
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-raised/50"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Keep typing instead
          </button>
        </div>
      </div>
    </div>
  );
}
