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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 50%, var(--hero-glow), transparent)` }}
      />

      <div className="container-site relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center glass-card"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-ink mb-6">
            {heading}
          </h2>
          <p className="text-lg text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={primaryHref}
              className="w-full sm:w-auto px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-brand-700/20 flex items-center justify-center gap-2 group"
            >
              {primaryLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={secondaryHref}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-raised text-ink rounded-xl font-bold text-lg transition-all border border-line"
            >
              {secondaryLabel}
            </Link>
          </div>

          {bullets.length > 0 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 text-sm text-faded font-medium">
              {bullets.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
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
