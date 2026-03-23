import type { Metadata } from "next";
import ManagedITContent from "./ManagedITContent";

export const metadata: Metadata = {
  title: "Managed IT & Security",
  description:
    "HIPAA-compliant managed IT, cybersecurity, and 24/7 network monitoring for businesses in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay. Flat-rate pricing, no surprises.",
  openGraph: {
    title: "Managed IT & Security — HIPAA-Compliant IT for Local Businesses",
    description:
      "24/7 network monitoring, HIPAA compliance, cybersecurity, and proactive IT support. Flat-rate pricing, no hidden fees.",
    url: "https://www.redrosetechnologies.com/managed-it",
  },
};

export default function ManagedITPage() {
  return <ManagedITContent />;
}
