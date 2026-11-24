import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Route-level tests for the authorization checkbox, the authorization
 * record and the rate limits. The scanner itself is replaced with a stub so
 * nothing here touches the network; the store is the in-memory one (no
 * DATABASE_URL), whose limits are exactly what the Postgres one enforces.
 */

const runScan = vi.fn();
vi.mock("@/lib/security-check/scan", () => ({
  runScan: (...a: unknown[]) => runScan(...a),
}));
const sendScanRecord = vi.fn(async () => undefined);
vi.mock("@/lib/security-check/emails", async (orig) => ({
  ...(await orig<typeof import("@/lib/security-check/emails")>()),
  sendScanRecord: (...a: unknown[]) => sendScanRecord(...(a as [])),
}));

import { POST as scan } from "@/app/api/security-check/scan/route";
import { getStore, resetStoreCache, MemoryStore, PostgresStore } from "@/lib/security-check/store";
import { AUTHORIZATION_TEXT, AUTHORIZATION_VERSION } from "@/lib/security-check/types";

function fakeResult(host: string) {
  return {
    version: 1, host, domain: host.replace(/^www\./, ""), scannedAt: new Date().toISOString(), score: 80, grade: "B",
    checks: [], findings: [], strengths: [], requests: [], pageUrl: `https://${host}/`,
  };
}

function req(body: unknown, ip = "203.0.113.10", headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/security-check/scan", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, host: "localhost", "user-agent": "vitest", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.DATABASE_URL;
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-sixteen-chars";
  resetStoreCache();
  runScan.mockReset();
  runScan.mockImplementation(async (h: string) => ({ ok: true, result: fakeResult(h) }));
  sendScanRecord.mockClear();
});

describe("authorization checkbox", () => {
  it("is required: missing, false or a truthy non-boolean is refused and nothing is scanned", async () => {
    for (const authorized of [undefined, false, "true", 1]) {
      const res = await scan(req({ domain: "smiledental.com", authorized }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/Tick the box/);
    }
    expect(runScan).not.toHaveBeenCalled();
  });

  it("stores the record with timestamp, IP, domain and the exact wording", async () => {
    const before = Date.now();
    const res = await scan(req({ domain: "https://www.SmileDental.com/", authorized: true }, "198.51.100.23"));
    expect(res.status).toBe(200);
    const { scanId } = await res.json();
    const stored = await (await getStore()).getScan(scanId);
    expect(stored).toMatchObject({
      host: "www.smiledental.com",
      domain: "smiledental.com",
      ip: "198.51.100.23",
      userAgent: "vitest",
      authorizationText: AUTHORIZATION_TEXT,
      authorizationVersion: AUTHORIZATION_VERSION,
    });
    expect(stored!.authorizedAt.getTime()).toBeGreaterThanOrEqual(before);
    // No database: the record is also emailed so it is not lost.
    expect(sendScanRecord).toHaveBeenCalledTimes(1);
  });

  it("rejects a cross-site POST", async () => {
    const res = await scan(req({ domain: "smiledental.com", authorized: true }, "203.0.113.50", { origin: "https://evil.example.net" }));
    expect(res.status).toBe(403);
  });

  it("rejects a filled honeypot", async () => {
    const res = await scan(req({ domain: "smiledental.com", authorized: true, website: "spam" }));
    expect(res.status).toBe(400);
    expect(runScan).not.toHaveBeenCalled();
  });
});

describe("rate limits", () => {
  it("allows 3 scans per IP per hour and refuses the 4th with Retry-After", async () => {
    const ip = "203.0.113.77";
    for (const d of ["a-dental.com", "b-dental.com", "c-dental.com"]) {
      expect((await scan(req({ domain: d, authorized: true }, ip))).status).toBe(200);
    }
    const fourth = await scan(req({ domain: "d-dental.com", authorized: true }, ip));
    expect(fourth.status).toBe(429);
    expect(Number(fourth.headers.get("retry-after"))).toBeGreaterThan(3500);
    expect((await fourth.json()).error).toMatch(/3 checks an hour/);
    expect(runScan).toHaveBeenCalledTimes(3);
    // A different IP is unaffected.
    expect((await scan(req({ domain: "d-dental.com", authorized: true }, "203.0.113.78"))).status).toBe(200);
  });

  it("scans each domain once per 24 hours: same IP sees the stored result, others are told to wait", async () => {
    const first = await scan(req({ domain: "smile.com", authorized: true }, "192.0.2.1"));
    expect(first.status).toBe(200);
    const again = await scan(req({ domain: "www.smile.com", authorized: true }, "192.0.2.1"));
    expect(again.status).toBe(200);
    expect(await again.json()).toMatchObject({ cached: true });
    const stranger = await scan(req({ domain: "smile.com", authorized: true }, "192.0.2.2"));
    expect(stranger.status).toBe(429);
    expect(runScan).toHaveBeenCalledTimes(1);
  });

  it("does not use up a domain's daily check on a name that was refused", async () => {
    runScan.mockImplementationOnce(async () => ({ ok: false, reason: "refused", message: "private" }));
    expect((await scan(req({ domain: "rebind-test.com", authorized: true }, "192.0.2.9"))).status).toBe(422);
    expect((await scan(req({ domain: "rebind-test.com", authorized: true }, "192.0.2.9"))).status).toBe(200);
  });

  it("refuses an invalid address before any limit or scan", async () => {
    const res = await scan(req({ domain: "http://169.254.169.254/latest", authorized: true }, "192.0.2.30"));
    expect(res.status).toBe(400);
    expect(runScan).not.toHaveBeenCalled();
  });
});

describe("store semantics", () => {
  it("memory: the window slides", async () => {
    const s = new MemoryStore();
    const t0 = new Date("2026-11-24T10:00:00Z");
    for (let i = 0; i < 3; i++) expect((await s.takeSlot("b", "k", 3, 3600_000, t0)).allowed).toBe(true);
    expect((await s.takeSlot("b", "k", 3, 3600_000, t0)).allowed).toBe(false);
    expect((await s.takeSlot("b", "k", 3, 3600_000, new Date(t0.getTime() + 3600_001))).allowed).toBe(true);
    expect(await s.claimDomain("x.com", "scan", 86_400_000, t0)).toBe(true);
    expect(await s.claimDomain("x.com", "scan", 86_400_000, new Date(t0.getTime() + 86_399_000))).toBe(false);
    expect(await s.claimDomain("x.com", "scan", 86_400_000, new Date(t0.getTime() + 86_400_001))).toBe(true);
  });

  it("postgres: counts after inserting, and claims the domain with one conditional upsert", async () => {
    const calls: Array<{ text: string; params: unknown[] }> = [];
    let rowsForSelect: unknown[] = [];
    let upsertReturns: unknown[] = [];
    const sql = {
      query: async (text: string, params: unknown[] = []) => {
        calls.push({ text, params });
        if (text.startsWith("SELECT created_at")) return rowsForSelect;
        if (text.includes("security_check_domain_slots") && text.startsWith("INSERT")) return upsertReturns;
        return [];
      },
    };
    const pg = new PostgresStore(sql);
    const now = new Date("2026-11-24T10:00:00Z");
    rowsForSelect = [1, 2, 3].map((i) => ({ created_at: new Date(now.getTime() - i * 1000).toISOString() }));
    expect((await pg.takeSlot("scan-ip", "1.2.3.4", 3, 3600_000, now)).allowed).toBe(true);
    expect(calls[0].text).toMatch(/^INSERT INTO security_check_attempts/);
    rowsForSelect = [1, 2, 3, 4].map((i) => ({ created_at: new Date(now.getTime() - i * 1000).toISOString() }));
    expect((await pg.takeSlot("scan-ip", "1.2.3.4", 3, 3600_000, now)).allowed).toBe(false);

    upsertReturns = [{ domain: "x.com" }];
    expect(await pg.claimDomain("x.com", "scan", 86_400_000, now)).toBe(true);
    upsertReturns = [];
    expect(await pg.claimDomain("x.com", "scan", 86_400_000, now)).toBe(false);
    const upsert = calls.find((c) => c.text.includes("ON CONFLICT"))!;
    expect(upsert.text).toMatch(/WHERE security_check_domain_slots\.claimed_at <= \$4/);
    expect(upsert.params[3]).toBe(new Date(now.getTime() - 86_400_000).toISOString());
  });
});
