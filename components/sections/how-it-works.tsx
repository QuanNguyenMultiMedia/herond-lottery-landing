import Link from "next/link";
import { TiltCard } from "@/components/tilt-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { HEROND_POINT_LINK } from "@/data/season";

const STEPS = [
  {
    n: 1,
    title: "Install",
    body: "Get Herond Browser on iOS, Android, or desktop. Under a minute.",
    link: "Download now →",
  },
  {
    n: 2,
    title: "Check in daily",
    body: "Log in to Herond Point and check in every day to collect your tickets.",
  },
  {
    n: 3,
    title: "Stay active, win more",
    body: "Check in 5 of 7 days for a bonus ticket. Every ticket automatically enters each Monday's Weekly Draw and the Grand Draw at season's end.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-[clamp(40px,6vw,72px)]">
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading eyebrow="How it works" title="Three steps to your first ticket" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <TiltCard
              key={step.n}
              className="px-[22px] py-6 hover:shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_0_1px_rgba(51,115,246,0.25)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[var(--hp-cta-from)] to-[var(--hp-cta-to)] text-base font-extrabold text-white">
                {step.n}
              </div>
              <h3 className="mb-1 text-[15px] font-bold">{step.title}</h3>
              <p className="text-[13px] text-muted-foreground">{step.body}</p>
              {step.link && (
                <Link
                  href={HEROND_POINT_LINK}
                  target="_blank"
                  className="mt-3 inline-block text-[12.5px] font-bold text-primary no-underline hover:text-[#5e8ff8]"
                >
                  {step.link}
                </Link>
              )}
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
