"use client";

import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MagicCard from "@/components/magicui/magic-card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function ServiceCard({ icon: Icon, title, description, href }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <MagicCard className="glass-card h-full">
        <Link
          href={href}
          className="group flex h-full flex-col gap-5 p-8 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent">
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-ink">{title}</h3>
          <p className="text-secondary text-[15px] leading-relaxed flex-1">{description}</p>
          <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold group-hover:gap-2.5 transition-all">
            Learn more <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </MagicCard>
    </motion.div>
  );
}
