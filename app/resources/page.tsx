import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { ArrowRight, BookOpen, Shield, Bot } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, checklists, and plain-English articles on AI, cybersecurity, and HIPAA compliance from Red Rose Technologies.",
};

const articles = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "5 AI Automations Every Dental Office Should Set Up This Week",
    excerpt:
      "Stop copy-pasting patient reminders, appointment confirmations, and intake forms. These five no-code automations take under an hour to set up.",
    tag: "Guide",
  },
  {
    icon: Shield,
    category: "Cybersecurity",
    title: "The SMB Cybersecurity Checklist: 12 Things to Do Before You Get Hacked",
    excerpt:
      "Most small businesses think they're too small to get targeted. They're not. Here's a plain-English checklist to lock things down.",
    tag: "Checklist",
  },
  {
    icon: BookOpen,
    category: "Compliance",
    title: "HIPAA in 2026: What Changed and What You Need to Do Now",
    excerpt:
      "New enforcement priorities, updated breach rules, and telehealth-specific requirements. Here's what your practice needs to act on.",
    tag: "Article",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Hero
        badge="Resources"
        title={
          <>
            Guides & Articles for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              Real Business Owners
            </span>
          </>
        }
        subtitle="Practical stuff on AI, cybersecurity, and compliance. Written for people who run businesses, not for engineers."
        primaryCta={{ label: "Get a Free Assessment", href: "/contact" }}
      />

      <section className="section-padding border-t border-dark-700/30">
        <div className="container-site">
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.title} className="glass-card rounded-2xl overflow-hidden group hover:bg-dark-800/80 transition-colors flex flex-col">
                {/* Colored header bar */}
                <div className="h-48 bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center">
                  <article.icon className="w-16 h-16 text-brand-400/40" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">{article.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">{article.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 leading-snug">{article.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{article.excerpt}</p>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-brand-400 text-sm font-semibold group-hover:gap-2.5 transition-all"
                  >
                    Coming Soon <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-slate-400 text-lg">
              More on the way. Want to know when they drop?{" "}
              <Link href="/contact" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Get on the list →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Don't Wait for a Blog Post"
        subtitle="Get real advice for your business right now. Let's hop on a call."
        primaryLabel="Book a Free Call"
      />
    </>
  );
}
