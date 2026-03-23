"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("LocaleSwitcher");

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as Locale;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-faded hover:text-ink transition-colors cursor-pointer">
      <Globe className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("label")}</span>
      <select
        className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-sm font-medium cursor-pointer focus:ring-accent focus:border-accent"
        value={locale}
        onChange={onChange}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  );
}
