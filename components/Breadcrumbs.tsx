"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const nameMap: Record<string, string> = {
  "ai-clinics": "AI Clinics",
  "managed-it": "Managed IT",
  industries: "Industries",
  about: "About",
  resources: "Resources",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    { label: "Home", href: "/" },
    ...segments.map((seg, i) => ({
      label: nameMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: `https://www.redrosetechnologies.com${crumb.href === "/" ? "" : crumb.href}`,
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
