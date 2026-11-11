/*
 * English only. /es, /fr and /pt declared their language but served the
 * English page untouched, so they are dropped: next.config.mjs sends them to
 * the English URL with a 308. To bring a language back, add it here with a
 * real translation in messages/, and remove its redirect.
 */
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
