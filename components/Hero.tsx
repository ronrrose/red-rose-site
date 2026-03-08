"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  badge?: string;
  title: ReactNode;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  trustItems?: string[];
}

export default function Hero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  trustItems,
}: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--hero-glow), transparent)`,
        }}
      />

      <div className="container-site relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {badge && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel text-accent text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              {badge}
            </span>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.08] mb-8"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-secondary leading-relaxed mb-10"
        >
          {subtitle}
        </motion.p>

        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="w-full sm:w-auto px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-brand-700/20 flex items-center justify-center gap-2 group"
              >
                {primaryCta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-raised text-ink rounded-xl font-semibold text-lg transition-all border border-line"
              >
                {secondaryCta.label}
              </Link>
            )}
          </motion.div>
        )}

        {trustItems && trustItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-faded font-medium"
          >
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
