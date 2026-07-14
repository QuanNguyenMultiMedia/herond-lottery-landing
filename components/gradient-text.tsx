"use client";

import React from "react";
import { motion, MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

interface GradientTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * Brand-color wash behind a numeral/word — same four hues as the footer
 * aurora (blue/purple/pink/red), as a slow-panning linear gradient. An
 * earlier version used four blurred, independently-animated color blobs
 * blended with mix-blend-lighten; at any given frame two blobs could
 * dominate and read as a garish soft ellipse. A plain gradient can't do that.
 */
function GradientText({ className, children, as: Component = "span", ...props }: GradientTextProps) {
  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent className={cn("relative inline-flex overflow-hidden bg-background", className)} {...props}>
      {children}
      <span
        className="pointer-events-none absolute inset-0 animate-[gradient-pan_10s_ease-in-out_infinite] mix-blend-lighten"
        style={{
          backgroundImage:
            "linear-gradient(115deg, hsl(var(--gradient-1)), hsl(var(--gradient-2)), hsl(var(--gradient-3)), hsl(var(--gradient-4)))",
          backgroundSize: "280% 280%",
        }}
      />
      {/* Grain — same idea as the footer aurora's per-pixel dither, keeps the
          gradient from reading as a flat CG wash. */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </MotionComponent>
  );
}

export { GradientText };
