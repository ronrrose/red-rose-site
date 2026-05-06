"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Scan,
  Plug,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { CityData } from "@/lib/city-data";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";

/* ── Pricing tiers ────────────────────────────────────────── */
const tiers = [
  {
    name: "Core Shield",
    price: "149",
    unit: "/user/mo",
    description:
      "Microsoft 365 Business Premium, 24/7 monitoring, helpdesk support, backup, HIPAA compliance",
    features: [
      "Microsoft 365 Business Premium",
      "24/7 network monitoring",
      "Helpdesk support",
      "Cloud backup & disaster recovery",
      "HIPAA compliance automation",
    ],
  },
  {
    name: "Advanced Guard",
    price: "199",
    unit: "/user/mo",
    popular: true,
    description:
      "Everything in Core Shield + Microsoft Sentinel SIEM, advanced threat protection, quarterly security training",
    features: [
      "Everything in Core Shield",
      "Microsoft Sentinel SIEM",
      "Advanced threat protection",
      "Quarterly security training",
      "Priority helpdesk support",
    ],
  },
  {
    name: "Total Command",
    price: "299",
    unit: "/user/mo",
    description:
      "Everything in Advanced Guard + AI workflow automation, strategic IT planning, priority support",
    features: [
      "Everything in Advanced Guard",
      "AI workflow automation",
      "Strategic IT planning (vCTO)",
      "Priority 24/7 support",
      "Custom integrations",
    ],
  },
];

/* ── Challenges list ──────────────────────────────────────── */
const challenges = [
  "Windows 10 end-of-life security risks",
  "HIPAA Security Risk Assessment (SRA) compliance",
  "Ransomware and phishing attacks targeting healthcare",
  "Practice management software downtime",
];

/* ── Animation variants ───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function CityLandingContent({ city }: { city: CityData }) {
  const servingLine = [city.name, ...city.nearbyCities].join(", ");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hero-glow" />
        <div className="container-site relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel text-accent text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              Dental IT in {city.name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.08] mb-8"
          >
            Managed IT Services for Dental Practices in{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              {city.name}, FL
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-secondary leading-relaxed mb-10"
          >
            Red Rose Technologies provides specialized IT support for dental
            offices in {city.name} and surrounding areas. As a Microsoft Partner
            with expertise in HIPAA compliance and dental practice management
            software, we help {city.name} dentists secure patient data, prevent
            downtime, and streamline operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-brand-700/20 flex items-center justify-center gap-2 group"
            >
              Schedule a Free IT Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:9548571100"
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-raised text-ink rounded-xl font-semibold text-lg transition-all border border-line"
            >
              Call (954) 857-1100
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-faded font-medium"
          >
            {["HIPAA Compliant", "Microsoft Partner", "24/7 Monitoring", `Local to ${city.name}`].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────── */}
      <section className="section-padding bg-panel border-y border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">
              Why Us
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">
              Why {city.name} Dental Practices Choose Red Rose Technologies
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: "HIPAA Compliance Automation",
                detail:
                  "Continuous monitoring, encryption, and documentation",
              },
              {
                icon: Scan,
                title: "Microsoft Sentinel SIEM",
                detail: "Advanced threat detection and response",
              },
              {
                icon: Plug,
                title: "Practice Management Integration",
                detail:
                  "Seamless support for Dentrix, Eaglesoft, Open Dental",
              },
              {
                icon: MapPin,
                title: "Local Support",
                detail: `On-site service in ${city.name}, ${city.nearbyCities.join(", ")}, and ${city.county} County`,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6 rounded-2xl flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-ink font-bold mb-1">{item.title}</h3>
                  <p className="text-faded text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className="section-padding border-b border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-4">
              Services for {city.name} Dental Offices
            </h2>
            <p className="text-secondary text-lg">
              Flat-rate pricing. No hidden fees. HIPAA compliance included in
              every tier.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`glass-card rounded-2xl p-8 flex flex-col ${
                  tier.popular ? "ring-2 ring-accent relative" : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-ink mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-ink">
                    ${tier.price}
                  </span>
                  <span className="text-faded text-sm">{tier.unit}</span>
                </div>
                <p className="text-faded text-sm mb-6 leading-relaxed">
                  {tier.description}
                </p>
                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-secondary text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all text-sm ${
                    tier.popular
                      ? "bg-brand-700 hover:bg-brand-800 text-white shadow-lg shadow-brand-700/25"
                      : "border border-line text-ink hover:bg-raised/50"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-faded text-sm mt-8">
            Custom pricing available for practices with 10+ users.
          </p>
        </div>
      </section>

      {/* ── Common Challenges ────────────────────────────── */}
      <section className="section-padding bg-panel border-b border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">
              Challenges
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink">
              Common IT Challenges for {city.name} Dental Practices
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {challenges.map((c, i) => (
              <motion.div
                key={c}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-ink font-medium text-sm leading-relaxed">
                  {c}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serving Line ─────────────────────────────────── */}
      <section className="py-8 border-b border-line">
        <div className="container-site text-center">
          <p className="text-secondary text-sm">
            <strong className="text-ink">Serving:</strong> {servingLine}, and
            throughout {city.county} County
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <FAQSection
        heading={`Dental IT FAQ — ${city.name}`}
        faqs={[
          {
            question: `What is HIPAA compliance for dental practices in ${city.name}?`,
            answer:
              "HIPAA compliance requires dental practices to protect patient health information through administrative, physical, and technical safeguards. Red Rose Technologies provides automated compliance monitoring, encryption, access controls, and security risk assessments tailored to dental workflows.",
          },
          {
            question: "Do I need a Business Associate Agreement (BAA)?",
            answer:
              "Yes. Any vendor with access to your electronic protected health information (ePHI) must sign a BAA. Red Rose Technologies provides HIPAA-compliant BAAs for all managed service clients.",
          },
          {
            question: "What happens if my practice management system goes down?",
            answer:
              "Our 24/7 monitoring detects outages immediately. Core Shield clients receive response within 4 hours, Advanced Guard within 2 hours, and Total Command clients within 1 hour with priority escalation.",
          },
          {
            question: "Can you help with Windows 10 end-of-life migration?",
            answer:
              "Yes. We provide Windows 11 migration planning, hardware compatibility assessments, and phased rollouts to minimize disruption to patient care.",
          },
          {
            question: "What dental practice management software do you support?",
            answer:
              "We specialize in Dentrix, Eaglesoft, Open Dental, Curve Dental, and other cloud-based and on-premise dental software platforms.",
          },
        ]}
      />

      {/* ── CTA ──────────────────────────────────────────── */}
      <CTABanner
        heading={`Ready to Fix IT for Your ${city.name} Practice?`}
        subtitle="We'll run a free checkup on your network, show you where the gaps are, and give you an honest plan. No pitch, no pressure."
        primaryLabel="Schedule a Free IT Assessment"
      />
    </>
  );
}
