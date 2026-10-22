import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/admin/auth";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/admin/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

/** Brute-force brake. In-memory, so per-instance: a speed bump, not a wall. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attemptsByIp = new Map<string, number[]>();

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = (attemptsByIp.get(ip) || []).filter((t) => t > now - WINDOW_MS);
  attempts.push(now);
  attemptsByIp.set(ip, attempts);
  if (attemptsByIp.size > 1000) attemptsByIp.clear();
  return attempts.length <= MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "unknown";

  if (!withinRateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes." }, { status: 429 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!secret || !hash) {
    // Misconfigured rather than wrong password. Say so to the operator: this
    // endpoint is already behind a password, so there is nothing to leak.
    return NextResponse.json(
      { error: "Admin login is not configured on this deployment." },
      { status: 503 }
    );
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  if (!verifyPassword(parsed.data.password, hash)) {
    console.warn(`Admin login failed from ${ip}`);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(secret), sessionCookieOptions());
  return res;
}
