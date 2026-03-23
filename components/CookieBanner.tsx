"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n-context";
import Link from "next/link";
import { X } from "lucide-react";

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
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem("rrt-cookie-consent");
    if (!consent) {
      setVisible(true);
    } else {
      setHasConsented(true);
    }
    const saved = localStorage.getItem("rrt-cookie-prefs");
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch { /* use defaults */ }
    }
  }, []);

  const saveAndClose = useCallback((preferences: CookiePreferences) => {
    localStorage.setItem("rrt-cookie-consent", "custom");
    localStorage.setItem("rrt-cookie-prefs", JSON.stringify(preferences));
    setVisible(false);
    setShowPreferences(false);
    setHasConsented(true);
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

  const openPreferencesWidget = () => {
    setVisible(true);
    setShowPreferences(true);
  };

  if (!visible) {
    // Show floating cookie widget button after user has consented
    if (!hasConsented) return null;
    return (
      <div className="fixed bottom-4 left-4 z-[60]">
        <button
          onClick={openPreferencesWidget}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-faded hover:text-ink bg-raised border border-line rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label="Cookie preferences"
        >
          <span className="text-lg leading-none" aria-hidden="true">🍪</span>
          Cookie preferences
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
    >
      <div className="container-site">
        {!showPreferences ? (
          /* ── Simple Banner ── */
          <div className="bg-raised border border-line rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-2xl">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-3xl shrink-0 leading-none" aria-hidden="true">&#127850;</span>
              <p className="text-sm text-faded">
                {t("cookie.message")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-faded hover:text-ink border border-line rounded-lg transition-colors"
              >
                {t("cookie.manage")}
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-faded hover:text-ink border border-line rounded-lg transition-colors"
              >
                {t("cookie.reject")}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
              >
                {t("cookie.accept")}
              </button>
            </div>
          </div>
        ) : (
          /* ── Full Preferences Panel ── */
          <div className="bg-raised border border-line rounded-2xl shadow-2xl max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" aria-hidden="true">&#127850;</span>
                  <h2 className="text-xl font-bold text-ink">Update Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 text-faded hover:text-ink transition-colors rounded-lg"
                  aria-label="Close preferences"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-sm text-faded leading-relaxed mb-6">
                Red Rose Technologies uses different categories of cookies to provide, protect, improve, and promote our website and services.
                Information on these categories and their purposes are described below.
                For more information please see our{" "}
                <Link href="/privacy" className="text-accent hover:text-brand-600 transition-colors">Privacy Policy</Link>.
              </p>

              {/* Do Not Sell Toggle */}
              <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel mb-4 cursor-pointer hover:bg-raised/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.doNotSell}
                  onChange={() => toggle("doNotSell")}
                  className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                  aria-label="Do not sell or share my information toggle"
                />
                <span className="text-sm font-semibold text-ink">Do not sell or share my information</span>
              </label>

              <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-4 mt-6">Cookie Preferences</h3>

              <div className="space-y-3">
                {/* Strictly Necessary */}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel cursor-not-allowed opacity-80">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 rounded border-line text-accent"
                    aria-label="Strictly Necessary toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Strictly Necessary</span>
                    <p className="text-xs text-faded mt-0.5">Required for the website to function. Cannot be disabled.</p>
                  </div>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={() => toggle("marketing")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="General Marketing and Advertising toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">General Marketing and Advertising</span>
                    <p className="text-xs text-faded mt-0.5">Used to deliver relevant ads and measure campaign effectiveness.</p>
                  </div>
                </label>

                {/* Analytics */}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={() => toggle("analytics")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Analytics toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Analytics</span>
                    <p className="text-xs text-faded mt-0.5">Helps us understand how visitors use the site so we can improve it.</p>
                  </div>
                </label>

                {/* Performance */}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.performance}
                    onChange={() => toggle("performance")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Performance and Functionality toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Performance and Functionality</span>
                    <p className="text-xs text-faded mt-0.5">Enhances site speed, remembers preferences, and improves your experience.</p>
                  </div>
                </label>

                {/* Social Media */}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-line bg-panel cursor-pointer hover:bg-raised/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.social}
                    onChange={() => toggle("social")}
                    className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
                    aria-label="Social Media Advertising toggle"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink">Social Media Advertising</span>
                    <p className="text-xs text-faded mt-0.5">Enables targeted ads on social platforms based on your site activity.</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleNecessaryOnly}
                  className="flex-1 px-4 py-3 text-sm font-medium text-faded hover:text-ink border border-line rounded-xl transition-colors"
                >
                  Strictly Necessary Only
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-colors shadow-lg shadow-brand-700/20"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
