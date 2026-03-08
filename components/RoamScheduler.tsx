"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Roam: any;
  }
}

export default function RoamScheduler() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement("script");
    script.src = "https://ro.am/lobbylinks/embed.js";
    script.async = true;
    script.onload = () => {
      if (window.Roam && containerRef.current) {
        window.Roam.initLobbyEmbed({
          url: "https://ro.am/ronrose/meeting",
          parentElement: containerRef.current,
          lobbyConfiguration: "booking_only",
          accentColor: "#8B1A1A",
          theme: "light",
          onSizeChange: (_width: number, height: number) => {
            if (containerRef.current) {
              containerRef.current.style.height = height + "px";
            }
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div ref={containerRef} style={{ minWidth: "320px", width: "100%" }} />;
}
