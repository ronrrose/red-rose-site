"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

const VIDEO_SRC = "/assistant-greeting.mp4";
const CAPTIONS_SRC = "/assistant-greeting.vtt";
const POSTER_SRC = "/assistant-greeting-poster.jpg";

/**
 * A pre-rendered introduction from the Red Rose AI assistant, shown on the
 * contact page where the printed business-card QR code lands.
 *
 * Three deliberate constraints, each one load-bearing:
 *
 * 1. It never autoplays. Sound only ever starts from a click, so a visitor
 *    scanning the card in a waiting room is never ambushed.
 * 2. The presenter is synthetic, and the card says so in text before anyone
 *    presses play. A visitor who only reads the card is told the same thing
 *    the audio tells a visitor who watches it. Red Rose sells IT security and
 *    HIPAA compliance, so a presenter mistaken for staff is a real problem.
 * 3. If the asset fails to load, the card degrades to the phone number. The
 *    contact page is where card scans land and it must never show a dead
 *    frame.
 */
export default function GreetingVideo() {
  const t = useTranslations("Contact");
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <p className="text-secondary text-sm">
          {t("greetingUnavailable")}{" "}
          <a
            href={PHONE_HREF}
            className="text-accent font-semibold hover:underline whitespace-nowrap"
          >
            {PHONE_DISPLAY}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      {playing ? (
        <video
          className="w-full max-w-[20rem] mx-auto rounded-xl bg-panel"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          controls
          autoPlay
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <track
            kind="captions"
            src={CAPTIONS_SRC}
            srcLang="en"
            label="English"
            default
          />
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group flex w-full items-center gap-4 text-left"
          aria-label={t("greetingPlay")}
        >
          <span className="relative shrink-0">
            <Image
              src={POSTER_SRC}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl object-cover"
              onError={() => setFailed(true)}
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/35 transition-colors group-hover:bg-black/15">
              <Play
                className="h-5 w-5 text-white transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">
              {t("greetingTitle")}
            </span>
            <span className="block text-xs text-faded mt-0.5">
              {t("greetingBody")}
            </span>
          </span>
        </button>
      )}

      {/* Stated in text, not only in the audio. Someone who never presses
          play still learns the presenter is not a person. */}
      <p className="mt-4 flex items-start gap-2 text-xs text-faded">
        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {t("greetingDisclosure")}{" "}
          <a
            href={PHONE_HREF}
            className="text-accent font-medium hover:underline whitespace-nowrap"
          >
            {PHONE_DISPLAY}
          </a>
          .
        </span>
      </p>
    </div>
  );
}
