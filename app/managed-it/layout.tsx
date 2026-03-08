import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Managed IT & Security",
  description:
    "Managed IT and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Sarasota, and Tampa Bay. Compliance-first. Flat-rate. Local.",
};

export default function ManagedITLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
