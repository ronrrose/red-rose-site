"use client";

import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import CTABanner from "@/components/CTABanner";
import { Bot, Shield, Building2, ShieldCheck, Award, Stethoscope, Scale, Heart, Briefcase } from "lucide-react";

const industries = [
  { icon: Stethoscope, label: "Dental Practices" },
  { icon: Heart,       label: "Healthcare" },
  { icon: Scale,       label: "Legal Firms" },
  { icon: Building2,   label: "Nonprofits" },
  { icon: Briefcase,   label: "Local SMBs" },
];

export default function HomeContent() {
  return (
    <>
      <Hero
        badge="AI + Automation + Security for Local Businesses"
        title={
          <>
            AI &amp; Automation That <br className="hidden md:block" />
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              Actually Works
            </span>{" "}
            for Local Businesses.
          </>
        }
        subtitle="You've heard the AI hype. We skip that part. We show dental practices, law firms, nonprofits, and local shops across Tampa Bay how to automate the stuff that's eating their week. And we keep the tech running so they don't have to think about it."
        primaryCta={{ label: "Let's Look at Your Setup", href: "/contact" }}
        secondaryCta={{ label: "Check Out AI Clinics", href: "/ai-clinics" }}
        trustItems={[
          "Google AI Certified",
          "CompTIA Certified",
          "HIPAA Compliant",
          "24/7 Monitoring",
        ]}
      />

      {/* ── 3 Service Cards ── */}
      <section className="section-padding bg-panel border-t border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">What We Do</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">Three Things We're Really Good At</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={Bot}
              title="AI & Automation Clinics"
              description="Hands-on workshops where your team builds real automations. Not a lecture. You'll walk out saving hours every week."
              href="/ai-clinics"
            />
            <ServiceCard
              icon={Shield}
              title="Managed IT & Security"
              description="We watch your network, keep you compliant, and fix problems before you notice them. HIPAA, cybersecurity, all of it."
              href="/managed-it"
            />
            <ServiceCard
              icon={Building2}
              title="Industries We Serve"
              description="Dental offices, law firms, healthcare, nonprofits, and local businesses. We know your software and we speak your language."
              href="/industries"
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
              People Who Can&apos;t Afford IT That Doesn&apos;t Work
            </h2>
            <p className="text-faded text-lg">
              If your business depends on the tech actually working, and you're tired of surprise bills and slow responses, we should talk.
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

      {/* ── Trust / Credentials Strip ── */}
      <section className="py-12 border-y border-line bg-panel">
        <div className="container-site">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { icon: Award, text: "Google AI Essentials Certified" },
              { icon: ShieldCheck, text: "CompTIA IT Fundamentals+" },
              { icon: Shield, text: "HIPAA Security Specialist" },
              { icon: ShieldCheck, text: "24/7 SOC Monitoring" },
            ].map((cred) => (
              <div key={cred.text} className="flex items-center gap-3 text-secondary">
                <cred.icon className="w-6 h-6 text-accent" aria-hidden="true" />
                <span className="text-sm font-medium">{cred.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">What People Say</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">Don&apos;t Take Our Word for It</h2>
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

      <CTABanner />
    </>
  );
}
