import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  normalizeEmail,
  formatPhoneForDisplay,
  firstNameOf,
} from "@/lib/phone";

describe("normalizePhone", () => {
  it("normalises the business number in every format it gets typed", () => {
    for (const input of [
      "(941) 206-4709",
      "941-206-4709",
      "941.206.4709",
      "941 206 4709",
      "9412064709",
      "1-941-206-4709",
      "19412064709",
      "+1 941 206 4709",
      "+19412064709",
      "  (941) 206-4709  ",
      "tel:+19412064709",
    ]) {
      expect(normalizePhone(input), input).toBe("+19412064709");
    }
  });

  it("keeps an explicit international number", () => {
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizePhone("+61 2 9374 4000")).toBe("+61293744000");
  });

  it("rejects anything that is not a dialable number", () => {
    for (const input of [
      "",
      "   ",
      null,
      undefined,
      "abc",
      "555-1234",            // no area code
      "1234567890",          // area code starts with 1
      "0412064709",          // area code starts with 0
      "941-111-4709",        // exchange ends in 11
      "+0123456789",         // country code starts with 0
      "+1",                  // too short
      "12345678901234567890", // too long for E.164
    ]) {
      expect(normalizePhone(input as string), String(input)).toBeNull();
    }
  });

  it("does not vanity-decode letters into digits", () => {
    // 1-800-FLOWERS must not become a number we were never given.
    expect(normalizePhone("1-800-FLOWERS")).toBeNull();
  });

  it("is idempotent", () => {
    const once = normalizePhone("(941) 206-4709");
    expect(normalizePhone(once)).toBe(once);
  });
});

describe("normalizeEmail", () => {
  it("lower-cases and trims so case is never a second identity", () => {
    expect(normalizeEmail("  Jane.Doe@Example.COM ")).toBe("jane.doe@example.com");
  });

  it("rejects unusable addresses", () => {
    for (const input of ["", null, undefined, "nope", "a@b", "a b@c.com", "@example.com"]) {
      expect(normalizeEmail(input as string), String(input)).toBeNull();
    }
  });

  it("rejects an address longer than the RFC maximum", () => {
    expect(normalizeEmail(`${"a".repeat(250)}@example.com`)).toBeNull();
  });
});

describe("formatPhoneForDisplay", () => {
  it("formats a US number", () => {
    expect(formatPhoneForDisplay("+19412064709")).toBe("(941) 206-4709");
  });

  it("passes a non-US number through unchanged", () => {
    expect(formatPhoneForDisplay("+442079460958")).toBe("+442079460958");
  });
});

describe("firstNameOf", () => {
  it("takes the first token", () => {
    expect(firstNameOf("Jane Doe")).toBe("Jane");
    expect(firstNameOf("  Maria  De La Cruz ")).toBe("Maria");
  });

  it("falls back to a neutral greeting rather than an empty name", () => {
    expect(firstNameOf(null)).toBe("there");
    expect(firstNameOf("   ")).toBe("there");
  });
});
