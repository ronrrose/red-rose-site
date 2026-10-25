import type { Metadata } from "next";
import { CheckCircle2, MapPin, Phone, Workflow } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localeAlternates, localeUrl } from "@/lib/metadata";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import {
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  PHONE_DISPLAY,
  PHONE_HREF,
  SITE_URL,
} from "@/lib/site-config";

const PATH = "/ai-consultant/lakewood-ranch";

/**
 * Answer-first local page for "AI consultant Lakewood Ranch".
 *
 * Every claim here comes from lib/red-rose-knowledge.ts, the vetted list of
 * things the business already says in public and will stand behind. No prices
 * (Red Rose does not publish any), no certifications beyond the four we hold,
 * and no promised outcomes — only what we set out to do.
 */

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const title = "AI Consultant in Lakewood Ranch, FL";
  const description =
    "Red Rose Technologies is an AI and automation consultancy in Lakewood Ranch, Florida. We find where your business loses time and money first, then automate only the parts that should be automated.";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Red Rose Technologies LLC",
      title: `${title} | Red Rose Technologies`,
      description,
      url: localeUrl(params.locale, PATH),
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    alternates: localeAlternates(PATH, params.locale),
  };
}

const method = [
  {
    step: "1",
    title: "Find the waste",
    body: "We start by finding where the business is losing time and money. Operational waste first, before any talk of technology.",
  },
  {
    step: "2",
    title: "Streamline the workflow",
    body: "We reshape the workflow around what your business actually does, not around what a software vendor assumes you do.",
  },
  {
    step: "3",
    title: "Automate the right parts",
    body: "We automate the parts that should be automated, and leave alone the parts that should not.",
  },
  {
    step: "4",
    title: "Build around how you run",
    body: "Every business runs differently, so the work is shaped to the business rather than sold as a standard package.",
  },
];

const clinics = [
  "Three live, hands-on sessions where your team builds real automations",
  "A 90 day rollout plan your team leaves with",
  "30 days of email support from our team afterwards",
];

const credentials = [
  "Google AI Essentials Certified",
  "CompTIA IT Fundamentals+",
  "HIPAA Security Specialist",
  "24/7 SOC monitoring",
];

const servedIndustries = [
  "Dental practices",
  "Healthcare and occupational medicine clinics",
  "Legal firms",
  "Nonprofits",
  "Local businesses",
];

const faqs = [
  {
    question: "What does an AI consultant in Lakewood Ranch actually do?",
    answer:
      "At Red Rose Technologies the work starts with finding where your business loses time and money, before any talk of technology. We then streamline that workflow, automate the parts that should be automated, leave alone the parts that should not, and build all of it around how your business actually runs. The aim is to give your team back time and take cost out so the business runs leaner.",
  },
  {
    question: "Will AI automation replace my staff?",
    answer:
      "That is not how we approach it. We automate the parts of a workflow that should be automated and leave alone the parts that should not. The aim is to give your team back time, not to remove people from the business.",
  },
  {
    question: "What are the AI & Automation Clinics?",
    answer:
      "Three live, hands-on sessions where your team builds real automations rather than watching a demo. Your team leaves with a 90 day rollout plan and gets 30 days of email support from our team afterwards.",
  },
  {
    question: "What does AI consulting cost in Lakewood Ranch?",
    answer:
      "Red Rose Technologies does not publish prices. What it costs depends on the size and setup of your business, so we talk it through first. You can book a free IT checkup or call (941) 206-4709 and someone from our team will go over your setup.",
  },
  {
    question: "Can you work with a HIPAA-regulated practice?",
    answer:
      "Yes. We work with dental practices, healthcare clinics and occupational medicine clinics, and we hold a HIPAA Security Specialist credential. Red Rose provides HIPAA compliant Business Associate Agreements for all managed service clients. We can describe what we offer, but we do not certify that any particular setup is legally sufficient for your situation.",
  },
  {
    question: "Are you actually local to Lakewood Ranch?",
    answer:
      "Yes. Red Rose Technologies is based in Lakewood Ranch, Florida, and serves Bradenton, Sarasota, Palmetto, Parrish, North Port, Manatee County, Sarasota County and the greater Tampa Bay area.",
  },
];

export default function AiConsultantLakewoodRanchPage() {
  /* Ties this page's service to the organisation node in components/JsonLd.tsx
     so answer engines resolve one entity instead of several. */
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${PATH}#service`,
    name: "AI & Automation Consulting",
    serviceType: "AI and automation consulting",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Lakewood Ranch" },
      { "@type": "City", name: "Bradenton" },
      { "@type": "City", name: "Sarasota" },
      { "@type": "AdministrativeArea", name: "Manatee County" },
      { "@type": "AdministrativeArea", name: "Sarasota County" },
    ],
    description:
      "AI and automation consulting for dental practices, healthcare and occupational medicine clinics, legal firms, nonprofits and local businesses in Lakewood Ranch, Florida.",
    url: `${SITE_URL}${PATH}`,
  };

  return (
    <>
      {/* ── Answer-first hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hero-glow" />
        <div className="container-site relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel text-accent text-sm font-semibold mb-8">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {ADDRESS_LOCALITY}, {ADDRESS_REGION}
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.08] mb-8 max-w-4xl">
            AI Consultant in Lakewood Ranch, Florida
          </h1>

          {/* The quotable passage: a complete answer in the first paragraph. */}
          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl mb-6">
            Red Rose Technologies is an AI and automation consultancy based in
            Lakewood Ranch, Florida. We find where your business is losing time
            and money first, then streamline that workflow and automate only the
            parts that should be automated. Every business runs differently, so
            the work is shaped to your business rather than sold as a standard
            package. The aim is to give your team back time and take cost out so
            the business runs leaner.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-700/20"
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── Method ────────────────────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <h2 className="text-3xl md:text-5xl font-bold text-ink mb-4">
            How the work runs, in order
          </h2>
          <p className="text-secondary max-w-2xl mb-14 leading-relaxed">
            This is a claim about method, not about outcome. It is the order we
            work in on every engagement.
          </p>
          <ol className="grid md:grid-cols-2 gap-6">
            {method.map((m) => (
              <li key={m.step} className="glass-card rounded-2xl p-8">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-raised text-accent font-bold mb-5">
                  {m.step}
                </span>
                <h3 className="text-xl font-bold text-ink mb-3">{m.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{m.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Clinics ───────────────────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-accent font-semibold uppercase tracking-wide text-sm mb-4">
              <Workflow className="w-4 h-4" aria-hidden="true" />
              AI &amp; Automation Clinics
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-6">
              Your team builds the automations, not us
            </h2>
            <ul className="space-y-4">
              {clinics.map((c) => (
                <li key={c} className="flex gap-3 text-secondary leading-relaxed">
                  <CheckCircle2
                    className="w-5 h-5 text-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-lg font-bold text-ink mb-5">Who we work with</h3>
            <ul className="space-y-3 mb-8">
              {servedIndustries.map((s) => (
                <li key={s} className="flex gap-3 text-secondary text-sm">
                  <CheckCircle2
                    className="w-4 h-4 text-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-bold text-ink mb-5">Credentials</h3>
            <ul className="space-y-3">
              {credentials.map((c) => (
                <li key={c} className="flex gap-3 text-secondary text-sm">
                  <CheckCircle2
                    className="w-4 h-4 text-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Service area ──────────────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <h2 className="text-2xl md:text-3xl font-bold text-ink mb-5">
            Where we work
          </h2>
          <p className="text-secondary max-w-3xl leading-relaxed">
            Based in Lakewood Ranch, Florida, serving Bradenton, Sarasota,
            Palmetto, Parrish, North Port, Tampa, Clearwater and St. Petersburg,
            across Manatee County, Sarasota County and the greater Tampa Bay
            area.
          </p>
        </div>
      </section>

      <FAQSection
        heading="AI consulting in Lakewood Ranch: common questions"
        faqs={faqs}
      />

      <CTABanner
        heading="Start with a free IT checkup"
        subtitle="We look at your setup, tell you what is working and what is not, and give you an honest plan. No contracts and no hidden fees."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
