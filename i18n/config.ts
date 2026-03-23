export const locales = ["en", "es", "pt", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
