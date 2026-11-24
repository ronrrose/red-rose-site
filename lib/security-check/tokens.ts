import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed tokens for the two things that must not be forgeable: the
 * unsubscribe link, and the scan result the browser hands back when it asks
 * for the report.
 *
 * Keys:
 *   - Unsubscribe links (and so the day 3 and day 7 follow-ups) need a
 *     dedicated SECURITY_CHECK_SECRET. Without it they are never issued:
 *     fail closed, so an unsubscribe link can never depend on a secret that
 *     exists for something else and might be rotated without notice.
 *   - Result signatures use SECURITY_CHECK_SECRET when set, otherwise a key
 *     derived from ADMIN_SESSION_SECRET or CRON_SECRET under a purpose
 *     label, so previews work before Ron adds it.
 */

const LABEL = "red-rose/security-check/v1";
const MIN_SECRET = 16;

export type TokenPurpose = "unsub";

function dedicatedKey(): Buffer | null {
  const own = process.env.SECURITY_CHECK_SECRET;
  return own && own.length >= MIN_SECRET ? Buffer.from(own, "utf8") : null;
}

/** The key for a purpose, or null when that purpose may not be signed here. */
export function signingKey(purpose: TokenPurpose | "result"): Buffer | null {
  const own = dedicatedKey();
  if (own) return own;
  if (purpose === "unsub") return null;
  const parent = process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET;
  if (parent && parent.length >= MIN_SECRET) return createHmac("sha256", parent).update(LABEL).digest();
  return null;
}

export function hasDedicatedSecret(): boolean {
  return dedicatedKey() !== null;
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

/** Constant-time string compare. Hashing first makes the lengths equal. */
export function safeEqual(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y) && a.length === b.length;
}

/** A compact signed token: base64url(json).signature, with purpose and expiry inside. */
export function signToken(purpose: TokenPurpose, payload: Record<string, unknown>, ttlSeconds: number, now = Date.now()): string | null {
  const key = signingKey(purpose);
  if (!key) return null;
  const body = b64url(Buffer.from(JSON.stringify({ ...payload, p: purpose, exp: Math.floor(now / 1000) + ttlSeconds })));
  return `${body}.${hmac(body, key)}`;
}

export function verifyToken<T extends Record<string, unknown>>(purpose: TokenPurpose, token: unknown, now = Date.now()): T | null {
  const key = signingKey(purpose);
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

/** How long the browser's copy of a result can be turned into a report. */
export const RESULT_TTL_SECONDS = 24 * 60 * 60;

/**
 * Signature over a scan result, with an expiry, so the report route can trust
 * what the browser returns for a day and no longer. Format: "<exp>.<mac>".
 */
export function signResult(json: string, now = Date.now()): string | null {
  const key = signingKey("result");
  if (!key) return null;
  const exp = Math.floor(now / 1000) + RESULT_TTL_SECONDS;
  return `${exp}.${hmac(`result:${exp}:${json}`, key)}`;
}

export function verifyResult(json: string, sig: unknown, now = Date.now()): boolean {
  const key = signingKey("result");
  if (!key || typeof sig !== "string" || sig.length > 200) return false;
  const dot = sig.indexOf(".");
  const exp = Number(sig.slice(0, dot));
  if (dot < 1 || !Number.isInteger(exp) || exp * 1000 < now) return false;
  return safeEqual(sig.slice(dot + 1), hmac(`result:${exp}:${json}`, key));
}
