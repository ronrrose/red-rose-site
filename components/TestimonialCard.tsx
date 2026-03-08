"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
    quote: string;
    name: string;
    role: string;
    stars?: number;
}

export default function TestimonialCard({
    quote,
    name,
    role,
    stars = 5,
}: TestimonialCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 rounded-2xl"
        >
            <div className="flex gap-1 mb-5">
                {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                ))}
            </div>
            <blockquote className="text-white font-medium leading-relaxed mb-6 text-[15px]">
                &ldquo;{quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-700" />
                <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-brand-400 text-xs">{role}</p>
                </div>
            </div>
        </motion.div>
    );
}
