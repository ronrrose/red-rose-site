/**
 * The two fixed-scope offers shown with every result, written the way #36
 * did for managed IT: name the offer, say what it covers, and say it is
 * priced after a free checkup. No prices are published anywhere on the site.
 *
 * STATUS: the "covers" lines are a DRAFT for Ron to approve.
 */
export const OFFERS = [
  {
    name: "Full pre-launch security review",
    covers: "A full security review of your website and systems before you launch or relaunch them.",
    pricing: "Priced for your practice after a free IT checkup",
  },
  {
    name: "Monthly monitoring",
    covers: "Ongoing monitoring of your website, email and systems, every month.",
    pricing: "Priced for your practice after a free IT checkup",
  },
] as const;

export const REVIEW_CTA_LABEL = "Book a free 30-minute review of your results";
