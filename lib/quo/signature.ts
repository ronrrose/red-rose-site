import crypto from "node:crypto";

/**
 * Quo webhook signature verification.
 *
 * Scheme (per Quo's docs, which is the Svix scheme):
 *   HMAC-SHA256 over `{webhook-id}.{webhook-timestamp}.{raw-body}`,
 *   base64-encoded, compared against a space-separated list of
 *   `v1,<signature>` entries in the webhook-signature header.
 *
 * The signing key arrives as `whsec_<base64>`. Strip the prefix and
 * base64-decode the remainder to get the key bytes.
 *
 * Implemented against node:crypto rather than the svix SDK so the scheme is
 * visible and directly testable, with no dependency in the request path.
 */

/** Reject anything signed more than this long ago, to blunt replay. */
export const MAX_SKEW_SECONDS = 5 * 60;

export type SignatureHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

export type VerifyResult =
  | { ok: true; deliveryId: string }
  | { ok: false; reason: VerifyFailure };

export type VerifyFailure =
  | "not_configured"
  | "missing_headers"
  | "bad_timestamp"
  | "stale_timestamp"
  | "no_v1_signature"
  | "bad_signature";

/**
 * Verify a delivery.
 *
 * `rawBody` must be the exact bytes Quo sent. Re-serialising a parsed object
 * changes key order and whitespace, and the HMAC will not match.
 */
export function verifyQuoSignature(
  rawBody: string,
  headers: SignatureHeaders,
  secret: string | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): VerifyResult {
  if (!secret) return { ok: false, reason: "not_configured" };

  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) {
    return { ok: false, reason: "missing_headers" };
  }

  /*
   * Integer seconds only.
   *
   * Number() alone is too permissive to use as a validator: "" becomes 0,
   * "0x1ab" becomes 427, and " 12 " becomes 12. None of those is exploitable
   * here, because the timestamp string is covered by the HMAC and a garbage
   * value also fails the skew check below. But rejecting them up front means
   * the failure reason in the log says what was actually wrong.
   */
  if (!/^\d{1,15}$/.test(timestamp)) {
    return { ok: false, reason: "bad_timestamp" };
  }
  const signedAt = Number(timestamp);
  if (!Number.isSafeInteger(signedAt)) {
    return { ok: false, reason: "bad_timestamp" };
  }
  // Absolute difference, so a timestamp from the future is rejected too.
  if (Math.abs(nowSeconds - signedAt) > MAX_SKEW_SECONDS) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const keyBytes = decodeSecret(secret);
  const expected = crypto
    .createHmac("sha256", keyBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  const provided = parseSignatureHeader(signature);
  if (provided.length === 0) {
    return { ok: false, reason: "no_v1_signature" };
  }

  const matched = provided.some((candidate) => timingSafeEqualStrings(candidate, expected));
  if (!matched) return { ok: false, reason: "bad_signature" };

  return { ok: true, deliveryId: id };
}

/** `whsec_<base64>` -> key bytes. A secret without the prefix is used as-is. */
function decodeSecret(secret: string): Buffer {
  const base64 = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  return Buffer.from(base64, "base64");
}

/**
 * Pull the v1 signatures out of the header.
 *
 * The header may carry several entries during a secret rotation, and may
 * carry versions we do not understand. Ignore anything that is not v1 rather
 * than guessing at its scheme.
 */
function parseSignatureHeader(header: string): string[] {
  return header
    .split(" ")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const comma = entry.indexOf(",");
      if (comma === -1) return null;
      const version = entry.slice(0, comma);
      const value = entry.slice(comma + 1);
      return version === "v1" && value ? value : null;
    })
    .filter((value): value is string => value !== null);
}

/**
 * Constant-time compare.
 *
 * timingSafeEqual throws when the buffers differ in length, so check length
 * first. Length is not a secret here: it is fixed by SHA-256, so an attacker
 * learns nothing from a length mismatch.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/** Sign a body the way Quo does. Used by the tests, not by the request path. */
export function signQuoPayload(
  rawBody: string,
  id: string,
  timestamp: string | number,
  secret: string
): string {
  const keyBytes = decodeSecret(secret);
  const mac = crypto
    .createHmac("sha256", keyBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");
  return `v1,${mac}`;
}
