import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { locales, type Locale } from "@/i18n/config";
import ThemeProvider from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n-context";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const dynamic = "force-static";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-page text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <I18nProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
              >
                Skip to main content
              </a>
              <NavBar />
              <Breadcrumbs />
              <main id="main-content">{children}</main>
              <Footer />
              <CookieBanner />
              <AccessibilityWidget />
              <ChatWidget />
              <JsonLd />
            </I18nProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
