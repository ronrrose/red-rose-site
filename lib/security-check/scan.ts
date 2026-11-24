import {
  RefusedError,
  defaultDeps,
  errorCode,
  fetchFollow,
  isTlsCertError,
  requestOnce,
  resolvePublic,
  vetUrl,
  MAX_REDIRECTS,
  type FetchOptions,
  type FollowResult,
  type HopResponse,
  type NetDeps,
} from "@/lib/security-check/safe-fetch";
import { baseDomain, parseTarget, TARGET_REFUSAL_MESSAGES } from "@/lib/security-check/target";
import {
  EXPOSED_FILE_PATHS,
  checkCms,
  checkEmail,
  checkFiles,
  checkForms,
  checkHeaders,
  checkHttps,
  type FileProbe,
  type HttpsEvidence,
} from "@/lib/security-check/checks";
import { gatherEmailEvidence, type TxtLookup } from "@/lib/security-check/dns-checks";
import { gradeFor, scoreChecks, strengths, topFindings } from "@/lib/security-check/scoring";
import type { RequestRecord, ScanResult } from "@/lib/security-check/types";

/**
 * Run the Website Exposure Scan against one hostname.
 *
 * What it sends, and nothing else (tests/security-check-scan.test.ts checks
 * the request log against this list):
 *   - GET https://host/ and GET http://host/, each following at most 3
 *     redirects, every hop re-vetted
 *   - one more GET of the https homepage, without certificate verification,
 *     only when the certificate is broken, so the other checks can still read
 *     the page
 *   - HEAD of /.git/HEAD, /.env and /wp-config.php.bak, only when
 *     includeExposedFiles is set (the visitor proved an email at the domain)
 *   - DNS TXT lookups for SPF, DMARC and common DKIM selectors
 * No port scans, no logins, no forms submitted, no crawling past the homepage.
 */

export type ScanOptions = {
  includeExposedFiles?: boolean;
  deps?: NetDeps;
  txtLookup?: TxtLookup;
  now?: Date;
  /** Total time budget for all HTTP work. */
  budgetMs?: number;
};

export type ScanOutcome =
  | { ok: true; result: ScanResult }
  | { ok: false; reason: "invalid_target" | "refused" | "not_found"; message: string };

export const SCAN_BUDGET_MS = 25_000;
const HOMEPAGE_MAX_BYTES = 1_000_000;

export async function runScan(raw: string, opts: ScanOptions = {}): Promise<ScanOutcome> {
  const target = parseTarget(raw);
  if (!target.ok) {
    return { ok: false, reason: "invalid_target", message: TARGET_REFUSAL_MESSAGES[target.reason] };
  }
  const deps = opts.deps ?? defaultDeps;
  const now = opts.now ?? new Date();
  const deadlineAt = Date.now() + (opts.budgetMs ?? SCAN_BUDGET_MS);
  const host = target.host;
  const domain = target.domain;

  // Vet once up front so a refused name gets a clear answer and no requests.
  try {
    await resolvePublic(host, deps);
  } catch (err) {
    if (err instanceof RefusedError && err.code === "blocked_address") {
      return {
        ok: false,
        reason: "refused",
        message: "That address points to a private or reserved network, so we cannot check it.",
      };
    }
    return { ok: false, reason: "not_found", message: "We could not find that website. Check the spelling and try again." };
  }

  const log: RequestRecord[] = [];
  const base = { deps, deadlineAt, log };

  const [emailEv, httpsAttempt, httpWalk] = await Promise.all([
    gatherEmailEvidence(domain, log, opts.txtLookup),
    settle(fetchFollow(`https://${host}/`, { ...base, maxBytes: HOMEPAGE_MAX_BYTES })),
    walkHttp(host, base),
  ]);

  // HTTPS evidence. A broken certificate gets one unverified read of the page
  // so the header, software and form checks can still run.
  let httpsPage: FollowResult | null = null;
  let httpsEv: HttpsEvidence["https"];
  if (httpsAttempt.ok) {
    httpsPage = httpsAttempt.value;
    httpsEv = { ok: true, tlsValidTo: httpsAttempt.value.hops[0]?.tls?.validTo ?? null };
  } else if (isTlsCertError(httpsAttempt.error)) {
    httpsEv = { ok: false, error: errorCode(httpsAttempt.error), certError: true };
    const second = await settle(
      fetchFollow(`https://${host}/`, { ...base, maxBytes: HOMEPAGE_MAX_BYTES, verifyTls: false })
    );
    if (second.ok) httpsPage = second.value;
  } else {
    httpsEv = { ok: false, error: errorCode(httpsAttempt.error), certError: false };
  }

  const httpEv: HttpsEvidence["http"] = httpWalk.evidence;

  // The page the content checks read: the HTTPS homepage when there is one,
  // otherwise whatever plain HTTP served.
  let page: { url: string; body: Buffer; headers: HopResponse["headers"] } | null = null;
  if (httpsPage && httpsPage.final.status < 400) page = { url: httpsPage.final.url, body: httpsPage.final.body, headers: httpsPage.final.headers };
  else if (httpWalk.page) page = httpWalk.page;
  const pageUrl = page ? new URL(page.url) : null;
  const html = page ? page.body.toString("utf8") : null;
  const pageProtocol = pageUrl ? (pageUrl.protocol as "http:" | "https:") : null;
  const headers = page ? page.headers : null;

  // Check 5, only when unlocked.
  const files = opts.includeExposedFiles
    ? await probeExposedFiles({ host, domain, pageUrl: pageUrl?.toString() ?? null, tlsVerified: httpsEv.ok }, { ...base })
    : null;

  const checks = [
    checkHttps({ https: httpsEv, http: httpEv, now }),
    checkHeaders(headers, pageProtocol),
    checkEmail(emailEv),
    checkCms(html),
    files ?? checkFiles(null),
    checkForms(html, pageProtocol),
  ];

  const score = scoreChecks(checks);
  const findings = topFindings(checks);
  return {
    ok: true,
    result: {
      version: 1,
      host,
      domain,
      scannedAt: now.toISOString(),
      score,
      grade: gradeFor(score),
      checks,
      findings,
      strengths: strengths(checks, findings.length),
      requests: log,
      exposedFilesChecked: files !== null,
      pageUrl: pageUrl?.toString() ?? null,
      tlsVerified: httpsEv.ok,
    },
  };
}

/**
 * Check 5 on its own: HEAD of the three listed paths, no redirects followed.
 * Probed on the host the homepage settled on when it is the same site, never
 * on a third-party host the homepage redirected to.
 */
export async function probeExposedFiles(
  site: { host: string; domain: string; pageUrl: string | null; tlsVerified: boolean },
  base: Pick<FetchOptions, "deps" | "deadlineAt"> & { log: RequestRecord[] }
) {
  const page = site.pageUrl ? new URL(site.pageUrl) : null;
  const probeHost = page && baseDomain(page.hostname) === site.domain ? page.hostname : site.host;
  const protocol = page?.protocol === "http:" ? "http:" : "https:";
  const probes: FileProbe[] = [];
  for (const path of EXPOSED_FILE_PATHS) {
    const url = `${protocol}//${probeHost}${path}`;
    try {
      const r = await requestOnce(url, { deps: base.deps, deadlineAt: base.deadlineAt, method: "HEAD", verifyTls: site.tlsVerified });
      base.log.push({ method: "HEAD", url: r.url, status: r.status });
      probes.push({ path, status: r.status, contentType: String(r.headers["content-type"] ?? "") || null });
    } catch (err) {
      base.log.push({ method: "HEAD", url, status: null, error: errorCode(err) });
      probes.push({ path, status: null, contentType: null });
    }
  }
  return checkFiles(probes);
}

/** Put a fresh check 5 into an earlier result and recompute the score. */
export async function addExposedFilesToResult(
  result: ScanResult,
  opts: { deps?: NetDeps; budgetMs?: number } = {}
): Promise<ScanResult> {
  const log: RequestRecord[] = [];
  const files = await probeExposedFiles(result, {
    deps: opts.deps ?? defaultDeps,
    deadlineAt: Date.now() + (opts.budgetMs ?? 12_000),
    log,
  });
  const checks = result.checks.map((c) => (c.id === "files" ? files : c));
  const score = scoreChecks(checks);
  const findings = topFindings(checks);
  return {
    ...result,
    checks,
    score,
    grade: gradeFor(score),
    findings,
    strengths: strengths(checks, findings.length),
    requests: [...result.requests, ...log],
    exposedFilesChecked: true,
  };
}

/**
 * Request http://host/ and follow plain-HTTP redirects (at most 3, each
 * re-vetted) until the site either moves the visitor to HTTPS or serves a
 * page over HTTP. We stop at the first https:// Location rather than
 * following it, because the HTTPS side is checked on its own.
 */
async function walkHttp(
  host: string,
  base: Pick<FetchOptions, "deps" | "deadlineAt"> & { log: RequestRecord[] }
): Promise<{ evidence: HttpsEvidence["http"]; page: { url: string; body: Buffer; headers: HopResponse["headers"] } | null }> {
  const walkLog = base.log;
  let url = `http://${host}/`;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let r: HopResponse;
    try {
      r = await requestOnce(url, { deps: base.deps, deadlineAt: base.deadlineAt, maxBytes: 300_000 });
    } catch (err) {
      walkLog.push({ method: "GET", url, status: null, error: errorCode(err) });
      // Nothing answers on plain HTTP at all: that is fine. A later hop
      // failing tells us nothing either way, so it is not held against them.
      return { evidence: { ok: false }, page: null };
    }
    walkLog.push({ method: "GET", url: r.url, status: r.status });
    const loc = r.headers.location;
    if ([301, 302, 303, 307, 308].includes(r.status) && typeof loc === "string") {
      let next: URL;
      try {
        next = new URL(loc, r.url);
      } catch {
        return { evidence: { ok: false }, page: null };
      }
      if (next.protocol === "https:") {
        return { evidence: { ok: true, finalProtocol: "https:", finalStatus: r.status }, page: null };
      }
      try {
        url = vetUrl(next.toString()).toString();
      } catch {
        return { evidence: { ok: false }, page: null };
      }
      continue;
    }
    return {
      evidence: { ok: true, finalProtocol: "http:", finalStatus: r.status },
      page: r.status < 400 ? { url: r.url, body: r.body, headers: r.headers } : null,
    };
  }
  return { evidence: { ok: false }, page: null };
}

type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };

async function settle<T>(p: Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, value: await p };
  } catch (error) {
    return { ok: false, error };
  }
}
