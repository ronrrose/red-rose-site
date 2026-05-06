import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Red Rose Technologies | Managed IT Services for Dental Practices in Bradenton, FL",
    template: "%s | Red Rose Technologies",
  },
  description:
    "HIPAA-compliant managed IT services for dental practices in Bradenton, Tampa, and Sarasota. Microsoft 365, cybersecurity, and AI-driven workflow solutions. Microsoft Partner.",
  keywords: [
    "managed IT Lakewood Ranch",
    "managed IT Bradenton",
    "managed IT Sarasota",
    "AI automation small business",
    "AI automation Tampa Bay",
    "dental IT support Sarasota",
    "dental IT Lakewood Ranch",
    "HIPAA compliance Tampa Bay",
    "HIPAA compliance Manatee County",
    "cybersecurity Bradenton",
    "cybersecurity Sarasota",
    "IT support Manatee County",
    "IT services Lakewood Ranch",
    "Red Rose Technologies",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Red Rose Technologies LLC",
    title: "Red Rose Technologies | Managed IT for Dental Practices in Bradenton, FL",
    description:
      "HIPAA-compliant managed IT services for dental practices. Microsoft Partner specializing in cybersecurity and practice management software.",
    images: [
      {
        url: "https://redrosetechnologies.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Red Rose Technologies - Managed IT for Dental Practices",
      },
    ],
    url: "https://redrosetechnologies.com",
  },
  twitter: {
    card: "summary_large_image",
  },
  metadataBase: new URL("https://redrosetechnologies.com"),
  alternates: {
    canonical: "https://redrosetechnologies.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
