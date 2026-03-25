"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n-context";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  marketing: boolean;
  analytics: boolean;
  performance: boolean;
  social: boolean;
  doNotSell: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  marketing: true,
  analytics: true,
  performance: true,
  social: true,
  doNotSell: false,
};

export default function CookieBanner() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem("rrt-cookie-consent");
    if (!consent) {
      setShowBanner(true);
      setExpanded(true);
    }
    const saved = localStorage.getItem("rrt-cookie-prefs");
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch { /* use defaults */ }
    }
    setMounted(true);
  }, []);

  const saveAndClose = useCallback((preferences: CookiePreferences) => {
    localStorage.setItem("rrt-cookie-consent", "custom");
    localStorage.setItem("rrt-cookie-prefs", JSON.stringify(preferences));
    setExpanded(false);
    setShowBanner(false);
  }, []);

  const handleAcceptAll = () => {
    const all: CookiePreferences = { ...defaultPreferences, doNotSell: false };
    setPrefs(all);
    saveAndClose(all);
  };

  const handleRejectAll = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      marketing: false,
      analytics: false,
      performance: false,
      social: false,
      doNotSell: true,
    };
    setPrefs(minimal);
    saveAndClose(minimal);
  };

  const handleSavePreferences = () => {
    saveAndClose(prefs);
  };

  const handleNecessaryOnly = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      marketing: false,
      analytics: false,
      performance: false,
      social: false,
      doNotSell: prefs.doNotSell,
    };
    setPrefs(minimal);
    saveAndClose(minimal);
  };

  const toggle = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-[4.25rem] left-4 z-[60]">
      {/* ── Cookie Icon Button (always visible) ── */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-12 h-12 flex items-center justify-center bg-raised border border-line rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
          aria-label="Open cookie preferences"
        >
          <Cookie className="w-6 h-6 text-amber-500" aria-hidden="true" />
        </button>
      )}

      {/* ── Expanded: Widget label + Panel ── */}
      {expanded && (
        <div className="flex flex-col items-start gap-3">
          {/* Preferences Panel */}
          <div className="bg-raised border border-line rounded-2xl shadow-2xl w-[90vw] max-w-lg max-h-[75vh] overflow-y-auto">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-amber-500" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-ink">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => { setExpanded(false); setShowBanner(false); }}
                  className="p-2 text-faded hover:text-ink transition-colors rounded-lg"
                  aria-label="Close cookie preferences"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Show consent message for first-time visitors */}
              {showBanner && (
                <div className="mb-5 p-4 rounded-xl bg-panel border border-line">
                  <p className="text-sm text-faded">
                    {t("cookie.message")}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={handleRejectAll}
                      className="px-3 py-1.5 text-xs font-medium text-faded hover:text-ink border border-line rounded-lg transition-colors"
                    >
                      {t("cookie.reject")}
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
                    >
                      {t("cookie.accept")}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-faded leading-relaxed mb-5">
                We use cookies to provide, protect, improve, and promote our services.
                For more information see our{" "}
                <Link href="/privacy" className="text-accent hover:text-brand-600 transition-colors">Privacy Policy</Link>.
              </p>

              {/* Do Not Sell Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel mb-3 cursor-pointer hover:bg-raised/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.doNotSell}
                  onChange={() => toggle("doNotSell")}
                  className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                  aria-label="Do not sell or share my information toggle"
                />
                <span className="text-sm font-semibold text-ink">Do not sell or share my information</span>
              </label>

              <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-3 mt-5">Categories</h3>

              <div className="space-y-2">
                {/* Strictly Necessary */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel cursor-not-allowed opacity-80">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 rounded border-line text-accent"
                    aria-label="Strictly Necessary toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Strictly Necessary</span>
                    <p className="text-xs text-faded mt-0.5">Required for the website to function.</p>
                  </div>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={() => toggle("marketing")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="General Marketing and Advertising toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Marketing &amp; Advertising</span>
                    <p className="text-xs text-faded mt-0.5">Deliver relevant ads and measure effectiveness.</p>
                  </div>
                </label>

                {/* Analytics */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={() => toggle("analytics")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Analytics toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Analytics</span>
                    <p className="text-xs text-faded mt-0.5">Understand how visitors use the site.</p>
                  </div>
                </label>

                {/* Performance */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.performance}
                    onChange={() => toggle("performance")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Performance and Functionality toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Performance</span>
                    <p className="text-xs text-faded mt-0.5">Enhance speed and remember preferences.</p>
                  </div>
                </label>

                {/* Social Media */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.social}
                    onChange={() => toggle("social")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Social Media Advertising toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Social Media</span>
                    <p className="text-xs text-faded mt-0.5">Targeted ads on social platforms.</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleNecessaryOnly}
                  className="flex-1 px-3 py-2.5 text-xs font-medium text-faded hover:text-ink border border-line rounded-xl transition-colors"
                >
                  Necessary Only
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-3 py-2.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-colors shadow-lg shadow-brand-700/20"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
