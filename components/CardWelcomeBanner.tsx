"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Handshake } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

/**
 * Shown when a visitor arrives from the printed business-card QR code
 * (utm_source=card). Keeps the in-person handoff warm and points straight at
 * the two actions the card promises: book, or call.
 */
export default function CardWelcomeBanner() {
  const searchParams = useSearchParams();
  const isCardVisitor = searchParams.get("utm_source") === "card";
  const tracked = useRef(false);

  useEffect(() => {
    if (!isCardVisitor || tracked.current) return;
    tracked.current = true;

    // The repo has no analytics vendor installed. If one is ever added and
    // exposes a dataLayer, the event flows through without further changes.
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event: "card_scan", source: "business_card" });
    }
  }, [isCardVisitor]);

  if (!isCardVisitor) return null;

  return (
    <div
      role="status"
      className="container-site pt-6"
    >
      <div className="flex items-start gap-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-3 sm:items-center">
        <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-accent sm:mt-0" aria-hidden="true" />
        <p className="text-sm font-medium text-ink">
          Great to meet you. Book your free IT checkup below, or call{" "}
          <a href={PHONE_HREF} className="text-accent font-semibold hover:underline whitespace-nowrap">
            {PHONE_DISPLAY}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
