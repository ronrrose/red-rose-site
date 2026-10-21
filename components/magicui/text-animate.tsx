"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextAnimateProps {
  children: string;
  className?: string;
  delay?: number;
  /** Seconds between each word settling. */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}

/**
 * Reveals a line word by word. The words rise and unblur on a short stagger,
 * which reads as considered rather than animated.
 *
 * The full string stays available to assistive tech as one label, so the
 * per-word spans never fragment the heading for a screen reader.
 */
export default function TextAnimate({
  children,
  className,
  delay = 0,
  stagger = 0.055,
  as: Tag = "span",
}: TextAnimateProps) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: "0.4em", filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Tag className={cn(className)}>
      <motion.span
        aria-label={children}
        initial="hidden"
        animate="visible"
        variants={container}
        className="inline"
      >
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            variants={word}
            aria-hidden="true"
            className="inline-block whitespace-pre"
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
