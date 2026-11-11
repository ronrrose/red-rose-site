"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds before this element settles. Stagger siblings with it. */
  delay?: number;
}

/**
 * Scroll reveal that can never hide content.
 *
 * framer-motion's whileInView server-renders its opening frame, so the HTML
 * shipped text at opacity:0 and only JavaScript could show it. If hydration
 * failed, or a crawler read the HTML, the content was invisible.
 *
 * Here the server HTML is plain and visible. After mount, only an element
 * that starts below the fold is hidden, and the IntersectionObserver shows it
 * as it scrolls in: rise 32px and fade, 700ms on the house curve, once.
 * Anything already on screen is left alone, so there is no flash. Reduced
 * motion (the OS setting or the site's accessibility panel) skips the effect.
 */
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.classList.contains("a11y-reduce-motion")) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("reveal-pending");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        if (delay) el.style.transitionDelay = `${delay}ms`;
        el.classList.remove("reveal-pending");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("reveal-pending");
    };
  }, [delay]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
