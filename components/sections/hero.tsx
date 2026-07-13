"use client";

import { CtaLink } from "@/components/cta-link";
import { useCountdown } from "@/lib/countdown";
import { WEEKS_META, DRAW_TIME } from "@/data/season";

const COUNTDOWN_UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "mins", label: "Mins" },
  { key: "secs", label: "Secs" },
] as const;

export function Hero() {
  const cd = useCountdown(WEEKS_META, DRAW_TIME);

  return (
    <section className="relative py-[clamp(48px,7vw,88px)]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-14 px-6 md:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-[#1e1e1f] px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground">
            <span className="h-1.5 w-1.5 animate-[hp-pulse_2s_ease-in-out_infinite] rounded-full bg-[var(--hp-success)]" />
            Season 1 Grand Launch ·{" "}
            <span className="font-bold text-primary">$10,000 Lottery Pool</span>
          </div>

          <h1 className="mb-[18px] text-[clamp(38px,4.8vw,62px)] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Check in daily.
            <br />
            <span className="text-primary">Win real rewards</span>
            <br />
            every week.
          </h1>

          <p className="mb-[26px] max-w-[460px] text-lg text-muted-foreground">
            Every check-in earns a ticket. Every ticket is a shot at the $10,000 pool!
          </p>

          {cd.active && (
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3.5">
                <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[2.75px] text-muted-foreground">
                  Next Weekly Draw
                </span>
                <span className="h-px max-w-[120px] flex-1 bg-[var(--hp-hairline)]" />
                <span className="text-xs font-semibold text-muted-foreground">{cd.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COUNTDOWN_UNITS.map((unit) => (
                  <div
                    key={unit.key}
                    className="min-w-[60px] rounded-[10px] bg-[#1e1e1f] px-2 py-2.5 text-center"
                  >
                    <div
                      className={`text-2xl font-extrabold leading-[1.1] tracking-[-0.01em] tabular-nums ${
                        unit.key === "secs" ? "text-primary" : ""
                      }`}
                    >
                      {cd[unit.key]}
                    </div>
                    <div className="mt-[3px] text-[10px] font-semibold uppercase tracking-[.1em] text-white/30">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CtaLink>
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
          <div className="mt-4 text-[12.5px] text-white/30">
            Free to enter · 1-minute install · Tickets never expire
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="animate-[hp-border-spin_4s_linear_infinite,hp-float_8s_ease-in-out_infinite] w-full max-w-[400px] rounded-2xl p-0.5 shadow-[0_0_24px_rgba(37,99,235,0.25)]"
            style={{
              background:
                "conic-gradient(from var(--hp-angle), rgba(51,115,246,0) 0%, rgba(51,115,246,0.9) 12%, rgba(102,81,234,0.9) 22%, rgba(51,115,246,0) 38%, rgba(51,115,246,0) 55%, rgba(255,128,151,0.7) 68%, rgba(51,115,246,0) 82%)",
            }}
          >
            <video
              src="/assets/hero-showcase.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="block w-full rounded-[14px] bg-background"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
