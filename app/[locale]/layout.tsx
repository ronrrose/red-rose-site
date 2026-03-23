import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { locales } from "@/i18n/config";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n-context";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import Breadcrumbs from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
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
        <JsonLd />
      </I18nProvider>
    </NextIntlClientProvider>
  );
}
