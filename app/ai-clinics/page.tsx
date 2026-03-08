import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { CheckCircle2, Users, Lightbulb, Presentation, Gift, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI & Automation Clinics",
  description:
    "Hands-on AI workshops for local businesses in Lakewood Ranch, Sarasota, and Tampa Bay. Three sessions. Real automations. No fluff.",
};

const sessions = [
  {
    number: "01",
    title: "AI Basics That Actually Matter",
    bullets: [
      "We cut through the buzzwords and show you what AI can do right now",
      "Live demos with ChatGPT, Google Gemini, and Microsoft Copilot on real business tasks",
      "You'll pick your top 3 time-wasters and we'll figure out how to automate them",
      "You leave with a custom action plan for your specific role",
    ],
  },
  {
    number: "02",
    title: "Build Your First Automations (For Real)",
    bullets: [
      "Set up automated email replies, scheduling, and follow-ups",
      "Create AI-powered document templates for your industry",
      "Connect tools with Zapier, Make, or Power Automate. No coding.",
      "Practice writing prompts until you actually get good at it",
    ],
  },
  {
    number: "03",
    title: "Do It Right, Then Scale It",
    bullets: [
      "Learn what can go wrong with AI: privacy, bad outputs, compliance risks",
      "HIPAA-safe and regulation-safe ways to use AI in healthcare and legal",
      "Write an AI policy your team can actually follow",
      "Map out your 90-day plan to roll this out across your org",
    ],
  },
];

const whoItsFor = [
  "Practice managers buried in admin work",
  "Business owners who keep hearing about AI but haven't seen real results",
  "Office managers doing the same task 50 times a week",
  "Nonprofits running lean who need to do more with less",
  "Anyone whose team still copy-pastes between systems",
];

const whatYouGet = [
  "3 live, interactive sessions (90 minutes each)",
  "Hands-on exercises. You leave with working automations.",
  "A custom AI action plan built around your business",
  "Access to our private prompt and template library",
  "30 days of email support from Ron after the clinic",
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
        subtitle="Three sessions that teach your team to actually use AI. Not theory. Not slides. You'll build real automations and leave with tools that save you hours every week."
        primaryCta={{ label: "Save My Spot", href: "/contact" }}
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
                Curious About AI but Tired of the Hype?
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
                No Fluff. Working Automations.
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
            <h2 className="text-3xl md:text-5xl font-bold text-white">Pretty Simple, Actually</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: Presentation, title: "Book or Host", desc: "Sign up for a public clinic, or bring a private one to your team, chamber, or SBDC group." },
              { step: "2", icon: Lightbulb, title: "Show Up & Build", desc: "Attend 3 sessions. Bring your laptop. You'll leave with real automations actually running." },
              { step: "3", icon: CheckCircle2, title: "Roll It Out", desc: "Use your 90-day roadmap and post-clinic support to spread it across your team." },
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
            Bring a Clinic to Your Community
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-4">
            Chambers of commerce, SBDCs, SCORE chapters, the LWRBA, or any business group. We'll bring the whole thing to your members for free.
          </p>
          <p className="text-slate-400 mb-8">
            We handle everything: curriculum, materials, instruction, and follow-up. You bring the room and the people.
          </p>
          <a
            href="/contact"
            className="inline-flex px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-600/25"
          >
            Let&apos;s Set It Up
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
                  I'm Ron. I run Red Rose Technologies and I built these clinics because I got tired of watching local businesses get left behind on AI. I'm Google AI Essentials certified, CompTIA credentialed, and I've spent years in HIPAA-compliant IT for dental practices. I know what works for non-technical teams because I've sat across the table from them hundreds of times.
                </p>
                <p className="text-slate-400 text-sm">
                  Based in Lakewood Ranch, FL. Serving Bradenton, Sarasota, Manatee County, and the greater Tampa Bay area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Want to Stop Guessing About AI?"
        subtitle="Grab a seat in the next clinic or bring one to your group. Either way, you'll leave knowing exactly what to do."
        primaryLabel="Save My Spot"
        secondaryLabel="Host a Clinic"
      />
    </>
  );
}
