import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-config";

/** Same source order as the contact form. On Vercel, x-forwarded-for is set by the platform. */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function userAgent(req: NextRequest): string | null {
  const ua = req.headers.get("user-agent");
  return ua ? ua.slice(0, 300) : null;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** A JSON body no bigger than `max` bytes, or null. */
export async function readJson(req: NextRequest, max = 64_000): Promise<unknown | null> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > max) return null;
  try {
    const text = await req.text();
    if (text.length > max) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Reject cross-site form posts. Browsers send Origin on POST; a request from
 * another site's page is refused. Requests with no Origin (curl, tests) pass,
 * because the rate limits apply to them anyway.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const o = new URL(origin);
    const host = req.headers.get("host");
    return o.host === host || o.origin === SITE_URL || o.origin === SITE_URL.replace("://www.", "://");
  } catch {
    return false;
  }
}

/** Absolute base for links in emails: the deployment the visitor used, falling back to production. */
export function siteBase(req: NextRequest): string {
  // Only hosts we serve from, so a forged Host header cannot put someone
  // else's address into an email we send.
  const host = (req.headers.get("host") ?? "").toLowerCase();
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  if (/^([a-z0-9-]+\.)*redrosetechnologies\.com$/.test(host)) return `https://${host}`;
  if (/^redrosetechnologies-site-[a-z0-9-]+\.vercel\.app$/.test(host)) return `https://${host}`;
  return SITE_URL;
}

export function minutes(seconds: number): string {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return m === 1 ? "1 minute" : `${m} minutes`;
}
