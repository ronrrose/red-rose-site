import type { Metadata } from "next";
import ResourcesContent from "./ResourcesContent";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, checklists, and plain-English articles on AI, cybersecurity, and HIPAA compliance from Red Rose Technologies.",
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
