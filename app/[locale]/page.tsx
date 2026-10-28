import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import HomeContent from "./HomeContent";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: { absolute: "Red Rose Technologies | IT, AI & Automation for Local Businesses" },
    description:
      "Red Rose Technologies helps dental practices, law firms, healthcare providers, and local businesses in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay automate their work and stay secure.",
    openGraph: {
      title: "Red Rose Technologies | IT, AI & Automation for Local Businesses",
      description:
        "AI automation, managed IT, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Tampa Bay.",
    },
    alternates: localeAlternates("", params.locale),
  };
}

export default function HomePage() {
  return <HomeContent />;
}
