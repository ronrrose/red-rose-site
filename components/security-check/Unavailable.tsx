import { Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

/** Shown instead of an error when the check is closed (production without its database). */
export default function Unavailable() {
  return (
    <div role="status" className="mt-4 rounded-xl border border-line bg-raised p-4 text-left">
      <p className="text-sm font-semibold text-ink">The free check is temporarily unavailable.</p>
      <p className="mt-1 text-sm text-secondary">Call us and we will run it with you over the phone.</p>
      <a
        href={PHONE_HREF}
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        Call {PHONE_DISPLAY}
      </a>
    </div>
  );
}
