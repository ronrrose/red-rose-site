import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import DotPattern from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

interface HeroProps {
  badge?: string;
  title: ReactNode;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  trustItems?: string[];
}

/**
 * The hero reveal is pure CSS on purpose.
 *
 * An earlier version drove it with framer-motion, which meant the opening
 * state (opacity 0, blurred) was server-rendered and only cleared once React
 * hydrated. When hydration failed the heading stayed invisible. CSS animation
 * runs regardless of whether any JavaScript executes, uses `both` fill so the
 * final state sticks, and is neutralised by the global prefers-reduced-motion
 * rule in globals.css. It also ships no JS at all: this is a server component.
 */
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
      {/* Static dot field under the brand glow. Both are inert. */}
      <DotPattern
        className={cn(
          "fill-ink/[0.05]",
          "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,white,transparent)]"
        )}
      />
      <div className="absolute inset-0 pointer-events-none hero-glow" />

      <div className="container-site relative z-10 text-center">
        {badge && (
          <div className="animate-settle">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel text-accent text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              {badge}
            </span>
          </div>
        )}

        <h1
          className="animate-settle text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink leading-[1.08] mb-8"
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h1>

        <p
          className="animate-settle max-w-2xl mx-auto text-lg md:text-xl text-secondary leading-relaxed mb-10"
          style={{ animationDelay: "180ms" }}
        >
          {subtitle}
        </p>

        {(primaryCta || secondaryCta) && (
          <div
            className="animate-settle flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            style={{ animationDelay: "280ms" }}
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
          </div>
        )}

        {trustItems && trustItems.length > 0 && (
          <div
            className="animate-settle flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-faded font-medium"
            style={{ animationDelay: "400ms" }}
          >
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
