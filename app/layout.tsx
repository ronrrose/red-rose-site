import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Red Rose Technologiesnologies | IT, Automation & Security for Local Businesses",
    template: "%s | Red Rose Technologiesnologies",
  },
  description:
    "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
  keywords: [
    "managed IT Lakewood Ranch",
    "AI automation small business",
    "dental IT support Sarasota",
    "HIPAA compliance Tampa Bay",
    "cybersecurity Bradenton",
    "Red Rose Technologiesnologies",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-page text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <NavBar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
