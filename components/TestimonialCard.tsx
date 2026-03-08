"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  rating?: number;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-8 flex flex-col"
    >
      <div className="flex gap-1 mb-5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <blockquote className="text-secondary text-[15px] leading-relaxed flex-1 mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div>
        <p className="text-ink font-semibold text-sm">{name}</p>
        <p className="text-faded text-xs mt-0.5">{role}</p>
      </div>
    </motion.div>
  );
}
