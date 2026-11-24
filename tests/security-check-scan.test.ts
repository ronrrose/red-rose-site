import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { runScan } from "@/lib/security-check/scan";
import { isBlockedAddress } from "@/lib/security-check/ip";
import type { NetDeps } from "@/lib/security-check/safe-fetch";
import { buildReportPdf, toWinAnsi } from "@/lib/security-check/pdf";
import { signResult, signToken, verifyResult, verifyToken } from "@/lib/security-check/tokens";
import { followupConfig, followupEmail, reportEmail } from "@/lib/security-check/emails";

/**
 * End to end through the real scanner, against a local fake practice site,
 * to prove the "no active probing" acceptance test from the brief: the only
 * HTTP traffic is GET of the homepage (and its redirects) and, when
 * unlocked, HEAD of the three listed paths.
 */

const seen: Array<{ method: string; url: string }> = [];
let server: http.Server;
let port = 0;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    seen.push({ method: req.method ?? "", url: req.url ?? "" });
    if (req.url === "/.env") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end();
    }
    if (req.url !== "/") {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<p>not found</p>");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      '<html><head><meta name="generator" content="WordPress 5.8.1"></head><body>' +
        '<form action="http://forms.example-vendor.com/send"><input name="n"></form>' +
        '<a href="/about">About</a><a href="/contact">Contact</a></body></html>'
    );
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  port = (server.address() as AddressInfo).port;
});
afterAll(() => {
  server.closeAllConnections?.();
  server.close();
});

const deps = (): NetDeps => ({
  resolve: async (h) => (h === "weak-practice.com" ? [{ address: "127.0.0.1", family: 4 }] : []),
  isBlocked: (a) => (a === "127.0.0.1" ? false : isBlockedAddress(a)),
  // HTTP goes to the fake site; HTTPS goes to a closed port, so it is "unreachable".
  portFor: (p) => (p === "http:" ? port : 1),
});
const noDns = async () => {
  const e = new Error("none") as NodeJS.ErrnoException;
  e.code = "ENOTFOUND";
  throw e;
};

describe("scan of a known-weak site", () => {
  it("returns the right status for every check, and only GETs the homepage", async () => {
    seen.length = 0;
    const r = await runScan("weak-practice.com", { deps: deps(), txtLookup: noDns, budgetMs: 8000 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const status = Object.fromEntries(r.result.checks.map((c) => [c.id, c.status]));
    expect(status).toEqual({ https: "fail", headers: "fail", email: "fail", cms: "fail", files: "skipped", forms: "fail" });
    expect(r.result.grade).toBe("F");
    expect(r.result.findings.length).toBe(5);
    expect(seen).toEqual([{ method: "GET", url: "/" }]);
    expect(r.result.requests.filter((q) => q.method !== "DNS").every((q) => q.method === "GET")).toBe(true);
  });

  it("with the check unlocked, adds exactly three HEAD requests to the listed paths", async () => {
    seen.length = 0;
    const r = await runScan("weak-practice.com", { deps: deps(), txtLookup: noDns, includeExposedFiles: true, budgetMs: 8000 });
    expect(r.ok && r.result.checks.find((c) => c.id === "files")?.status).toBe("fail");
    expect(seen).toEqual([
      { method: "GET", url: "/" },
      { method: "HEAD", url: "/.git/HEAD" },
      { method: "HEAD", url: "/.env" },
      { method: "HEAD", url: "/wp-config.php.bak" },
    ]);
  });

  it("refuses a domain that resolves privately, with no request made", async () => {
    seen.length = 0;
    const r = await runScan("weak-practice.com", {
      deps: { ...deps(), isBlocked: isBlockedAddress },
      txtLookup: noDns,
    });
    expect(r).toMatchObject({ ok: false, reason: "refused" });
    expect(seen).toEqual([]);
  });
});

describe("tokens", () => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-sixteen-chars";
  it("round-trips and rejects tampering, the wrong purpose and expiry", () => {
    const t = signToken("files", { h: "smile.com", e: "dr@smile.com" }, 60)!;
    expect(verifyToken("files", t)).toMatchObject({ h: "smile.com" });
    expect(verifyToken("unsub", t)).toBeNull();
    expect(verifyToken("files", t.replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBeNull();
    expect(verifyToken("files", t, Date.now() + 61_000)).toBeNull();
    const body = JSON.stringify({ a: 1 });
    expect(verifyResult(body, signResult(body))).toBe(true);
    expect(verifyResult(JSON.stringify({ a: 2 }), signResult(body))).toBe(false);
  });
});

describe("report PDF and emails", () => {
  it("builds a PDF in-house, even with characters Helvetica lacks", async () => {
    const r = await runScan("weak-practice.com", { deps: deps(), txtLookup: noDns, budgetMs: 8000 });
    if (!r.ok) throw new Error("scan failed");
    const pdf = await buildReportPdf({ scan: r.result, practice: "Zoë’s Dental 🦷", preparedFor: "Dr. Ünal", quiz: { free_ai: "yes", patient_data_in_ai: "no" } });
    expect(Buffer.from(pdf.slice(0, 5)).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(3000);
    expect(toWinAnsi("a—b “q” 🦷")).toBe('a-b "q" ');
  });

  it("escapes visitor text in emails and carries the disclaimer", async () => {
    const r = await runScan("weak-practice.com", { deps: deps(), txtLookup: noDns, budgetMs: 8000 });
    if (!r.ok) throw new Error("scan failed");
    const e = reportEmail({ to: "a@b.com", name: "<img src=x>", practice: "<b>x</b>", scan: r.result, pdf: new Uint8Array(), unlockUrl: null, followupsPlanned: false });
    expect(e.html).not.toContain("<img");
    expect(e.html).not.toContain("<b>x</b>");
    expect(e.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(e.html).toContain("This free check covers public signals only.");
  });

  it("keeps follow-ups off until both the switch and a postal address are set", () => {
    delete process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED;
    delete process.env.SECURITY_CHECK_POSTAL_ADDRESS;
    expect(followupConfig().enabled).toBe(false);
    process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED = "true";
    expect(followupConfig().enabled).toBe(false);
    process.env.SECURITY_CHECK_POSTAL_ADDRESS = "PO Box 0000, Test, FL 00000";
    expect(followupConfig().enabled).toBe(true);
    delete process.env.SECURITY_CHECK_FOLLOWUPS_ENABLED;
    delete process.env.SECURITY_CHECK_POSTAL_ADDRESS;
  });

  it("puts the postal address, unsubscribe link and ad identification in every marketing email", () => {
    for (const day of [3, 7] as const) {
      const e = followupEmail({ day, to: "a@b.com", name: "Pat", scan: null, postalAddress: "PO Box 0000, Test, FL 00000", unsubscribeUrl: "https://x/u?t=1", oneClickUrl: "https://x/api?t=1" });
      expect(e.html).toContain("PO Box 0000, Test, FL 00000");
      expect(e.html).toContain("https://x/u?t=1");
      expect(e.html).toContain("This is a marketing email");
      expect(e.text).toContain("Unsubscribe: https://x/u?t=1");
    }
  });
});
