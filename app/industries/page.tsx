import type { Metadata } from "next";
import IndustriesContent from "./IndustriesContent";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "IT, cybersecurity, and AI automation for dental practices, healthcare, legal, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
};

export default function IndustriesPage() {
  return <IndustriesContent />;
}
