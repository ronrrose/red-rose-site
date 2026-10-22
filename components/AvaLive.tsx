"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Send, Square, Loader2 } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";
import VoiceConsentGate, {
  readStoredConsent,
  type ConsentDecision,
} from "@/components/VoiceConsentGate";

/* ── Minimal typings for the Web Speech API ───────────────────────────────
 * SpeechRecognition is not in the standard DOM lib, and it is prefixed in
 * Chrome. Only the surface actually used is declared.
 */
type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResult };
};
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};
type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

type Turn = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "listening" | "thinking" | "speaking";

/**
 * A short boomerang loop (forward, then the same frames reversed) rather than
 * the full greeting. Two reasons, both about how it reads rather than how it
 * is built:
 *
 * Looping the 22 second greeting meant a hard cut back to frame zero every
 * time, which the eye catches immediately. A boomerang has no seam at all,
 * because the last frame IS the first frame.
 *
 * It is also cut from a settled stretch mid-sentence, so the motion stays in
 * the range a person actually moves in while talking. The wide gestures and
 * the long neck extensions elsewhere in the greeting look theatrical on a
 * three second repeat even though they read fine once.
 */
const VIDEO_SRC = "/ava-loop.mp4";
const POSTER_SRC = "/assistant-greeting-poster.jpg";

/**
 * Ava, answering out loud.
 *
 * This is deliberately NOT real-time lip sync. Render based lip sync takes
 * sixty to ninety seconds a clip, so it cannot answer a question, and the
 * streaming vendors that can (HeyGen, Tavus) need an account Red Rose does
 * not have yet.
 *
 * What this does instead: her own footage loops while she speaks and rests on
 * a still frame while she does not, so the face is present and alive without
 * claiming a sync it does not have. Speech in and speech out both use the
 * browser's own engines, so there is no new vendor, no API key and no render
 * cost per answer. The brain is the same /api/chat agent that already runs
 * the text chat, which means every honesty fence written into the system
 * prompt applies here unchanged.
 *
 * Two things this is honest about rather than hiding:
 * - Her mouth does not form these specific words. It is a presenter loop.
 * - The spoken voice is the visitor's own browser voice, not the voice in the
 *   recorded greeting. They will not match, and pretending otherwise would be
 *   the kind of small lie this whole project has avoided.
 *
 * The microphone is gated behind VoiceConsentGate. Florida is an all party
 * consent state, browser speech recognition ships audio to the browser
 * vendor's servers, and these visitors run medical practices.
 */
export default function AvaLive() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [heard, setHeard] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMicSupported(!!getRecognitionCtor());
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, phase]);

  /** Loop her footage while speaking, rest on a frame otherwise. */
  const setFaceSpeaking = useCallback((on: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    if (on) {
      v.loop = true;
      v.muted = true;
      void v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  /**
   * When her real voice is unavailable she stays silent and the answer is
   * read on screen. The browser's built-in speech used to fill this gap, and
   * it sounded robotic: a voice that obviously is not hers undermines the
   * whole presenter more than silence does. So there is no spoken fallback.
   */
  const speakFallback = useCallback(async (_text: string) => {}, []);

  /**
   * Speak in Ava's own voice, the same one as the recorded greeting.
   *
   * If that cannot happen (no key configured, the service is down, rate
   * limited, or the browser refuses to start audio) she answers in text only.
   * Every failure is caught rather than surfaced; the written answer is
   * already on screen.
   */
  const speak = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return speakFallback(text);

        const blob = await res.blob();
        if (!blob.size) return speakFallback(text);

        const url = URL.createObjectURL(blob);
        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = url;

        await new Promise<void>((resolve) => {
          let settled = false;
          const done = () => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onended = done;
          audio.onerror = done;
          audio.play().catch(done);
        });
      } catch {
        return speakFallback(text);
      }
    },
    [speakFallback]
  );

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;
      setError("");
      setHeard("");
      const next: Turn[] = [...turns, { role: "user", content: q }];
      setTurns(next);
      setPhase("thinking");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error || "Ava could not answer just then.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        setTurns((t) => [...t, { role: "assistant", content: "" }]);

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          setTurns((t) => {
            const copy = [...t];
            copy[copy.length - 1] = { role: "assistant", content: answer };
            return copy;
          });
        }

        setPhase("speaking");
        setFaceSpeaking(true);
        await speak(answer);
        setFaceSpeaking(false);
        setPhase("idle");
      } catch (e) {
        setFaceSpeaking(false);
        setPhase("idle");
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    },
    [turns, speak, setFaceSpeaking]
  );

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setHeard(finalText || interim);
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "The browser blocked the microphone. You can type instead."
          : "The microphone stopped. You can type instead."
      );
      setPhase("idle");
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setPhase((p) => (p === "listening" ? "idle" : p));
      if (finalText.trim()) void ask(finalText);
    };

    setPhase("listening");
    try {
      rec.start();
    } catch {
      setPhase("idle");
    }
  }, [ask]);

  const onMicClick = useCallback(() => {
    if (phase === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    if (readStoredConsent() === "granted") startListening();
    else setConsentOpen(true);
  }, [phase, startListening]);

  const onConsent = useCallback(
    (d: ConsentDecision) => {
      setConsentOpen(false);
      if (d === "granted") startListening();
    },
    [startListening]
  );

  const busy = phase === "thinking" || phase === "speaking";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="relative bg-panel">
          <video
            ref={videoRef}
            className="mx-auto block w-full max-w-[18rem]"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            preload="auto"
          />
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
            {phase === "listening"
              ? "Listening"
              : phase === "thinking"
              ? "Thinking"
              : phase === "speaking"
              ? "Speaking"
              : "Ava, AI assistant"}
          </div>
        </div>

        <div ref={logRef} className="max-h-72 overflow-y-auto px-5 py-4">
          {turns.length === 0 ? (
            <p className="text-sm text-faded">
              Ask her where your practice is losing time and money, or whether
              this chat is HIPAA compliant. She will tell you what she does not
              know.
            </p>
          ) : (
            <div className="space-y-3">
              {turns.map((t, i) => (
                <div
                  key={i}
                  className={
                    t.role === "user"
                      ? "ml-auto max-w-[85%] rounded-xl bg-accent px-3 py-2 text-sm text-white"
                      : "max-w-[85%] rounded-xl bg-raised/60 px-3 py-2 text-sm text-ink"
                  }
                >
                  {t.content || "..."}
                </div>
              ))}
            </div>
          )}
          {heard && phase === "listening" && (
            <p className="mt-3 text-sm italic text-faded">{heard}</p>
          )}
          {error && <p className="mt-3 text-sm text-accent">{error}</p>}
        </div>

        <form
          className="flex items-center gap-2 border-t border-line px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            const q = draft;
            setDraft("");
            void ask(q);
          }}
        >
          {micSupported && (
            <button
              type="button"
              onClick={onMicClick}
              disabled={busy}
              aria-label={phase === "listening" ? "Stop listening" : "Talk to Ava"}
              className="shrink-0 rounded-xl border border-line p-2.5 text-secondary transition-colors hover:bg-raised/50 disabled:opacity-40"
            >
              {phase === "listening" ? (
                <Square className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={busy}
            placeholder="Type, or press the microphone and talk"
            className="min-w-0 flex-1 rounded-xl border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-faded focus:border-[var(--accent-border)]"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="shrink-0 rounded-xl bg-accent p-2.5 text-white transition-opacity disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>
      </div>

      <p className="mt-3 text-center text-xs text-faded">
        Ava is an AI assistant, not a person. Her face is a looping recording,
        so her mouth does not form these words. For
        anything real, call us at{" "}
        <a href={PHONE_HREF} className="font-medium text-accent hover:underline whitespace-nowrap">
          {PHONE_DISPLAY}
        </a>
        .
      </p>

      <VoiceConsentGate
        open={consentOpen}
        onDecision={onConsent}
        onUseText={() => setConsentOpen(false)}
      />
    </div>
  );
}
