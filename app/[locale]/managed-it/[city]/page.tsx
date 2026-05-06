import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { cities, getCityBySlug } from "@/lib/city-data";
import CityLandingContent from "./CityLandingContent";

interface CityPageProps {
  params: { locale: Locale; city: string };
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    cities.map((c) => ({ locale, city: c.slug }))
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.city);
  if (!city) return {};

  const title = `Managed IT Services for Dental Practices in ${city.name}, FL`;
  const description = `HIPAA-compliant managed IT services for dental practices in ${city.name}, ${city.nearbyCities.join(", ")}, and throughout ${city.county} County. Microsoft 365, cybersecurity, and AI-driven workflow solutions. Microsoft Partner.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Red Rose Technologies`,
      description,
    },
    alternates: {
      languages: Object.fromEntries([
        ["x-default", `https://www.redrosetechnologies.com/en/managed-it/${city.slug}`],
        ...locales.map((l) => [l, `https://www.redrosetechnologies.com/${l}/managed-it/${city.slug}`]),
      ]),
    },
  };
}

export default function CityPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  return <CityLandingContent city={city} />;
}
