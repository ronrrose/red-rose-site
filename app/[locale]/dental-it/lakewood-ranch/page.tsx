import type { Metadata } from "next";
import { CheckCircle2, Clock, MapPin, Phone, Server } from "lucide-react";
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

const PATH = "/dental-it/lakewood-ranch";

/**
 * Answer-first local page for "dental IT Lakewood Ranch".
 *
 * Claims are limited to lib/red-rose-knowledge.ts. The response times are
 * written as targets, never as a guarantee or an SLA, and the savings figure
 * stays attributed to the client who reported it rather than being restated as
 * something a new practice should expect.
 */

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const title = "Dental IT Support in Lakewood Ranch, FL";
  const description =
    "Dental IT support in Lakewood Ranch, Florida for Dentrix, Eaglesoft, Open Dental and Curve Dental. 24/7 monitoring, backup, HIPAA aware security and a signed BAA. No contracts, no hidden fees.";

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

const platforms = ["Dentrix", "Eaglesoft", "Open Dental", "Curve Dental"];

const included = [
  "24/7 network monitoring",
  "Patching",
  "Backup",
  "HIPAA aware security",
  "Cybersecurity",
  "Proactive support",
  "No contracts and no hidden fees",
  "A free dark web scan",
];

const tiers = [
  { name: "Core Shield", target: "Response within 4 hours" },
  { name: "Advanced Guard", target: "Response within 2 hours" },
  {
    name: "Total Command",
    target: "Response within 1 hour, with priority escalation",
  },
];

const faqs = [
  {
    question: "What dental practice management software do you support?",
    answer:
      "Dentrix, Eaglesoft, Open Dental and Curve Dental. That covers both on-premise servers and cloud-based platforms, so a practice does not have to change software to work with us.",
  },
  {
    question: "Do you sign a Business Associate Agreement?",
    answer:
      "Yes. Any vendor with access to your electronic protected health information has to sign a BAA, and Red Rose Technologies provides HIPAA compliant BAAs for all managed service clients.",
  },
  {
    question: "How fast do you respond if our practice management system goes down?",
    answer:
      "Our 24/7 monitoring detects outages immediately. From there the target response times are 4 hours on Core Shield, 2 hours on Advanced Guard, and 1 hour with priority escalation on Total Command. These are target response times, not a guarantee and not a contractual service level agreement.",
  },
  {
    question: "Can you move our practice off a server and onto cloud dental software?",
    answer:
      "Yes, that is work we do. One dental client reported roughly $75,000 a year in savings after a review of spend, a move from Eaglesoft servers to Curve Dental in the cloud, a phone system change, and a payroll move from ADP to Gusto. That is what that practice reported, not a figure we promise to a new practice.",
  },
  {
    question: "What should we do about Windows 10 end of life?",
    answer:
      "We provide Windows 11 migration planning, including hardware compatibility assessment and phased rollouts, so the practice is not taken offline during patient hours.",
  },
  {
    question: "What does dental IT support cost in Lakewood Ranch?",
    answer:
      "Red Rose Technologies does not publish prices. What it costs depends on the size and setup of the practice. Call (941) 206-4709 or book a free IT checkup and someone from our team will go through your setup first.",
  },
];

export default function DentalItLakewoodRanchPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${PATH}#service`,
    name: "Dental IT Support",
    serviceType: "Dental IT support and HIPAA compliance",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Lakewood Ranch" },
      { "@type": "City", name: "Bradenton" },
      { "@type": "City", name: "Sarasota" },
      { "@type": "AdministrativeArea", name: "Manatee County" },
      { "@type": "AdministrativeArea", name: "Sarasota County" },
    ],
    description:
      "Dental IT support in Lakewood Ranch, Florida for Dentrix, Eaglesoft, Open Dental and Curve Dental, with 24/7 monitoring, patching, backup, HIPAA aware security and HIPAA compliant Business Associate Agreements.",
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
            Dental IT Support in Lakewood Ranch, Florida
          </h1>

          {/* The quotable passage: a complete answer in the first paragraph. */}
          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl mb-6">
            Red Rose Technologies provides dental IT support in Lakewood Ranch,
            Florida. We support Dentrix, Eaglesoft, Open Dental and Curve Dental,
            with 24/7 network monitoring, patching, backup, HIPAA aware security
            and proactive support. Every managed service client gets a HIPAA
            compliant Business Associate Agreement. No contracts, no hidden fees.
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

      {/* ── Platforms ─────────────────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <span className="inline-flex items-center gap-2 text-accent font-semibold uppercase tracking-wide text-sm mb-4">
            <Server className="w-4 h-4" aria-hidden="true" />
            Supported platforms
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink mb-6">
            You do not have to change software to work with us
          </h2>
          <p className="text-secondary max-w-2xl mb-12 leading-relaxed">
            On-premise servers and cloud platforms both. These are the dental
            platforms we support today.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((p) => (
              <li
                key={p}
                className="glass-card rounded-2xl p-6 text-ink font-semibold"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What's included + response targets ────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-8">
              What managed dental IT includes
            </h2>
            <ul className="space-y-4">
              {included.map((i) => (
                <li key={i} className="flex gap-3 text-secondary leading-relaxed">
                  <CheckCircle2
                    className="w-5 h-5 text-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <span className="inline-flex items-center gap-2 text-accent font-semibold uppercase tracking-wide text-sm mb-4">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Target response times
            </span>
            <ul className="space-y-5 mb-6">
              {tiers.map((t) => (
                <li
                  key={t.name}
                  className="flex flex-col gap-1 pb-5 border-b border-line last:border-0 last:pb-0"
                >
                  <span className="text-ink font-bold">{t.name}</span>
                  <span className="text-secondary text-sm">{t.target}</span>
                </li>
              ))}
            </ul>
            <p className="text-faded text-xs leading-relaxed">
              These are target response times. They are not a guarantee and not
              a contractual service level agreement.
            </p>
          </div>
        </div>
      </section>

      {/* ── Client-reported result ────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <figure className="glass-card rounded-2xl p-8 md:p-12 max-w-3xl">
            <blockquote className="text-lg md:text-xl text-ink leading-relaxed mb-6">
              &ldquo;Ron looked at what we were spending and found $75,000 a year
              in savings. He moved us from Eaglesoft servers to Curve Dental in
              the cloud, switched our phones and got us off ADP onto
              Gusto for payroll.&rdquo;
            </blockquote>
            <figcaption className="text-secondary text-sm font-semibold">
              Dr. Yudancy Gangi, DMD
            </figcaption>
          </figure>
          <p className="text-faded text-xs mt-5 max-w-3xl leading-relaxed">
            This is what one dental client reported after that work. It is not a
            figure Red Rose Technologies promises to any other practice.
          </p>
        </div>
      </section>

      {/* ── Service area ──────────────────────────────────────────────── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <h2 className="text-2xl md:text-3xl font-bold text-ink mb-5">
            Where we work
          </h2>
          <p className="text-secondary max-w-3xl leading-relaxed">
            Based in Lakewood Ranch, Florida, serving dental practices in
            Bradenton, Sarasota, Palmetto, Parrish, North Port, Tampa,
            Clearwater and St. Petersburg, across Manatee County, Sarasota
            County and the greater Tampa Bay area.
          </p>
        </div>
      </section>

      <FAQSection
        heading="Dental IT in Lakewood Ranch: common questions"
        faqs={faqs}
      />

      <CTABanner
        heading="Start with a free IT checkup"
        subtitle="We look at your practice's setup, tell you what is working and what is not, and give you an honest plan."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
