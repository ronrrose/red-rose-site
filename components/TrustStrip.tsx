import { BadgeCheck, ShieldCheck } from "lucide-react";

/**
 * Credentials Ron asserts, worded exactly as he approved them. Text only:
 * no logos, and never "certified", "accredited" or "partner" for the
 * Anthropic program. Shared by /dental, /free-security-check and, once it
 * exists, /security-reviews.
 */
export const TRUST_ITEMS = [
  { icon: BadgeCheck, label: "Microsoft Partner" },
  { icon: ShieldCheck, label: "Verified in Anthropic's Cyber Verification Program (Defense Access)" },
] as const;

export default function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Credentials" className={`border-y border-line bg-panel ${className}`}>
      <ul className="container-site flex flex-col items-center justify-center gap-4 py-6 text-center md:flex-row md:gap-12">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
