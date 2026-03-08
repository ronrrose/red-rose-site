"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CTABannerProps {
  heading?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  bullets?: string[];
}

export default function CTABanner({
  heading = "Let's Fix Your IT",
  subtitle = "We'll take a look at your setup, tell you what's working and what's not, and give you an honest plan. Free. No strings.",
  primaryLabel = "Get a Free Checkup",
  primaryHref = "/contact",
  secondaryLabel = "Call Ron",
  secondaryHref = "/contact",
  bullets = [
    "No Contracts",
    "No Hidden Fees",
    "Free Dark Web Scan",
  ],
}: CTABannerProps) {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-900/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-brand-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-site relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center border border-brand-500/20 glass-card"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {heading}
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={primaryHref}
              className="w-full sm:w-auto px-8 py-4 bg-white text-dark-900 hover:bg-brand-50 rounded-xl font-bold text-lg transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 group"
            >
              {primaryLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={secondaryHref}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 text-white rounded-xl font-bold text-lg transition-all border border-dark-600"
            >
              {secondaryLabel}
            </Link>
          </div>

          {bullets.length > 0 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 text-sm text-slate-400 font-medium">
              {bullets.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  {b}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
