import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { ShieldCheck, Users, Lightbulb, HeartHandshake, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About / Why Red Rose",
  description:
    "Red Rose Technologies: operator-first AI, automation, and managed IT. Google AI certified, CompTIA credentialed. Founded by Ron Rose in Lakewood Ranch, FL.",
};

const differentiators = [
  {
    icon: Lightbulb,
    title: "Operator-First Thinking",
    description:
      "We don't sell technology for technology's sake. Every recommendation starts with understanding your workflows, your team, and your bottom line.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Is the Foundation",
    description:
      "HIPAA, SOC 2, and regulatory requirements aren't add-ons. They're baked into every solution from day one.",
  },
  {
    icon: Users,
    title: "We Speak Your Industry",
    description:
      "We know Dentrix, Clio, QuickBooks, and the tools your team relies on. We don't waste your time learning your business on your dime.",
  },
  {
    icon: HeartHandshake,
    title: "Partnership, Not Vendor Lock-In",
    description:
      "No long-term contracts. No hidden fees. We earn your business every month by delivering results — not by trapping you in a contract.",
  },
];

const credentials = [
  { label: "Google AI Essentials", detail: "Certified in practical AI application for business automation and decision-making." },
  { label: "CompTIA IT Fundamentals+", detail: "Industry-standard credential covering IT infrastructure, security, and networking." },
  { label: "HIPAA Security Specialist", detail: "Deep expertise in healthcare data protection, risk assessments, and compliance documentation." },
  { label: "Microsoft 365 Administration", detail: "Proficiency in deployment, security, and management of Microsoft cloud ecosystems." },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        badge="About Red Rose Technologies"
        title={
          <>
            Built by an Operator,{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              for Operators
            </span>
          </>
        }
        subtitle="Red Rose Technologies isn't another faceless IT company. It's a business built by someone who understands what it's like to run one — and what it costs when technology doesn't work."
        primaryCta={{ label: "Work With Us", href: "/contact" }}
        secondaryCta={{ label: "See Our Services", href: "/managed-it" }}
      />

      {/* ── Our Story ── */}
      <section className="section-padding border-t border-dark-700/30">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Why Red Rose Technologies Exists
            </h2>
            <div className="text-slate-300 text-lg leading-relaxed space-y-6 text-left">
              <p>
                I started Red Rose Technologies because I saw the same pattern everywhere: local businesses — dental practices, law firms, nonprofits, shops — getting sold technology they didn&apos;t need by vendors who didn&apos;t understand their operations.
              </p>
              <p>
                They were paying for break-fix IT that waited for things to break. They were told AI was &ldquo;the future&rdquo; but given no roadmap to get there. And worse, they were being left exposed on compliance and security because their IT provider treated it as an afterthought.
              </p>
              <p>
                I built Red Rose Technologies to be different. We lead with security. We build with compliance. And we teach business owners how to use AI and automation tools that actually move the needle — not just the ones that look good in a demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 Differentiators ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">What Makes Us Different</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Four Principles We Never Compromise
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {differentiators.map((d) => (
              <div key={d.title} className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-5 text-brand-400">
                  <d.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{d.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credentials ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Credentials</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Certified. Proven. Trusted.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {credentials.map((c) => (
              <div key={c.label} className="glass-card p-6 rounded-2xl flex items-start gap-4">
                <Award className="w-8 h-8 text-brand-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-bold mb-1">{c.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal Note ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-24 h-24 rounded-2xl bg-dark-700 shrink-0" />
              <div>
                <p className="text-brand-400 font-semibold text-sm mb-1">A Note from the Founder</p>
                <h3 className="text-2xl font-bold text-white mb-4">Ron Rose</h3>
                <div className="text-slate-300 leading-relaxed space-y-4 text-[15px]">
                  <p>
                    If you&apos;re reading this, you probably know something isn&apos;t working with your current IT situation. Maybe it&apos;s the vendor who takes three days to respond. Maybe it&apos;s the nagging feeling that your patient data isn&apos;t actually secure. Maybe you keep hearing about AI but have no idea where to start.
                  </p>
                  <p>
                    I&apos;ve been there. I know what it feels like to run a business where technology is supposed to help but instead it just creates more problems. That&apos;s exactly why I built Red Rose Technologies.
                  </p>
                  <p>
                    I&apos;d love to talk. No pitch, no pressure — just a real conversation about what&apos;s going on and whether we can help.
                  </p>
                  <p className="text-brand-400 font-semibold">— Ron Rose, Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Let's Start a Conversation"
        subtitle="Reach out for a free, no-obligation assessment. If we're a fit, great. If not, you'll still walk away with actionable insights."
        primaryLabel="Book a Call with Ron"
      />
    </>
  );
}
