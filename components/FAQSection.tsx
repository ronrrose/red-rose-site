"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  label?: string;
  heading: string;
  faqs: FAQ[];
}

export default function FAQSection({ label = "FAQ", heading, faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="section-padding border-t border-line">
      <div className="container-site">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">{label}</p>
          <h2 className="text-3xl md:text-5xl font-bold text-ink">{heading}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-ink font-semibold text-[15px] pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-faded shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-secondary text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
