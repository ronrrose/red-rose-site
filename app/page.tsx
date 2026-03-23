import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: "Red Rose Technologies | IT, AI & Automation for Local Businesses",
  description:
    "Red Rose Technologies helps dental practices, law firms, healthcare providers, and local businesses in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay automate their work and stay secure.",
  openGraph: {
    title: "Red Rose Technologies | IT, AI & Automation for Local Businesses",
    description:
      "AI automation, managed IT, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Tampa Bay.",
    url: "https://www.redrosetechnologies.com",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
