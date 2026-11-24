import type { Metadata } from "next";
import { Lock, FileCode2, Mail, Layers, FolderLock, FormInput, Ban } from "lucide-react";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import type { Locale } from "@/i18n/config";
import DotPattern from "@/components/magicui/dot-pattern";
import TrustStrip from "@/components/TrustStrip";
import FaqList from "@/components/FaqList";
import { SecurityCheckProvider } from "@/components/security-check/SecurityCheckState";
import ScanForm from "@/components/security-check/ScanForm";
import ResultsSection from "@/components/security-check/ResultsSection";
import ShadowAiQuiz from "@/components/security-check/ShadowAiQuiz";
import { ReviewCta } from "@/components/security-check/ScanResults";
import { QUIZ_TIE_IN } from "@/lib/security-check/quiz";
import { RESULT_DISCLAIMER } from "@/lib/security-check/types";

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: "Free Practice Security Check",
    description:
      "A free 2-minute security check for dental and medical practices: a passive scan of your website's public signals and a 10-question Shadow AI risk quiz, with a score and plain-English fixes.",
    openGraph: pageOpenGraph({
      title: "Free Practice Security Check for Dental and Medical Practices",
      description:
        "Score your practice website's public security signals and your staff's Shadow AI risk in about two minutes. Free, passive, and no patient data.",
    }),
    alternates: localeAlternates("/free-security-check", params.locale),
  };
}

const CHECKS = [
  { icon: Lock, title: "HTTPS and certificate", text: "Whether your site loads securely, your certificate is valid, and how many days it has left." },
  { icon: FileCode2, title: "Security headers", text: "Five browser settings: HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options and Referrer-Policy." },
  { icon: Mail, title: "Email spoofing protection", text: "Your SPF, DKIM and DMARC records, which decide whether someone can send email that claims to be your practice." },
  { icon: Layers, title: "Website software versions", text: "Whether your homepage shows a WordPress, Joomla or Drupal version, or plugin versions, that are out of date." },
  { icon: FolderLock, title: "Exposed common files", text: "Whether three files that should never be public answer at all. Only when you ask from an email at your domain, and we never download them." },
  { icon: FormInput, title: "Forms and booking links", text: "Whether a form or booking link on your homepage sends information over plain HTTP." },
];

const FAQS = [
  {
    question: "Is this check safe to run on my website?",
    answer:
      "Yes. It makes the same kind of requests a browser makes when someone visits your homepage, plus public DNS lookups. It does not log in, try passwords, scan ports or crawl past the homepage.",
  },
  {
    question: "Why do I have to tick the authorization box?",
    answer:
      "Because we only check websites for the people who run them. We record that you ticked it, with the time, the website and your IP address.",
  },
  {
    question: "Why is the exposed-files check not run straight away?",
    answer:
      "It asks your server whether three files that should never be public exist. That goes a step past what a normal visitor does, so we only run it when the request comes from an email address at the same domain, through a link we email to that address.",
  },
  {
    question: "Does a good score mean my practice is HIPAA compliant?",
    answer: `No. ${RESULT_DISCLAIMER} A HIPAA risk analysis looks at your systems, policies and people, which a website check cannot see.`,
  },
  {
    question: "How often can I run it?",
    answer:
      "Up to three checks an hour from one connection, and each website, counting its subdomains, once every 24 hours. Inside that window your site is not checked again: from the same connection you see the earlier result, and from anywhere else you are asked to try again the next day.",
  },
];

export default function FreeSecurityCheckPage() {
  return (
    <SecurityCheckProvider>
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44" aria-labelledby="check-title">
        <DotPattern className="fill-ink/[0.05] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,white,transparent)]" />
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="container-site relative z-10 text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Free practice security check
          </span>
          <h1 id="check-title" className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl [text-wrap:balance]">
            It&apos;s not real until you&apos;re the victim.{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              Don&apos;t be the victim.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary md:text-xl [text-wrap:pretty]">
            Free 2-minute security check for dental and medical practices. AI is moving fast. Attackers are moving faster.
          </p>
          <ScanForm />
        </div>
      </section>

      <TrustStrip />

      <ResultsSection />

      <section className="section-padding border-t border-line" aria-labelledby="what-heading">
        <div className="container-site">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Part 1: Website exposure scan</p>
            <h2 id="what-heading" className="text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
              Six public signals, scored
            </h2>
            <p className="mt-5 text-lg text-secondary [text-wrap:pretty]">
              Each one gets a pass, a warning or a fail. You get a score out of 100, a letter grade, and the top fixes in plain English.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">
                  {i + 1}. {title}
                </h3>
                <p className="text-sm leading-relaxed text-secondary">{text}</p>
              </li>
            ))}
          </ol>
          <div className="glass-card mx-auto mt-8 flex max-w-3xl items-start gap-4 rounded-2xl p-6">
            <Ban className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-secondary [text-wrap:pretty]">
              <span className="font-semibold text-ink">What we never do: </span>
              no port scans, no login attempts, no vulnerability probing and no crawling past your homepage. We read only what
              any browser can see in public, and our requests name themselves as the Red Rose Technologies security check.
            </p>
          </div>
        </div>
      </section>

      <section id="shadow-ai" className="section-padding border-t border-line" aria-labelledby="quiz-heading">
        <div className="container-site max-w-4xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Part 2: Shadow AI risk check</p>
            <h2 id="quiz-heading" className="text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
              Is patient data going into free AI tools?
            </h2>
            <p className="mt-5 text-lg text-secondary [text-wrap:pretty]">{QUIZ_TIE_IN}</p>
            <p className="mt-3 text-sm text-faded">Ten questions, about a minute. Your answers stay in your browser.</p>
          </div>
          <ShadowAiQuiz />
        </div>
      </section>

      <section className="section-padding border-t border-line" aria-labelledby="privacy-heading">
        <div className="container-site max-w-3xl">
          <h2 id="privacy-heading" className="mb-6 text-2xl font-bold text-ink md:text-3xl">
            How we handle your information
          </h2>
          <ul className="list-disc space-y-3 pl-5 text-base text-secondary [text-wrap:pretty]">
            <li>We never ask for patient information, and the quiz has nowhere to type any.</li>
            <li>For each check we keep the website address, the time, your IP address and the authorization you ticked, so we can show every check was asked for.</li>
            <li>If you ask for the report, we keep your name, practice name, email, phone and role to send it and to follow up.</li>
            <li>Quiz answers stay in your browser unless you choose to add them to your report.</li>
            <li>Your results are shown only to you and our team. The scan itself reads only public information.</li>
          </ul>
        </div>
      </section>

      <FaqList heading="Common questions" faqs={FAQS} />

      <section className="section-padding border-t border-line" aria-label="Book a review">
        <div className="container-site max-w-3xl">
          <ReviewCta
            headingLevel="h2"
            heading="Want a second set of eyes?"
            body="Book a free 30-minute review. We will go through your results with you, or look at your website and email setup together if you have not run the check yet."
          />
        </div>
      </section>
    </SecurityCheckProvider>
  );
}
