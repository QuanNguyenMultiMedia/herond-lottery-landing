"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TiltCard } from "@/components/tilt-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { PointIcon, LinePointIcon } from "@/components/icons";
import { GradientText } from "@/components/gradient-text";
import { fetchWinners } from "@/lib/winners";
import {
  WEEKS_META,
  FALLBACK_WEEKS,
  FALLBACK_FINAL,
  SHEET_URL,
  WeekEntry,
  FinalData,
} from "@/data/season";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

type Target = number | "final";

const NAV_ITEMS: { value: Target; label: string }[] = [
  ...WEEKS_META.map((m) => ({ value: m.week, label: `Week ${m.week}` })),
  { value: "final" as const, label: "Grand Draw" },
];
const VISIBLE_COUNT = 3;

export function RewardsWinners() {
  const [weeksData, setWeeksData] = useState<WeekEntry[]>(FALLBACK_WEEKS);
  const [finalData, setFinalData] = useState<FinalData>(FALLBACK_FINAL);
  const [active, setActive] = useState<Target>(1);
  const [navStart, setNavStart] = useState(0);
  const maxNavStart = NAV_ITEMS.length - VISIBLE_COUNT;
  const visibleItems = NAV_ITEMS.slice(navStart, navStart + VISIBLE_COUNT);

  useEffect(() => {
    fetchWinners(SHEET_URL).then((data) => {
      if (!data) return;
      if (data.weeks?.length) setWeeksData(data.weeks);
      if (data.final?.drawn) setFinalData(data.final);
    });
  }, []);

  const byWeek = useMemo(() => {
    const map = new Map<number, WeekEntry>();
    weeksData.forEach((w) => map.set(w.week, w));
    return map;
  }, [weeksData]);

  const panel = useMemo(() => {
    if (active === "final") {
      const isDrawn = !!(finalData.drawn && finalData.draws.length);
      return {
        title: "Season 1 Grand Draw Winners",
        isDrawn,
        draws: isDrawn ? finalData.draws : [],
        badgeText: isDrawn
          ? `${finalData.draws.length} draw${finalData.draws.length > 1 ? "s" : ""}`
          : "Coming Soon",
        badgeBg: "rgba(255,195,0,0.12)",
        badgeColor: "#ffd60a",
        cardBorder: "1px solid rgba(255,214,10,0.24)",
        cardShadow: "none",
        lockedTitle: "Coming Soon",
        lockedSub: "Winners announced at the end of Season 1",
      };
    }

    const meta = WEEKS_META.find((m) => m.week === active) ?? WEEKS_META[0];
    const entry = byWeek.get(active);
    const isDrawn = !!(entry && entry.draws.length);
    return {
      title: `Week ${active} Winners`,
      isDrawn,
      draws: isDrawn ? entry!.draws : [],
      badgeText: isDrawn
        ? `${entry!.draws.length} draw${entry!.draws.length > 1 ? "s" : ""}`
        : "Coming Soon",
      badgeBg: isDrawn ? "rgba(40,201,104,0.12)" : "rgba(116,116,128,0.18)",
      badgeColor: isDrawn ? "#28c968" : "rgba(235,235,245,0.6)",
      cardBorder: "1px solid var(--border)",
      cardShadow: "none",
      lockedTitle: `Week ${active} — Coming Soon`,
      lockedSub: `Winners announced on ${ordinal(meta.day)} ${meta.month} ${meta.year}`,
    };
  }, [active, byWeek, finalData]);

  return (
    <section id="rewards" className="py-[clamp(72px,10vw,128px)]">
      <div className="mx-auto w-full min-w-0 max-w-[1080px] px-6">
        <SectionHeading
          eyebrow="Rewards"
          title={
            <>
              <GradientText className="rounded-lg bg-background px-1">$10,000</GradientText> Up for grabs
            </>
          }
        />
        <p className="-mt-6 mb-10 max-w-[420px] text-pretty text-[15px] text-muted-foreground">
          Real prizes every week, plus a Grand Draw built from every ticket you&apos;ve earned all
          season.
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PoolCard
            badge="WEEKLY POOL"
            badgeColor="#3373f6"
            badgeBg="rgba(51,115,246,0.12)"
            cadence="Every Sunday"
            amount="Up to $400"
            winners="30"
            note="Each weekly draw uses only that week's tickets."
            prizes={[
              "$20 (ETH on Base)",
              "$10 (ETH on Base)",
              "$5 (ETH on Base)",
              "Google Play $10",
              "Starbucks $5",
            ]}
          />
          <PoolCard
            badge="GRAND DRAW POOL"
            badgeColor="#ffd60a"
            badgeBg="rgba(255,195,0,0.12)"
            cadence="End of Season 1"
            amount="Up to $8,000"
            winners="500+"
            note="Every ticket you've earned all season counts, plus any bonus tickets."
            prizes={[
              "$1,500 (ETH on Base)",
              "$400 (ETH on Base)",
              "$200 (ETH on Base)",
              "$10 (ETH on Base)",
              "Google Play $10",
              "$5 (ETH on Base)",
              "Starbucks $5",
            ]}
            glow
          />
        </div>

        {/* Mobile: a 3-item window with prev/next arrows (fits without wrapping or scrolling). */}
        <div className="mt-12 flex items-center justify-center gap-2 sm:hidden">
          <button
            type="button"
            aria-label="Show earlier weeks"
            onClick={() => setNavStart((s) => Math.max(0, s - 1))}
            disabled={navStart === 0}
            className="flex size-9 flex-none items-center justify-center rounded-full border border-border bg-[#161617] text-white/70 transition-colors hover:border-white/15 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex min-w-0 justify-center gap-1 rounded-full border border-border bg-[#161617] p-1">
            {visibleItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActive(item.value)}
                aria-pressed={active === item.value}
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                  active === item.value
                    ? "bg-[#2c2c2e] font-semibold text-foreground shadow-sm"
                    : "text-foreground/55 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Show later weeks"
            onClick={() => setNavStart((s) => Math.min(maxNavStart, s + 1))}
            disabled={navStart >= maxNavStart}
            className="flex size-9 flex-none items-center justify-center rounded-full border border-border bg-[#161617] text-white/70 transition-colors hover:border-white/15 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Wider screens: room for the full range at once, no arrows needed. */}
        <div className="mt-12 hidden flex-wrap items-center justify-center gap-1.5 rounded-full border border-border bg-[#161617] p-1.5 sm:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setActive(item.value)}
              aria-pressed={active === item.value}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                active === item.value
                  ? "bg-[#2c2c2e] font-semibold text-foreground shadow-sm"
                  : "text-foreground/55 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div
            className="overflow-hidden rounded-2xl bg-card"
            style={{ border: panel.cardBorder, boxShadow: panel.cardShadow }}
          >
            <div className="flex items-center justify-between border-b border-border px-[22px] py-4">
              <h3 className="text-[15px] font-bold">{panel.title}</h3>
              <span
                className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ background: panel.badgeBg, color: panel.badgeColor }}
              >
                {panel.badgeText}
              </span>
            </div>
            <div className="hp-scroll max-h-[640px] overflow-y-auto px-[22px] pt-1.5 pb-[18px]">
              {panel.isDrawn ? (
                panel.draws.map((draw, i) => (
                  <div key={i} className="border-b border-white/[0.06] py-4 last:border-b-0">
                    <div className="text-[13px] font-bold text-foreground">{draw.title}</div>
                    <div className="my-0.5 mb-3 text-[11px] text-white/30">{draw.time}</div>
                    <div className="grid grid-cols-1 gap-x-4.5 gap-y-2 sm:grid-cols-2">
                      {draw.winners.map((name, wi) => (
                        <div key={wi} className="flex items-center gap-2.5">
                          <span className="flex h-[25px] w-[25px] flex-none items-center justify-center rounded-lg bg-primary/[0.12] font-mono text-[10.5px] font-bold text-primary">
                            {String(wi + 1).padStart(2, "0")}
                          </span>
                          <span className="font-mono text-[12.5px] text-muted-foreground">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3.5 py-4.5">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-[#2d2d2e]">
                    <LinePointIcon className="size-5 text-white/30" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 text-[14.5px] font-bold">{panel.lockedTitle}</h4>
                    <p className="text-[12.5px] text-white/30">{panel.lockedSub}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PoolCardProps {
  badge: string;
  badgeColor: string;
  badgeBg: string;
  cadence: string;
  amount: string;
  winners: string;
  note: string;
  prizes: string[];
  glow?: boolean;
}

function PoolCard({
  badge,
  badgeColor,
  badgeBg,
  cadence,
  amount,
  winners,
  note,
  prizes,
  glow,
}: PoolCardProps) {
  return (
    <TiltCard
      className={
        glow
          ? "border-[rgba(255,214,10,0.28)] p-6 hover:border-[rgba(255,214,10,0.45)]"
          : "p-6"
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[.08em]"
          style={{ background: badgeBg, color: badgeColor }}
        >
          <PointIcon className="size-3" style={{ color: badgeColor }} /> {badge}
        </div>
        <div className="text-[13px] font-medium text-muted-foreground">{cadence}</div>
      </div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[32px] font-bold tracking-[-0.02em] tabular-nums">{amount}</div>
        <div className="text-[13px] text-muted-foreground">
          <b className="text-[15px] text-foreground">{winners}</b> winners{" "}
          {winners === "500+" ? "" : "/ week"}
        </div>
      </div>
      <p className="mb-4 text-pretty text-[13px] leading-snug text-muted-foreground">{note}</p>
      <div className="mb-3.5 h-px bg-[var(--hp-hairline)]" />
      <div className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[.1em] text-white/30">
        Prize breakdown
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prizes.map((prize) => (
          <span
            key={prize}
            className="whitespace-nowrap rounded-full bg-[var(--hp-muted-pill)] px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground"
          >
            {prize}
          </span>
        ))}
      </div>
    </TiltCard>
  );
}
