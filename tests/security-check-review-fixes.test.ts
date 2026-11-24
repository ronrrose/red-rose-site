import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Tests for the review of c06a599: email relay, fail-closed in production,
 * IPv6 /64 keys, the suppression list, the dedicated secret, the cron auth
 * and the cache headers on token pages.
 */

const sendReportEmail = vi.fn(async (_input?: unknown) => ({ ok: true, id: "re_test" }));
const sendLeadAlert = vi.fn(async (_input?: unknown) => true);
const sendFollowup = vi.fn(async (_input?: unknown) => true);
const sendUnsubscribeNotice = vi.fn(async (_e?: unknown, _l?: unknown) => undefined);
vi.mock("@/lib/security-check/emails", async (orig) => ({
  ...(await orig<typeof import("@/lib/security-check/emails")>()),
  sendReportEmail: (i: unknown) => sendReportEmail(i),
  sendLeadAlert: (i: unknown) => sendLeadAlert(i),
  sendFollowup: (i: unknown) => sendFollowup(i),
  sendUnsubscribeNotice: (e: unknown, l: unknown) => sendUnsubscribeNotice(e, l),
}));
const runScan = vi.fn();
vi.mock("@/lib/security-check/scan", () => ({
  runScan: (...a: unknown[]) => runScan(...a),
  addExposedFilesToResult: vi.fn(),
}));

import { POST as report } from "@/app/api/security-check/report/route";
import { POST as scanRoute } from "@/app/api/security-check/scan/route";
import { POST as unsubscribe } from "@/app/api/security-check/unsubscribe/route";
import { getStore, resetStoreCache, PostgresStore, MemoryStore } from "@/lib/security-check/store";
import { signResult, signToken, verifyResult, verifyToken, safeEqual } from "@/lib/security-check/tokens";
import { checkName, checkPractice } from "@/lib/security-check/lead-fields";
import { ipRateKey } from "@/lib/security-check/http";
import { followupConfig } from "@/lib/security-check/emails";
import { readFileSync } from "node:fs";

function result(host = "smiledental.com", scannedAt = new Date().toISOString()) {
  return {
    version: 1, host, domain: host.replace(/^www\./, ""), scannedAt, score: 50, grade: "F",
    checks: [], findings: [], strengths: [], requests: [], exposedFilesChecked: false, pageUrl: null, tlsVerified: true,
  };
}

function post(path: string, body: unknown, ip = "203.0.113.5") {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, host: "localhost" },
    body: JSON.stringify(body),
  });
}

const lead = { name: "Pat Lee", practice: "Smile Dental", email: "pat@smiledental.com", phone: "", role: "Office manager" };

beforeEach(() => {
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL_ENV;
  delete process.env.SECURITY_CHECK_ALLOW_MEMORY;
  delete process.env.SECURITY_CHECK_SECRET;
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-sixteen-chars";
  resetStoreCache();
  vi.clearAllMocks();
  runScan.mockImplementation(async (h: string) => ({ ok: true, result: result(h) }));
});
afterEach(() => {
  delete process.env.VERCEL_ENV;
  delete process.env.SECURITY_CHECK_SECRET;
});

describe("1. the report route is not an open email relay", () => {
  it("emails one scan's result at most twice", async () => {
    const r = result();
    const body = { scanId: "x", result: r, signature: signResult(JSON.stringify(r)) };
    expect((await report(post("/api/security-check/report", { ...body, ...lead, email: "a@smiledental.com" }, "198.51.100.1"))).status).toBe(200);
    expect((await report(post("/api/security-check/report", { ...body, ...lead, email: "b@smiledental.com" }, "198.51.100.2"))).status).toBe(200);
    const third = await report(post("/api/security-check/report", { ...body, ...lead, email: "c@smiledental.com" }, "198.51.100.3"));
    expect(third.status).toBe(429);
    expect(sendReportEmail).toHaveBeenCalledTimes(2);
  });

  it("emails any one address at most twice a day, whatever the scan", async () => {
    for (const [i, expected] of [[1, 200], [2, 200], [3, 429]] as const) {
      const r = result(`site${i}.com`);
      const res = await report(post("/api/security-check/report", { scanId: "x", result: r, signature: signResult(JSON.stringify(r)), ...lead, email: "victim@example-mail.com" }, `198.51.100.${10 + i}`));
      expect(res.status).toBe(expected);
    }
  });

  it("refuses an expired result signature", async () => {
    const r = result();
    const old = signResult(JSON.stringify(r), Date.now() - 25 * 3600_000);
    expect(verifyResult(JSON.stringify(r), old)).toBe(false);
    const res = await report(post("/api/security-check/report", { scanId: "x", result: r, signature: old, ...lead }));
    expect(res.status).toBe(410);
  });

  it("refuses a stored scan older than a day", async () => {
    const store = await getStore();
    const id = await store.saveScan({ host: "smiledental.com", domain: "smiledental.com", ip: null, userAgent: null, authorizationText: "x", authorizationVersion: "x", authorizedAt: new Date(), result: result() as never });
    (await store.getScan(id))!.createdAt = new Date(Date.now() - 25 * 3600_000);
    const res = await report(post("/api/security-check/report", { scanId: id, result: null, signature: null, ...lead }));
    expect(res.status).toBe(410);
  });

  it.each([
    ["practice", "Visit evil.example now"],
    ["practice", "Call 800 555 0199"],
    ["practice", "https://phish.example"],
    ["practice", "www.claim-your-prize"],
    ["practice", "Pay at pay@x.co"],
    ["name", "Bob 1234"],
    ["name", "<b>Bob</b>"],
    ["name", "bob.example.net"],
  ])("refuses a %s of %j", async (field, value) => {
    const r = result();
    const res = await report(post("/api/security-check/report", { scanId: "x", result: r, signature: signResult(JSON.stringify(r)), ...lead, [field]: value }));
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe(field);
    expect(sendReportEmail).not.toHaveBeenCalled();
  });

  it("accepts real names in any language and ordinary practice names", () => {
    for (const n of ["Zoë Ünal", "Mary-Ann O'Neil", "Dr. José García", "李 小龙"]) expect(checkName(n).ok).toBe(true);
    for (const p of ["Smile Dental", "Lakewood Ranch Family Dentistry, P.A.", "Dr. Lee & Associates (Bradenton)", "32nd Street Dental"]) {
      expect(checkPractice(p).ok).toBe(true);
    }
  });

  it("marks only a lead at the scanned domain as eligible for follow-ups", async () => {
    const store = (await getStore()) as MemoryStore;
    const save = vi.spyOn(store, "saveLead");
    for (const [email, ip] of [["pat@smiledental.com", "198.51.100.40"], ["pat@gmail.com", "198.51.100.41"]] as const) {
      const r = result("smiledental.com", new Date(Date.now() - (email.includes("gmail") ? 1000 : 0)).toISOString());
      await report(post("/api/security-check/report", { scanId: "x", result: r, signature: signResult(JSON.stringify(r)), ...lead, email }, ip));
    }
    expect(save.mock.calls.map((c) => [c[0].email, c[0].followupsOk])).toEqual([
      ["pat@smiledental.com", true],
      ["pat@gmail.com", false],
    ]);
  });
});

describe("2. production fails closed without the database", () => {
  it("scan, report and full return 503 with a friendly message", async () => {
    process.env.VERCEL_ENV = "production";
    const s = await scanRoute(post("/api/security-check/scan", { domain: "smiledental.com", authorized: true }));
    expect(s.status).toBe(503);
    expect(await s.json()).toMatchObject({ unavailable: true, error: expect.stringContaining("(941) 206-4709") });
    const r = result();
    const rep = await report(post("/api/security-check/report", { scanId: "x", result: r, signature: signResult(JSON.stringify(r)), ...lead }));
    expect(rep.status).toBe(503);
    expect(runScan).not.toHaveBeenCalled();
    expect(sendReportEmail).not.toHaveBeenCalled();
  });

  it("stays open in production only when SECURITY_CHECK_ALLOW_MEMORY=1, and always on previews", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.SECURITY_CHECK_ALLOW_MEMORY = "1";
    expect((await scanRoute(post("/api/security-check/scan", { domain: "a-dental.com", authorized: true }))).status).toBe(200);
    process.env.VERCEL_ENV = "preview";
    delete process.env.SECURITY_CHECK_ALLOW_MEMORY;
    expect((await scanRoute(post("/api/security-check/scan", { domain: "b-dental.com", authorized: true }))).status).toBe(200);
  });
});

describe("3. per-IP limits key IPv6 by /64", () => {
  it.each([
    ["203.0.113.7", "203.0.113.7"],
    ["2001:db8:abcd:12:1::5", "2001:db8:abcd:12::/64"],
    ["2001:db8:abcd:12:ffff:ffff:ffff:ffff", "2001:db8:abcd:12::/64"],
    ["::ffff:203.0.113.7", "203.0.113.7"],
  ])("%s -> %s", (ip, key) => expect(ipRateKey(ip)).toBe(key));

  it("addresses in one /64 share the 3-an-hour limit", async () => {
    for (let i = 1; i <= 3; i++) {
      expect((await scanRoute(post("/api/security-check/scan", { domain: `v6-${i}.com`, authorized: true }, `2001:db8:1:2::${i}`))).status).toBe(200);
    }
    expect((await scanRoute(post("/api/security-check/scan", { domain: "v6-4.com", authorized: true }, "2001:db8:1:2:dead:beef::9"))).status).toBe(429);
    expect((await scanRoute(post("/api/security-check/scan", { domain: "v6-5.com", authorized: true }, "2001:db8:1:3::1"))).status).toBe(200);
  });
});

describe("4. unsubscribe is by email address", () => {
  it("suppresses the address, so other and later leads for it stop too", async () => {
    process.env.SECURITY_CHECK_SECRET = "dedicated-secret-for-tests-0123456789";
    const store = await getStore();
    const token = signToken("unsub", { l: "lead-1", e: "Pat@SmileDental.com" }, 3600)!;
    const res = await unsubscribe(post("/api/security-check/unsubscribe", { token }));
    expect(res.status).toBe(200);
    expect(await store.isSuppressed("pat@smiledental.com")).toBe(true);
    // No database here, so it is also sent to the inbox to record by hand.
    expect(sendUnsubscribeNotice).toHaveBeenCalledTimes(1);
  });

  it("postgres: due follow-ups exclude suppressed addresses and unproven leads", async () => {
    const calls: string[] = [];
    const pg = new PostgresStore({ query: async (t: string) => (calls.push(t), []) });
    await pg.dueFollowups();
    expect(calls[0]).toMatch(/l\.followups_ok/);
    expect(calls[0]).toMatch(/NOT EXISTS \(SELECT 1 FROM security_check_suppressions s WHERE s\.email = lower\(l\.email\)\)/);
    await pg.suppress("Pat@SmileDental.com", "test");
    expect(calls[1]).toMatch(/INSERT INTO security_check_suppressions \(email, source\) VALUES \(lower\(\$1\), \$2\)/);
  });

  it("the migration creates the suppression table and the eligibility column", () => {
    const sql = readFileSync("lib/db/migrations/0002_security_check.sql", "utf8");
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS security_check_suppressions/);
    expect(sql).toMatch(/followups_ok\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  });
});

describe("5. unsubscribe links and follow-ups need a dedicated secret", () => {
  it("never signs an unsubscribe token from a borrowed secret", () => {
    expect(signToken("unsub", { l: "x", e: "a@b.com" }, 60)).toBeNull();
    expect(signToken("files", { h: "a.com" }, 60)).not.toBeNull();
    process.env.SECURITY_CHECK_SECRET = "dedicated-secret-for-tests-0123456789";
    const t = signToken("unsub", { l: "x", e: "a@b.com" }, 60);
    expect(verifyToken("unsub", t)).toMatchObject({ l: "x" });
    delete process.env.SECURITY_CHECK_SECRET;
    expect(verifyToken("unsub", t)).toBeNull();
  });

  it("keeps follow-ups off without it, even with the switch and the address set", () => {
    process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED = "true";
    process.env.SECURITY_CHECK_POSTAL_ADDRESS = "PO Box 0000, Test, FL 00000";
    expect(followupConfig()).toMatchObject({ enabled: false, reason: "SECURITY_CHECK_SECRET is not set" });
    process.env.SECURITY_CHECK_SECRET = "dedicated-secret-for-tests-0123456789";
    expect(followupConfig().enabled).toBe(true);
    delete process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED;
    delete process.env.SECURITY_CHECK_POSTAL_ADDRESS;
  });
});

describe("9. the cron compares its secret in constant time", () => {
  it("uses safeEqual and refuses a wrong or missing secret", async () => {
    const src = readFileSync("app/api/cron/security-check-followups/route.ts", "utf8");
    expect(src).toMatch(/safeEqual\(req\.headers\.get\("authorization"\)/);
    expect(safeEqual("Bearer abc", "Bearer abc")).toBe(true);
    expect(safeEqual("Bearer abc", "Bearer abd")).toBe(false);
    expect(safeEqual("Bearer ab", "Bearer abc")).toBe(false);
    process.env.CRON_SECRET = "cron-secret-for-tests";
    const { GET } = await import("@/app/api/cron/security-check-followups/route");
    expect((await GET(new Request("http://localhost/api/cron/security-check-followups"))).status).toBe(401);
    expect((await GET(new Request("http://localhost/x", { headers: { authorization: "Bearer nope" } }))).status).toBe(401);
    expect((await GET(new Request("http://localhost/x", { headers: { authorization: "Bearer cron-secret-for-tests" } }))).status).toBe(200);
  });
});

describe("10 and cache: config files", () => {
  it("every workflow this branch touches has a read-only token and no vars in shell", () => {
    for (const f of ["rose-gates", "rose-fast-index", "indexnow"]) {
      const y = readFileSync(`.github/workflows/${f}.yml`, "utf8");
      expect(y).toMatch(/^permissions:\n  contents: read$/m);
      for (const line of y.split("\n").filter((l) => /run:|python3|node /.test(l))) {
        expect({ f, line, interpolated: /\$\{\{\s*vars\./.test(line) }).toMatchObject({ interpolated: false });
      }
    }
  });

  it("token pages are never publicly cached", () => {
    const v = JSON.parse(readFileSync("vercel.json", "utf8")) as { headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };
    const pub = v.headers.find((h) => h.headers.some((x) => x.value.startsWith("public")))!;
    const rx = new RegExp(`^${pub.source}$`);
    expect(rx.test("/free-security-check/full")).toBe(false);
    expect(rx.test("/free-security-check/unsubscribe")).toBe(false);
    expect(rx.test("/free-security-check")).toBe(true);
    const priv = v.headers.find((h) => h.source === "/free-security-check/(full|unsubscribe)")!;
    expect(priv.headers).toEqual([{ key: "Cache-Control", value: "private, no-store" }]);
  });
});
