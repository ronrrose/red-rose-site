import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n-context";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Red Rose Technologies | IT, Automation & Security for Local Businesses",
    template: "%s | Red Rose Technologies",
  },
  description:
    "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
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
    siteName: "Red Rose Technologies",
    title: "Red Rose Technologies | IT, Automation & Security for Local Businesses",
    description:
      "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
    url: "https://redrosetechnologies.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Rose Technologies | IT, Automation & Security",
    description:
      "IT, AI automation, and cybersecurity for local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
  },
  metadataBase: new URL("https://redrosetechnologies.com"),
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
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-page text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <I18nProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
            >
              Skip to main content
            </a>
            <NavBar />
            <main id="main-content">{children}</main>
            <Footer />
            <CookieBanner />
            <JsonLd />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
