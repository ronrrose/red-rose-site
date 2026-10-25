import { locales, defaultLocale, type Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/site-config";

/**
 * Absolute URL for a path in a given locale.
 *
 * Routing runs with next-intl's localePrefix "as-needed", so English is served
 * at /managed-it and only the other locales carry a prefix (/es/managed-it).
 * Getting this wrong is expensive: every URL we emit here goes into hreflang,
 * canonical tags and the sitemap, and a prefix that does not match the router
 * sends crawlers through a redirect on every single entry.
 */
export function localeUrl(locale: Locale, path: string = ""): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

/**
 * hreflang alternates for a path, plus a self-referencing canonical when the
 * caller knows which locale it is rendering.
 *
 * Pass the locale from generateMetadata to get a canonical. A page with static
 * metadata cannot know its locale, and a canonical pointing at the English URL
 * from a Spanish page would ask Google to drop the translation, so those pages
 * get alternates only.
 */
export function localeAlternates(path: string = "", locale?: Locale) {
  const languages: Record<string, string> = {
    "x-default": localeUrl(defaultLocale, path),
  };
  for (const l of locales) {
    languages[l] = localeUrl(l, path);
  }
  return locale
    ? { canonical: localeUrl(locale, path), languages }
    : { languages };
}
