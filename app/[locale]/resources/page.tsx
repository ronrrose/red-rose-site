import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import ResourcesContent from "./ResourcesContent";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, checklists, and plain-English articles on AI, cybersecurity, and HIPAA compliance from Red Rose Technologies.",
  openGraph: {
    title: "Resources — AI, Cybersecurity & HIPAA Guides for Business Owners",
    description:
      "Practical guides on AI automation, cybersecurity checklists, and HIPAA compliance written for people who run businesses.",
  },
  alternates: localeAlternates("/resources"),
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
