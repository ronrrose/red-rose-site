import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed tokens for three things that must not be forgeable: the emailed link
 * that unlocks the exposed-files check, the unsubscribe link, and the scan
 * result the browser hands back when it asks for the report.
 *
 * Key: SECURITY_CHECK_SECRET when set. Otherwise one is derived from a secret
 * the deployment already has (ADMIN_SESSION_SECRET, then CRON_SECRET), with a
 * purpose label so it can never be used for anything else. With none of
 * them, signing is off and every feature that needs it says so.
 */

const LABEL = "red-rose/security-check/v1";

export function signingKey(): Buffer | null {
  const own = process.env.SECURITY_CHECK_SECRET;
  if (own && own.length >= 16) return Buffer.from(own, "utf8");
  const parent = process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET;
  if (parent && parent.length >= 16) return createHmac("sha256", parent).update(LABEL).digest();
  return null;
}

export function isSigningConfigured(): boolean {
  return signingKey() !== null;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function hmac(data: string, key: Buffer): string {
  return b64url(createHmac("sha256", key).update(data).digest());
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type TokenPurpose = "files" | "unsub";

/** A compact signed token: base64url(json).signature, with purpose and expiry inside. */
export function signToken(purpose: TokenPurpose, payload: Record<string, unknown>, ttlSeconds: number, now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  const body = b64url(Buffer.from(JSON.stringify({ ...payload, p: purpose, exp: Math.floor(now / 1000) + ttlSeconds })));
  return `${body}.${hmac(body, key)}`;
}

export function verifyToken<T extends Record<string, unknown>>(purpose: TokenPurpose, token: unknown, now = Date.now()): T | null {
  const key = signingKey();
  if (!key || typeof token !== "string" || token.length > 2000) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  if (!safeEqual(token.slice(dot + 1), hmac(body, key))) return null;
  try {
    const data = JSON.parse(fromB64url(body).toString("utf8"));
    if (data.p !== purpose || typeof data.exp !== "number" || data.exp * 1000 < now) return null;
    return data as T;
  } catch {
    return null;
  }
}

/** Signature over a scan result, so the report route can trust what the browser returns. */
export function signResult(json: string): string | null {
  const key = signingKey();
  return key ? hmac(`result:${json}`, key) : null;
}

export function verifyResult(json: string, sig: unknown): boolean {
  const key = signingKey();
  if (!key || typeof sig !== "string") return false;
  return safeEqual(sig, hmac(`result:${json}`, key));
}
