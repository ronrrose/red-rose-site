import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: "IT, AI & Automation for Local Businesses",
  description:
    "Red Rose Technologies helps dental practices, law firms, healthcare providers, and local businesses in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay automate their work and stay secure.",
};

export default function HomePage() {
  return <HomeContent />;
}
