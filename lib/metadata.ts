import { locales } from "@/i18n/config";

const BASE = "https://www.redrosetechnologies.com";

/**
 * Generate hreflang alternates for a given path (without locale prefix).
 * e.g. localeAlternates("/managed-it") → { "en": ".../en/managed-it", "es": ".../es/managed-it", ... }
 */
export function localeAlternates(path: string = "") {
  const languages: Record<string, string> = {
    "x-default": `${BASE}/en${path}`,
  };
  for (const l of locales) {
    languages[l] = `${BASE}/${l}${path}`;
  }
  return { languages };
}
