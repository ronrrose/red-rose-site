"use client";

import { useState, useEffect, useCallback } from "react";
import { Accessibility, X, RotateCcw } from "lucide-react";

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

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaults);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("a11y-settings");
      if (saved) {
        const parsed = JSON.parse(saved) as A11ySettings;
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch {}
  }, []);

  // Persist and apply whenever settings change
  useEffect(() => {
    localStorage.setItem("a11y-settings", JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const applySettings = useCallback((s: A11ySettings) => {
    const root = document.documentElement;
    root.style.fontSize = `${s.fontSize}%`;
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-reduce-motion", s.reduceMotion);
    root.classList.toggle("a11y-screen-reader", s.screenReader);
    root.classList.toggle("a11y-content-structure", s.contentStructure);
  }, []);

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setSettings(defaults);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open accessibility options"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-full bg-ink text-page shadow-xl hover:scale-105 transition-transform text-sm font-semibold"
      >
        <Accessibility className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">Accessibility</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility options"
          aria-modal="false"
          className="fixed bottom-20 right-6 z-[9999] w-80 max-w-[90vw] bg-raised border border-line rounded-2xl shadow-2xl p-5 font-sans text-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ink font-bold text-base">Accessibility</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close accessibility options"
              className="p-1.5 rounded-lg text-faded hover:text-ink hover:bg-raised/80 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
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
                className="w-24 accent-brand-700"
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
                className="w-4 h-4 accent-brand-700 rounded"
              />
              <span className="font-medium">High Contrast</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => update("reduceMotion", e.target.checked)}
                className="w-4 h-4 accent-brand-700 rounded"
              />
              <span className="font-medium">Reduce Motion</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.screenReader}
                onChange={(e) => update("screenReader", e.target.checked)}
                className="w-4 h-4 accent-brand-700 rounded"
              />
              <span className="font-medium">Screen Reader Mode</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.contentStructure}
                onChange={(e) => update("contentStructure", e.target.checked)}
                className="w-4 h-4 accent-brand-700 rounded"
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
    </>
  );
}
