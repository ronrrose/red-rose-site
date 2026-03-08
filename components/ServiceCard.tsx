"use client";

import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

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
            <Link
                href={href}
                className="block glass-card p-8 rounded-2xl hover:bg-dark-800/80 transition-all group h-full"
            >
                <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors text-brand-400">
                    <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{description}</p>
                <span className="inline-flex items-center gap-1.5 text-brand-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                </span>
            </Link>
        </motion.div>
    );
}
