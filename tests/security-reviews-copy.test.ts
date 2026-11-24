import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  BOOK_URL,
  DATA_SAFETY,
  DELIVERABLES,
  DESCRIPTION,
  FAQS,
  PACKAGES,
  PRICING_LINE,
  PROMISE,
  REVIEW_AREAS,
  TITLE,
  WHY_RED_ROSE,
  securityReviewsSchema,
} from "@/lib/security-reviews";
import { POSITIONING } from "@/lib/positioning";
import { TRUST_ITEMS } from "@/components/TrustStrip";

/**
 * Ron's hard copy rules for /security-reviews and the site-wide positioning
 * work (brief of Nov 24): plain words, no em dashes, no prices, durations or
 * client names, the exact Cyber Verification Program phrase only, and no
 * promise of protection or of a HIPAA compliance outcome.
 */

const PAGE_FILES = [
  "app/[locale]/security-reviews/page.tsx",
  "lib/security-reviews.ts",
  "lib/positioning.ts",
  "components/TrustStrip.tsx",
];

const TOUCHED_FILES = [
  ...PAGE_FILES,
  "components/Footer.tsx",
  "components/NavBar.tsx",
  "components/JsonLd.tsx",
  "app/layout.tsx",
  "app/[locale]/HomeContent.tsx",
  "app/[locale]/about/AboutContent.tsx",
  "app/[locale]/dental/page.tsx",
  "app/[locale]/managed-it/page.tsx",
  "app/[locale]/managed-it/ManagedITContent.tsx",
  "app/[locale]/managed-it/[city]/page.tsx",
  "app/[locale]/managed-it/[city]/CityLandingContent.tsx",
  "lib/red-rose-knowledge.ts",
  "public/llms.txt",
];

const CVP = "Verified in Anthropic's Cyber Verification Program (Defense Access)";

const pageCopy: string[] = [
  TITLE,
  DESCRIPTION,
  PROMISE,
  ...REVIEW_AREAS.flatMap((a) => [a.title, a.text]),
  ...DATA_SAFETY,
  ...DELIVERABLES.flatMap((d) => [d.title, d.text]),
  ...PACKAGES.flatMap((p) => [p.name, p.covers]),
  PRICING_LINE,
  ...WHY_RED_ROSE,
  ...FAQS.flatMap((f) => [f.question, f.answer]),
];

describe("security reviews copy", () => {
  it("has no em dashes in any file this change touches", () => {
    for (const f of TOUCHED_FILES) {
      const text = readFileSync(f, "utf8");
      expect({ f, emDash: text.includes("—") || /&mdash;|\\u2014/.test(text) }).toEqual({ f, emDash: false });
    }
  });

  it("publishes no price or 'starting at' on the page or in its schema", () => {
    for (const f of PAGE_FILES) {
      const text = readFileSync(f, "utf8");
      expect({ f, dollar: text.match(/\$\s?\d/g) }).toEqual({ f, dollar: null });
    }
    for (const s of pageCopy) expect({ s, startingAt: /starting at|from \$/i.test(s) }).toEqual({ s, startingAt: false });
    const schema = JSON.stringify(securityReviewsSchema());
    expect(schema).not.toMatch(/"price|priceSpecification|priceRange|\$\s?\d/);
    expect(PRICING_LINE).toBe("Priced after a free review");
    const services = securityReviewsSchema()["@graph"].filter((n) => n["@type"] === "Service");
    expect(services.map((s) => s.name)).toEqual(["Pre-launch review", "Monthly monitoring", "Full HIPAA security assessment"]);
    for (const s of services) expect((s as { offers: { description: string } }).offers.description).toBe(PRICING_LINE);
  });

  it("invents no durations or statistics", () => {
    for (const s of pageCopy) {
      expect({ s, duration: /\b\d+\s*(minutes?|hours?|days?|weeks?|months?|business days)\b/i.test(s) }).toEqual({ s, duration: false });
      expect({ s, percent: /\d+\s*(%|percent)/i.test(s) }).toEqual({ s, percent: false });
    }
    // The only figure on the page is Ron's own "15+ years" claim (365 is Microsoft 365).
    const numbers = pageCopy.flatMap((s) => s.replace(/Microsoft 365/g, "").match(/\d+\+?/g) ?? []);
    expect(Array.from(new Set(numbers))).toEqual(["15+"]);
  });

  it("names no clients on the page", () => {
    for (const f of PAGE_FILES) {
      expect({ f, client: /BRHPC|Gangi|Torres|Hollywood/i.test(readFileSync(f, "utf8")) }).toEqual({ f, client: false });
    }
  });

  it("uses only the exact Cyber Verification Program phrase", () => {
    for (const f of TOUCHED_FILES) {
      const text = readFileSync(f, "utf8");
      expect({ f, bad: /anthropic[^.\n]{0,40}(certif|accredit|partner)|(certif|accredit)[^.\n]{0,40}anthropic|anthropic partner/i.test(text) }).toEqual({
        f,
        bad: false,
      });
    }
    expect(WHY_RED_ROSE).toContain(CVP);
    expect(TRUST_ITEMS).toContain(CVP);
    const q3 = FAQS.find((f) => f.question === "What is Anthropic's Cyber Verification Program?");
    expect(q3?.answer.toLowerCase()).toContain(CVP.toLowerCase());
    // At most two sentences describe the program; the third is the status line.
    expect(q3?.answer.split(/(?<=\.)\s+/)).toHaveLength(3);
  });

  it("promises no protection and no HIPAA compliance outcome", () => {
    for (const s of pageCopy) {
      expect({ s, promise: /guarantee|fully protected|100% secure|you will be (secure|compliant)|makes you (secure|compliant)|HIPAA[- ]compliant|certif|accredit/i.test(s) }).toEqual({
        s,
        promise: false,
      });
    }
  });

  it("has exactly the six FAQ questions from the brief, each 2 or 3 sentences", () => {
    expect(FAQS.map((f) => f.question)).toEqual([
      "Who does HIPAA security reviews in Lakewood Ranch?",
      "Is AI-assisted vulnerability scanning safe for patient data?",
      "What is Anthropic's Cyber Verification Program?",
      "How long does a security review take?",
      "Do you work with nonprofits and grant-funded organizations?",
      "What happens after you find a vulnerability?",
    ]);
    for (const f of FAQS) {
      const n = f.answer.split(/(?<=[.?!])\s+/).length;
      expect({ q: f.question, ok: n >= 2 && n <= 3 }).toEqual({ q: f.question, ok: true });
    }
    expect(FAQS[1].answer).toBe(
      "We scan code, configurations and websites only. Patient records and uploaded documents are never sent to AI models. All findings are verified by a human before you see them."
    );
    // Q5 says yes to nonprofits and claims nothing about grants.
    expect(FAQS[4].answer).not.toMatch(/grant/i);
    // Q4 sets the timeline after the free review call.
    expect(FAQS[3].answer).toMatch(/depends on the scope/);
    expect(FAQS[3].answer).toMatch(/after the free review call/);
  });

  it("books through Ron's Roam link and has the title Ron asked for", () => {
    expect(BOOK_URL).toBe("https://ro.am/ronrose/meeting");
    expect(TITLE).toBe("AI-Assisted Security Reviews for Healthcare and Nonprofits | Lakewood Ranch and Tampa Bay");
    const page = readFileSync("app/[locale]/security-reviews/page.tsx", "utf8");
    expect(page).not.toMatch(/from "framer-motion"|<Reveal|opacity-0/);
  });
});

describe("site-wide positioning", () => {
  it("uses Ron's three lines verbatim", () => {
    expect(POSITIONING).toEqual({
      tagline: "Secure AI, Automation and IT for Regulated Industries",
      industries: "Healthcare | Dental | Financial Services | Professional Services",
      location: "Lakewood Ranch, FL | Serving Clients Nationwide",
    });
    for (const f of ["components/Footer.tsx", "app/layout.tsx", "app/[locale]/about/AboutContent.tsx", "components/JsonLd.tsx"]) {
      expect({ f, uses: readFileSync(f, "utf8").includes("POSITIONING") }).toEqual({ f, uses: true });
    }
  });

  it("adds United States to every areaServed block", () => {
    for (const f of [
      "components/JsonLd.tsx",
      "lib/security-reviews.ts",
      "app/[locale]/ai-consultant/lakewood-ranch/page.tsx",
      "app/[locale]/dental-it/lakewood-ranch/page.tsx",
    ]) {
      const text = readFileSync(f, "utf8");
      expect({ f, us: text.includes('{ "@type": "Country", name: "United States" }'), local: text.includes('name: "Lakewood Ranch"') }).toEqual({ f, us: true, local: true });
    }
  });

  it("has no bare HIPAA Compliant badge or HIPAA-compliant managed IT meta", () => {
    for (const f of TOUCHED_FILES.concat("app/opengraph-image.tsx")) {
      const text = readFileSync(f, "utf8");
      expect({ f, badge: /"HIPAA Compliant"/.test(text), meta: /HIPAA-compliant managed IT/i.test(text) }).toEqual({ f, badge: false, meta: false });
    }
  });

  it("links the page from the nav, footer, sitemap and llms.txt, and keeps the no-prices line", () => {
    expect(readFileSync("components/NavBar.tsx", "utf8")).toContain('{ href: "/security-reviews", key: "security" }');
    const footer = readFileSync("components/Footer.tsx", "utf8");
    expect(footer).toMatch(/"HIPAA compliance",\s+href: "\/security-reviews"/);
    expect(footer).toMatch(/"Cybersecurity",\s+href: "\/security-reviews"/);
    expect(readFileSync("app/sitemap.ts", "utf8")).toContain("${base}/security-reviews");
    const llms = readFileSync("public/llms.txt", "utf8");
    expect(llms).toContain("https://www.redrosetechnologies.com/security-reviews");
    expect(llms).toContain("Red Rose does not publish prices");
    for (const locale of ["en", "es", "fr", "pt"]) {
      expect(JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")).Nav.security).toBeTruthy();
    }
  });

  it("teaches Ava the service with the exact CVP wording and no price", () => {
    const k = readFileSync("lib/red-rose-knowledge.ts", "utf8").replace(/\s+/g, " ");
    expect(k).toContain("AI-Assisted Security Reviews");
    expect(k).toContain(CVP);
    expect(k).toContain("Each is priced after a free review.");
  });
});
