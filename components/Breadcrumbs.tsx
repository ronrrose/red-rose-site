"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import { defaultLocale } from "@/i18n/config";

const localeSet = new Set(["en", "es", "pt", "fr"]);

const nameMap: Record<string, string> = {
  "ai-clinics": "AI Clinics",
  "managed-it": "Managed IT",
  "ai-consultant": "AI Consultant",
  "dental-it": "Dental IT",
  "lakewood-ranch": "Lakewood Ranch",
  industries: "Industries",
  about: "About",
  resources: "Resources",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Filter out locale segment so it doesn't appear as a breadcrumb label
  const allSegments = pathname.split("/").filter(Boolean);
  const segments = allSegments.filter((seg) => !localeSet.has(seg));

  if (segments.length === 0) return null;

  /*
   * Rebuild hrefs using the locale prefix the router actually serves.
   *
   * usePathname() reports the rewritten internal path, so English pages arrive
   * here as /en/dental-it/... even though they are served at /dental-it/...
   * Under localePrefix "as-needed" the default locale carries no prefix, and
   * emitting /en/... would point both the visible links and the
   * BreadcrumbList schema at a 308 redirect.
   */
  const routedLocale =
    allSegments[0] && localeSet.has(allSegments[0]) ? allSegments[0] : null;
  const localePrefix =
    routedLocale && routedLocale !== defaultLocale ? `/${routedLocale}` : "";

  const crumbs = [
    { label: "Home", href: `${localePrefix}/` },
    ...segments.map((seg, i) => ({
      label: nameMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: `${localePrefix}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.href === "/" ? "" : crumb.href}`,
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="container-site pt-24 pb-0"
      >
        <ol className="flex items-center gap-1.5 text-sm text-faded">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
                {isLast ? (
                  <span className="text-ink font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-accent transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
