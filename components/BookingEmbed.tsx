"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Calendar, Loader2, Phone } from "lucide-react";
import {
  BOOKING_URL,
  PHONE_DISPLAY,
  PHONE_HREF,
  PRIMARY_CTA_LABEL,
} from "@/lib/site-config";

const ROAM_EMBED_SCRIPT = "https://ro.am/lobbylinks/embed.js";
/** Roam's SDK renders asynchronously. If no iframe exists by then, show the fallback. */
const RENDER_TIMEOUT_MS = 8000;
/** Card scans happen on phones, so reserve real estate before the iframe reports its height. */
const MIN_EMBED_HEIGHT = 700;

type RoamGlobal = {
  initLobbyEmbed: (opts: {
    url: string;
    parentElement: HTMLElement;
    lobbyConfiguration: string;
    accentColor: string;
    theme: string;
    onSizeChange?: (w: number, h: number) => void;
  }) => void;
};

/**
 * Builds the lobby URL, preserving utm_source so a business-card scan is still
 * attributable once the visitor lands inside Roam.
 */
function buildBookingUrl(utmSource: string | null): string {
  if (!BOOKING_URL) return "";
  try {
    const url = new URL(BOOKING_URL);
    if (utmSource) url.searchParams.set("utm_source", utmSource);
    return url.toString();
  } catch {
    return BOOKING_URL;
  }
}

export default function BookingEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const utmSource = searchParams.get("utm_source");
  const bookingUrl = buildBookingUrl(utmSource);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Wait for mount so resolvedTheme is accurate and we don't mismatch hydration.
    if (!mounted || !bookingUrl) return;

    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    setFailed(false);
    // Switching theme reloads the iframe, which takes a few seconds. Show a
    // skeleton rather than a blank 700px hole.
    setReady(false);
    // Re-initialising (e.g. on theme change) must not stack a second lobby.
    el.innerHTML = "";

    const theme = resolvedTheme === "dark" ? "dark" : "light";

    const render = () => {
      const roam = (window as unknown as { Roam?: RoamGlobal }).Roam;
      if (cancelled || !roam || !containerRef.current) return;
      try {
        roam.initLobbyEmbed({
          url: bookingUrl,
          parentElement: containerRef.current,
          lobbyConfiguration: "booking_only",
          accentColor: "#9C3233",
          theme,
          onSizeChange: (_w, h) => {
            if (containerRef.current && h > 0) {
              containerRef.current.style.height = `${Math.max(h, MIN_EMBED_HEIGHT)}px`;
            }
          },
        });
        const iframe = containerRef.current.querySelector("iframe");
        if (iframe) {
          iframe.addEventListener(
            "load",
            () => {
              if (!cancelled) setReady(true);
            },
            { once: true }
          );
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const onError = () => {
      if (!cancelled) setFailed(true);
    };

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${ROAM_EMBED_SCRIPT}"]`
    );

    if ((window as unknown as { Roam?: RoamGlobal }).Roam) {
      render();
    } else if (script) {
      script.addEventListener("load", render);
    } else {
      script = document.createElement("script");
      script.src = ROAM_EMBED_SCRIPT;
      script.async = true;
      script.addEventListener("load", render);
      script.addEventListener("error", onError);
      document.body.appendChild(script);
    }

    // Never ship an empty box: if nothing rendered, fall back to the button.
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const hasIframe = !!containerRef.current?.querySelector("iframe");
      if (!hasIframe) setFailed(true);
    }, RENDER_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", onError);
    };
  }, [mounted, bookingUrl, resolvedTheme]);

  // Booking disabled by configuration: the form and phone number carry the page.
  if (!bookingUrl) {
    return (
      <a
        href={PHONE_HREF}
        className="flex items-center justify-center gap-3 w-full px-8 py-5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-brand-700/25"
      >
        <Phone className="w-5 h-5 shrink-0" aria-hidden="true" />
        Call {PHONE_DISPLAY}
      </a>
    );
  }

  return (
    <>
      <div
        className={`relative w-full${failed ? " hidden" : ""}`}
        style={failed ? undefined : { minHeight: MIN_EMBED_HEIGHT }}
        aria-hidden={failed || undefined}
      >
        <div
          ref={containerRef}
          id="roam-lobby"
          className="w-full overflow-hidden"
          style={{ minHeight: MIN_EMBED_HEIGHT }}
        />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel">
            <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            <p className="text-faded text-sm">Loading the scheduler...</p>
          </div>
        )}
      </div>
      {failed && (
      <div className="space-y-3 px-8 pb-8">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full px-8 py-5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-brand-700/25"
        >
          <Calendar className="w-5 h-5 shrink-0" aria-hidden="true" />
          {PRIMARY_CTA_LABEL}
        </a>
        <p className="text-faded text-xs text-center">
          Opens our scheduler in a new tab. Prefer the phone?{" "}
          <a href={PHONE_HREF} className="text-accent font-semibold hover:underline">
            {PHONE_DISPLAY}
          </a>
        </p>
      </div>
      )}
    </>
  );
}
