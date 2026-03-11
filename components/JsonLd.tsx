export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://redrosetechnologies.com/#business",
        name: "Red Rose Technologies",
        description:
          "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
        url: "https://redrosetechnologies.com",
        telephone: "+1-954-857-1100",
        email: "info@redrosetechnologies.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lakewood Ranch",
          addressRegion: "FL",
          addressCountry: "US",
        },
        areaServed: [
          { "@type": "City", name: "Lakewood Ranch" },
          { "@type": "City", name: "Bradenton" },
          { "@type": "City", name: "Sarasota" },
          { "@type": "City", name: "Palmetto" },
          { "@type": "City", name: "Parrish" },
          { "@type": "City", name: "North Port" },
          { "@type": "AdministrativeArea", name: "Manatee County" },
          { "@type": "AdministrativeArea", name: "Tampa Bay" },
        ],
        openingHours: "Mo-Fr 08:00-18:00",
        founder: {
          "@type": "Person",
          name: "Ron Rose",
          jobTitle: "Founder & IT Consultant",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "IT Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "AI & Automation Clinics",
                description:
                  "Hands-on workshops where your team builds real automations to save hours every week.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Managed IT & Security",
                description:
                  "24/7 network monitoring, HIPAA compliance, cybersecurity, and proactive IT support.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Dental IT Support",
                description:
                  "Specialized IT support for dental practices including Eaglesoft, Curve Dental, and Dentrix integrations.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "HIPAA Compliance",
                description:
                  "HIPAA security assessments, policies, and ongoing compliance for healthcare and dental offices.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Cybersecurity",
                description:
                  "Vulnerability assessments, endpoint protection, SOC monitoring, and incident response.",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://redrosetechnologies.com/#website",
        url: "https://redrosetechnologies.com",
        name: "Red Rose Technologies",
        publisher: { "@id": "https://redrosetechnologies.com/#business" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
