/**
 * Shared shapes for the Free Practice Security Check. Safe to import from
 * client components: no Node APIs here.
 */

export type CheckId = "https" | "headers" | "email" | "cms" | "files" | "forms";
export type CheckStatus = "pass" | "warn" | "fail" | "skipped" | "error";
export type Severity = "fail" | "warn";

export type FindingId =
  | "https_unreachable"
  | "https_cert_invalid"
  | "https_cert_expiring"
  | "http_no_redirect"
  | "headers_missing"
  | "spf_missing"
  | "spf_multiple"
  | "spf_permissive"
  | "dmarc_missing"
  | "dmarc_none"
  | "dmarc_partial"
  | "dkim_not_found"
  | "cms_core_insecure"
  | "cms_core_outdated"
  | "cms_eol"
  | "cms_version_exposed"
  | "plugin_outdated"
  | "exposed_git"
  | "exposed_env"
  | "exposed_wpconfig_backup"
  | "form_on_http_page"
  | "form_http_action"
  | "booking_link_http";

export type FindingRef = {
  id: FindingId;
  severity: Severity;
  /**
   * What we saw, built only from fixed vocabulary, numbers, version strings
   * and hostnames that passed a strict pattern. Never raw page text.
   */
  detail?: string;
};

export type CheckResult = {
  id: CheckId;
  label: string;
  status: CheckStatus;
  weight: number;
  summary: string;
  details: string[];
  findings: FindingRef[];
};

export type ResolvedFinding = FindingRef & {
  check: CheckId;
  title: string;
  why: string;
  fix: string;
};

export type Strength = { check: CheckId; title: string; summary: string };

export type RequestRecord = {
  method: "GET" | "HEAD" | "DNS";
  url: string;
  status: number | null;
  error?: string;
};

export type ScanResult = {
  version: 1;
  host: string;
  domain: string;
  scannedAt: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  checks: CheckResult[];
  /** Top three to five, most serious first. */
  findings: ResolvedFinding[];
  /** Shown only when there are fewer than three findings. */
  strengths: Strength[];
  /** Every request and lookup the scan made, for the visitor and for audit. */
  requests: RequestRecord[];
  exposedFilesChecked: boolean;
  /** The homepage URL the content checks read, after redirects. */
  pageUrl: string | null;
  /** Whether the certificate verified, so a later HEAD probe knows how to connect. */
  tlsVerified: boolean;
};

export const CHECK_LABELS: Record<CheckId, string> = {
  https: "HTTPS and certificate",
  headers: "Security headers",
  email: "Email spoofing protection",
  cms: "Website software versions",
  files: "Exposed common files",
  forms: "Forms and booking links",
};

export const CHECK_WEIGHTS: Record<CheckId, number> = {
  https: 25,
  email: 25,
  headers: 15,
  cms: 15,
  forms: 10,
  files: 10,
};

/** The disclaimer every result carries, word for word from the brief. */
export const RESULT_DISCLAIMER =
  "This free check covers public signals only. It is not a full security assessment or a HIPAA compliance determination.";

/** Badge wording, exact. Never "certified", "accredited" or "partner", and no logo. */
export const REVIEW_BADGE =
  "Reviewed by Red Rose Technologies, verified in Anthropic's Cyber Verification Program (Defense Access)";

/** Shown in place of check 5 when the email does not match the domain. */
export const FILES_SKIPPED_MESSAGE = "Run the full check from an email address at this domain";

/** The checkbox text. Versioned so a stored authorization proves what was agreed. */
export const AUTHORIZATION_TEXT =
  "I own or manage this domain and authorize Red Rose Technologies to run a passive public check.";
export const AUTHORIZATION_VERSION = "2026-11-24";
