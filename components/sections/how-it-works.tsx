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
                    {active === i && i === 0 && (
                      <CtaLink className="mt-3 px-6 py-3 text-[14px]">
                        <PointIcon className="size-4" />
                        Install Herond
                      </CtaLink>
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
            <div className="flex flex-col overflow-hidden rounded-[17px] bg-card lg:block">
              {/* Mobile/tablet: image up top for thumb reach, then the body copy
                  (height fixed to the tallest step's copy so switching steps never
                  shifts the layout), then tabs pinned to the bottom (the desktop
                  rail replaces all of this at lg+). */}
              <div className="order-1 px-5 pb-5 pt-5 lg:order-none">
                <div className="relative mx-auto aspect-[1200/1142] w-full max-w-[420px] overflow-hidden rounded-xl">
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

                <div
                  className={`mt-5 flex justify-center lg:hidden ${
                    active === 0 ? "" : "invisible"
                  }`}
                  aria-hidden={active !== 0}
                >
                  <CtaLink className="px-6 py-3 text-[14px]" tabIndex={active === 0 ? 0 : -1}>
                    <PointIcon className="size-4" />
                    Install Herond
                  </CtaLink>
                </div>
              </div>

              <p className="order-2 flex min-h-[130px] items-center justify-center text-pretty px-6 py-4 text-center text-[13.5px] leading-relaxed text-muted-foreground lg:order-none lg:hidden">
                {step.body}
              </p>

              <div className="order-3 grid grid-cols-1 border-t border-white/[0.06] sm:grid-cols-3 lg:order-none lg:hidden">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
