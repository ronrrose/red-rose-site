import {
  CHECK_LABELS,
  CHECK_WEIGHTS,
  FILES_SKIPPED_MESSAGE,
  type CheckId,
  type CheckResult,
  type CheckStatus,
  type FindingRef,
} from "@/lib/security-check/types";
import {
  END_OF_LIFE,
  PLUGIN_LATEST,
  WORDPRESS_CORE,
  compareVersions,
  wordpressCoreStatus,
} from "@/lib/security-check/outdated-versions";

/**
 * The six checks, as pure functions over evidence the scanner gathered.
 *
 * Nothing here touches the network, so every pass, warn and fail rule can be
 * tested with fixed inputs. Strings that reach the visitor come only from
 * fixed text, numbers, version strings and hostnames matched by strict
 * patterns: fetched HTML is read, never echoed.
 */

type Headers = Record<string, string | string[] | undefined>;

function worst(findings: FindingRef[]): CheckStatus {
  if (findings.some((f) => f.severity === "fail")) return "fail";
  if (findings.some((f) => f.severity === "warn")) return "warn";
  return "pass";
}

function result(id: CheckId, status: CheckStatus, summary: string, details: string[], findings: FindingRef[]): CheckResult {
  return { id, label: CHECK_LABELS[id], status, weight: CHECK_WEIGHTS[id], summary, details, findings };
}

function header(h: Headers, name: string): string {
  const v = h[name.toLowerCase()];
  return (Array.isArray(v) ? v.join(", ") : v ?? "").trim();
}

const SAFE_HOST = /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/;

/** A hostname from fetched content, only if it is plainly a hostname. */
function safeHost(raw: string): string | null {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return SAFE_HOST.test(host) ? host : null;
  } catch {
    return null;
  }
}

/* ── 1. HTTPS ───────────────────────────────────────────────────────────── */

export type HttpsEvidence = {
  https:
    | { ok: true; tlsValidTo: string | null }
    | { ok: false; error: string; certError: boolean };
  /** Outcome of requesting http://host/ and following up to 3 redirects. */
  http:
    | { ok: true; finalProtocol: "http:" | "https:"; finalStatus: number }
    | { ok: false };
  now: Date;
};

const CERT_ERROR_TEXT: Record<string, string> = {
  CERT_HAS_EXPIRED: "the certificate has expired",
  CERT_NOT_YET_VALID: "the certificate is not valid yet",
  DEPTH_ZERO_SELF_SIGNED_CERT: "the certificate is self-signed",
  SELF_SIGNED_CERT_IN_CHAIN: "the certificate chain includes a self-signed certificate",
  ERR_TLS_CERT_ALTNAME_INVALID: "the certificate is for a different website name",
  HOSTNAME_MISMATCH: "the certificate is for a different website name",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "the certificate is not from a trusted authority",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "the certificate is not from a trusted authority",
  UNABLE_TO_GET_ISSUER_CERT: "the certificate is not from a trusted authority",
  CERT_UNTRUSTED: "the certificate is not trusted",
  CERT_REVOKED: "the certificate has been revoked",
  CERT_SIGNATURE_FAILURE: "the certificate signature does not check out",
};

export const EXPIRY_WARN_DAYS = 14;

export function daysUntil(validTo: string, now: Date): number | null {
  const t = Date.parse(validTo);
  if (Number.isNaN(t)) return null;
  return Math.floor((t - now.getTime()) / 86_400_000);
}

export function checkHttps(ev: HttpsEvidence): CheckResult {
  const findings: FindingRef[] = [];
  const details: string[] = [];
  let summary: string;

  if (!ev.https.ok && !ev.https.certError && ev.https.error === "TIMEOUT") {
    // Slow is not the same as insecure. Leave it out of the score.
    return result("https", "error", "The site took too long to answer, so we could not check HTTPS. Try again later.", [], []);
  }

  if (!ev.https.ok) {
    if (ev.https.certError) {
      const why = CERT_ERROR_TEXT[ev.https.error] ?? "browsers will not trust the certificate";
      findings.push({ id: "https_cert_invalid", severity: "fail", detail: why });
      summary = `HTTPS is set up, but ${why}.`;
    } else {
      findings.push({ id: "https_unreachable", severity: "fail" });
      summary = "The site did not answer over HTTPS.";
    }
  } else {
    const days = ev.https.tlsValidTo ? daysUntil(ev.https.tlsValidTo, ev.now) : null;
    if (days !== null && days < 0) {
      findings.push({ id: "https_cert_invalid", severity: "fail", detail: "the certificate has expired" });
      summary = "The certificate has expired.";
    } else if (days !== null && days < EXPIRY_WARN_DAYS) {
      findings.push({ id: "https_cert_expiring", severity: "warn", detail: `${days} days left` });
      summary = `Valid certificate, but it expires in ${days} days.`;
    } else {
      summary = days !== null ? `Valid certificate, ${days} days until it expires.` : "Valid certificate.";
    }
    if (days !== null) details.push(`Certificate expires in ${days} days`);
  }

  if (ev.http.ok) {
    if (ev.http.finalProtocol === "https:") {
      details.push("Plain HTTP visits are sent to HTTPS");
    } else if (ev.http.finalStatus >= 200 && ev.http.finalStatus < 400) {
      findings.push({ id: "http_no_redirect", severity: "fail" });
      details.push("Plain HTTP visits are served without moving to HTTPS");
      if (ev.https.ok && findings.length === 1) summary = "Valid certificate, but plain HTTP visits are not sent to HTTPS.";
    }
  } else {
    details.push("The site does not answer over plain HTTP, which is fine");
  }

  return result("https", worst(findings), summary, details, findings);
}

/* ── 2. Security headers ────────────────────────────────────────────────── */

export const HSTS_MIN_SECONDS = 15_552_000; // 180 days

export function checkHeaders(h: Headers | null, protocol: "http:" | "https:" | null = "https:"): CheckResult {
  if (!h) {
    return result("headers", "skipped", "Could not be checked because the homepage did not load.", [], []);
  }
  // Browsers ignore HSTS sent over plain HTTP, so a page served that way has none.
  if (protocol === "http:") h = { ...h, "strict-transport-security": undefined };
  const missing: string[] = [];
  const weak: string[] = [];
  const present: string[] = [];

  const hsts = header(h, "strict-transport-security");
  const maxAge = /max-age\s*=\s*"?(\d+)/i.exec(hsts);
  if (!hsts || !maxAge) missing.push("HSTS");
  else if (Number(maxAge[1]) < HSTS_MIN_SECONDS) weak.push("HSTS (short max-age)");
  else present.push("HSTS");

  const csp = header(h, "content-security-policy");
  const cspRo = header(h, "content-security-policy-report-only");
  if (csp) present.push("Content-Security-Policy");
  else if (cspRo) weak.push("Content-Security-Policy (report-only)");
  else missing.push("Content-Security-Policy");

  const xfo = header(h, "x-frame-options").toUpperCase();
  if (xfo === "DENY" || xfo === "SAMEORIGIN" || /frame-ancestors/i.test(csp)) present.push("X-Frame-Options");
  else missing.push("X-Frame-Options");

  if (header(h, "x-content-type-options").toLowerCase() === "nosniff") present.push("X-Content-Type-Options");
  else missing.push("X-Content-Type-Options");

  const rp = header(h, "referrer-policy").toLowerCase();
  if (rp && !rp.split(",").map((s) => s.trim()).includes("unsafe-url")) present.push("Referrer-Policy");
  else missing.push("Referrer-Policy");

  const findings: FindingRef[] = [];
  let status: CheckStatus = "pass";
  if (missing.length >= 3) status = "fail";
  else if (missing.length > 0 || weak.length > 0) status = "warn";
  if (status !== "pass") {
    findings.push({
      id: "headers_missing",
      severity: status === "fail" ? "fail" : "warn",
      detail: [...missing, ...weak].join(", "),
    });
  }

  const summary =
    status === "pass"
      ? "All five security headers are set."
      : `${present.length} of 5 security headers set. Missing or weak: ${[...missing, ...weak].join(", ")}.`;
  const details = [
    ...present.map((n) => `${n}: set`),
    ...missing.map((n) => `${n}: missing`),
    ...weak.map((n) => `${n}: needs strengthening`),
  ];
  return result("headers", status, summary, details, findings);
}

/* ── 3. Email spoofing protection ───────────────────────────────────────── */

export type EmailEvidence = {
  /** TXT records at the domain that start with v=spf1. */
  spf: string[];
  /** TXT records at _dmarc.domain that start with v=DMARC1. */
  dmarc: string[];
  /** Common selectors where a DKIM key was found. */
  dkimSelectors: string[];
  dnsFailed?: boolean;
};

export function checkEmail(ev: EmailEvidence): CheckResult {
  if (ev.dnsFailed) {
    return result("email", "error", "We could not look up this domain's email records.", [], []);
  }
  const findings: FindingRef[] = [];
  const details: string[] = [];

  if (ev.spf.length === 0) {
    findings.push({ id: "spf_missing", severity: "fail" });
    details.push("SPF: missing");
  } else if (ev.spf.length > 1) {
    findings.push({ id: "spf_multiple", severity: "fail", detail: `${ev.spf.length} SPF records` });
    details.push(`SPF: ${ev.spf.length} records, receivers treat this as an error`);
  } else {
    const spf = ev.spf[0].toLowerCase();
    const all = /(^|\s)([+?~-]?)all(\s|$)/.exec(spf);
    const redirect = /(^|\s)redirect=/.test(spf);
    if (all && (all[2] === "+" || all[2] === "")) {
      findings.push({ id: "spf_permissive", severity: "fail", detail: "ends in +all, which allows any sender" });
      details.push("SPF: allows any sender");
    } else if (all && all[2] === "?") {
      findings.push({ id: "spf_permissive", severity: "warn", detail: "ends in ?all, which makes no decision" });
      details.push("SPF: neutral (?all)");
    } else if (!all && !redirect) {
      findings.push({ id: "spf_permissive", severity: "warn", detail: "has no closing all rule" });
      details.push("SPF: no closing rule");
    } else {
      details.push(`SPF: set (${all ? all[2] + "all" : "redirect"})`);
    }
  }

  let policy: string | null = null;
  if (ev.dmarc.length === 0) {
    findings.push({ id: "dmarc_missing", severity: "fail" });
    details.push("DMARC: missing");
  } else if (ev.dmarc.length > 1) {
    findings.push({ id: "dmarc_missing", severity: "fail", detail: "more than one DMARC record, so receivers ignore them" });
    details.push("DMARC: more than one record");
  } else {
    const rec = ev.dmarc[0].toLowerCase();
    const p = /(?:^|;)\s*p\s*=\s*(none|quarantine|reject)\b/.exec(rec);
    const pct = /(?:^|;)\s*pct\s*=\s*(\d{1,3})\b/.exec(rec);
    policy = p ? p[1] : null;
    if (!policy) {
      findings.push({ id: "dmarc_missing", severity: "fail", detail: "the DMARC record has no valid policy" });
      details.push("DMARC: no valid policy");
    } else if (policy === "none") {
      findings.push({ id: "dmarc_none", severity: "warn" });
      details.push("DMARC: policy none (monitoring only)");
    } else if (pct && Number(pct[1]) < 100) {
      findings.push({ id: "dmarc_partial", severity: "warn", detail: `applies to ${Number(pct[1])} percent of mail` });
      details.push(`DMARC: policy ${policy} on ${Number(pct[1])} percent of mail`);
    } else {
      details.push(`DMARC: policy ${policy}`);
    }
  }

  if (ev.dkimSelectors.length === 0) {
    findings.push({ id: "dkim_not_found", severity: "warn" });
    details.push("DKIM: none found at common selectors");
  } else {
    details.push(`DKIM: found (${ev.dkimSelectors.join(", ")})`);
  }

  const status = worst(findings);
  const summary =
    status === "pass"
      ? `SPF, DKIM and DMARC are in place. DMARC policy: ${policy}.`
      : `Email protection has gaps. ${details.filter((d) => !/: set|: found|policy (quarantine|reject)$/.test(d)).join(". ")}.`;
  return result("email", status, summary, details, findings);
}

/* ── 4. CMS and version exposure ────────────────────────────────────────── */

export type CmsFacts = {
  cms: "WordPress" | "Joomla" | "Drupal" | "Wix" | "Squarespace" | "Shopify" | "Webflow" | null;
  version: string | null;
  versionSource: "generator" | "asset" | null;
  plugins: Array<{ slug: string; version: string }>;
};

const VERSION = /^\d{1,3}(?:\.\d{1,4}){0,3}$/;

/** Read CMS facts from homepage HTML. Pure regex; the HTML is never rendered. */
export function detectCms(html: string): CmsFacts {
  const facts: CmsFacts = { cms: null, version: null, versionSource: null, plugins: [] };
  const generators: string[] = [];
  for (const m of Array.from(html.matchAll(/<meta\b[^>]*>/gi))) {
    const tag = m[0];
    if (!/name\s*=\s*["']?generator["'\s>]/i.test(tag)) continue;
    const c = /content\s*=\s*(?:"([^"]{0,200})"|'([^']{0,200})')/i.exec(tag);
    if (c) generators.push(c[1] ?? c[2] ?? "");
  }

  for (const g of generators) {
    let m: RegExpExecArray | null;
    if ((m = /\bWordPress\s+(\d[\d.]{0,15})/i.exec(g))) {
      facts.cms = "WordPress";
      facts.version = cleanVersion(m[1]);
      facts.versionSource = facts.version ? "generator" : null;
    } else if ((m = /\bJoomla!?(?:\s*-\s*Open Source Content Management)?(?:\s+(\d[\d.]{0,15}))?/i.exec(g))) {
      facts.cms = "Joomla";
      facts.version = m[1] ? cleanVersion(m[1]) : null;
      facts.versionSource = facts.version ? "generator" : null;
    } else if ((m = /\bDrupal\s+(\d{1,2})/i.exec(g))) {
      facts.cms = "Drupal";
      facts.version = cleanVersion(m[1]);
      facts.versionSource = "generator";
    } else if (/\bWix\.com\b/i.test(g)) facts.cms = "Wix";
    else if (/\bSquarespace\b/i.test(g)) facts.cms = "Squarespace";
    else if (/\bWebflow\b/i.test(g)) facts.cms = "Webflow";
    if (facts.cms) break;
  }

  if (!facts.cms) {
    if (/\/wp-(?:content|includes)\//i.test(html)) facts.cms = "WordPress";
    else if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) facts.cms = "Shopify";
    else if (/static1\.squarespace\.com/i.test(html)) facts.cms = "Squarespace";
    else if (/static\.wixstatic\.com|static\.parastorage\.com/i.test(html)) facts.cms = "Wix";
    else if (/assets\.website-files\.com|data-wf-site=/i.test(html)) facts.cms = "Webflow";
  }

  if (facts.cms === "WordPress") {
    if (!facts.version) {
      // Core assets carry the core version in ?ver=. Take the most common one.
      const counts = new Map<string, number>();
      for (const m of Array.from(html.matchAll(/\/wp-includes\/[^"'\s>]{1,200}?\?ver=(\d[\d.]{0,15})/gi))) {
        const v = cleanVersion(m[1]);
        if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        facts.version = top[0];
        facts.versionSource = "asset";
      }
    }
    const seen = new Set<string>();
    for (const m of Array.from(html.matchAll(/\/wp-content\/plugins\/([a-z0-9-]{1,60})\/[^"'\s>?]{0,200}\?ver=(\d[\d.]{0,15})/gi))) {
      const slug = m[1].toLowerCase();
      const v = cleanVersion(m[2]);
      if (!v || seen.has(slug)) continue;
      seen.add(slug);
      facts.plugins.push({ slug, version: v });
      if (facts.plugins.length >= 30) break;
    }
  }
  return facts;
}

function cleanVersion(v: string): string | null {
  const t = v.replace(/\.+$/, "");
  return VERSION.test(t) ? t : null;
}

const HOSTED = new Set(["Wix", "Squarespace", "Shopify", "Webflow"]);

export function checkCms(html: string | null): CheckResult {
  if (html === null) {
    return result("cms", "skipped", "Could not be checked because the homepage did not load.", [], []);
  }
  const facts = detectCms(html);
  const findings: FindingRef[] = [];
  const details: string[] = [];
  let summary: string;

  if (!facts.cms) {
    summary = "No content management system or version is visible in the public page.";
  } else if (HOSTED.has(facts.cms)) {
    summary = `Built on ${facts.cms}, a hosted platform that the provider keeps up to date.`;
  } else if (facts.cms === "WordPress") {
    if (!facts.version) {
      summary = "WordPress, with the version hidden from the public page.";
    } else {
      const status = wordpressCoreStatus(facts.version);
      const label = `WordPress ${facts.version}`;
      details.push(`${label}, read from the page's ${facts.versionSource === "generator" ? "generator tag" : "file addresses"}`);
      if (status === "insecure") {
        findings.push({ id: "cms_core_insecure", severity: "fail", detail: label });
        summary = `${label} is a release WordPress lists as insecure.`;
      } else if (status === "outdated") {
        findings.push({ id: "cms_core_outdated", severity: "warn", detail: label });
        summary = `${label} is supported but not the newest release (${WORDPRESS_CORE.latest}).`;
      } else if (status === "latest") {
        summary = `${label}, the current release.`;
      } else {
        findings.push({ id: "cms_version_exposed", severity: "warn", detail: label });
        summary = `${label} is shown publicly and is not on our version list, so we could not confirm it is current.`;
      }
    }
    const old = facts.plugins.filter((p) => PLUGIN_LATEST[p.slug] && compareVersions(p.version, PLUGIN_LATEST[p.slug]) < 0);
    if (old.length) {
      findings.push({
        id: "plugin_outdated",
        severity: "warn",
        detail: old.map((p) => `${p.slug} ${p.version}`).join(", "),
      });
      details.push(`Plugins older than the current release: ${old.map((p) => `${p.slug} ${p.version} (current ${PLUGIN_LATEST[p.slug]})`).join(", ")}`);
    }
    if (facts.plugins.length) details.push(`Plugin versions visible: ${facts.plugins.length}`);
  } else {
    const major = facts.version ? parseInt(facts.version, 10) : null;
    const eol = END_OF_LIFE.find((e) => e.cms === facts.cms && e.major === major);
    const label = facts.version ? `${facts.cms} ${facts.version}` : facts.cms;
    if (eol) {
      findings.push({ id: "cms_eol", severity: "fail", detail: `${facts.cms} ${eol.major}` });
      summary = `${facts.cms} ${eol.major} stopped receiving security updates on ${eol.ended}.`;
    } else if (facts.version) {
      findings.push({ id: "cms_version_exposed", severity: "warn", detail: label });
      summary = `${label} is shown publicly.`;
    } else {
      summary = `${facts.cms}, with the version hidden from the public page.`;
    }
  }

  return result("cms", worst(findings), summary, details, findings);
}

/* ── 5. Exposed common files ────────────────────────────────────────────── */

export const EXPOSED_FILE_PATHS = ["/.git/HEAD", "/.env", "/wp-config.php.bak"] as const;
export type ExposedPath = (typeof EXPOSED_FILE_PATHS)[number];

const FILE_FINDING: Record<ExposedPath, FindingRef["id"]> = {
  "/.git/HEAD": "exposed_git",
  "/.env": "exposed_env",
  "/wp-config.php.bak": "exposed_wpconfig_backup",
};

export type FileProbe = { path: ExposedPath; status: number | null; contentType: string | null };

/**
 * Found means the server answered 200 with something other than a web page.
 * Many sites answer every address with their normal page (a "soft 404"), and
 * calling that a leak would be a false alarm. We only ever send HEAD, so the
 * file itself is never downloaded.
 */
export function isFileExposed(p: FileProbe): boolean {
  return p.status === 200 && !/text\/html/i.test(p.contentType ?? "");
}

export function checkFiles(probes: FileProbe[] | null): CheckResult {
  if (probes === null) {
    return result("files", "skipped", `${FILES_SKIPPED_MESSAGE}.`, [], []);
  }
  const findings: FindingRef[] = [];
  const details: string[] = [];
  for (const p of probes) {
    const found = isFileExposed(p);
    details.push(`${p.path}: ${found ? "found" : "not found"}`);
    if (found) findings.push({ id: FILE_FINDING[p.path], severity: "fail", detail: p.path });
  }
  const status = worst(findings);
  const summary =
    status === "pass"
      ? "None of the common sensitive files we look for are reachable."
      : `${findings.length} sensitive file${findings.length > 1 ? "s are" : " is"} reachable from the internet.`;
  return result("files", status, summary, details, findings);
}

/* ── 6. Forms and booking links over HTTP ───────────────────────────────── */

const BOOKING_WORDS = /book|appoint|schedul|contact|request|patient|portal|form|intake|pay/i;

export function checkForms(html: string | null, pageProtocol: "http:" | "https:" | null): CheckResult {
  if (html === null || pageProtocol === null) {
    return result("forms", "skipped", "Could not be checked because the homepage did not load.", [], []);
  }
  const findings: FindingRef[] = [];
  const details: string[] = [];
  const formCount = (html.match(/<form\b/gi) ?? []).length;

  if (pageProtocol === "http:" && formCount > 0) {
    findings.push({ id: "form_on_http_page", severity: "fail", detail: `${formCount} form${formCount > 1 ? "s" : ""}` });
    details.push("The homepage itself is served over plain HTTP and contains a form");
  }

  const httpTargets = new Set<string>();
  for (const m of Array.from(html.matchAll(/<form\b[^>]*\baction\s*=\s*["']?(http:\/\/[^"'\s>]{1,500})/gi))) {
    const host = safeHost(m[1]);
    if (host) httpTargets.add(host);
  }
  for (const m of Array.from(html.matchAll(/<iframe\b[^>]*\bsrc\s*=\s*["']?(http:\/\/[^"'\s>]{1,500})/gi))) {
    const host = safeHost(m[1]);
    if (host) httpTargets.add(host);
  }
  if (httpTargets.size) {
    findings.push({ id: "form_http_action", severity: "fail", detail: Array.from(httpTargets).slice(0, 5).join(", ") });
    details.push(`Form or embedded booking frame sends over plain HTTP to: ${Array.from(httpTargets).slice(0, 5).join(", ")}`);
  }

  const httpLinks = new Set<string>();
  for (const m of Array.from(html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']?(http:\/\/[^"'\s>]{1,500})/gi))) {
    if (!BOOKING_WORDS.test(m[1])) continue;
    const host = safeHost(m[1]);
    if (host) httpLinks.add(host);
  }
  if (httpLinks.size) {
    findings.push({ id: "booking_link_http", severity: "warn", detail: Array.from(httpLinks).slice(0, 5).join(", ") });
    details.push(`Booking or contact links that use plain HTTP: ${Array.from(httpLinks).slice(0, 5).join(", ")}`);
  }

  details.push(`Forms on the homepage: ${formCount}`);
  const status = worst(findings);
  const summary =
    status === "pass"
      ? formCount > 0
        ? "Forms on the homepage send over HTTPS."
        : "No form or booking link on the homepage uses plain HTTP."
      : "A form or booking link on the homepage uses plain HTTP.";
  return result("forms", status, summary, details, findings);
}
