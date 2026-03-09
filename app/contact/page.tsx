import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact / Book a Call",
  description: "Talk to Ron about your IT, AI, or security needs. Free assessment. Serving Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
};

export default function ContactPage() {
  return <ContactContent />;
}
