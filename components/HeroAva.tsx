"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

const VIDEO_SRC = "/assistant-greeting.mp4";
const CAPTIONS_SRC = "/assistant-greeting.vtt";
const POSTER_SRC = "/assistant-greeting-poster.jpg";

/**
 * Ava as the homepage hero visual.
 *
 * Same rules as the contact page's GreetingVideo: never autoplays, sound only
 * after a click, captions on, and the AI disclosure is in text so a visitor
 * who never presses play still learns Ava is not a person. If the video fails
 * it falls back to the phone number, never a dead frame.
 */
export default function HeroAva() {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <figure className="mx-auto w-full max-w-[18rem] sm:max-w-xs">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-panel shadow-xl shadow-black/5">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-secondary">Ava&apos;s introduction could not load.</p>
            <a href={PHONE_HREF} className="text-sm font-semibold text-accent hover:underline">
              Call {PHONE_DISPLAY}
            </a>
          </div>
        ) : playing ? (
          <video
            className="h-full w-full object-cover"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          >
            <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
          >
            <Image
              src={POSTER_SRC}
              alt=""
              fill
              priority
              sizes="(min-width: 640px) 320px, 288px"
              className="object-cover"
              onError={() => setFailed(true)}
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-left text-white">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-brand-700 transition-transform group-hover:scale-105 group-active:scale-[.98]">
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Play Ava&apos;s introduction</span>
                <span className="block text-xs text-white/90">22 seconds, with captions</span>
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex items-start gap-2 text-xs text-secondary">
        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Ava is Red Rose&apos;s AI assistant, not a real person. Our team is a phone call away at{" "}
          <a href={PHONE_HREF} className="whitespace-nowrap font-medium text-accent hover:underline">
            {PHONE_DISPLAY}
          </a>
          .
        </span>
      </figcaption>
    </figure>
  );
}
