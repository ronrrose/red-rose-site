"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before this element settles. Stagger siblings with it. */
  delay?: number;
  /** Travel distance in px. Keep it small; the settle should feel weighted. */
  offset?: number;
  blur?: string;
  once?: boolean;
}

/**
 * The reveal used across the site: content lifts a short distance, unblurs and
 * settles. Deliberately understated, with no bounce or overshoot.
 */
export default function BlurFade({
  children,
  className,
  delay = 0,
  offset = 16,
  blur = "6px",
  once = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-64px" });
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: offset, filter: `blur(${blur})` },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  // Readers who asked for less motion still get the content, just immediately.
  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        delay: 0.04 + delay,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
