"use client";

import Link from "next/link";
import { Button } from "@/components/animate-ui/primitives/buttons/button";
import { cn } from "@/lib/utils";
import { HEROND_POINT_LINK } from "@/data/season";

interface CtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  pulse?: boolean;
  children: React.ReactNode;
}

/** Primary blue gradient CTA — matches the source's `neonPulse`-animated buttons. */
export function CtaLink({ pulse = true, className, children, href, ...props }: CtaLinkProps) {
  return (
    <Button asChild hoverScale={1.02} tapScale={0.98}>
      <Link
        href={href ?? HEROND_POINT_LINK}
        target={href ? "_blank" : undefined}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-b from-[var(--hp-cta-from)] to-[var(--hp-cta-to)] px-7 py-3.5 text-[15px] font-bold text-white no-underline hover:text-white",
          pulse && "animate-[hp-neon-pulse_2s_ease-in-out_infinite]",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    </Button>
  );
}
