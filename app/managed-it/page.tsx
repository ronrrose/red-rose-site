import type { Metadata } from "next";
import ManagedITContent from "./ManagedITContent";

export const metadata: Metadata = {
  title: "Managed IT & Security",
  description:
    "HIPAA-compliant managed IT, cybersecurity, and 24/7 network monitoring for businesses in Lakewood Ranch, Bradenton, Sarasota, Manatee County, and Tampa Bay. Flat-rate pricing, no surprises.",
};

export default function ManagedITPage() {
  return <ManagedITContent />;
}
