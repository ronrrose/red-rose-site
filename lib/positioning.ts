/**
 * Site-wide positioning lines, worded exactly as Ron approved them. The
 * footer, the root meta description, the About intro and the schema all read
 * from here, so the wording cannot drift between them.
 */
export const POSITIONING = {
  tagline: "Secure AI, Automation and IT for Regulated Industries",
  industries: "Healthcare | Dental | Financial Services | Professional Services",
  location: "Lakewood Ranch, FL | Serving Clients Nationwide",
} as const;

/** The three lines as one meta description. */
export const POSITIONING_DESCRIPTION = `${POSITIONING.tagline}. ${POSITIONING.industries}. ${POSITIONING.location}.`;
