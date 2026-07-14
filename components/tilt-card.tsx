"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
}

/**
 * A surface card with a restrained hover response: a small lift and a border
 * that warms up. The earlier version applied a mouse-driven 3D tilt to every
 * card, which read as a demo gimmick — we now spend motion only where it earns
 * attention and keep the resting state calm.
 */
export function TiltCard({ children, className, ...props }: TiltCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "rounded-2xl border border-border bg-card transition-colors duration-200 ease-out hover:border-white/15",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
