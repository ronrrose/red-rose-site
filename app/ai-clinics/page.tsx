import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { CheckCircle2, Users, Lightbulb, Presentation, Gift, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI & Automation Clinics",
  description:
    "Hands-on AI workshops for local businesses. 3-session clinic series teaching real automation workflows for dental, healthcare, legal, nonprofits & SMBs in Lakewood Ranch, Sarasota & Tampa Bay.",
};

const sessions = [
  {
    number: "01",
    title: "AI Foundations — What Actually Works Right Now",
    bullets: [
      "Demystify AI buzzwords — separate hype from reality",
      "Live demos of ChatGPT, Google Gemini, and Microsoft Copilot for business tasks",
      "Identify your top 3 time-wasting workflows to automate first",
      "Leave with an AI action plan customized to your role",
    ],
  },
  {
    number: "02",
    title: "Hands-On Automation — Build Your First Workflows",
    bullets: [
      "Create automated email responses, scheduling, and follow-ups",
      "Build AI-powered document templates for your industry",
      "Set up no-code automation with Zapier, Make, or Power Automate",
      "Practice prompt engineering until it clicks",
    ],
  },
  {
    number: "03",
    title: "Security, Ethics & Scaling — Do It Right",
    bullets: [
      "Understand AI risks: data privacy, hallucinations, compliance gaps",
      "HIPAA / regulatory-safe AI usage patterns for healthcare & legal",
      "Create an AI governance policy for your organization",
      "Plan your 90-day automation roadmap",
    ],
  },
];

const whoItsFor = [
  "Practice managers drowning in admin tasks",
  "Business owners tired of hearing about AI but not seeing results",
  "Office managers who want to stop doing the same task 50 times a week",
  "Nonprofits running lean who need to multiply their impact",
  "Anyone whose team is still copy-pasting between systems",
];

const whatYouGet = [
  "3 x 90-minute live, interactive sessions",
  "Hands-on exercises — you leave with working automations",
  "Custom AI action plan for your business",
  "Access to private resource library of prompts & templates",
  "30-day post-clinic email support from Ron Rose",
  "Certificate of completion",
];

export default function AIClinicsPage() {
  return (
    <>
      <Hero
        badge="Flagship Program"
        title={
          <>
            AI &amp; Automation{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              Clinics
            </span>
          </>
        }
        subtitle="Three hands-on sessions that teach your team to actually use AI — not theory, not slides, real workflows that save hours every week. Built for local businesses that can't afford to fall behind."
        primaryCta={{ label: "Reserve Your Seat", href: "/contact" }}
        secondaryCta={{ label: "Host a Clinic", href: "/contact" }}
      />

      {/* ── 3-Session Breakdown ── */}
      <section className="section-padding border-t border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">The Curriculum</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Three Sessions. Real Results.</h2>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {sessions.map((s) => (
              <div key={s.number} className="glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-6 right-8 text-6xl font-black text-brand-500/10 select-none">
                  {s.number}
                </div>
                <p className="text-brand-400 text-sm font-semibold mb-2">Session {s.number}</p>
                <h3 className="text-2xl font-bold text-white mb-5">{s.title}</h3>
                <ul className="space-y-3">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-[15px]">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who This Is For ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Who This Is For</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                If You&apos;re Curious About AI but Tired of the Hype, This Is for You
              </h2>
              <ul className="space-y-4">
                {whoItsFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Users className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">What You Get</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                No Fluff. Walk Away with Working Automations.
              </h2>
              <ul className="space-y-4">
                {whatYouGet.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Gift className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Simple. Structured. Effective.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: Presentation, title: "Book or Host", desc: "Sign up for a public clinic or host a private session for your team, chamber, or SBDC group." },
              { step: "2", icon: Lightbulb, title: "Learn & Build", desc: "Attend 3 interactive sessions. Bring your laptop. Leave with real automations running." },
              { step: "3", icon: CheckCircle2, title: "Implement & Scale", desc: "Use your 90-day roadmap and post-clinic support to roll out AI across your organization." },
            ].map((s) => (
              <div key={s.step} className="glass-card p-8 rounded-2xl text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-brand-600/30">
                  {s.step}
                </div>
                <s.icon className="w-8 h-8 text-brand-400 mx-auto mb-4 mt-3" />
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Host / Partner ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site text-center max-w-3xl mx-auto">
          <Building2 className="w-12 h-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Host a Clinic for Your Community
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-4">
            Are you a chamber of commerce, SBDC, SCORE chapter, or business association like the LWRBA? Partner with us to bring AI &amp; automation training to your members — at no cost to your organization.
          </p>
          <p className="text-slate-400 mb-8">
            We provide everything: curriculum, materials, instructor (Ron Rose), and follow-up resources. You provide the venue and the audience.
          </p>
          <a
            href="/contact"
            className="inline-flex px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-600/25"
          >
            Partner With Us
          </a>
        </div>
      </section>

      {/* ── Instructor Bio ── */}
      <section className="section-padding">
        <div className="container-site">
          <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-28 h-28 rounded-2xl bg-dark-700 shrink-0" />
              <div>
                <p className="text-brand-400 font-semibold text-sm mb-1">Your Instructor</p>
                <h3 className="text-2xl font-bold text-white mb-4">Ron Rose</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Ron Rose is the founder of Red Rose Technologies and a Google AI Essentials certified professional with CompTIA IT Fundamentals+ credentials. With deep experience in HIPAA-compliant IT for dental practices and a passion for making AI accessible to non-technical business owners, Ron built the AI &amp; Automation Clinics to bridge the gap between cutting-edge tools and everyday business operations.
                </p>
                <p className="text-slate-400 text-sm">
                  Based in Lakewood Ranch, FL — serving Bradenton, Sarasota, Manatee County, and the greater Tampa Bay area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Ready to Stop Guessing About AI?"
        subtitle="Reserve your seat in the next AI & Automation Clinic or bring one to your organization."
        primaryLabel="Reserve Your Seat"
        secondaryLabel="Host a Clinic"
      />
    </>
  );
}
