"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mic, MicOff, PhoneOff, Send, Loader2 } from "lucide-react";
import type { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";
import VoiceConsentGate, { readStoredConsent, type ConsentDecision } from "@/components/VoiceConsentGate";
import AvaLive from "@/components/AvaLive";

type Phase = "checking" | "fallback" | "idle" | "connecting" | "live" | "ended";
type Turn = { role: "user" | "assistant"; text: string };

const POSTER = "/assistant-greeting-poster.jpg";

/**
 * Ava, live: a real-time, lip-synced avatar (HeyGen LiveAvatar).
 *
 * She listens, thinks and answers with her mouth forming the actual words, the
 * way the Goldcast agent does. What she says comes from Red Rose's own Claude
 * agent through /api/liveavatar/llm, so the honesty fences from the text chat
 * apply here unchanged.
 *
 * Degrades rather than breaks. If LiveAvatar is not configured, or a session
 * cannot start, the page falls back to the recorded-loop version (AvaLive),
 * which needs no vendor at all.
 *
 * Consent. Florida is an all party consent state and these visitors run
 * medical practices, so the microphone is never opened before VoiceConsentGate
 * returns "granted". The SDK opens the microphone on start even in its
 * "muted" mode, so for a visitor who declines, its microphone step is switched
 * off entirely and the conversation is typed. Declining must mean nothing is
 * recorded, not that a muted recording is running.
 */
export default function AvaStream() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [consentOpen, setConsentOpen] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/liveavatar/token", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j: { configured?: boolean }) => {
        if (!cancelled) setPhase(j.configured ? "idle" : "fallback");
      })
      .catch(() => !cancelled && setPhase("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  /** Always end a billed session when the visitor leaves the page. */
  useEffect(() => {
    const end = () => {
      void sessionRef.current?.stop().catch(() => {});
    };
    window.addEventListener("pagehide", end);
    return () => {
      window.removeEventListener("pagehide", end);
      end();
    };
  }, []);

  const appendTurn = useCallback((role: Turn["role"], text: string) => {
    const t = text.trim();
    if (!t) return;
    setTurns((prev) => [...prev, { role, text: t }]);
  }, []);

  const start = useCallback(
    async (withMic: boolean) => {
      setPhase("connecting");
      setNote("");
      setTextOnly(!withMic);
      try {
        const res = await fetch("/api/liveavatar/token", { method: "POST" });
        const body = (await res.json().catch(() => ({}))) as { sessionToken?: string; error?: string };
        if (!res.ok || !body.sessionToken) {
          setNote(
            body.error === "rate_limited"
              ? "Ava is talking to a lot of people right now. Here is her recorded version."
              : "Ava's live mode is not available right now. Here is her recorded version."
          );
          setPhase("fallback");
          return;
        }

        const { LiveAvatarSession, SessionEvent, AgentEventsEnum } = await import("@heygen/liveavatar-web-sdk");
        const session = new LiveAvatarSession(body.sessionToken, { autoKeepAlive: true });

        if (!withMic) {
          // See the component note: skip the SDK's microphone step entirely.
          (session as unknown as { configureSession: () => Promise<void> }).configureSession = async () => {};
        }

        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (videoRef.current) session.attach(videoRef.current);
          setPhase("live");
        });
        session.on(SessionEvent.SESSION_DISCONNECTED, () => {
          sessionRef.current = null;
          setSpeaking(false);
          setListening(false);
          setPhase("ended");
        });
        session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => setListening(true));
        session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => setListening(false));
        session.on(AgentEventsEnum.USER_TRANSCRIPTION, (e) => appendTurn("user", e.text));
        session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (e) => appendTurn("assistant", e.text));
        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => setSpeaking(true));
        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => setSpeaking(false));

        sessionRef.current = session;
        await session.start();
        setMuted(false);
      } catch {
        sessionRef.current = null;
        setNote("Ava's live mode could not connect. Here is her recorded version.");
        setPhase("fallback");
      }
    },
    [appendTurn]
  );

  const onTalk = useCallback(() => {
    const prior = readStoredConsent();
    if (prior === "granted") void start(true);
    else setConsentOpen(true);
  }, [start]);

  /*
   * The gate reports "declined" for the X, Escape and a backdrop click as well
   * as for "Keep typing instead". Only the last is a request to talk, so only
   * it (onUseText) starts a text session. Closing the dialog must not start a
   * session billed by the minute.
   */
  const onConsent = useCallback(
    (d: ConsentDecision) => {
      setConsentOpen(false);
      if (d === "granted") void start(true);
    },
    [start]
  );

  const onUseText = useCallback(() => {
    setConsentOpen(false);
    void start(false);
  }, [start]);

  const hangUp = useCallback(async () => {
    await sessionRef.current?.stop().catch(() => {});
    sessionRef.current = null;
    setPhase("ended");
  }, []);

  const toggleMute = useCallback(async () => {
    const vc = sessionRef.current?.voiceChat;
    if (!vc) return;
    if (vc.isMuted) await vc.unmute();
    else await vc.mute();
    setMuted(vc.isMuted);
  }, []);

  const sendText = useCallback(() => {
    const q = draft.trim();
    if (!q || !sessionRef.current) return;
    setDraft("");
    appendTurn("user", q);
    sessionRef.current.message(q);
  }, [draft, appendTurn]);

  if (phase === "checking") {
    return <div className="mx-auto h-[28rem] w-full max-w-2xl animate-pulse rounded-2xl bg-panel" />;
  }

  if (phase === "fallback") {
    return (
      <>
        {note && <p className="mx-auto mb-4 max-w-2xl text-center text-sm text-faded">{note}</p>}
        <AvaLive />
      </>
    );
  }

  const badge =
    phase === "connecting"
      ? "Connecting"
      : phase === "ended"
      ? "Conversation ended"
      : speaking
      ? "Speaking"
      : listening
      ? "Listening"
      : "Ava, AI assistant";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="relative flex justify-center bg-panel">
          <video
            ref={videoRef}
            className={phase === "live" ? "block w-full max-w-[22rem]" : "hidden"}
            autoPlay
            playsInline
          />
          {phase !== "live" && (
            <div className="relative w-full max-w-[22rem]">
              <Image
                src={POSTER}
                alt="Ava, Red Rose's AI assistant"
                width={672}
                height={900}
                className="h-auto w-full"
                priority
              />
              {phase === "connecting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden="true" />
                </div>
              )}
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
            {badge}
          </div>
        </div>

        {(phase === "idle" || phase === "ended") && (
          <div className="flex flex-col items-center gap-3 px-5 py-6 text-center">
            <button
              type="button"
              onClick={onTalk}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              {phase === "ended" ? "Talk to Ava again" : "Talk to Ava"}
            </button>
            <p className="max-w-sm text-xs text-faded">
              A live conversation, up to five minutes. You can speak or type.
            </p>
          </div>
        )}

        {(phase === "live" || phase === "connecting") && (
          <>
            <div ref={logRef} className="max-h-56 space-y-2 overflow-y-auto px-5 py-4">
              {turns.length === 0 ? (
                <p className="text-sm text-faded">
                  {textOnly
                    ? "Type below. Ava will answer out loud."
                    : "Just start talking. Ask where your practice is losing time, or whether this conversation is HIPAA compliant."}
                </p>
              ) : (
                turns.map((t, i) => (
                  <div
                    key={i}
                    className={
                      t.role === "user"
                        ? "ml-auto max-w-[85%] rounded-xl bg-accent px-3 py-2 text-sm text-white"
                        : "max-w-[85%] rounded-xl bg-raised/60 px-3 py-2 text-sm text-ink"
                    }
                  >
                    {t.text}
                  </div>
                ))
              )}
            </div>
            <form
              className="flex items-center gap-2 border-t border-line px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                sendText();
              }}
            >
              {!textOnly && (
                <button
                  type="button"
                  onClick={toggleMute}
                  disabled={phase !== "live"}
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  className="shrink-0 rounded-xl border border-line p-2.5 text-secondary transition-colors hover:bg-raised/50 disabled:opacity-40"
                >
                  {muted ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
                </button>
              )}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={phase !== "live"}
                placeholder={textOnly ? "Type to Ava" : "Or type here"}
                className="min-w-0 flex-1 rounded-xl border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faded focus:border-[var(--accent-border)]"
              />
              <button
                type="submit"
                disabled={phase !== "live" || !draft.trim()}
                aria-label="Send"
                className="shrink-0 rounded-xl bg-accent p-2.5 text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={hangUp}
                aria-label="End conversation"
                className="shrink-0 rounded-xl border border-line p-2.5 text-secondary transition-colors hover:bg-raised/50"
              >
                <PhoneOff className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-faded">
        Ava is an AI assistant, not a person. Her face and voice are generated in real time. What you say or type is processed by our AI, voice and video providers and may be saved so our team can follow up; please don&apos;t share patient information. For anything real, call
        Ron at{" "}
        <a href={PHONE_HREF} className="whitespace-nowrap font-medium text-accent hover:underline">
          {PHONE_DISPLAY}
        </a>
        .
      </p>

      <VoiceConsentGate open={consentOpen} onDecision={onConsent} onUseText={onUseText} />
    </div>
  );
}
