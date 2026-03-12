"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  label: string;
  heading: string;
  subtitle?: string;
  items: Feature[];
  columns?: 2 | 3;
}

export default function FeatureGrid({
  label,
  heading,
  subtitle,
  items,
  columns = 3,
}: FeatureGridProps) {
  return (
    <section className="section-padding border-t border-line">
      <div className="container-site">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">{label}</p>
          <h2 className="text-3xl md:text-5xl font-bold text-ink">{heading}</h2>
          {subtitle && (
            <p className="text-secondary text-lg mt-5">{subtitle}</p>
          )}
        </div>

        <div className={`grid md:grid-cols-${columns} gap-8 ${columns === 2 ? "max-w-4xl mx-auto" : ""}`}>
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-8 rounded-2xl"
            >
              <div className="w-12 h-12 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl flex items-center justify-center mb-5 text-accent">
                <item.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>
              <p className="text-faded text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
