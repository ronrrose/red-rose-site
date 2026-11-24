import { domainToASCII } from "node:url";

/**
 * Turn what a visitor typed into a hostname we are willing to look up.
 *
 * This is the first SSRF fence. The scanner fetches whatever this returns, so
 * the rule is: a bare public DNS name and nothing else. No path, no port, no
 * credentials, no query, no IP literal in any spelling, no single-label or
 * internal name. Anything ambiguous is refused rather than "cleaned up".
 *
 * The one courtesy: a leading http:// or https:// and a single trailing slash
 * are dropped, because people paste their address from the browser bar. Any
 * other scheme is refused.
 */

export type TargetResult =
  | { ok: true; host: string; domain: string }
  | { ok: false; reason: TargetRefusal };

export type TargetRefusal =
  | "empty"
  | "too_long"
  | "bad_scheme"
  | "has_credentials"
  | "has_port"
  | "has_path"
  | "bad_characters"
  | "ip_literal"
  | "single_label"
  | "bad_label"
  | "reserved_name";

/** Messages shown to the visitor. Plain, specific, no blame. */
export const TARGET_REFUSAL_MESSAGES: Record<TargetRefusal, string> = {
  empty: "Enter your practice's website address, for example smiledental.com.",
  too_long: "That address is too long to be a website name.",
  bad_scheme: "Enter just the website name, for example smiledental.com.",
  has_credentials: "Enter just the website name, without a user name or password.",
  has_port: "Enter just the website name, without a port number.",
  has_path: "Enter just the website name, without a page path, for example smiledental.com.",
  bad_characters: "That does not look like a website name. Try something like smiledental.com.",
  ip_literal: "Enter a website name rather than an IP address.",
  single_label: "Enter the full website name, including the ending such as .com.",
  bad_label: "That does not look like a valid website name.",
  reserved_name: "That name is not a public website, so we cannot check it.",
};

/**
 * Suffixes that are never public websites. Covers RFC 2606 / 6761 / 6762 /
 * 8375 / 9476 names plus the private suffixes routers and cloud platforms use
 * for internal hosts (metadata.google.internal is the classic SSRF target).
 */
const RESERVED_SUFFIXES = [
  "localhost",
  "local",
  "localdomain",
  "internal",
  "intranet",
  "private",
  "lan",
  "home",
  "corp",
  "test",
  "example",
  "invalid",
  "onion",
  "alt",
  "arpa",
  "home.arpa",
  "example.com",
  "example.net",
  "example.org",
];

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function parseTarget(raw: unknown): TargetResult {
  if (typeof raw !== "string") return { ok: false, reason: "empty" };
  let s = raw.trim().toLowerCase();
  if (!s) return { ok: false, reason: "empty" };
  if (s.length > 300) return { ok: false, reason: "too_long" };

  // Credentials and IPv6 literals first: both contain characters that would
  // otherwise read as a scheme.
  if (s.includes("@")) return { ok: false, reason: "has_credentials" };
  if (/^(https?:\/\/)?\[/.test(s) || (/^[0-9a-f:]+$/.test(s) && s.includes(":"))) {
    return { ok: false, reason: "ip_literal" };
  }

  // Only the two schemes a browser bar shows. Everything else is refused,
  // including scheme-relative "//host" and things like "javascript:".
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(s);
  if (scheme) {
    if (s.startsWith("https://")) s = s.slice(8);
    else if (s.startsWith("http://")) s = s.slice(7);
    else if (!/^[a-z0-9.-]+:\d+$/.test(s)) return { ok: false, reason: "bad_scheme" };
  } else if (s.startsWith("//")) {
    return { ok: false, reason: "bad_scheme" };
  }

  if (s.endsWith("/")) s = s.slice(0, -1);

  if (s.includes("@")) return { ok: false, reason: "has_credentials" };
  if (s.startsWith("[") || /^[0-9a-f:]+$/.test(s) && s.includes(":")) {
    return { ok: false, reason: "ip_literal" };
  }
  if (s.includes(":")) return { ok: false, reason: "has_port" };
  if (/[/\\?#]/.test(s)) return { ok: false, reason: "has_path" };
  if (/[\s%]/.test(s)) return { ok: false, reason: "bad_characters" };

  if (s.endsWith(".")) s = s.slice(0, -1);
  if (!s) return { ok: false, reason: "empty" };

  // IDN to punycode. Returns "" for anything the WHATWG host parser rejects.
  const ascii = s.split(".").some((l) => /[^\x00-\x7f]/.test(l)) ? domainToASCII(s) : s;
  if (!ascii) return { ok: false, reason: "bad_characters" };
  if (!/^[a-z0-9.-]+$/.test(ascii)) return { ok: false, reason: "bad_characters" };
  if (ascii.length > 253) return { ok: false, reason: "too_long" };

  const labels = ascii.split(".");
  if (labels.length < 2) {
    // A bare number such as 2130706433 is an IPv4 address to many resolvers.
    return { ok: false, reason: /^(0x)?[0-9a-f]+$/.test(ascii) ? "ip_literal" : "single_label" };
  }
  if (labels.some((l) => !LABEL.test(l))) return { ok: false, reason: "bad_label" };

  // A numeric last label means an IPv4 literal in dotted, short (127.1),
  // octal or hex form. No real TLD is numeric.
  const tld = labels[labels.length - 1];
  if (/^(0x[0-9a-f]*|[0-9]+)$/.test(tld)) return { ok: false, reason: "ip_literal" };
  if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(tld)) return { ok: false, reason: "bad_label" };

  for (const suffix of RESERVED_SUFFIXES) {
    if (ascii === suffix || ascii.endsWith("." + suffix)) {
      return { ok: false, reason: "reserved_name" };
    }
  }

  return { ok: true, host: ascii, domain: baseDomain(ascii) };
}

/**
 * The name used for the per-domain limit, DNS email checks and the email
 * match. Only "www." is dropped: we do not ship the Public Suffix List, and
 * guessing the registrable domain wrong would merge unrelated sites.
 */
export function baseDomain(host: string): string {
  return host.startsWith("www.") && host.split(".").length > 2 ? host.slice(4) : host;
}

/**
 * Free mailbox providers. An address there proves nothing about owning a
 * website, so it never unlocks the exposed-files check, even for a site
 * hosted on a subdomain of the same provider.
 */
const FREE_MAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "ymail.com", "aol.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me", "gmx.com", "gmx.net", "mail.com",
  "zoho.com", "yandex.com", "fastmail.com", "hey.com", "comcast.net", "att.net",
  "verizon.net", "sbcglobal.net", "bellsouth.net", "earthlink.net",
]);

/**
 * Whether an email address is at the scanned website's domain.
 *
 * True when the email domain equals the site's base domain, or the site is a
 * subdomain of the email domain (portal.smile.com with dr@smile.com). Never
 * for a free mailbox provider.
 */
export function emailMatchesDomain(email: string, siteHost: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 1) return false;
  const emailDomain = email.slice(at + 1).trim().toLowerCase().replace(/\.$/, "");
  if (!emailDomain || FREE_MAIL_DOMAINS.has(emailDomain)) return false;
  const site = baseDomain(siteHost.toLowerCase());
  return site === emailDomain || site.endsWith("." + emailDomain);
}
