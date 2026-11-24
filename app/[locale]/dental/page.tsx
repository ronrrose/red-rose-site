import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BotOff } from "lucide-react";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import type { Locale } from "@/i18n/config";
import DotPattern from "@/components/magicui/dot-pattern";
import TrustStrip from "@/components/TrustStrip";
import DentalServices from "./DentalServices";
import FaqList from "@/components/FaqList";
import CTABanner from "@/components/CTABanner";
import { PRIMARY_CTA_LABEL } from "@/lib/site-config";
import { QUIZ_TIE_IN } from "@/lib/security-check/quiz";
import { RESULT_DISCLAIMER } from "@/lib/security-check/types";

/*
 * Every claim on this page is already published elsewhere on the site or in
 * lib/red-rose-knowledge.ts. No client names, no statistics, no prices
 * beyond Ron's rule that managed IT is quoted after the free checkup.
 */

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: "HIPAA-Focused IT and Security for Dental Practices",
    description:
      "Managed IT, cybersecurity and HIPAA compliance support for dental practices in Lakewood Ranch, Bradenton, Sarasota and Tampa Bay, with support for Dentrix, Eaglesoft, Open Dental and Curve Dental.",
    openGraph: pageOpenGraph({
      title: "HIPAA-Focused IT and Security for Dental Practices",
      description:
        "Managed IT, security and HIPAA compliance support for dental offices, plus a free practice security check and Shadow AI risk check.",
    }),
    alternates: localeAlternates("/dental", params.locale),
  };
}


const SHADOW_AI_EXAMPLES = [
  "A team member pastes an insurance denial into a free chatbot to draft the appeal.",
  "Someone asks a free AI tool to tidy up clinical notes before they go in the chart.",
  "A browser extension that helps with writing can read the web-based screens it runs on.",
];

const SHADOW_AI_FIXES = [
  "A one-page AI use policy that names the approved tools and what never goes into them",
  "A business associate agreement with every vendor that touches patient information",
  "Control over which apps and browser extensions can be installed",
  "Multi-factor sign-in on email and the practice management system",
];

const FAQS = [
  { question: "Do you support our dental software?", answer: "We support Dentrix, Eaglesoft, Open Dental and Curve Dental, along with Microsoft 365 and Windows 11 across the office." },
  { question: "Will you sign a business associate agreement?", answer: "Yes. We sign a business associate agreement with every managed service client, because any vendor with access to electronic patient information needs one." },
  {
    question: "Is it safe for staff to use ChatGPT or other AI tools at work?",
    answer:
      "It depends on the tool and what goes into it. Free consumer versions usually come without a business associate agreement, so patient information should never go into them. A written AI use policy that names approved tools is the place to start.",
  },
  {
    question: "What does the free practice security check look at?",
    answer: `Five public signals from your website and email records, plus a 10-question Shadow AI quiz. It is passive and takes about two minutes. ${RESULT_DISCLAIMER}`,
  },
  { question: "How is managed IT priced?", answer: "Managed IT is quoted after a free IT checkup, because it depends on the size and setup of the practice. There are no contracts and no hidden fees." },
  { question: "Do you work with medical practices too?", answer: "Yes. We also support medical practices and occupational medicine clinics, as well as legal, financial and nonprofit offices." },
  { question: "Where are you based?", answer: "Lakewood Ranch, Florida. We serve practices across Manatee County, Sarasota County and greater Tampa Bay." },
];

const btnPrimary =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-700/20 transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] sm:w-auto";
const btnSecondary =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-line bg-transparent px-8 py-4 text-lg font-semibold text-ink transition-colors hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] sm:w-auto";

export default function DentalPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44" aria-labelledby="dental-title">
        <DotPattern className="fill-ink/[0.05] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,white,transparent)]" />
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="container-site relative z-10 text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Dental practices
          </span>
          <h1 id="dental-title" className="mx-auto mb-8 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl [text-wrap:balance]">
            HIPAA-Focused IT and Security for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              Dental Practices
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary md:text-xl [text-wrap:pretty]">
            Managed IT, cybersecurity and HIPAA compliance support for dental offices across Lakewood Ranch, Bradenton,
            Sarasota and Tampa Bay, from one accountable team.
          </p>
          <div className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/free-security-check" className={btnPrimary}>
              Run the free security check
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/contact" className={btnSecondary}>
              {PRIMARY_CTA_LABEL}
            </Link>
          </div>
          <p className="text-sm text-faded">Free, passive, about two minutes. No patient data.</p>
        </div>
      </section>

      <TrustStrip />

      <DentalServices />

      <section className="section-padding border-t border-line" aria-labelledby="shadow-heading">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">The Shadow AI risk</p>
            <h2 id="shadow-heading" className="mb-6 text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
              Your team may already be using AI with patient data
            </h2>
            <p className="mb-6 text-lg text-secondary [text-wrap:pretty]">{QUIZ_TIE_IN}</p>
            <p className="mb-3 text-base font-semibold text-ink">It usually starts with good intentions, for example:</p>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-base text-secondary">
              {SHADOW_AI_EXAMPLES.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <Link href="/free-security-check#shadow-ai" className={btnPrimary}>
              Take the Shadow AI risk check
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent">
              <BotOff className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-ink">What closes the gap</h3>
            <ul className="space-y-3 text-base text-secondary">
              {SHADOW_AI_FIXES.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-faded">We help practices put each of these in place as part of HIPAA compliance support.</p>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-line" aria-labelledby="check-cta-heading">
        <div className="container-site max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Free practice security check</p>
          <h2 id="check-cta-heading" className="mb-6 text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
            See what your website shows an attacker
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-secondary [text-wrap:pretty]">
            A passive check of five public signals, from HTTPS to email spoofing protection, with a score and plain-English
            fixes. It takes about two minutes.
          </p>
          <Link href="/free-security-check" className={btnPrimary}>
            Run the free security check
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-faded">{RESULT_DISCLAIMER}</p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-secondary">
            Need a deeper look at your website, code or Microsoft 365?{" "}
            <Link href="/security-reviews" className="font-semibold text-accent underline-offset-4 hover:underline">
              See AI-assisted security reviews
            </Link>
          </p>
        </div>
      </section>

      <FaqList heading="Questions dental offices ask" faqs={FAQS} />

      <CTABanner
        heading="Ready to see where your practice stands?"
        subtitle="Start with the free security check, or book a free IT checkup and we will look at the whole office with you."
        primaryLabel="Run the free security check"
        primaryHref="/free-security-check"
        secondaryLabel={PRIMARY_CTA_LABEL}
        secondaryHref="/contact"
        bullets={["No contracts", "No hidden fees", "No patient data needed"]}
      />
    </>
  );
}
