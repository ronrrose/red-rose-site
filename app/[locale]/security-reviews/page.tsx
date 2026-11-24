import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Globe,
  Code2,
  Cloud,
  PhoneCall,
  ListOrdered,
  ClipboardList,
  RefreshCw,
  CalendarClock,
  Briefcase,
  BadgeCheck,
  ShieldCheck,
  MapPin,
  Lock,
} from "lucide-react";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import type { Locale } from "@/i18n/config";
import DotPattern from "@/components/magicui/dot-pattern";
import TrustStrip from "@/components/TrustStrip";
import FaqList from "@/components/FaqList";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";
import { POSITIONING } from "@/lib/positioning";
import {
  BOOK_LABEL,
  BOOK_URL,
  DATA_SAFETY,
  DELIVERABLES,
  DESCRIPTION,
  FAQS,
  PACKAGES,
  PATH,
  PRICING_LINE,
  PROMISE,
  REVIEW_AREAS,
  TITLE,
  WHY_RED_ROSE,
  securityReviewsSchema,
} from "@/lib/security-reviews";

/*
 * Every section is server-rendered static markup. Nothing here animates in:
 * an invisible opening state blanked the site twice before (see
 * components/Hero.tsx), so no framer-motion and no Reveal on this page.
 */

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION }),
    alternates: localeAlternates(PATH, params.locale),
  };
}

const AREA_ICONS = [Globe, Code2, Cloud, PhoneCall];
const DELIVERABLE_ICONS = [ListOrdered, ClipboardList, RefreshCw, CalendarClock];
const WHY_ICONS = [Briefcase, BadgeCheck, ShieldCheck, MapPin];

const btnPrimary =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-700/20 transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[.98] sm:w-auto";
const textLink =
  "font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function BookButton() {
  return (
    <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
      {BOOK_LABEL}
      <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function SectionHeading({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-bold text-ink md:text-5xl [text-wrap:balance]">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg text-secondary [text-wrap:pretty]">{intro}</p>}
    </div>
  );
}

export default function SecurityReviewsPage() {
  return (
    <>
      {/* Hero: static, one action. */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44" aria-labelledby="reviews-title">
        <DotPattern className="fill-ink/[0.05] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,white,transparent)]" />
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="container-site relative z-10 text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Security reviews
          </span>
          <h1 id="reviews-title" className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl [text-wrap:balance]">
            AI-assisted security reviews for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              healthcare and nonprofits
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary md:text-xl [text-wrap:pretty]">{PROMISE}</p>
          <BookButton />
          <p className="mt-5 text-sm text-secondary">
            Not ready to talk?{" "}
            <Link href="/free-security-check" className={textLink}>
              Run the free 2-minute security check
            </Link>
          </p>
        </div>
      </section>

      <section className="section-padding border-t border-line" aria-labelledby="review-heading">
        <div className="container-site">
          <SectionHeading id="review-heading" eyebrow="What we review" title="Four areas, one review" />
          <ul className="grid gap-6 md:grid-cols-2">
            {REVIEW_AREAS.map(({ title, text }, i) => {
              const Icon = AREA_ICONS[i];
              return (
                <li key={title} className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section-padding border-t border-line bg-panel" aria-labelledby="data-heading">
        <div className="container-site max-w-4xl">
          <div className="glass-card flex flex-col gap-6 rounded-2xl p-6 md:flex-row md:items-start md:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent">
              <Lock className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Patient data</p>
              <h2 id="data-heading" className="mb-5 text-2xl font-bold text-ink md:text-4xl [text-wrap:balance]">
                How patient data stays safe
              </h2>
              <ul className="space-y-3 text-lg text-secondary">
                {DATA_SAFETY.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-line" aria-labelledby="get-heading">
        <div className="container-site">
          <SectionHeading id="get-heading" eyebrow="What you get" title="Findings you can act on" />
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map(({ title, text }, i) => {
              const Icon = DELIVERABLE_ICONS[i];
              return (
                <li key={title} className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section-padding border-t border-line bg-panel" aria-labelledby="packages-heading">
        <div className="container-site">
          <SectionHeading
            id="packages-heading"
            eyebrow="Packages"
            title="Three ways to start"
            intro="Every package is scoped and priced after a free review call, because it depends on what you need checked."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <li key={p.name} className="glass-card flex flex-col rounded-2xl p-6 md:p-8">
                <h3 className="mb-3 text-xl font-bold text-ink">{p.name}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-secondary">{p.covers}</p>
                <p className="text-sm font-semibold text-accent">{PRICING_LINE}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding border-t border-line" aria-labelledby="why-heading">
        <div className="container-site">
          <SectionHeading id="why-heading" eyebrow="Why Red Rose" title="Who is doing the review" />
          <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
            {WHY_RED_ROSE.map((claim, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <li key={claim} className="glass-card flex items-start gap-4 rounded-2xl p-6">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="text-base font-semibold text-ink">{claim}</p>
                    {claim === "Local and hands-on" && <p className="mt-1 text-sm text-secondary">{POSITIONING.location}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-center text-sm text-secondary">
            Looking for ongoing IT support instead?{" "}
            <Link href="/managed-it" className={textLink}>
              See managed IT and security
            </Link>
          </p>
        </div>
      </section>

      <FaqList heading="Security review questions" faqs={[...FAQS]} />

      <section className="section-padding border-t border-line" aria-labelledby="book-heading">
        <div className="container-site max-w-4xl">
          <div className="glass-card rounded-2xl p-8 text-center md:p-12">
            <h2 id="book-heading" className="mb-4 text-3xl font-bold text-ink md:text-4xl [text-wrap:balance]">
              Find the gaps before someone else does
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-secondary [text-wrap:pretty]">
              Start with a free review call. We will talk through what you run, agree what is in scope and send you a plan.
            </p>
            <BookButton />
            <p className="mt-5 text-sm text-secondary">
              Or call{" "}
              <a href={PHONE_HREF} className={textLink}>
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityReviewsSchema()).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
