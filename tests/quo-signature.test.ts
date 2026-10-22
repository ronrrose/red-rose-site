import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import {
  verifyQuoSignature,
  signQuoPayload,
  MAX_SKEW_SECONDS,
} from "@/lib/quo/signature";

/** A realistic whsec_ secret: the prefix plus base64 key material. */
const SECRET = `whsec_${crypto.randomBytes(24).toString("base64")}`;
const OTHER_SECRET = `whsec_${crypto.randomBytes(24).toString("base64")}`;

const BODY = JSON.stringify({
  id: "EV123",
  apiVersion: "2026-03-30",
  type: "message.received",
  data: { resource: { from: "+19415551234", text: "hi" } },
});

const DELIVERY_ID = "msg_2abcDEF";
const NOW = 1_800_000_000;

function headers(overrides: Partial<Record<"id" | "timestamp" | "signature", string | null>> = {}) {
  return {
    id: DELIVERY_ID,
    timestamp: String(NOW),
    signature: signQuoPayload(BODY, DELIVERY_ID, NOW, SECRET),
    ...overrides,
  };
}

describe("verifyQuoSignature", () => {
  it("accepts a correctly signed delivery", () => {
    const result = verifyQuoSignature(BODY, headers(), SECRET, NOW);
    expect(result).toEqual({ ok: true, deliveryId: DELIVERY_ID });
  });

  it("accepts a signature computed independently of our own signer", () => {
    // Guards against a bug where sign and verify agree with each other but
    // disagree with Quo. Built straight from the documented scheme.
    const keyBytes = Buffer.from(SECRET.slice("whsec_".length), "base64");
    const mac = crypto
      .createHmac("sha256", keyBytes)
      .update(`${DELIVERY_ID}.${NOW}.${BODY}`)
      .digest("base64");
    const result = verifyQuoSignature(
      BODY,
      headers({ signature: `v1,${mac}` }),
      SECRET,
      NOW
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a body that was modified in flight", () => {
    const tampered = BODY.replace("+19415551234", "+19998887777");
    const result = verifyQuoSignature(tampered, headers(), SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a body that was only re-serialised", () => {
    // The exact failure mode the docs warn about: parsing then re-stringifying
    // changes whitespace, and the HMAC no longer matches.
    const reserialised = JSON.stringify(JSON.parse(BODY), null, 2);
    const result = verifyQuoSignature(reserialised, headers(), SECRET, NOW);
    expect(result.ok).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    const result = verifyQuoSignature(
      BODY,
      headers({ signature: signQuoPayload(BODY, DELIVERY_ID, NOW, OTHER_SECRET) }),
      SECRET,
      NOW
    );
    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a signature bound to a different delivery id", () => {
    const result = verifyQuoSignature(
      BODY,
      headers({ signature: signQuoPayload(BODY, "msg_other", NOW, SECRET) }),
      SECRET,
      NOW
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a replayed delivery that is too old", () => {
    const old = NOW - MAX_SKEW_SECONDS - 1;
    const result = verifyQuoSignature(
      BODY,
      { id: DELIVERY_ID, timestamp: String(old), signature: signQuoPayload(BODY, DELIVERY_ID, old, SECRET) },
      SECRET,
      NOW
    );
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects a timestamp from the future", () => {
    const future = NOW + MAX_SKEW_SECONDS + 1;
    const result = verifyQuoSignature(
      BODY,
      { id: DELIVERY_ID, timestamp: String(future), signature: signQuoPayload(BODY, DELIVERY_ID, future, SECRET) },
      SECRET,
      NOW
    );
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("accepts a delivery right at the edge of the window", () => {
    const edge = NOW - MAX_SKEW_SECONDS;
    const result = verifyQuoSignature(
      BODY,
      { id: DELIVERY_ID, timestamp: String(edge), signature: signQuoPayload(BODY, DELIVERY_ID, edge, SECRET) },
      SECRET,
      NOW
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a non-numeric timestamp", () => {
    const result = verifyQuoSignature(BODY, headers({ timestamp: "not-a-number" }), SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "bad_timestamp" });
  });

  it("rejects a delivery with any header missing", () => {
    for (const key of ["id", "timestamp", "signature"] as const) {
      const result = verifyQuoSignature(BODY, headers({ [key]: null }), SECRET, NOW);
      expect(result, key).toEqual({ ok: false, reason: "missing_headers" });
    }
  });

  it("refuses to verify when no secret is configured", () => {
    // Fails closed: an unset secret must never mean "accept everything".
    expect(verifyQuoSignature(BODY, headers(), undefined, NOW)).toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(verifyQuoSignature(BODY, headers(), "", NOW)).toEqual({
      ok: false,
      reason: "not_configured",
    });
  });

  it("rejects an unsigned delivery whose header carries no v1 entry", () => {
    const result = verifyQuoSignature(BODY, headers({ signature: "v2,abc v3,def" }), SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "no_v1_signature" });
  });

  it("accepts a v1 signature alongside versions it does not understand", () => {
    const valid = signQuoPayload(BODY, DELIVERY_ID, NOW, SECRET);
    const result = verifyQuoSignature(
      BODY,
      headers({ signature: `v2,bogus ${valid}` }),
      SECRET,
      NOW
    );
    expect(result.ok).toBe(true);
  });

  it("accepts either signature during a secret rotation", () => {
    // Quo sends several entries while a rotated secret is bedding in; the one
    // matching our current secret is enough.
    const oldSig = signQuoPayload(BODY, DELIVERY_ID, NOW, OTHER_SECRET);
    const newSig = signQuoPayload(BODY, DELIVERY_ID, NOW, SECRET);
    expect(verifyQuoSignature(BODY, headers({ signature: `${oldSig} ${newSig}` }), SECRET, NOW).ok).toBe(true);
  });

  it("tolerates a secret stored without the whsec_ prefix", () => {
    const bare = SECRET.slice("whsec_".length);
    const result = verifyQuoSignature(
      BODY,
      headers({ signature: signQuoPayload(BODY, DELIVERY_ID, NOW, bare) }),
      bare,
      NOW
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a truncated signature without throwing on length mismatch", () => {
    const valid = signQuoPayload(BODY, DELIVERY_ID, NOW, SECRET);
    const truncated = valid.slice(0, valid.length - 5);
    expect(() => verifyQuoSignature(BODY, headers({ signature: truncated }), SECRET, NOW)).not.toThrow();
    expect(verifyQuoSignature(BODY, headers({ signature: truncated }), SECRET, NOW).ok).toBe(false);
  });

  it("rejects an empty body signed for a different body", () => {
    expect(verifyQuoSignature("", headers(), SECRET, NOW).ok).toBe(false);
  });
});

describe("timestamp parsing strictness", () => {
  /*
   * Raised by an independent review pass. None of these was exploitable --
   * the timestamp is covered by the HMAC and garbage also fails the skew
   * check -- but a loose parse reported the wrong failure reason, which would
   * have sent anyone debugging a rejected delivery down the wrong path.
   */
  it("rejects a numeric-looking timestamp that is not plain integer seconds", () => {
    for (const timestamp of [" ", "0x1ab", ` ${NOW} `, "1e9", "+1800000000", "18.5", "-1800000000", "Infinity"]) {
      const result = verifyQuoSignature(
        BODY,
        { id: DELIVERY_ID, timestamp, signature: signQuoPayload(BODY, DELIVERY_ID, timestamp, SECRET) },
        SECRET,
        NOW
      );
      expect(result, JSON.stringify(timestamp)).toEqual({ ok: false, reason: "bad_timestamp" });
    }
  });

  it("treats an empty timestamp header as missing rather than malformed", () => {
    // An empty header value is an absent header, and the reason should say so.
    expect(verifyQuoSignature(BODY, headers({ timestamp: "" }), SECRET, NOW)).toEqual({
      ok: false,
      reason: "missing_headers",
    });
  });

  it("still accepts a well-formed integer timestamp", () => {
    expect(verifyQuoSignature(BODY, headers(), SECRET, NOW).ok).toBe(true);
  });
});
