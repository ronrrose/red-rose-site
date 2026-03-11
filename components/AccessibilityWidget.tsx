"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, X, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface A11ySettings {
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  contentStructure: boolean;
}

const defaults: A11ySettings = {
  fontSize: 100,
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  contentStructure: false,
};

function applyToDOM(s: A11ySettings) {
  const root = document.documentElement;
  root.style.fontSize = `${s.fontSize}%`;
  root.classList.toggle("a11y-high-contrast", s.highContrast);
  root.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  root.classList.toggle("a11y-screen-reader", s.screenReader);
  root.classList.toggle("a11y-content-structure", s.contentStructure);
}

/** Extract readable text from the main content area */
function getPageText(): string {
  const main = document.querySelector("main") || document.body;
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const tag = el.tagName;
      // Skip script, style, hidden elements, and the a11y widget itself
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (el.closest("#a11y-widget")) return NodeFilter.FILTER_REJECT;
      if (el.getAttribute("aria-hidden") === "true") return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const parts: string[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text) parts.push(text);
  }
  return parts.join(". ").replace(/\.{2,}/g, ".").replace(/\s+/g, " ");
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaults);
  const [mounted, setMounted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    setMounted(true);
    synthRef.current = window.speechSynthesis;
    try {
      const saved = localStorage.getItem("a11y-settings");
      if (saved) {
        const parsed = JSON.parse(saved) as A11ySettings;
        setSettings(parsed);
        applyToDOM(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply and persist whenever settings change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("a11y-settings", JSON.stringify(settings));
    applyToDOM(settings);
  }, [settings, mounted]);

  // Stop speech when screen reader is toggled off
  useEffect(() => {
    if (!settings.screenReader && synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
  }, [settings.screenReader]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const startReading = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();
    const text = getPageText();
    if (!text) return;

    // Split into chunks (speechSynthesis has a ~200 char limit on some browsers)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + sentence).length > 180) {
        if (current) chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    let index = 0;
    setSpeaking(true);

    const speakNext = () => {
      if (index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.lang = "en-US";
      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        setSpeaking(false);
      };
      synth.speak(utterance);
    };

    speakNext();
  }, []);

  const stopReading = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  const toggleScreenReader = (checked: boolean) => {
    update("screenReader", checked);
    if (checked) {
      startReading();
    } else {
      stopReading();
    }
  };

  const reset = () => {
    stopReading();
    setSettings(defaults);
  };

  if (!mounted) return null;

  return (
    <div ref={panelRef} id="a11y-widget">
      {/* Toggle Button — small blue circle */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close accessibility options" : "Open accessibility options"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[9999] w-11 h-11 rounded-full bg-[#4a6cf7] hover:bg-[#3b5de7] text-white shadow-lg shadow-[#4a6cf7]/30 hover:shadow-[#4a6cf7]/50 transition-all flex items-center justify-center"
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility options"
          aria-modal="false"
          className="fixed bottom-[4.5rem] right-5 z-[9999] w-80 max-w-[90vw] bg-raised border border-line rounded-2xl shadow-2xl p-5 font-sans text-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ink font-bold text-base">Accessibility</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close accessibility options"
              className="p-1.5 rounded-lg text-faded hover:text-ink hover:bg-raised/80 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <label htmlFor="a11y-font-size" className="text-secondary font-medium">
              Font Size
            </label>
            <div className="flex items-center gap-2">
              <span className="text-accent font-semibold text-xs w-10 text-right">
                {settings.fontSize}%
              </span>
              <input
                id="a11y-font-size"
                type="range"
                min={90}
                max={150}
                step={5}
                value={settings.fontSize}
                onChange={(e) => update("fontSize", Number(e.target.value))}
                className="w-24 accent-[#4a6cf7]"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-5">
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => update("highContrast", e.target.checked)}
                className="w-4 h-4 accent-[#4a6cf7] rounded"
              />
              <span className="font-medium">High Contrast</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => update("reduceMotion", e.target.checked)}
                className="w-4 h-4 accent-[#4a6cf7] rounded"
              />
              <span className="font-medium">Reduce Motion</span>
            </label>

            {/* Screen Reader with play/stop */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => toggleScreenReader(e.target.checked)}
                  className="w-4 h-4 accent-[#4a6cf7] rounded"
                />
                <span className="font-medium">Screen Reader</span>
              </label>
              {settings.screenReader && (
                <button
                  onClick={speaking ? stopReading : startReading}
                  aria-label={speaking ? "Stop reading" : "Start reading page"}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-[#4a6cf7]/10 text-[#4a6cf7] hover:bg-[#4a6cf7]/20"
                >
                  {speaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Read
                    </>
                  )}
                </button>
              )}
            </div>

            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.contentStructure}
                onChange={(e) => update("contentStructure", e.target.checked)}
                className="w-4 h-4 accent-[#4a6cf7] rounded"
              />
              <span className="font-medium">Content Structure</span>
            </label>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-page hover:bg-raised/50 text-secondary font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset All
          </button>
        </div>
      )}
    </div>
  );
}
