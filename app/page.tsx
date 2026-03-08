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
        subtitle="Red Rose Technologies helps dental practices, healthcare providers, legal firms, nonprofits, and SMBs across Tampa Bay automate operations, lock down compliance, and stop wasting money on IT that doesn't perform."
        primaryCta={{ label: "Get a Free Assessment", href: "/contact" }}
        secondaryCta={{ label: "Explore AI Clinics", href: "/ai-clinics" }}
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
            <h2 className="text-3xl md:text-5xl font-bold text-white">Three Ways We Transform Your Business</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={Bot}
              title="AI & Automation Clinics"
              description="Hands-on workshops that teach your team to use AI tools right now — not theory, real workflows that save hours every week."
              href="/ai-clinics"
            />
            <ServiceCard
              icon={Shield}
              title="Managed IT & Security"
              description="Proactive, compliance-first IT management. HIPAA, SOC 2, and cybersecurity built in — not bolted on."
              href="/managed-it"
            />
            <ServiceCard
              icon={Building2}
              title="Industries We Serve"
              description="Deep expertise in dental, healthcare, legal, nonprofits, and SMBs. We speak your language and know your software."
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
              Built for Operators Who Can&apos;t Afford to Break Things
            </h2>
            <p className="text-slate-400 text-lg">
              We work with businesses that need their technology to work — reliably, securely, and without surprises on the invoice.
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
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Client Results</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Trusted by Local Businesses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Red Rose Technologies handled our Dentrix migration without a single hour of downtime. Their HIPAA expertise gave us complete peace of mind."
              name="Dr. Sarah Jenkins, DDS"
              role="Jenkins Family Dentistry, Lakewood Ranch"
            />
            <TestimonialCard
              quote="The AI clinic changed how we run our back office. We automated our intake forms and scheduling follow-ups — saving us 10+ hours a week."
              name="Maria Gonzalez"
              role="Operations Director, Sarasota Nonprofit"
            />
            <TestimonialCard
              quote="We finally have an IT partner who understands compliance. Their proactive monitoring caught a vulnerability before it became a headline."
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
