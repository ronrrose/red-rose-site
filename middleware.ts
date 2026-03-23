import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  // Upgrade temporary redirects (307) to permanent (308)
  if (res.status === 307) {
    const location = res.headers.get("location");
    if (location) {
      return NextResponse.redirect(new URL(location, req.url), 308);
    }
  }

  return res;
}

export const config = {
  matcher: ["/", "/((?!_next|api|.*\\..*).*)"], // apply to all non-asset routes
};
