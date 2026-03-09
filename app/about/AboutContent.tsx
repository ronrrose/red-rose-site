"use client";

import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { ShieldCheck, Users, Lightbulb, HeartHandshake, Award } from "lucide-react";

const differentiators = [
  {
    icon: Lightbulb,
    title: "We Think Like Operators",
    description:
      "We don't sell tech for the sake of selling tech. Every recommendation starts with understanding how your business actually runs.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Is the Starting Point",
    description:
      "HIPAA, SOC 2, industry regulations. These aren't add-ons. They're built into every setup from day one.",
  },
  {
    icon: Users,
    title: "We Already Know Your Tools",
    description:
      "Dentrix, Clio, QuickBooks, and the rest. We don't spend your time learning your software. We already know it.",
  },
  {
    icon: HeartHandshake,
    title: "No Contracts, No Lock-In",
    description:
      "We earn your business every month by doing good work. Not by trapping you in a contract. No hidden fees, ever.",
  },
];

const credentials = [
  { label: "Google AI Essentials", detail: "Certified in practical AI tools for business automation and decision-making." },
  { label: "CompTIA IT Fundamentals+", detail: "Industry-standard credential covering IT infrastructure, security, and networking." },
  { label: "HIPAA Security Specialist", detail: "Deep experience with healthcare data protection, risk assessments, and audit documentation." },
  { label: "Microsoft 365 Administration", detail: "Deployment, security, and management of Microsoft cloud environments." },
];

export default function AboutContent() {
  return (
    <>
      <Hero
        badge="About Red Rose Technologies"
        title={
          <>
            Built by an Operator,{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              for Operators
            </span>
          </>
        }
        subtitle="We're not another faceless IT company. Red Rose Technologies was built by someone who knows what it's like to run a business, and what it costs when the tech doesn't work."
        primaryCta={{ label: "Work With Us", href: "/contact" }}
        secondaryCta={{ label: "See What We Do", href: "/managed-it" }}
      />

      {/* ── Our Story ── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-8">
              Why Red Rose Technologies Exists
            </h2>
            <div className="text-secondary text-lg leading-relaxed space-y-6 text-left">
              <p>
                I started Red Rose Technologies because I kept seeing the same thing. Local businesses, dental practices, law firms, nonprofits, getting sold technology they didn&apos;t need by vendors who didn&apos;t understand their operations.
              </p>
              <p>
                They were paying for break-fix IT that waited for things to break. They kept hearing AI was &ldquo;the future&rdquo; but nobody gave them a roadmap. And the worst part? Their IT provider treated compliance and security like an afterthought.
              </p>
              <p>
                I built Red Rose Technologies to do it differently. We lead with security. We build with compliance. And we teach business owners how to use AI tools that actually make a difference, not just the ones that look good in a demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 Differentiators ── */}
      <section className="section-padding bg-panel border-y border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">How We Work</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">
              Four Things We Don&apos;t Bend On
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {differentiators.map((d) => (
              <div key={d.title} className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl flex items-center justify-center mb-5 text-accent">
                  <d.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{d.title}</h3>
                <p className="text-faded text-sm leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credentials ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Credentials</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">We Did the Homework</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {credentials.map((c) => (
              <div key={c.label} className="glass-card p-6 rounded-2xl flex items-start gap-4">
                <Award className="w-8 h-8 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="text-ink font-bold mb-1">{c.label}</h3>
                  <p className="text-faded text-sm leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal Note ── */}
      <section className="section-padding bg-panel border-y border-line">
        <div className="container-site">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-24 h-24 rounded-2xl bg-raised shrink-0" />
              <div>
                <p className="text-accent font-semibold text-sm mb-1">A Note from the Founder</p>
                <h3 className="text-2xl font-bold text-ink mb-4">Ron Rose</h3>
                <div className="text-secondary leading-relaxed space-y-4 text-[15px]">
                  <p>
                    If you&apos;re reading this, something isn&apos;t working with your current IT. Maybe it&apos;s the vendor who takes three days to call back. Maybe it&apos;s the nagging feeling that your patient data isn&apos;t really secure. Maybe you keep hearing about AI but have no clue where to start.
                  </p>
                  <p>
                    I&apos;ve been there. I know what it feels like to run a business where the technology is supposed to help but mostly just creates more problems. That&apos;s exactly why I built this company.
                  </p>
                  <p>
                    I&apos;d love to talk. No pitch, no pressure. Just a real conversation about what&apos;s going on and whether we can help.
                  </p>
                  <p className="text-accent font-semibold">— Ron</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Want to Have a Real Conversation?"
        subtitle="Reach out for a free, no-pressure assessment. If we're a fit, great. If not, you'll still walk away with useful info."
        primaryLabel="Talk to Ron"
      />
    </>
  );
}
