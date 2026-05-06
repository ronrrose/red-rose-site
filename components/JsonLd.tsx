export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://redrosetechnologies.com",
        name: "Red Rose Technologies LLC",
        image: "https://redrosetechnologies.com/logo.png",
        description:
          "IT, automation, and cybersecurity for dental practices, healthcare, legal firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
        url: "https://redrosetechnologies.com",
        telephone: "+1-954-857-1100",
        email: "info@redrosetechnologies.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "8403 Pines Blvd, 1081",
          addressLocality: "Pembroke Pines",
          addressRegion: "FL",
          postalCode: "33024",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 26.0131,
          longitude: -80.3433,
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
          { "@type": "AdministrativeArea", name: "Tampa Bay" },
        ],
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
        },
        sameAs: [
          "https://www.linkedin.com/company/red-rose-technologies",
        ],
        founder: {
          "@type": "Person",
          name: "Ron Rose",
          jobTitle: "Founder & IT Consultant",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: "1",
          bestRating: "5",
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
        "@id": "https://redrosetechnologies.com/#website",
        url: "https://redrosetechnologies.com",
        name: "Red Rose Technologies LLC",
        publisher: { "@id": "https://redrosetechnologies.com" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is HIPAA compliance for dental practices?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HIPAA compliance requires dental practices to protect patient health information through administrative, physical, and technical safeguards. Red Rose Technologies provides automated compliance monitoring, encryption, access controls, and security risk assessments tailored to dental workflows.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need a Business Associate Agreement (BAA)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Any vendor with access to your electronic protected health information (ePHI) must sign a BAA. Red Rose Technologies provides HIPAA-compliant BAAs for all managed service clients.",
            },
          },
          {
            "@type": "Question",
            name: "What happens if my practice management system goes down?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our 24/7 monitoring detects outages immediately. Core Shield clients receive response within 4 hours, Advanced Guard within 2 hours, and Total Command clients within 1 hour with priority escalation.",
            },
          },
          {
            "@type": "Question",
            name: "Can you help with Windows 10 end-of-life migration?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. We provide Windows 11 migration planning, hardware compatibility assessments, and phased rollouts to minimize disruption to patient care.",
            },
          },
          {
            "@type": "Question",
            name: "What dental practice management software do you support?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We specialize in Dentrix, Eaglesoft, Open Dental, Curve Dental, and other cloud-based and on-premise dental software platforms.",
            },
          },
        ],
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
