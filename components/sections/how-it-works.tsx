"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/sections/section-heading";
import { CtaLink } from "@/components/cta-link";
import { PointIcon } from "@/components/icons";

const STEPS = [
  {
    n: 1,
    title: "Install",
    body: "Get Herond Browser on iOS, Android, or desktop. Under a minute.",
    image: "/assets/how-it-works/step-1.webp",
    width: 1200,
    height: 1142,
  },
  {
    n: 2,
    title: "Check in daily",
    body: "Log in to Herond Point and check in every day to collect your tickets.",
    image: "/assets/how-it-works/step-2.webp",
    width: 1200,
    height: 1142,
  },
  {
    n: 3,
    title: "Stay active, win more",
    body: "Check in 5 of 7 days for a bonus ticket. Every ticket automatically enters each Sunday's Weekly Draw and the Grand Draw at season's end.",
    image: "/assets/how-it-works/step-3.webp",
    width: 1200,
    height: 1142,
  },
] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="how" className="py-[clamp(72px,10vw,128px)]">
      <div className="mx-auto w-full max-w-[1080px] px-6">
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-14">
          <div>
            <SectionHeading eyebrow="How it works" title="Three steps to your first ticket" />
            <p className="-mt-6 mb-10 max-w-[460px] text-pretty text-[15px] text-muted-foreground lg:mb-0 lg:max-w-none">
              That prize money above is real — here&apos;s exactly how you get in on it.
            </p>

            {/* Desktop: vertical step list doubles as the section's left rail. */}
            <div className="mt-6 hidden lg:block lg:space-y-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                    active === i ? "bg-card" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-extrabold ${
                      active === i
                        ? "bg-gradient-to-b from-[var(--hp-cta-from)] to-[var(--hp-cta-to)] text-white"
                        : "bg-[#2d2d2e] text-white/40"
                    }`}
                  >
                    {s.n}
                  </span>
                  <div>
                    <div
                      className={`text-[14px] font-bold ${active === i ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.title}
                    </div>
                    {active === i && (
                      <p className="mt-1 text-pretty text-[13px] leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="mt-8 rounded-2xl p-px shadow-[0_24px_60px_-30px_rgba(37,99,235,0.45)] lg:mt-0"
            style={{
              background:
                "linear-gradient(150deg, rgba(51,115,246,0.55), rgba(102,81,234,0.4) 45%, rgba(255,128,151,0.35) 100%)",
            }}
          >
            <div className="overflow-hidden rounded-[17px] bg-card">
              {/* Mobile/tablet: horizontal tabs (the desktop rail replaces these at lg+). */}
              <div className="grid grid-cols-1 border-b border-white/[0.06] sm:grid-cols-3 lg:hidden">
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    className={`flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3.5 text-left transition-colors last:border-b-0 sm:border-b-0 sm:not-last:border-r sm:border-white/[0.06] ${
                      active === i ? "bg-[var(--card-hover)]" : "hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-extrabold ${
                        active === i
                          ? "bg-gradient-to-b from-[var(--hp-cta-from)] to-[var(--hp-cta-to)] text-white"
                          : "bg-[#2d2d2e] text-white/40"
                      }`}
                    >
                      {s.n}
                    </span>
                    <span
                      className={`text-[13.5px] font-bold ${active === i ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>

              <p className="flex h-[84px] items-center justify-center text-pretty px-6 text-center text-[13.5px] text-muted-foreground lg:hidden">
                {step.body}
              </p>

              <div className="px-5 pb-5 lg:pt-5">
                <div className="relative mx-auto aspect-[1200/1142] w-full max-w-[420px] overflow-hidden rounded-xl bg-background">
                  <Image
                    key={step.image}
                    src={step.image}
                    alt={step.title}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 1024px) 100vw, 420px"
                    priority={active === 0}
                  />
                </div>

                {active === 0 && (
                  <div className="mt-5 flex justify-center">
                    <CtaLink className="px-6 py-3 text-[14px]">
                      <PointIcon className="size-4" />
                      Install Herond
                    </CtaLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
