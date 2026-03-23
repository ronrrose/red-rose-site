import type { Metadata } from "next";
import IndustriesContent from "./IndustriesContent";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "IT, cybersecurity, and AI automation for dental practices, healthcare, legal, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
  openGraph: {
    title: "Industries We Serve — Dental, Healthcare, Legal, Nonprofits & SMBs",
    description:
      "Specialized IT support for dental practices, healthcare providers, law firms, nonprofits, and small businesses in Tampa Bay.",
    url: "https://www.redrosetechnologies.com/industries",
  },
};

export default function IndustriesPage() {
  return <IndustriesContent />;
}
