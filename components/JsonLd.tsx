export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.redrosetechnologies.com/#business",
        name: "Red Rose Technologies",
        description:
          "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
        url: "https://www.redrosetechnologies.com",
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
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: "3",
          bestRating: "5",
          worstRating: "5",
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
        "@id": "https://www.redrosetechnologies.com/#website",
        url: "https://www.redrosetechnologies.com",
        name: "Red Rose Technologies",
        publisher: { "@id": "https://www.redrosetechnologies.com/#business" },
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
