import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // /en, /es, /pt, /fr
});

export const config = {
  matcher: ["/", "/((?!_next|api|.*\\..*).*)"], // apply to all non-asset routes
};
