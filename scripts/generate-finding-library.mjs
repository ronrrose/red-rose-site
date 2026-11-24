#!/usr/bin/env node
/**
 * Redraft the Security Check finding library with Claude, for review.
 *
 * The live site never calls a model: lib/security-check/finding-library.ts is
 * static copy that Ron approves. This script exists so the copy can be
 * redrafted the same way it was first written. It prints a JSON draft to
 * stdout and writes nothing; a person compares it with the current file and
 * copies across only the sentences they approve.
 *
 *   ANTHROPIC_API_KEY=... node scripts/generate-finding-library.mjs > draft.json
 *
 * Only finding types and public-signal descriptions are sent. No scan result,
 * no domain, no visitor data and no quiz answer is ever part of the prompt.
 */
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";

const FINDINGS = {
  https_unreachable: "The practice website does not load over HTTPS at all.",
  https_cert_invalid: "The TLS certificate is expired, self-signed, untrusted or for another name.",
  https_cert_expiring: "The TLS certificate expires within 14 days.",
  http_no_redirect: "Plain http:// visits are served without a redirect to https://.",
  headers_missing: "Some of HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options and Referrer-Policy are missing.",
  spf_missing: "The domain publishes no SPF record.",
  spf_multiple: "The domain publishes more than one SPF record.",
  spf_permissive: "The SPF record ends in +all or ?all, or has no closing all rule.",
  dmarc_missing: "The domain has no valid DMARC record.",
  dmarc_none: "The DMARC policy is p=none.",
  dmarc_partial: "The DMARC policy applies to less than 100 percent of mail (pct below 100).",
  dkim_not_found: "No DKIM key was found at common selectors.",
  cms_core_insecure: "WordPress core version is one WordPress.org lists as insecure.",
  cms_core_outdated: "WordPress core version is supported but not the newest release.",
  cms_eol: "The site runs a CMS major version whose vendor has ended security support.",
  cms_version_exposed: "The page shows its CMS version publicly and we could not confirm it is current.",
  plugin_outdated: "WordPress plugin versions visible in asset URLs are older than the current release.",
  exposed_git: "/.git/HEAD answers 200 with a non-HTML response.",
  exposed_env: "/.env answers 200 with a non-HTML response.",
  exposed_wpconfig_backup: "/wp-config.php.bak answers 200 with a non-HTML response.",
  form_on_http_page: "The homepage is served over plain HTTP and contains a form.",
  form_http_action: "A form or embedded booking frame on an HTTPS page posts to an http:// address.",
  booking_link_http: "Booking or contact links on the homepage use http://.",
};

const RULES = `Write for the person who runs a small dental office, not for IT staff.
For each finding return {"title","why","fix"}:
- title: sentence case, under 70 characters, plain words.
- why: one or two sentences on why it matters to a dental office.
- fix: one line, under 160 characters, starting with a verb.
Hard rules: no em dashes or en dashes; no statistics, percentages or numbers about how common anything is;
no invented facts; never promise an outcome or say anything makes a practice secure or compliant;
do not name vendors; no marketing words. Return only a JSON object keyed by finding id.`;

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error("Set ANTHROPIC_API_KEY to run this. Nothing was sent.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });
const msg = await client.messages.create({
  model: MODEL,
  max_tokens: 8000,
  messages: [{ role: "user", content: `${RULES}\n\nFindings:\n${JSON.stringify(FINDINGS, null, 2)}` }],
});
const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
const draft = JSON.parse(json);

const problems = [];
for (const [id, f] of Object.entries(draft)) {
  for (const [field, s] of Object.entries(f)) {
    if (/[–—]/.test(s)) problems.push(`${id}.${field}: dash`);
    if (/\d+\s*(%|percent)/i.test(s)) problems.push(`${id}.${field}: statistic`);
  }
}
console.log(JSON.stringify({ model: MODEL, generated: new Date().toISOString(), problems, draft }, null, 2));
