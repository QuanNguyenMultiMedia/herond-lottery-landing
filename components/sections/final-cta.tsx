"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { CtaLink } from "@/components/cta-link";
import { PointIcon } from "@/components/icons";
import { GradientText } from "@/components/gradient-text";

export function FinalCta() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        defaults: { ease: "power3.out" },
      });
      tl.from(".fc-glow", { opacity: 0, scale: 0.6, duration: 1.1 })
        .from(".fc-amount", { opacity: 0, y: 24, duration: 0.7 }, "-=0.7")
        .from(".fc-title", { opacity: 0, y: 18, duration: 0.6 }, "-=0.4")
        .from(".fc-copy", { opacity: 0, y: 14, duration: 0.5 }, "-=0.35")
        .from(".fc-cta", { opacity: 0, y: 14, scale: 0.94, duration: 0.5 }, "-=0.3");

      gsap.to(".fc-glow", {
        rotate: 360,
        duration: 26,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative flex flex-col items-center justify-center overflow-hidden py-[clamp(80px,12vw,140px)] text-center"
    >
      <div
        className="fc-glow pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(51,115,246,0.5), rgba(102,81,234,0.35), rgba(255,128,151,0.3), rgba(51,115,246,0.5))",
        }}
      />

      {/* The product is a lottery ticket — the closing CTA is shaped like one:
          a stub of prize + a stub of action, torn apart by a perforated seam.
          The two stubs are separate elements with a real gap between them so
          the notch bites are genuine cutouts (whatever's behind shows through),
          not a solid patch painted to guess-match the background. */}
      <div className="relative mx-auto w-full max-w-[540px] px-6">
        <GradientText
          as="div"
          className="block w-full rounded-t-[28px] border border-b-0 border-border bg-card shadow-[0_-20px_50px_-36px_rgba(0,0,0,0.6)]"
          style={{
            maskImage:
              "radial-gradient(circle 14px at 0 100%, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 100%, transparent 14px, black 15px)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "radial-gradient(circle 14px at 0 100%, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 100%, transparent 14px, black 15px)",
            WebkitMaskComposite: "source-in",
          }}
        >
          <div className="relative z-10 px-8 pb-9 pt-11 sm:px-12">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              Season 1 Grand Draw
            </div>
            <div className="fc-amount mb-1.5 text-[clamp(46px,8.5vw,76px)] font-bold leading-none tracking-[-0.03em] tabular-nums text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              $10,000
            </div>
            <div className="text-[12.5px] font-semibold uppercase tracking-[.12em] text-white/75 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              Total prize pool
            </div>
          </div>
        </GradientText>

        <div className="relative h-6">
          <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-[var(--hp-hairline)]" />
        </div>

        <div
          className="relative overflow-hidden rounded-b-[28px] border border-t-0 border-border bg-card shadow-[0_40px_90px_-36px_rgba(0,0,0,0.6)]"
          style={{
            maskImage:
              "radial-gradient(circle 14px at 0 0, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 0, transparent 14px, black 15px)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "radial-gradient(circle 14px at 0 0, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 0, transparent 14px, black 15px)",
            WebkitMaskComposite: "source-in",
          }}
        >
          <div className="px-8 pb-11 pt-9 sm:px-12">
            <h2 className="fc-title mb-2.5 text-[clamp(20px,2.4vw,26px)] font-semibold tracking-[-0.02em]">
              Your next check-in could be the one.
            </h2>
            <p className="fc-copy mb-7 text-pretty text-[14.5px] text-muted-foreground">
              Free to start. One check-in a day. Install Herond and you&apos;re in.
            </p>
            <div className="fc-cta inline-flex flex-col items-center gap-2.5">
              <div className="text-[12px] font-semibold uppercase tracking-[.12em] text-primary/70">
                Get Your First Ticket
              </div>
              <CtaLink className="px-8 py-3.5 text-base">
                <PointIcon className="size-[18px]" />
                Install Herond
              </CtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
