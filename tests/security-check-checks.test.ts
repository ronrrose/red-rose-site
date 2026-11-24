import { describe, expect, it } from "vitest";
import {
  checkCms,
  checkEmail,
  checkFiles,
  checkForms,
  checkHeaders,
  checkHttps,
  detectCms,
  isFileExposed,
} from "@/lib/security-check/checks";
import { gradeFor, scoreChecks, strengths, topFindings } from "@/lib/security-check/scoring";
import { emailMatchesDomain } from "@/lib/security-check/target";
import { WORDPRESS_CORE } from "@/lib/security-check/outdated-versions";

const NOW = new Date("2026-11-24T12:00:00Z");
const GOOD_HEADERS = {
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  "content-security-policy": "default-src 'self'; frame-ancestors 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
};

describe("check 1: HTTPS", () => {
  it("passes a valid certificate with HTTP redirected", () => {
    const r = checkHttps({ https: { ok: true, tlsValidTo: "Feb 11 00:00:00 2027 GMT" }, http: { ok: true, finalProtocol: "https:", finalStatus: 308 }, now: NOW });
    expect(r.status).toBe("pass");
    expect(r.summary).toMatch(/78 days/);
  });
  it("warns when the certificate expires within 14 days", () => {
    const r = checkHttps({ https: { ok: true, tlsValidTo: "Dec 01 00:00:00 2026 GMT" }, http: { ok: true, finalProtocol: "https:", finalStatus: 301 }, now: NOW });
    expect(r.status).toBe("warn");
    expect(r.findings[0].id).toBe("https_cert_expiring");
  });
  it("fails an expired certificate", () => {
    const r = checkHttps({ https: { ok: false, error: "CERT_HAS_EXPIRED", certError: true }, http: { ok: true, finalProtocol: "https:", finalStatus: 301 }, now: NOW });
    expect(r.status).toBe("fail");
    expect(r.findings[0]).toMatchObject({ id: "https_cert_invalid", detail: "the certificate has expired" });
  });
  it("fails a site with no HTTPS at all", () => {
    const r = checkHttps({ https: { ok: false, error: "ECONNREFUSED", certError: false }, http: { ok: true, finalProtocol: "http:", finalStatus: 200 }, now: NOW });
    expect(r.status).toBe("fail");
    expect(r.findings.map((f) => f.id)).toEqual(["https_unreachable", "http_no_redirect"]);
  });
  it("fails plain HTTP that is not redirected", () => {
    const r = checkHttps({ https: { ok: true, tlsValidTo: "Feb 11 00:00:00 2027 GMT" }, http: { ok: true, finalProtocol: "http:", finalStatus: 200 }, now: NOW });
    expect(r.status).toBe("fail");
    expect(r.findings[0].id).toBe("http_no_redirect");
  });
  it("does not score a timeout as insecure", () => {
    const r = checkHttps({ https: { ok: false, error: "TIMEOUT", certError: false }, http: { ok: false }, now: NOW });
    expect(r.status).toBe("error");
  });
});

describe("check 2: security headers", () => {
  it("passes all five", () => expect(checkHeaders(GOOD_HEADERS).status).toBe("pass"));
  it("accepts CSP frame-ancestors in place of X-Frame-Options", () => {
    const { ["x-frame-options"]: _x, ...h } = GOOD_HEADERS;
    expect(checkHeaders(h).status).toBe("pass");
  });
  it("warns with one or two missing", () => {
    const r = checkHeaders({ ...GOOD_HEADERS, "referrer-policy": undefined });
    expect(r.status).toBe("warn");
    expect(r.findings[0].detail).toBe("Referrer-Policy");
  });
  it("warns on a short HSTS and a report-only CSP", () => {
    const r = checkHeaders({ ...GOOD_HEADERS, "strict-transport-security": "max-age=300", "content-security-policy": undefined, "content-security-policy-report-only": "default-src 'self'", "x-frame-options": "DENY" });
    expect(r.status).toBe("warn");
  });
  it("fails with three or more missing", () => expect(checkHeaders({}).status).toBe("fail"));
  it("ignores HSTS sent over plain HTTP", () => {
    const r = checkHeaders(GOOD_HEADERS, "http:");
    expect(r.details).toContain("HSTS: missing");
  });
  it("is skipped with no page", () => expect(checkHeaders(null).status).toBe("skipped"));
});

describe("check 3: email spoofing protection", () => {
  const good = { spf: ["v=spf1 include:_spf.google.com -all"], dmarc: ["v=DMARC1; p=reject; rua=mailto:x@y.com"], dkimSelectors: ["google"] };
  it("passes SPF, DMARC reject and DKIM", () => expect(checkEmail(good).status).toBe("pass"));
  it("passes ~all and quarantine", () => expect(checkEmail({ ...good, spf: ["v=spf1 include:x ~all"], dmarc: ["v=DMARC1; p=quarantine"] }).status).toBe("pass"));
  it("fails missing SPF", () => expect(checkEmail({ ...good, spf: [] }).findings[0].id).toBe("spf_missing"));
  it("fails two SPF records", () => expect(checkEmail({ ...good, spf: ["v=spf1 -all", "v=spf1 ~all"] }).findings[0].id).toBe("spf_multiple"));
  it("fails +all", () => expect(checkEmail({ ...good, spf: ["v=spf1 +all"] }).status).toBe("fail"));
  it("warns ?all", () => expect(checkEmail({ ...good, spf: ["v=spf1 ?all"] }).status).toBe("warn"));
  it("fails missing DMARC", () => expect(checkEmail({ ...good, dmarc: [] }).findings[0].id).toBe("dmarc_missing"));
  it("warns DMARC p=none", () => {
    const r = checkEmail({ ...good, dmarc: ["v=DMARC1; p=none"] });
    expect(r.status).toBe("warn");
    expect(r.findings[0].id).toBe("dmarc_none");
  });
  it("warns DMARC pct below 100", () => expect(checkEmail({ ...good, dmarc: ["v=DMARC1; p=reject; pct=25"] }).findings[0].id).toBe("dmarc_partial"));
  it("warns when no DKIM key is found", () => expect(checkEmail({ ...good, dkimSelectors: [] }).findings[0].id).toBe("dkim_not_found"));
  it("reports an error, not a fail, when DNS itself fails", () => expect(checkEmail({ spf: [], dmarc: [], dkimSelectors: [], dnsFailed: true }).status).toBe("error"));
});

describe("check 4: CMS and versions", () => {
  const wp = (v: string, extra = "") => `<html><head><meta name="generator" content="WordPress ${v}" /><link href="/wp-includes/css/x.css?ver=${v}">${extra}</head></html>`;
  it("passes the current WordPress release", () => {
    expect(checkCms(wp(WORDPRESS_CORE.latest!)).status).toBe("pass");
  });
  it("fails a release WordPress lists as insecure", () => {
    const r = checkCms(wp("5.8.1"));
    expect(r.status).toBe("fail");
    expect(r.findings[0]).toMatchObject({ id: "cms_core_insecure", detail: "WordPress 5.8.1" });
  });
  it("warns a supported but older release", () => {
    expect(checkCms(wp("6.9.12")).findings[0].id).toBe("cms_core_outdated");
  });
  it("reads the core version from asset URLs when the generator tag is removed", () => {
    const f = detectCms('<script src="/wp-includes/js/jquery/jquery.min.js?ver=6.2.1"></script><link href="/wp-includes/a.css?ver=6.2.1">');
    expect(f).toMatchObject({ cms: "WordPress", version: "6.2.1", versionSource: "asset" });
  });
  it("warns an outdated plugin from its asset URL", () => {
    const r = checkCms(wp(WORDPRESS_CORE.latest!, '<script src="/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=3.1.0"></script>'));
    expect(r.findings[0]).toMatchObject({ id: "plugin_outdated", detail: "elementor 3.1.0" });
  });
  it("fails end-of-life Drupal 7", () => {
    const r = checkCms('<meta name="Generator" content="Drupal 7 (https://www.drupal.org)">');
    expect(r.findings[0].id).toBe("cms_eol");
  });
  it("passes hosted builders", () => {
    expect(checkCms('<meta name="generator" content="Wix.com Website Builder">').status).toBe("pass");
  });
  it("passes a plain site", () => expect(checkCms("<html><body>Hello</body></html>").status).toBe("pass"));
  it("never echoes page text: a hostile generator tag yields no finding text", () => {
    const r = checkCms('<meta name="generator" content="<script>alert(1)</script>">');
    expect(JSON.stringify(r)).not.toContain("script");
  });
});

describe("check 5: exposed files", () => {
  it("found means 200 and not an HTML page", () => {
    expect(isFileExposed({ path: "/.env", status: 200, contentType: "text/plain" })).toBe(true);
    expect(isFileExposed({ path: "/.env", status: 200, contentType: "text/html; charset=utf-8" })).toBe(false);
    expect(isFileExposed({ path: "/.env", status: 403, contentType: "text/plain" })).toBe(false);
    expect(isFileExposed({ path: "/.env", status: null, contentType: null })).toBe(false);
  });
  it("fails each exposed file separately", () => {
    const r = checkFiles([
      { path: "/.git/HEAD", status: 200, contentType: "application/octet-stream" },
      { path: "/.env", status: 404, contentType: "text/html" },
      { path: "/wp-config.php.bak", status: 200, contentType: "application/x-trash" },
    ]);
    expect(r.status).toBe("fail");
    expect(r.findings.map((f) => f.id)).toEqual(["exposed_git", "exposed_wpconfig_backup"]);
  });
  it("is skipped with the exact message when not unlocked", () => {
    const r = checkFiles(null);
    expect(r.status).toBe("skipped");
    expect(r.summary).toBe("Run the full check from an email address at this domain.");
  });
});

describe("check 6: forms over HTTP", () => {
  it("passes HTTPS forms", () => expect(checkForms('<form action="https://x.com/book"></form>', "https:").status).toBe("pass"));
  it("fails a form action over http", () => {
    const r = checkForms('<form method="post" action="http://booking.example-vendor.com/submit">', "https:");
    expect(r.findings[0]).toMatchObject({ id: "form_http_action", detail: "booking.example-vendor.com" });
  });
  it("fails an http booking iframe", () => expect(checkForms('<iframe src="http://widget.vendor.com/x"></iframe>', "https:").status).toBe("fail"));
  it("fails any form on a page served over http", () => expect(checkForms("<form><input></form>", "http:").findings[0].id).toBe("form_on_http_page"));
  it("warns http booking links", () => expect(checkForms('<a href="http://vendor.com/book-appointment">Book</a>', "https:").findings[0].id).toBe("booking_link_http"));
  it("ignores unrelated http links", () => expect(checkForms('<a href="http://news.com/story">x</a>', "https:").status).toBe("pass"));
});

describe("scoring", () => {
  const pass = checkHeaders(GOOD_HEADERS);
  const fail = checkHeaders({});
  it("weights pass 1, warn half, fail 0, and skips skipped", () => {
    expect(scoreChecks([pass])).toBe(100);
    expect(scoreChecks([fail])).toBe(0);
    expect(scoreChecks([pass, checkFiles(null)])).toBe(100);
  });
  it("grades on 90/80/70/60", () => {
    expect([95, 85, 75, 65, 10].map(gradeFor)).toEqual(["A", "B", "C", "D", "F"]);
  });
  it("lists fails before warns and caps at five", () => {
    const checks = [checkEmail({ spf: [], dmarc: ["v=DMARC1; p=none"], dkimSelectors: [] }), fail, checkHttps({ https: { ok: false, error: "ECONNREFUSED", certError: false }, http: { ok: true, finalProtocol: "http:", finalStatus: 200 }, now: NOW }), checkForms("<form>", "http:")];
    const f = topFindings(checks);
    expect(f.length).toBe(5);
    const firstWarn = f.findIndex((x) => x.severity === "warn");
    expect(firstWarn === -1 || f.slice(firstWarn).every((x) => x.severity === "warn")).toBe(true);
    expect(f.every((x) => x.why && x.fix && x.title)).toBe(true);
  });
  it("tops up to three items with strengths", () => {
    expect(strengths([pass, checkEmail({ spf: ["v=spf1 -all"], dmarc: ["v=DMARC1; p=reject"], dkimSelectors: ["s1"] })], 0).length).toBe(2);
    expect(strengths([pass], 3)).toEqual([]);
  });
});

describe("check 5 unlock: email must be at the scanned domain", () => {
  it.each([
    ["dr@smiledental.com", "smiledental.com", true],
    ["dr@smiledental.com", "www.smiledental.com", true],
    ["dr@smiledental.com", "portal.smiledental.com", false],
    ["student@bigstate.edu", "clinic.bigstate.edu", false],
    ["Dr@SmileDental.com", "smiledental.com", true],
    ["dr@mail.smiledental.com", "smiledental.com", false],
    ["dr@gmail.com", "gmail.com", false],
    ["dr@gmail.com", "sites.gmail.com", false],
    ["dr@other.com", "smiledental.com", false],
    ["dr@smiledental.com.evil.com", "smiledental.com", false],
    ["not-an-email", "smiledental.com", false],
  ])("%s for %s is %s", (email, host, expected) => {
    expect(emailMatchesDomain(email, host)).toBe(expected);
  });
});
