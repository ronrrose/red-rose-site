import type { Metadata } from "next";
import UnsubscribeButton from "@/components/security-check/UnsubscribeButton";

/** Reads the token from the query string, so it is never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage({ searchParams }: { searchParams: { t?: string } }) {
  return (
    <section className="section-padding pt-32 md:pt-44" aria-labelledby="unsub-heading">
      <div className="container-site max-w-2xl">
        <h1 id="unsub-heading" className="mb-4 text-3xl font-bold text-ink md:text-4xl">
          Unsubscribe from security check emails
        </h1>
        <p className="mb-8 text-base text-secondary">
          This stops the follow-up emails about your Free Practice Security Check. Your report stays in your inbox.
        </p>
        <UnsubscribeButton token={typeof searchParams.t === "string" ? searchParams.t.slice(0, 2000) : ""} />
      </div>
    </section>
  );
}
