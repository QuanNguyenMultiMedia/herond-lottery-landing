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
 * Brand-color glow behind a numeral/word — same four hues as the footer
 * aurora (blue/purple/pink/red), blended with mix-blend-lighten since the
 * site only has a dark theme (no light-mode variant needed).
 */
function GradientText({ className, children, as: Component = "span", ...props }: GradientTextProps) {
  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent className={cn("relative inline-flex overflow-hidden bg-background", className)} {...props}>
      {children}
      {/* Edge-masked so a blob mid-travel gets soft-clipped instead of showing
          a hard ellipse edge against the container bounds; heavier blur keeps
          each color point diffuse even before it reaches the mask falloff. */}
      <span
        className="pointer-events-none absolute inset-0 mix-blend-lighten"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 100%)",
        }}
      >
        <span className="pointer-events-none absolute -top-1/2 h-[30vw] w-[30vw] animate-[gradient-border_6s_ease-in-out_infinite,gradient-1_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--gradient-1))] mix-blend-overlay blur-[2.5rem]"></span>
        <span className="pointer-events-none absolute right-0 top-0 h-[30vw] w-[30vw] animate-[gradient-border_6s_ease-in-out_infinite,gradient-2_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--gradient-2))] mix-blend-overlay blur-[2.5rem]"></span>
        <span className="pointer-events-none absolute bottom-0 left-0 h-[30vw] w-[30vw] animate-[gradient-border_6s_ease-in-out_infinite,gradient-3_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--gradient-3))] mix-blend-overlay blur-[2.5rem]"></span>
        <span className="pointer-events-none absolute -bottom-1/2 right-0 h-[30vw] w-[30vw] animate-[gradient-border_6s_ease-in-out_infinite,gradient-4_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--gradient-4))] mix-blend-overlay blur-[2.5rem]"></span>
      </span>
      {/* Grain — same idea as the footer aurora's per-pixel dither, keeps the
          blended color flat from reading as a smooth CG gradient. */}
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
