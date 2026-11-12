"use client";

import Reveal from "@/components/Reveal";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MagicCard from "@/components/magicui/magic-card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  /** Verb plus thing, e.g. "See the AI clinics". Never "Learn more". */
  cta: string;
}

export default function ServiceCard({ icon: Icon, title, description, href, cta }: ServiceCardProps) {
  return (
    <Reveal>
      <MagicCard className="glass-card h-full">
        <Link
          href={href}
          className="group flex h-full flex-col gap-5 p-8 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent">
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-ink">{title}</h3>
          <p className="text-secondary text-sm leading-relaxed flex-1">{description}</p>
          <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold group-hover:gap-2.5 transition-all">
            {cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </Link>
      </MagicCard>
    </Reveal>
  );
}
