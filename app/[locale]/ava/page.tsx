import type { Metadata } from "next";
import AvaLive from "@/components/AvaLive";

/**
 * Ava, answering out loud.
 *
 * Deliberately its own route rather than a change to /contact. The contact
 * page is where the printed business-card QR code lands and it has broken
 * before, so a demo that is still finding its feet does not belong on it.
 *
 * noindex: this is a working demo, not a page that should turn up in search
 * next to the real service pages.
 */
export const metadata: Metadata = {
  title: "Talk to Ava",
  description:
    "Ask Red Rose's AI assistant about IT, automation and security for your practice.",
  robots: { index: false, follow: false },
};

export default function AvaPage() {
  return (
    <section className="section-padding">
      <div className="container-site">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-3 text-3xl font-bold text-ink sm:text-4xl">
            Talk to Ava
          </h1>
          <p className="text-secondary">
            Press the microphone and ask her anything, or type it. She is the
            same assistant that answers in the chat window, with a face and a
            voice.
          </p>
        </div>
        <AvaLive />
      </div>
    </section>
  );
}
