"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureItem {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface FeatureGridProps {
    label?: string;
    heading: string;
    subtitle?: string;
    items: FeatureItem[];
    columns?: 2 | 3;
}

export default function FeatureGrid({
    label,
    heading,
    subtitle,
    items,
    columns = 3,
}: FeatureGridProps) {
    const gridClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

    return (
        <section className="section-padding relative">
            <div className="container-site">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    {label && (
                        <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">
                            {label}
                        </p>
                    )}
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        {heading}
                    </h2>
                    {subtitle && (
                        <p className="text-slate-400 text-lg leading-relaxed">{subtitle}</p>
                    )}
                </div>

                <div className={`grid ${gridClass} gap-8`}>
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="glass-card p-8 rounded-2xl hover:bg-dark-800/80 transition-colors"
                        >
                            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-5 text-brand-400">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
