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

/** The site-wide share image, served by app/opengraph-image.tsx. */
export const SHARE_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: "Red Rose Technologies - Managed IT for Dental Practices",
};

/**
 * A page's Open Graph block, with the share image attached.
 *
 * Next.js does not merge openGraph between layouts and pages: a page that sets
 * its own openGraph replaces the root one wholesale, images included. That is
 * how 11 of 13 pages ended up with no og:image. Every page that sets openGraph
 * goes through here so the image cannot be dropped again. twitter:image is
 * filled from these images by Next.js, since the root sets the large card.
 */
export function pageOpenGraph(og: { title: string; description?: string; url?: string }) {
  return {
    type: "website" as const,
    siteName: "Red Rose Technologies LLC",
    locale: "en_US",
    images: [SHARE_IMAGE],
    ...og,
  };
}
