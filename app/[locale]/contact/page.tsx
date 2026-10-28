import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import ContactContent from "./ContactContent";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "Contact / Book a Call",
    description:
      "Talk to our team about your IT, AI, or security needs. Free assessment. Serving Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
    openGraph: {
      title: "Contact Red Rose Technologies — Book a Free IT Assessment",
      description:
        "Schedule a 30-minute call or send a message. Free, no-pressure IT assessment for your business.",
    },
    alternates: localeAlternates("/contact", params.locale),
  };
}

export default function ContactPage() {
  return <ContactContent />;
}
