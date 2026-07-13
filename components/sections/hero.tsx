"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
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
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const html = document.documentElement;

    // Only fly the hero panel in once per browser session — on later loads
    // (refresh, back/forward, revisits within the same tab session) skip
    // straight to the settled state instead of replaying the intro.
    if (sessionStorage.getItem("hp-intro-played")) {
      html.classList.add("intro-ready");
      return;
    }
    sessionStorage.setItem("hp-intro-played", "1");

    const run = () => {
      // Lock scroll first so the scrollbar-gutter change can't shift viewport width
      // out from under our px-based centering below.
      document.body.style.overflow = "hidden";

      // hp-border-spin/hp-float run as CSS animations on this element and both touch
      // `transform` — left running, they'd fight gsap's own transform every frame
      // (the visible "double image" jitter). Pause them for the intro, resume after.
      const prevAnimationPlayState = panel.style.animationPlayState;
      panel.style.animationPlayState = "paused";

      const rect = panel.getBoundingClientRect();
      const winH = window.innerHeight;
      // Plain px math instead of xPercent/yPercent — a transform-percent computed
      // in the same batch as a fresh `width`/`height` set was landing off-center
      // (it was reading the pre-resize box), so pin the exact centered left/top here.
      const startLeft = window.innerWidth / 2 - rect.width / 2;
      const holdTop = winH / 2 - rect.height / 2;

      gsap.set(panel, {
        position: "fixed",
        top: winH,
        left: startLeft,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 70,
        opacity: 0,
        scale: 1.12,
      });

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        gsap.set(panel, { clearProps: "all" });
        panel.style.animationPlayState = prevAnimationPlayState;
        document.body.style.overflow = "";
        html.classList.add("intro-ready");
      };

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: finish,
      });

      tl.to(panel, { opacity: 1, top: holdTop, duration: 1, ease: "power2.out" })
        .to(panel, { duration: 0.55 })
        .to(panel, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          scale: 1,
          duration: 0.9,
          ease: "power3.inOut",
        });

      // requestAnimationFrame (and so this gsap timeline) is throttled/paused while
      // the tab is backgrounded — without a hard fallback, a user who switches tabs
      // mid-intro could get stuck with the rest of the page hidden indefinitely.
      window.setTimeout(() => {
        if (!finished) {
          tl.progress(1);
          finish();
        }
      }, 4000);
    };

    // Measuring rect before fonts/layout settle is what caused the intro to fly to
    // a slightly-wrong (undersized, off-center) final spot. Wait for fonts, then
    // flush layout with a couple of rAFs before taking that measurement.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(run));
    });
  }, []);

  return (
    <section className="relative flex min-h-svh items-center py-[clamp(48px,7vw,88px)]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-14 px-6 md:grid-cols-2">
        <div className="hero-intro-text">
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

          <p className="mb-[26px] max-w-[460px] text-pretty text-lg text-muted-foreground">
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
            ref={panelRef}
            className="hero-video-panel animate-[hp-border-spin_4s_linear_infinite,hp-float_8s_ease-in-out_infinite] w-full max-w-[400px] rounded-2xl p-0.5 shadow-[0_0_24px_rgba(37,99,235,0.25)]"
            style={{
              background:
                "conic-gradient(from var(--hp-angle), rgba(51,115,246,0) 0%, rgba(51,115,246,0.9) 12%, rgba(102,81,234,0.9) 22%, rgba(51,115,246,0) 38%, rgba(51,115,246,0) 55%, rgba(255,128,151,0.7) 68%, rgba(51,115,246,0) 82%)",
            }}
          >
            <div className="relative aspect-[716/482] overflow-hidden rounded-[26.8px] bg-background">
              <video
                src="/assets/hero-showcase.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="block h-full w-full rounded-[26.8px] bg-background object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
