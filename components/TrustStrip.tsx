/**
 * Credentials Ron asserts, worded exactly as he approved them. Text only: no
 * logos or badges of any kind, and never "certified", "accredited" or
 * "partner" for the Anthropic program. Shown below the homepage hero, on
 * /dental, /free-security-check and /security-reviews, and (compact) in the
 * footer.
 */
export const TRUST_ITEMS = [
  "Microsoft Partner (6963034)",
  "Verified in Anthropic's Cyber Verification Program (Defense Access)",
  "HIPAA-focused MSP for healthcare and nonprofits",
] as const;

export default function TrustStrip({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <ul
        aria-label="Credentials"
        className={`flex flex-col gap-2 text-xs font-medium text-faded md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-6 ${className}`}
      >
        {TRUST_ITEMS.map((label) => (
          <li key={label} className="flex items-start gap-2 md:items-center">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent md:mt-0" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section aria-label="Credentials" className={`border-y border-line bg-panel ${className}`}>
      <ul className="container-site flex flex-col items-center justify-center gap-3 py-6 text-center md:flex-row md:flex-wrap md:gap-x-10">
        {TRUST_ITEMS.map((label) => (
          // Inline dot, so a label that wraps on a phone keeps its dot beside the first line.
          <li key={label} className="text-sm font-semibold text-secondary [text-wrap:balance]">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
