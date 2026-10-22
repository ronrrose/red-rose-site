import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, isAdminConfigured } from "@/lib/admin/auth";

/**
 * Password verification guards the whole CRM: customer phone numbers, emails
 * and call transcripts sit behind it. It had no tests until a manual check of
 * a real stored hash pointed out the omission.
 *
 * Every password here is synthetic.
 */

const PASSWORD = "correct horse battery staple";

describe("hashPassword", () => {
  it("produces the scrypt$<salt>$<hash> format the login route expects", () => {
    expect(hashPassword(PASSWORD)).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  it("salts every hash, so the same password never yields the same string twice", () => {
    expect(hashPassword(PASSWORD)).not.toBe(hashPassword(PASSWORD));
  });
});

describe("verifyPassword", () => {
  it("accepts the password it was derived from", () => {
    expect(verifyPassword(PASSWORD, hashPassword(PASSWORD))).toBe(true);
  });

  it("accepts a hash generated in a separate call, not just the same one", () => {
    // Guards against a bug where verification only works against a hash held
    // in memory from this process.
    const stored = hashPassword(PASSWORD);
    expect(verifyPassword(PASSWORD, stored)).toBe(true);
    expect(verifyPassword(PASSWORD, stored)).toBe(true);
  });

  it("rejects the wrong password", () => {
    const stored = hashPassword(PASSWORD);
    for (const wrong of [
      "Correct horse battery staple",   // capitalisation
      "correct horse battery stapl",    // truncated
      "correct horse battery staple ",  // trailing space
      "correct  horse battery staple",  // doubled space
      "",
      "password",
    ]) {
      expect(verifyPassword(wrong, stored), JSON.stringify(wrong)).toBe(false);
    }
  });

  it("rejects an empty password even against a hash of the empty string", () => {
    // A blank form field must never authenticate, whatever is stored.
    expect(verifyPassword("", hashPassword(""))).toBe(false);
  });

  it("fails closed when no hash is configured", () => {
    // An unset ADMIN_PASSWORD_HASH must not mean "let everyone in".
    expect(verifyPassword(PASSWORD, undefined)).toBe(false);
    expect(verifyPassword(PASSWORD, "")).toBe(false);
  });

  it("rejects a malformed stored value instead of throwing", () => {
    for (const stored of [
      "not-a-hash",
      "scrypt$",
      "scrypt$abc",
      "scrypt$zzzz$zzzz",                    // non-hex
      "bcrypt$" + "a".repeat(32) + "$" + "b".repeat(128), // wrong algorithm
      "scrypt$" + "a".repeat(32) + "$" + "b".repeat(10),  // wrong hash length
      "$$",
      "scrypt$$",
    ]) {
      expect(() => verifyPassword(PASSWORD, stored), stored).not.toThrow();
      expect(verifyPassword(PASSWORD, stored), stored).toBe(false);
    }
  });

  it("does not accept the stored hash itself as the password", () => {
    const stored = hashPassword(PASSWORD);
    expect(verifyPassword(stored, stored)).toBe(false);
  });

  it("handles a very long password without throwing", () => {
    const long = "x".repeat(4096);
    expect(verifyPassword(long, hashPassword(long))).toBe(true);
    expect(verifyPassword("x".repeat(4095), hashPassword(long))).toBe(false);
  });

  it("handles unicode passwords consistently", () => {
    const unicode = "contraseña-🔐-日本語";
    expect(verifyPassword(unicode, hashPassword(unicode))).toBe(true);
    expect(verifyPassword("contrasena-🔐-日本語", hashPassword(unicode))).toBe(false);
  });
});

describe("isAdminConfigured", () => {
  it("requires both the hash and the session secret", () => {
    const saved = {
      hash: process.env.ADMIN_PASSWORD_HASH,
      secret: process.env.ADMIN_SESSION_SECRET,
    };
    try {
      delete process.env.ADMIN_PASSWORD_HASH;
      delete process.env.ADMIN_SESSION_SECRET;
      expect(isAdminConfigured()).toBe(false);

      process.env.ADMIN_PASSWORD_HASH = "scrypt$aa$bb";
      expect(isAdminConfigured()).toBe(false);

      process.env.ADMIN_SESSION_SECRET = "a-secret";
      expect(isAdminConfigured()).toBe(true);
    } finally {
      if (saved.hash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
      else process.env.ADMIN_PASSWORD_HASH = saved.hash;
      if (saved.secret === undefined) delete process.env.ADMIN_SESSION_SECRET;
      else process.env.ADMIN_SESSION_SECRET = saved.secret;
    }
  });
});
