import { Resolver } from "node:dns/promises";
import type { EmailEvidence } from "@/lib/security-check/checks";
import type { RequestRecord } from "@/lib/security-check/types";

/**
 * DNS lookups for the email checks. Read-only TXT queries through the
 * platform resolver: nothing is sent to the practice's own servers.
 */

export const DKIM_SELECTORS = [
  "google",
  "selector1",
  "selector2",
  "k1",
  "k2",
  "s1",
  "s2",
  "default",
  "dkim",
  "mail",
  "smtp",
  "resend",
  "zoho",
  "protonmail",
  "mxvault",
] as const;

export type TxtLookup = (name: string) => Promise<string[][]>;

function defaultTxt(): TxtLookup {
  const r = new Resolver({ timeout: 3000, tries: 2 });
  return (name) => r.resolveTxt(name);
}

const NO_DATA = new Set(["ENODATA", "ENOTFOUND", "NXDOMAIN", "ENONAME"]);

async function txt(lookup: TxtLookup, name: string, log: RequestRecord[]): Promise<string[] | null> {
  try {
    const records = (await lookup(name)).map((parts) => parts.join(""));
    log.push({ method: "DNS", url: `TXT ${name}`, status: records.length });
    return records;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code ?? "ERROR";
    log.push({ method: "DNS", url: `TXT ${name}`, status: 0, error: code });
    return NO_DATA.has(code) ? [] : null;
  }
}

export async function gatherEmailEvidence(
  domain: string,
  log: RequestRecord[],
  lookup: TxtLookup = defaultTxt()
): Promise<EmailEvidence> {
  const [root, dmarc, ...dkim] = await Promise.all([
    txt(lookup, domain, log),
    txt(lookup, `_dmarc.${domain}`, log),
    ...DKIM_SELECTORS.map((s) => txt(lookup, `${s}._domainkey.${domain}`, log)),
  ]);

  if (root === null && dmarc === null) {
    return { spf: [], dmarc: [], dkimSelectors: [], dnsFailed: true };
  }
  return {
    spf: (root ?? []).filter((r) => /^v=spf1(\s|$)/i.test(r.trim())),
    dmarc: (dmarc ?? []).filter((r) => /^v=dmarc1\s*(;|$)/i.test(r.trim())),
    dkimSelectors: DKIM_SELECTORS.filter((_, i) =>
      // A key with an empty p= is a revoked key, so it does not count.
      (dkim[i] ?? []).some((r) => /(^|;)\s*p=[A-Za-z0-9+/=]{20,}/.test(r))
    ),
  };
}
