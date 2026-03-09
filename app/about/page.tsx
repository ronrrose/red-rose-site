import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About / Why Red Rose",
  description:
    "Red Rose Technologies: local IT, AI, and automation run by Ron Rose. Google AI certified, CompTIA credentialed. Lakewood Ranch, FL.",
};

export default function AboutPage() {
  return <AboutContent />;
}
