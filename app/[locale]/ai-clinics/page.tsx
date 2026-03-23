import type { Metadata } from "next";
import AIClinicsContent from "./AIClinicsContent";

export const metadata: Metadata = {
  title: "AI & Automation Clinics",
  description:
    "Hands-on AI workshops for local businesses in Lakewood Ranch, Sarasota, and Tampa Bay. Three sessions. Real automations. No fluff.",
  openGraph: {
    title: "AI & Automation Clinics — Hands-On Workshops for Local Businesses",
    description:
      "Three sessions that teach your team to actually use AI. Build real automations and leave with tools that save you hours every week.",
    url: "https://www.redrosetechnologies.com/ai-clinics",
  },
};

export default function AIClinicsPage() {
  return <AIClinicsContent />;
}
