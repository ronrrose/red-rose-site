import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: {
        default: "Red Rose Technologies | AI & Automation for Local Businesses",
        template: "%s | Red Rose Technologies",
    },
    description:
        "AI-powered automation, managed IT, and security for dental practices, healthcare, legal, nonprofits, and SMBs in Lakewood Ranch, Bradenton, Sarasota & Tampa Bay.",
    keywords: [
        "managed IT Lakewood Ranch",
        "AI automation small business",
        "dental IT support Sarasota",
        "HIPAA compliance Tampa Bay",
        "cybersecurity Bradenton",
        "Red Rose Technologies",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${inter.variable} scroll-smooth`}>
            <body className="font-sans min-h-screen bg-dark-900 text-slate-50 antialiased">
                <NavBar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
