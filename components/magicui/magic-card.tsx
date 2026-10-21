"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

/**
 * A card that lights up where the cursor is. The highlight is a soft radial
 * wash in brand red rather than a hard ring, so a grid of these reads as
 * depth rather than decoration.
 */
export default function MagicCard({
  children,
  className,
  gradientSize = 260,
  gradientColor = "139, 26, 26",
  gradientOpacity = 0.12,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -gradientSize, y: -gradientSize });
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleMove = useCallback((e: MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    // Pointer-driven only: skip entirely on touch and for reduced motion.
    if (!el || reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [handleMove, reduceMotion]);

  return (
    <div
      ref={cardRef}
      className={cn("group relative overflow-hidden rounded-2xl", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, rgba(${gradientColor}, ${gradientOpacity}), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
