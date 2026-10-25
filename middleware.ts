import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";
import { SESSION_COOKIE, verifySessionToken } from "./lib/admin/session";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /*
   * /admin is outside the localised site.
   *
   * It has to be handled before the intl middleware runs, or next-intl
   * rewrites /admin/crm to /en/admin/crm and the page 404s. It is also the
   * only place the CRM is reachable, so this is the gate that keeps customer
   * phone numbers, emails and call transcripts behind a login.
   */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return await guardAdmin(req);
  }

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

async function guardAdmin(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // The login page itself must stay reachable, or there is no way in.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  // Remember where they were headed, but only as a path: taking an absolute
  // URL from a query parameter would make this an open redirect.
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/",
    // All non-asset routes, including /admin, which is handled above.
    "/((?!_next|api|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
