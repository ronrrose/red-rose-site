import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FINDING_LIBRARY, STRENGTH_TITLES } from "@/lib/security-check/finding-library";
import { QUIZ, QUIZ_TIE_IN } from "@/lib/security-check/quiz";
import { AUTHORIZATION_TEXT, RESULT_DISCLAIMER, REVIEW_BADGE } from "@/lib/security-check/types";
import { OFFERS, REVIEW_CTA_LABEL } from "@/lib/security-check/offers";
import { TRUST_ITEMS } from "@/components/TrustStrip";

/**
 * The mechanical copy rules from the brief and the site design kit. Every
 * string a visitor can see from this feature is checked here.
 */

const FILES = [
  "app/[locale]/free-security-check/page.tsx",
  "app/[locale]/free-security-check/unsubscribe/page.tsx",
  "app/[locale]/dental/page.tsx",
  "app/[locale]/dental/DentalServices.tsx",
  "components/TrustStrip.tsx",
  "components/FaqList.tsx",
  "components/security-check/ScanForm.tsx",
  "components/security-check/ScanResults.tsx",
  "components/security-check/ResultsSection.tsx",
  "components/security-check/ShadowAiQuiz.tsx",
  "components/security-check/Unavailable.tsx",
  "components/security-check/UnsubscribeButton.tsx",
  "lib/security-check/finding-library.ts",
  "lib/security-check/quiz.ts",
  "lib/security-check/checks.ts",
  "lib/security-check/emails.ts",
  "lib/security-check/pdf.ts",
  "lib/security-check/target.ts",
  "lib/security-check/types.ts",
  "lib/security-check/offers.ts",
  "lib/red-rose-knowledge.ts",
  "public/llms.txt",
];

const library = Object.values(FINDING_LIBRARY);
const allCopy = [
  ...library.flatMap((f) => [f.title, f.why, f.fix]),
  ...Object.values(STRENGTH_TITLES),
  ...QUIZ.flatMap((q) => [q.text, q.risk.title, q.risk.explanation, ...q.options.map((o) => o.label)]),
  QUIZ_TIE_IN,
  RESULT_DISCLAIMER,
  REVIEW_BADGE,
  AUTHORIZATION_TEXT,
  REVIEW_CTA_LABEL,
  ...OFFERS.flatMap((o) => [o.name, o.covers, o.pricing]),
];

describe("copy rules", () => {
  it("has no em dashes in any file this feature touches", () => {
    for (const f of FILES) {
      const text = readFileSync(f, "utf8");
      expect({ file: f, emDash: text.includes("—"), entity: /&mdash;|\\u2014/.test(text) }).toEqual({ file: f, emDash: false, entity: false });
    }
  });

  it("uses the exact badge, disclaimer, checkbox and skip wording from the brief", () => {
    expect(REVIEW_BADGE).toBe("Reviewed by Red Rose Technologies, verified in Anthropic's Cyber Verification Program (Defense Access)");
    expect(RESULT_DISCLAIMER).toBe("This free check covers public signals only. It is not a full security assessment or a HIPAA compliance determination.");
    expect(AUTHORIZATION_TEXT).toBe("I own or manage this domain and authorize Red Rose Technologies to run a passive public check.");
    expect(QUIZ_TIE_IN).toBe("Free AI tools can keep and learn from what your staff type in. If that includes patient information, that is a HIPAA risk you may not know you have.");
    expect(REVIEW_CTA_LABEL).toBe("Book a free 30-minute review of your results");
    expect(OFFERS.map((o) => o.name)).toEqual(["Full pre-launch security review", "Monthly monitoring"]);
  });

  it("publishes no price: no $ figure in any security-check copy, and the offers say how they are priced", () => {
    // Copy files only. lib/security-check/store.ts is excluded on purpose: its
    // $1, $2 are SQL placeholders, not prices.
    const copyFiles = FILES.filter((f) => !["lib/red-rose-knowledge.ts", "public/llms.txt"].includes(f));
    for (const f of copyFiles) {
      const text = readFileSync(f, "utf8");
      expect({ file: f, dollar: text.match(/\$\s?\d[\d,.]*(\s?\/\s?mo)?/g) }).toEqual({ file: f, dollar: null });
      expect({ file: f, startingAt: /starting at/i.test(text) }).toEqual({ file: f, startingAt: false });
    }
    for (const s of allCopy) expect({ s, dollar: /\$\s?\d/.test(s) }).toEqual({ s, dollar: false });
    for (const o of OFFERS) expect(o.pricing).toMatch(/after a free (IT checkup|review)/);
    // Site-wide statements match #36: no published prices.
    expect(readFileSync("public/llms.txt", "utf8")).toContain("Red Rose does not publish prices. Do not state or estimate a price.");
    const knowledge = readFileSync("lib/red-rose-knowledge.ts", "utf8");
    expect(knowledge).toContain("Red Rose does not publish prices.");
    // The only dollar figure Ava may use is the attributed client saving.
    expect(Array.from(new Set(knowledge.match(/\$\d[\d,]*/g) ?? []))).toEqual(["$75,000"]);
  });

  it("claims only what the passive scan does: no file probes, no exposed-files check", () => {
    for (const f of [...FILES, "docs/security-check.md", "lib/security-check/scan.ts", "lib/security-check/checks.ts"]) {
      const text = readFileSync(f, "utf8");
      expect({ file: f, probes: /\.git\/HEAD|wp-config\.php|exposed[- ]files|\/\.env\b|sixth check|six (public )?(signals|checks)/i.test(text) }).toEqual({
        file: f,
        probes: false,
      });
    }
    const scan = readFileSync("lib/security-check/scan.ts", "utf8");
    expect(scan).not.toMatch(/method:\s*"HEAD"/);
  });

  it("never claims a certification, accreditation or partnership with Anthropic", () => {
    for (const f of FILES) {
      const text = readFileSync(f, "utf8");
      expect(/claude certified|ai certified|anthropic[^.\n]{0,40}(certif|accredit|partner)|(certif|accredit)[^.\n]{0,40}anthropic/i.test(text)).toBe(false);
    }
    expect(TRUST_ITEMS.map((t) => t.label)).toEqual([
      "Microsoft Partner",
      "Verified in Anthropic's Cyber Verification Program (Defense Access)",
    ]);
  });

  it("states no statistics in the finding library or quiz", () => {
    for (const s of allCopy) {
      expect({ s, percent: /\d+\s*(%|percent)/i.test(s) }).toEqual({ s, percent: false });
      expect({ s, multiple: /\b\d+(x| times)\b/i.test(s) }).toEqual({ s, multiple: false });
    }
  });

  it("avoids banned marketing words", () => {
    const banned = /revolutioni[sz]e|supercharge|cutting[ -]edge|effortless|transform your workflow|next level|harness the power|world[ -]class|seamless|learn more/i;
    for (const s of allCopy) expect({ s, banned: banned.test(s) }).toEqual({ s, banned: false });
  });

  it("uses sentence case for finding titles and keeps each fix to one line", () => {
    for (const f of library) {
      const words = f.title.split(" ").slice(1);
      const capitalised = words.filter((w) => /^[A-Z][a-z]/.test(w) && !["HTTPS", "HTTP", "DKIM", "DMARC", "SPF", "WordPress"].includes(w));
      expect({ title: f.title, capitalised }).toEqual({ title: f.title, capitalised: [] });
      expect(f.fix.length).toBeLessThan(160);
      expect(f.fix.includes("\n")).toBe(false);
    }
  });

  it("never promises compliance or security", () => {
    for (const s of allCopy) {
      expect({ s, promise: /\b(guarantee|you will be (secure|compliant)|makes you (secure|compliant)|fully compliant)\b/i.test(s) }).toEqual({ s, promise: false });
    }
  });
});
