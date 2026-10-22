import crypto from "node:crypto";

/**
 * Admin password verification.
 *
 * node:crypto, so this module must only be imported from code running on the
 * Node runtime (the login route). Session cookies live in
 * lib/admin/session.ts, which is Edge-safe because middleware imports it.
 *
 * There is exactly one operator, so there is no user table: a scrypt hash in
 * the environment is the whole credential store.
 */

const SCRYPT_KEYLEN = 64;

/**
 * Verify a password against ADMIN_PASSWORD_HASH.
 *
 * Expected format: `scrypt$<saltHex>$<hashHex>`. Generate one with
 * `node scripts/hash-password.mjs`.
 */
export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored || !password) return false;

  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length !== SCRYPT_KEYLEN) return false;

  let actual: Buffer;
  try {
    actual = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  } catch {
    return false;
  }
  return crypto.timingSafeEqual(actual, expected);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}
