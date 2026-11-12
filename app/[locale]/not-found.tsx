import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { PRIMARY_CTA_LABEL } from "@/lib/site-config";

/** The branded 404, rendered inside the locale layout (nav, footer, skip link). */
export default function NotFound() {
  return (
    <section className="section-padding">
      <div className="container-site max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">404</p>
        <h1 className="mb-4 text-3xl font-bold text-ink [text-wrap:balance] md:text-4xl">
          We could not find that page
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-secondary [text-wrap:pretty]">
          The link may be out of date, or the address may have a typo.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-700/20 transition-all hover:bg-brand-800 active:scale-[.98] sm:w-auto"
          >
            {PRIMARY_CTA_LABEL}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="w-full rounded-xl border border-line px-8 py-4 text-lg font-semibold text-ink transition-all hover:bg-raised active:scale-[.98] sm:w-auto"
          >
            Go to the homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
