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

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <Hero
        badge="AI + Automation + Security for Local Businesses"
        title={
          <>
            AI &amp; Automation That <br className="hidden md:block" />
            <span className="text-gradient bg-gradient-to-r from-brand-400 via-brand-300 to-cyan-400">
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
      <section className="section-padding bg-dark-900/50 border-t border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">What We Do</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Three Things We're Really Good At</h2>
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
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Who We Help</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              People Who Can&apos;t Afford IT That Doesn&apos;t Work
            </h2>
            <p className="text-slate-400 text-lg">
              If your business depends on the tech actually working, and you're tired of surprise bills and slow responses, we should talk.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {industries.map((ind) => (
              <div
                key={ind.label}
                className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-dark-800/70 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <ind.icon className="w-7 h-7" />
                </div>
                <span className="text-white font-semibold text-sm">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Credentials Strip ── */}
      <section className="py-12 border-y border-dark-700/30 bg-dark-950/50">
        <div className="container-site">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { icon: Award, text: "Google AI Essentials Certified" },
              { icon: ShieldCheck, text: "CompTIA IT Fundamentals+" },
              { icon: Shield, text: "HIPAA Security Specialist" },
              { icon: ShieldCheck, text: "24/7 SOC Monitoring" },
            ].map((cred) => (
              <div key={cred.text} className="flex items-center gap-3 text-slate-300">
                <cred.icon className="w-6 h-6 text-brand-400" />
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
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">What People Say</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Don&apos;t Take Our Word for It</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="They moved us off our old Dentrix server without a single minute of downtime. I didn't even know it happened until they told me it was done."
              name="Dr. Sarah Jenkins, DDS"
              role="Jenkins Family Dentistry, Lakewood Ranch"
            />
            <TestimonialCard
              quote="We sat through one AI clinic and automated our intake forms and appointment follow-ups the same week. That's 10 hours a week we got back."
              name="Maria Gonzalez"
              role="Operations Director, Sarasota Nonprofit"
            />
            <TestimonialCard
              quote="Our last IT company took three days to return calls. Ron picks up the phone. His team caught a vulnerability on our network before it turned into a nightmare."
              name="James Torres, Esq."
              role="Torres Law Group, Bradenton"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <CTABanner />
    </>
  );
}
