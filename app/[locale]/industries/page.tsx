import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import IndustriesContent from "./IndustriesContent";

export const metadata: Metadata = {
  title: "IT Services for Dental Practices | HIPAA Compliance",
  description:
    "Specialized IT support for dental offices: HIPAA compliance automation, Microsoft Sentinel SIEM, practice management software integration, and 24/7 monitoring.",
  openGraph: {
    title: "IT Services for Dental Practices | HIPAA Compliance | Red Rose Technologies",
    description:
      "Specialized IT support for dental offices: HIPAA compliance automation, Microsoft Sentinel SIEM, practice management software integration, and 24/7 monitoring.",
  },
  alternates: localeAlternates("/industries"),
};

export default function IndustriesPage() {
  return <IndustriesContent />;
}
