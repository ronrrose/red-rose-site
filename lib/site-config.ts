/**
 * Single source of truth for Red Rose Technologies contact details.
 *
 * Everything the printed business cards reference lives here. Changing a value
 * in this file updates the header, footer, contact page, schema.org JSON-LD,
 * transactional email, and every call-to-action across all locales.
 */

/* ── Phone ────────────────────────────────────────────────────────────────
 * Quo line, Bradenton area code. Replaced the retired (954) 857-1100 number
 * on 2026-10-21 for the business-card launch.
 */
export const PHONE_DISPLAY = "(941) 206-4709";
export const PHONE_E164 = "+19412064709";
export const PHONE_HREF = `tel:${PHONE_E164}`;
/** schema.org prefers the hyphenated E.164 form. */
export const PHONE_SCHEMA = "+1-941-206-4709";
/** Example number shown in the contact form's phone input. */
export const PHONE_PLACEHOLDER = "(941) 555-0123";

/* ── Address ──────────────────────────────────────────────────────────────
 * No street address is published yet. A Lakewood Ranch office address will be
 * added once the lease is active: set STREET_ADDRESS and POSTAL_CODE below and
 * every consumer (footer microdata, LocalBusiness JSON-LD) picks them up.
 * Leave them null to publish a city-only address.
 */
export const STREET_ADDRESS: string | null = null;
export const POSTAL_CODE: string | null = null;

export const ADDRESS_LOCALITY = "Lakewood Ranch";
export const ADDRESS_REGION = "FL";
export const ADDRESS_COUNTRY = "US";

/** The single line shown in the site footer. */
export const SERVICE_AREA_LINE =
  "Lakewood Ranch, FL | Serving Tampa Bay, Manatee & Sarasota";

/* ── Email ────────────────────────────────────────────────────────────────── */
export const CONTACT_EMAIL = "info@redrosetechnologies.com";

/* ── Booking ──────────────────────────────────────────────────────────────
 * Ron's Roam lobby. Empty string disables the embed and falls back to the
 * contact form plus a prominent phone number.
 */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://ro.am/ronrose/meeting";

/* ── Calls to action ──────────────────────────────────────────────────────
 * Must match the printed card: "Book a free IT checkup".
 */
export const PRIMARY_CTA_LABEL = "Book a free IT checkup";

/* ── Canonical origin ─────────────────────────────────────────────────────
 * www is canonical: the apex 308-redirects to www at the host level, so every
 * absolute URL we publish (schema @id, canonical tags, sitemap, OG, hreflang)
 * has to be the www form or crawlers get a redirect hop on every entry.
 * Before this existed, sitemap.ts, layout.tsx, metadata.ts and JsonLd.tsx each
 * hard-coded the apex while robots.txt and Breadcrumbs.tsx used www.
 */
export const SITE_URL = "https://www.redrosetechnologies.com";

/* ── Public profiles (schema.org sameAs) ──────────────────────────────────
 * Only profiles Red Rose actually controls belong here: sameAs is an identity
 * claim, and pointing it at a directory scrape or a similarly named company
 * tells answer engines the wrong entity is us. A company called "Red Rose
 * Technologies Ltd" trades in Swindon, UK, and a cloudtango.net listing under
 * our name is in fact theirs, so neither is listed.
 *
 * Verified 2026-10-25: the LinkedIn company page resolves (HTTP 200). No
 * Google Business Profile, Facebook page, YouTube channel or X account was
 * found for the LLC. Add each one here as it is created.
 */
export const PROFILE_URLS: string[] = [
  "https://www.linkedin.com/company/red-rose-technologies",
];

/* ── IndexNow ─────────────────────────────────────────────────────────────
 * Submitting a URL to IndexNow pushes it to Bing and Yandex within minutes
 * instead of waiting on a crawl. The key is not a secret: it is published at
 * /<key>.txt so the endpoint can verify we own the host.
 */
export const INDEXNOW_KEY = "0d855a4472bb486aabe5c6488d6c4937";
