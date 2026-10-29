import {
  ADDRESS_COUNTRY,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  PHONE_SCHEMA,
  PROFILE_URLS,
  SITE_URL,
} from "@/lib/site-config";
export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#organization`,
        name: "Red Rose Technologies LLC",
        image: `${SITE_URL}/logo.png`,
        description:
          "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
        url: SITE_URL,
        telephone: PHONE_SCHEMA,
        email: "info@redrosetechnologies.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: ADDRESS_LOCALITY,
          addressRegion: ADDRESS_REGION,
          addressCountry: ADDRESS_COUNTRY,
        },
        areaServed: [
          { "@type": "City", name: "Lakewood Ranch" },
          { "@type": "City", name: "Bradenton" },
          { "@type": "City", name: "Sarasota" },
          { "@type": "City", name: "Palmetto" },
          { "@type": "City", name: "Parrish" },
          { "@type": "City", name: "North Port" },
          { "@type": "City", name: "Tampa" },
          { "@type": "City", name: "Clearwater" },
          { "@type": "City", name: "St. Petersburg" },
          { "@type": "AdministrativeArea", name: "Manatee County" },
          { "@type": "AdministrativeArea", name: "Sarasota County" },
          { "@type": "AdministrativeArea", name: "Tampa Bay" },
        ],
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
        },
        sameAs: PROFILE_URLS,
        founder: {
          "@type": "Person",
          name: "Ron Rose",
          jobTitle: "Founder & CTO",
        },
        review: [
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Dr. Yudancy Gangi, DMD" },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody:
              "Ron looked at what we were spending and found $75,000 a year in savings. He moved us from Eaglesoft servers to Curve Dental in the cloud, switched our phones and got us off ADP onto Gusto for payroll.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Jonathan Hill" },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody:
              "We've worked with Ron since 2011. He built out our enterprise network for over 115 staff members, and it's still running strong today.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "James Torres, Esq." },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody:
              "Our last IT company took three days to return calls. Ron picks up the phone. His team caught a vulnerability on our network before it turned into a nightmare.",
          },
        ],
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
                  "Hands-on workshops where your team builds real automations to take repetitive work off the week.",
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
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Red Rose Technologies LLC",
        publisher: { "@id": `${SITE_URL}/#organization` },
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
