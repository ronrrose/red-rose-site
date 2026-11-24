import {
  ADDRESS_COUNTRY,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  PHONE_SCHEMA,
  SITE_URL,
} from "@/lib/site-config";

/**
 * Copy and structured data for /security-reviews, kept in one place so the
 * visible page and its JSON-LD are built from the same strings (Google wants
 * FAQPage answers to match the page word for word).
 *
 * Rules this copy follows (Ron's brief, Nov 24):
 * - No prices, no "starting at": every package is "Priced after a free review".
 * - No invented durations or statistics, and no client names.
 * - The Anthropic program is only ever "Verified in Anthropic's Cyber
 *   Verification Program (Defense Access)". Never certified, accredited or partner.
 * - No promise of protection or of a HIPAA compliance outcome.
 *
 * STATUS: the package "covers" lines are DRAFTS for Ron to approve.
 */

export const PATH = "/security-reviews";
export const PAGE_URL = `${SITE_URL}${PATH}`;

/** Ron's booking link. The enforced CSP already allows ro.am. */
export const BOOK_URL = "https://ro.am/ronrose/meeting";
export const BOOK_LABEL = "Book a security review";

export const TITLE = "AI-Assisted Security Reviews for Healthcare and Nonprofits | Lakewood Ranch and Tampa Bay";
export const DESCRIPTION =
  "AI-assisted security reviews of websites, application code, Microsoft 365, Entra and Azure, and phone and portal integrations. Every finding is verified by a human. Patient records never go to AI models.";

export const PROMISE =
  "We find the security gaps in your website, code and Microsoft 365, and a person checks every finding before you see it.";

export const REVIEW_AREAS = [
  {
    title: "Website and plugin vulnerabilities",
    text: "Out-of-date plugins and themes, known vulnerabilities and weak settings on your public website.",
  },
  {
    title: "Application code",
    text: "Custom apps, portals and scripts written by your team or a vendor, checked for security flaws.",
  },
  {
    title: "Microsoft 365, Entra and Azure configuration",
    text: "Sign-in and multi-factor settings, admin roles, sharing settings and your cloud resources.",
  },
  {
    title: "Phone and portal integrations",
    text: "How your phone system, booking tools and patient or client portals connect to each other and to your data.",
  },
] as const;

/** Ron's wording, used as is on the page and in FAQ 2. */
export const DATA_SAFETY = [
  "We scan code, configurations and websites only.",
  "Patient records and uploaded documents are never sent to AI models.",
  "All findings are verified by a human before you see them.",
] as const;

export const DELIVERABLES = [
  { title: "A prioritized findings report", text: "Every finding ranked by risk and explained in plain English, so you know what to fix first." },
  { title: "A fix plan", text: "Clear steps for each finding, in the order we recommend." },
  { title: "A re-scan after fixes", text: "Once the fixes are in, we scan again to check that each finding is closed." },
  { title: "An optional monthly monitoring plan", text: "A scan every month, so new issues come to light between reviews." },
] as const;

export const PRICING_LINE = "Priced after a free review";

export const PACKAGES = [
  {
    name: "Pre-launch review",
    covers: "A full review of a new website, app or portal before it goes live.",
  },
  {
    name: "Monthly monitoring",
    covers: "A scan of your website, code or Microsoft 365 setup every month, with every finding checked by a person.",
  },
  {
    name: "Full HIPAA security assessment",
    covers: "A wider look at the systems, settings and integrations that handle patient information.",
  },
] as const;

/** Ron's own claims, published as he worded them. */
export const WHY_RED_ROSE = [
  "15+ years of enterprise IT (cruise fleets, healthcare)",
  "Microsoft Partner",
  "Verified in Anthropic's Cyber Verification Program (Defense Access)",
  "Local and hands-on",
] as const;

/**
 * FAQ 3 is written only from Anthropic's own page, which goes in the PR
 * description: https://www.anthropic.com/news/cyber-verification-program
 * (published Oct 6, 2026, updated Nov 18, 2026). At most two sentences come
 * from it; the third is Red Rose's status in the exact wording.
 */
export const FAQS = [
  {
    question: "Who does HIPAA security reviews in Lakewood Ranch?",
    answer:
      "Red Rose Technologies does, from our base in Lakewood Ranch, Florida. We review websites, application code, Microsoft 365, Entra and Azure setups, and phone and portal integrations for healthcare practices and nonprofits across Bradenton, Sarasota and Tampa Bay, and we work with clients nationwide.",
  },
  {
    question: "Is AI-assisted vulnerability scanning safe for patient data?",
    answer: DATA_SAFETY.join(" "),
  },
  {
    question: "What is Anthropic's Cyber Verification Program?",
    answer:
      "It is Anthropic's program that makes advanced cyber capabilities available to qualifying security professionals, in three access tiers. Defense Access is the tier for defensive work, such as incident response and analyzing and validating vulnerabilities. Red Rose Technologies is verified in Anthropic's Cyber Verification Program (Defense Access).",
  },
  {
    question: "How long does a security review take?",
    answer:
      "It depends on the scope: how many websites, apps, accounts and integrations are involved. We set the timeline with you after the free review call, once we know what is in scope.",
  },
  {
    question: "Do you work with nonprofits and grant-funded organizations?",
    answer:
      "Yes, we work with nonprofits. On the free review call we talk through what you need reviewed and shape the work around it.",
  },
  {
    question: "What happens after you find a vulnerability?",
    answer:
      "You get a prioritized findings report and a fix plan, so you know what to fix first and what can wait. Once the fixes are in, we scan again to check each finding is closed, and you can add an optional monthly monitoring plan.",
  },
] as const;

const SERVICE_ID = `${PAGE_URL}#professional-service`;
const SERVICE_TYPE = "AI-assisted security review";

const AREA_SERVED = [
  { "@type": "City", name: "Lakewood Ranch" },
  { "@type": "City", name: "Bradenton" },
  { "@type": "City", name: "Sarasota" },
  { "@type": "AdministrativeArea", name: "Tampa Bay" },
  { "@type": "Country", name: "United States" },
];

/**
 * ProfessionalService plus one Service per package. FAQPage comes from
 * FaqList and BreadcrumbList from Breadcrumbs, both built from what renders.
 * No Offer carries a price: Red Rose does not publish prices.
 */
export function securityReviewsSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": SERVICE_ID,
        name: "Red Rose Technologies LLC",
        url: PAGE_URL,
        telephone: PHONE_SCHEMA,
        image: `${SITE_URL}/logo.png`,
        address: {
          "@type": "PostalAddress",
          addressLocality: ADDRESS_LOCALITY,
          addressRegion: ADDRESS_REGION,
          addressCountry: ADDRESS_COUNTRY,
        },
        areaServed: AREA_SERVED,
        description: DESCRIPTION,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        // serviceType is not a ProfessionalService property in schema.org (the
        // validator warns on it), so the service type lives on each Service
        // and the catalog links them to the business.
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: SERVICE_TYPE,
          itemListElement: PACKAGES.map((_, i) => ({ "@type": "Offer", itemOffered: { "@id": `${PAGE_URL}#package-${i + 1}` } })),
        },
      },
      ...PACKAGES.map((p, i) => ({
        "@type": "Service",
        "@id": `${PAGE_URL}#package-${i + 1}`,
        name: p.name,
        description: p.covers,
        serviceType: SERVICE_TYPE,
        provider: { "@id": SERVICE_ID },
        areaServed: AREA_SERVED,
        url: PAGE_URL,
        offers: {
          "@type": "Offer",
          description: PRICING_LINE,
          url: PAGE_URL,
        },
      })),
    ],
  };
}
