"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { CtaLink } from "@/components/cta-link";

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
      className="relative flex flex-col items-center justify-center overflow-hidden py-[clamp(96px,14vw,180px)] text-center"
    >
      <div
        className="fc-glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-[90px]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(51,115,246,0.5), rgba(102,81,234,0.35), rgba(255,128,151,0.3), rgba(51,115,246,0.5))",
        }}
      />
      <div className="relative mx-auto max-w-[1080px] px-6">
        <div className="fc-amount mb-3.5 text-[clamp(52px,7.5vw,88px)] font-bold leading-none tracking-[-0.03em] tabular-nums text-foreground drop-shadow-[0_0_30px_rgba(51,115,246,0.35)]">
          $10,000
          <span className="ml-2.5 text-[0.32em] font-medium text-muted-foreground">pool</span>
        </div>
        <h2 className="fc-title mb-2.5 text-[clamp(22px,2.8vw,30px)] font-semibold tracking-[-0.02em]">
          Your next check-in could be the one.
        </h2>
        <p className="fc-copy mb-[34px] text-pretty text-[15px] text-muted-foreground">
          Free to start. One check-in a day. Install Herond and you&apos;re in.
        </p>
        <div className="fc-cta inline-block">
          <CtaLink className="px-8 py-4 text-base">
            <video
              src="/assets/herond-icon-loop.webm"
              autoPlay
              loop
              muted
              playsInline
              className="block h-[22px] w-[22px]"
            />
            Install Herond — Get Your First Ticket
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
