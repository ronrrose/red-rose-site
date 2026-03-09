import type { Metadata } from "next";
import AIClinicsContent from "./AIClinicsContent";

export const metadata: Metadata = {
  title: "AI & Automation Clinics",
  description:
    "Hands-on AI workshops for local businesses in Lakewood Ranch, Sarasota, and Tampa Bay. Three sessions. Real automations. No fluff.",
};

export default function AIClinicsPage() {
  return <AIClinicsContent />;
}
