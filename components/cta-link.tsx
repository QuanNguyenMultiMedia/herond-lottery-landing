"use client";

import Link from "next/link";
import { Button } from "@/components/animate-ui/primitives/buttons/button";
import { cn } from "@/lib/utils";
import { useDownloadLink } from "@/lib/download-link";

interface CtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

/**
 * Primary action. One confident blue button — a static soft glow gives it
 * presence without the restless neon pulse the whole page used to carry.
 * Defaults to a link resolved client-side to the visitor's OS/arch installer
 * (or App Store / Play Store); pass an explicit `href` to override.
 */
export function CtaLink({ className, children, href, ...props }: CtaLinkProps) {
  const smartHref = useDownloadLink();

  return (
    <Button asChild hoverScale={1.015} tapScale={0.985}>
      <Link
        href={href ?? smartHref}
        target="_blank"
        className={cn(
          "inline-flex items-center gap-2.5 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_-6px_rgba(51,115,246,0.55)] transition-[background-color,box-shadow] hover:bg-[#4680ff] hover:text-white hover:shadow-[0_10px_30px_-6px_rgba(51,115,246,0.7)]",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    </Button>
  );
}
