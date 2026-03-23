import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About / Why Red Rose",
  description:
    "Red Rose Technologies: local IT, AI, and automation run by Ron Rose. Google AI certified, CompTIA credentialed. Lakewood Ranch, FL.",
  openGraph: {
    title: "About Red Rose Technologies — Built by an Operator, for Operators",
    description:
      "Meet Ron Rose and learn why Red Rose Technologies was built to serve dental practices, healthcare, legal firms, and local businesses differently.",
  },
  alternates: localeAlternates("/about"),
};

export default function AboutPage() {
  return <AboutContent />;
}
