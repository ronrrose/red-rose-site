"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { type Locale, localeNames } from "@/lib/translations";

const locales: Locale[] = ["en", "es", "pt", "fr"];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-faded hover:text-ink transition-colors rounded-lg"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-2 bg-raised border border-line rounded-lg shadow-xl py-1 min-w-[140px] z-50"
        >
          {locales.map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={locale === l}
              onClick={() => { setLocale(l); close(); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === l
                  ? "text-accent font-semibold bg-[var(--accent-bg)]"
                  : "text-faded hover:text-ink hover:bg-raised/80"
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
