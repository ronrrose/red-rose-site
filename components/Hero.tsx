"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

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
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none animate-blob" />
            <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: "4s" }} />

            <div className="container-site relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-brand-300 text-sm font-medium mb-8"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse-slow" />
                            {badge}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

                    {(primaryCta || secondaryCta) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            {primaryCta && (
                                <Link
                                    href={primaryCta.href}
                                    className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 group"
                                >
                                    {primaryCta.label}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                            {secondaryCta && (
                                <Link
                                    href={secondaryCta.href}
                                    className="w-full sm:w-auto px-8 py-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-semibold transition-all border border-dark-700"
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
                            transition={{ duration: 1, delay: 0.8 }}
                            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-400"
                        >
                            {trustItems.map((item, i) => (
                                <span key={i} className="flex items-center gap-2 text-sm font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                    {item}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
