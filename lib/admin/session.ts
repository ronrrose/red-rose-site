/**
 * Admin session tokens, built on Web Crypto.
 *
 * Deliberately not node:crypto. This module is imported by middleware.ts,
 * and Next 14 runs middleware on the Edge runtime where node:crypto does not
 * exist: a createHmac call there throws at request time, not at build time,
 * so it would have shipped and then locked the admin out.
 *
 * Web Crypto is available in both the Edge runtime and Node 18+, so the same
 * code verifies a cookie in middleware and in a route handler.
 */

export const SESSION_COOKIE = "rrt_admin";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

/**
 * Mint a session token: `<expiryUnixSeconds>.<hmac>`.
 *
 * Stateless, so there is no session store to keep. The expiry is inside the
 * signed payload, which means a cookie cannot be extended by editing it.
 */
export async function createSessionToken(
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<string> {
  const expires = String(nowSeconds + SESSION_TTL_SECONDS);
  return `${expires}.${await sign(expires, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<boolean> {
  if (!token || !secret) return false;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const expiresRaw = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!signature) return false;

  // Integer seconds only, for the same reason as the webhook timestamp: the
  // value is covered by the HMAC, but a strict check keeps the parse honest.
  if (!/^\d{1,15}$/.test(expiresRaw)) return false;
  const expires = Number(expiresRaw);
  if (!Number.isSafeInteger(expires) || expires <= nowSeconds) return false;

  const expected = await sign(expiresRaw, secret);
  return constantTimeEqual(signature, expected);
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(mac));
}

/**
 * Constant-time string compare.
 *
 * Length is not secret here: it is fixed by SHA-256, so an early return on a
 * length mismatch leaks nothing.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function sessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    // Allow plain http on localhost so dev login works.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
