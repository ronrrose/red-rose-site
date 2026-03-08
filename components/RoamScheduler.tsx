"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    Roam?: {
      initLobbyEmbed: (config: Record<string, unknown>) => void;
    };
  }
}

export default function RoamScheduler() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current || initializedRef.current) return;

    const initRoam = () => {
      if (!window.Roam || !containerRef.current) return;
      initializedRef.current = true;

      const el = containerRef.current;

      window.Roam.initLobbyEmbed({
        url: "https://ro.am/ronrose/meeting",
        lobbyConfiguration: "full",
        accentColor: "#8B1A1A",
        theme: resolvedTheme === "dark" ? "dark" : "light",
        parentElement: el,
        onSizeChange: (size: { height: number }) => {
          el.style.height = `${size.height}px`;
        },
      });
    };

    if (window.Roam) {
      initRoam();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://ro.am/lobbylinks/embed.js";
    script.async = true;
    script.onload = initRoam;
    document.body.appendChild(script);

    return () => {
      if (!initializedRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [mounted, resolvedTheme]);

  return (
    <>
      <style jsx>{`
        #roam-lobby iframe {
          height: auto !important;
          min-height: 500px;
        }
      `}</style>
      <div
        id="roam-lobby"
        ref={containerRef}
        style={{ minWidth: 320, overflow: "visible", height: "auto" }}
        className="w-full rounded-xl"
      />
    </>
  );
}
