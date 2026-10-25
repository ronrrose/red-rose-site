import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
  // Must match middleware.ts, or every internal link lands on a redirect.
  localePrefix: "as-needed",
});
