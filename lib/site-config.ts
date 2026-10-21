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
