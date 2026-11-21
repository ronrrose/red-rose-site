import type { Metadata } from "next";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import PenTestContent from "./PenTestContent";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "Penetration Testing",
    description:
      "Authorized penetration testing for medical and dental practices and small businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay. Written scope, rules of engagement, a full report and a free retest.",
    openGraph: pageOpenGraph({
      title: "Penetration Testing for Medical and Dental Practices",
      description:
        "External, internal and web application penetration testing under a signed scope, with a prioritized report and a free retest of fixed findings.",
    }),
    alternates: localeAlternates("/penetration-testing", params.locale),
  };
}

export default function PenetrationTestingPage() {
  return <PenTestContent />;
}
