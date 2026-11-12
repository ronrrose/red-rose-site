"use client";

import { Link } from "@/i18n/navigation";
import HeroAva from "@/components/HeroAva";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import CTABanner from "@/components/CTABanner";
import FAQSection from "@/components/FAQSection";
import { homeFaqs } from "@/lib/faq-data";
import { ArrowRight, ShieldCheck, Bot, Shield, Building2, Stethoscope, Scale, Heart, Briefcase } from "lucide-react";
import { PRIMARY_CTA_LABEL } from "@/lib/site-config";
import Marquee from "@/components/magicui/marquee";

const industries = [
  { icon: Stethoscope, label: "Dental practices" },
  { icon: Heart,       label: "Healthcare" },
  { icon: Scale,       label: "Legal firms" },
  { icon: Building2,   label: "Nonprofits" },
  { icon: Briefcase,   label: "Local SMBs" },
];

/**
 * Platforms Red Rose supports. This is a public capability claim, so only add
 * a name the team can actually stand behind.
 *
 * Dental and Microsoft entries are named elsewhere on the site. The
 * occupational medicine block was added for the occ med practice work.
 */
const PLATFORMS = [
  // Dental
  "Dentrix",
  "Eaglesoft",
  "Open Dental",
  "Curve Dental",
  // Occupational medicine
  "PrognoCIS",
  "Net Health",
  "Enterprise Health",
  "Cority",
  "SYSTOC",
  // Workplace
  "Microsoft 365",
  "Windows 11",
];

export default function HomeContent() {
  return (
    <>
      {/*
        Homepage hero, static markup on purpose (see components/Hero.tsx for
        why nothing above the fold animates). One action: book the checkup.
        Ava is the visual and only plays on a click.
      */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="absolute inset-0 pointer-events-none hero-glow" />
        <div className="container-site relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="mb-6 text-sm font-semibold text-accent">
              IT, automation and security for dental, medical and legal practices
            </p>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink [text-wrap:balance] md:text-6xl">
              Find where your practice is losing{" "}
              <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
                time and money.
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary [text-wrap:pretty] md:text-xl lg:mx-0">
              We look at how your practice works day to day, cut the work and spend that isn&apos;t
              paying off, and automate what should run itself. Every plan is set up around how your
              practice runs, starting with a free IT checkup.
            </p>
            {/* Auto width, centred on phones: a full-width button ran under the
                floating Ava and accessibility buttons in the bottom corners. */}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-700/20 transition-all hover:bg-brand-800 active:scale-[.98]"
            >
              {PRIMARY_CTA_LABEL}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <HeroAva />
        </div>
      </section>

      {/* ── Proof: real results from real clients, attributed ── */}
      <section className="border-y border-line bg-panel py-16 md:py-20" aria-labelledby="proof-heading">
        <div className="container-site">
          <h2 id="proof-heading" className="mb-10 text-center text-2xl font-bold text-ink [text-wrap:balance] md:text-3xl">
            What that looked like for two clients
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass-card rounded-2xl p-6 md:col-span-1">
              <p className="mb-2 text-3xl font-bold text-ink">About $75,000 a year</p>
              <p className="text-sm leading-relaxed text-secondary">
                Found for one dental practice, Gangi Dental Care in Bradenton, when Ron reviewed what it was
                spending. He moved it from Eaglesoft servers to Curve Dental in the cloud, switched its phones
                from Adit to Mango Voice, and moved payroll from ADP to Gusto.
              </p>
              <p className="mt-4 text-xs text-secondary">
                One client&apos;s reported result. What we find depends on how your practice runs.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <p className="mb-2 text-3xl font-bold text-ink">Since 2011</p>
              <p className="text-sm leading-relaxed text-secondary">
                How long a Hollywood nonprofit has worked with Ron. He is also its webmaster.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <p className="mb-2 text-3xl font-bold text-ink">115+ staff</p>
              <p className="text-sm leading-relaxed text-secondary">
                On the network Ron built for that same nonprofit. It is still running today.
              </p>
            </div>
          </div>
          {/* A person's credential, which Ron holds (issuer as listed on /about).
              Not a "HIPAA Compliant" badge: no such certification exists. */}
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-secondary">
            <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <span>
              Ron Rose holds the HIPAA Security Specialist credential from HIPAA Training &amp; Certification.
            </span>
            <Link href="/about" className="font-semibold text-accent hover:underline">
              See Ron&apos;s credentials
            </Link>
          </p>
        </div>
      </section>

      {/* ── 3 Service Cards ── */}
      <section className="section-padding bg-panel border-t border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">What We Do</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">Three things we&apos;re really good at</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={Bot}
              title="AI & Automation Clinics"
              description="Hands-on workshops where your team builds real automations. Not a lecture. You'll walk out with automations built to give your team time back."
              href="/ai-clinics"
              cta="See the AI clinics"
            />
            <ServiceCard
              icon={Shield}
              title="Managed IT & security"
              description="We watch your network, keep you compliant, and fix problems before you notice them. HIPAA, cybersecurity, all of it."
              href="/managed-it"
              cta="See managed IT and security"
            />
            <ServiceCard
              icon={Building2}
              title="Industries we serve"
              description="Dental offices, law firms, healthcare, nonprofits, and local businesses. We know your software and we speak your language."
              href="/industries"
              cta="See the industries we serve"
            />
          </div>
        </div>
      </section>

      {/* ── Who We Help ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Who We Help</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-6">
              People who can&apos;t afford IT that doesn&apos;t work
            </h2>
            <p className="text-faded text-lg">
              If your business depends on the tech actually working, and you&apos;re tired of surprise bills and slow responses, we should talk.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {industries.map((ind) => (
              <div
                key={ind.label}
                className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-raised/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent">
                  <ind.icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <span className="text-ink font-semibold text-sm">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platforms We Support ── */}
      <section className="py-14 border-b border-line overflow-hidden">
        <div className="container-site">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-faded mb-8">
            Platforms we support
          </p>
        </div>
        {/* Edges fade into the page so the loop has no hard start or stop. */}
        <div className="relative [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]">
          <Marquee pauseOnHover className="[--duration:38s] [--gap:4rem]">
            {PLATFORMS.map((name) => (
              <span
                key={name}
                className="text-lg md:text-xl font-semibold tracking-tight text-faded transition-colors hover:text-ink whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">What People Say</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">Don&apos;t take our word for it</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Ron looked at what we were spending and found $75,000 a year in savings. He moved us from Eaglesoft servers to Curve Dental in the cloud, switched our phones from Adit to Mango Voice, and got us off ADP onto Gusto for payroll. The whole transition was smooth, and our monthly costs dropped from day one."
              name="Dr. Yudancy Gangi, DMD"
              role="Gangi Dental Care, Bradenton"
            />
            <TestimonialCard
              quote="We've worked with Ron since 2011. He built out our enterprise network for over 115 staff members, and it's still running strong today. He's also our dedicated webmaster. That kind of consistency and reliability is hard to find."
              name="Jonathan Hill"
              role="MIS Director, Hollywood Nonprofit"
            />
            <TestimonialCard
              quote="Our last IT company took three days to return calls. Ron picks up the phone. His team caught a vulnerability on our network before it turned into a nightmare."
              name="James Torres, Esq."
              role="Torres Law Group, Bradenton"
            />
          </div>
        </div>
      </section>

      <FAQSection heading="Questions we get asked most" faqs={homeFaqs} />

      <CTABanner />
    </>
  );
}
