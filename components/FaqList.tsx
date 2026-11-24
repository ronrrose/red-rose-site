import { ChevronDown } from "lucide-react";

type Faq = { question: string; answer: string };

/**
 * FAQ with FAQPage schema, rendered on the server with native
 * details/summary: every answer is in the HTML crawlers and AI search read,
 * it opens with the keyboard, and it needs no JavaScript.
 */
export default function FaqList({ heading, faqs, label = "FAQ" }: { heading: string; faqs: Faq[]; label?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <section className="section-padding border-t border-line" aria-labelledby="faq-heading">
      <div className="container-site">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{label}</p>
          <h2 id="faq-heading" className="text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details key={f.question} className="group glass-card rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-6 text-left text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                {f.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-faded transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-6 pb-6 text-sm leading-relaxed text-secondary [text-wrap:pretty]">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
      {/* Static copy only; "<" is escaped anyway so no string can close the script tag. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </section>
  );
}
