import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { ArrowRight, BookOpen, Shield, Bot } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, articles, and tools for AI automation, cybersecurity, and HIPAA compliance from Red Rose Technologies.",
};

const articles = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "5 AI Automations Every Dental Office Should Set Up This Week",
    excerpt:
      "Stop copy-pasting patient reminders, appointment confirmations, and intake forms. These five no-code automations can be set up in under an hour.",
    tag: "Guide",
  },
  {
    icon: Shield,
    category: "Cybersecurity",
    title: "The SMB Cybersecurity Checklist: 12 Things to Do Before You Get Hacked",
    excerpt:
      "Most small businesses think they're too small to be targeted. They're wrong. Here's a practical, no-jargon checklist to lock things down.",
    tag: "Checklist",
  },
  {
    icon: BookOpen,
    category: "Compliance",
    title: "HIPAA Compliance in 2026: What's Changed and What You Need to Know",
    excerpt:
      "New enforcement priorities, updated breach notification rules, and telehealth-specific requirements. Here's what practices need to act on now.",
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
            Insights &amp; Guides for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              Smarter Business
            </span>
          </>
        }
        subtitle="Practical articles, checklists, and guides on AI automation, cybersecurity, and compliance — written for business owners, not engineers."
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
              More resources coming soon. Want early access?{" "}
              <Link href="/contact" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Get on the list →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CTABanner
        heading="Don't Wait for a Blog Post"
        subtitle="Get personalized advice for your business right now. Schedule a free assessment."
        primaryLabel="Book Your Free Call"
      />
    </>
  );
}
