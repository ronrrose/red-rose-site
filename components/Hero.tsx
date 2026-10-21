"use client";

import { motion, useReducedMotion } from "framer-motion";
import DotPattern from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
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
  const reduceMotion = useReducedMotion();

  /**
   * The settle: content lifts a little and unblurs on a long ease-out. No
   * overshoot. Honour prefers-reduced-motion by rendering the end state.
   */
  const settle = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: {
            duration: 0.75,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background: static dot field under the brand glow. Both are inert. */}
      <DotPattern
        className={cn(
          "fill-ink/[0.05]",
          "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,white,transparent)]"
        )}
      />
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="container-site relative z-10 text-center">
        <motion.div {...settle(0)}>
          {badge && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel text-accent text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              {badge}
            </span>
          )}
        </motion.div>

        <motion.h1
          {...settle(0.08)}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.08] mb-8"
        >
          {title}
        </motion.h1>

        <motion.p
          {...settle(0.18)}
          className="max-w-2xl mx-auto text-lg md:text-xl text-secondary leading-relaxed mb-10"
        >
          {subtitle}
        </motion.p>

        {(primaryCta || secondaryCta) && (
          <motion.div
            {...settle(0.28)}
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
            {...settle(0.4)}
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
