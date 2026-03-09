"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";

export default function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("rrt-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("rrt-cookie-consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("rrt-cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
    >
      <div className="container-site">
        <div className="bg-raised border border-line rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-2xl">
          <p className="text-sm text-faded flex-1">
            {t("cookie.message")}
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-faded hover:text-ink border border-line rounded-lg transition-colors"
            >
              {t("cookie.reject")}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
            >
              {t("cookie.accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
