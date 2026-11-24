import type { Metadata } from "next";
import FullCheckRunner from "@/components/security-check/FullCheckRunner";

/** Reads the token from the query string, so it is never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Run the full security check",
  robots: { index: false, follow: false },
};

/** Reached only from the link in the report email. The token is checked by the API, not here. */
export default function FullCheckPage({ searchParams }: { searchParams: { t?: string } }) {
  return (
    <section className="section-padding pt-32 md:pt-44" aria-labelledby="full-heading">
      <div className="container-site max-w-4xl">
        <h1 id="full-heading" className="mb-4 text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
          Run the full security check
        </h1>
        <p className="mb-8 text-lg text-secondary [text-wrap:pretty]">
          Your email address is at the domain you checked, so you can add the exposed-files check. We ask your server
          whether three files that should never be public exist, using requests that never download them. Then we email
          you the updated report.
        </p>
        <FullCheckRunner token={typeof searchParams.t === "string" ? searchParams.t.slice(0, 2000) : ""} />
      </div>
    </section>
  );
}
