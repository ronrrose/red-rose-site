import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import AIClinicsContent from "./AIClinicsContent";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "AI & Automation Clinics",
    description:
      "Hands-on AI workshops for local businesses in Lakewood Ranch, Sarasota, and Tampa Bay. Three sessions. Real automations. No fluff.",
    openGraph: {
      title: "AI & Automation Clinics — Hands-On Workshops for Local Businesses",
      description:
        "Three sessions that teach your team to actually use AI. Build real automations and leave with tools that save you hours every week.",
    },
    alternates: localeAlternates("/ai-clinics", params.locale),
  };
}

export default function AIClinicsPage() {
  return <AIClinicsContent />;
}
