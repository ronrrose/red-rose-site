import type { Metadata } from "next";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import HomeContent from "./HomeContent";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: { absolute: "Red Rose Technologies | Managed IT & Cybersecurity for Medical and Dental Practices" },
    description:
      "Red Rose Technologies provides managed IT, cybersecurity, HIPAA compliance and incident response for medical and dental practices in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay.",
    openGraph: pageOpenGraph({
      title: "Red Rose Technologies | Managed IT & Cybersecurity for Medical and Dental Practices",
      description:
        "Managed IT, cybersecurity, HIPAA compliance, 24/7 monitoring and AI automation for medical and dental practices in Tampa Bay.",
    }),
    alternates: localeAlternates("", params.locale),
  };
}

export default function HomePage() {
  return <HomeContent />;
}
