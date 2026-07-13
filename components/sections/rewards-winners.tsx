"use client";

import { useEffect, useMemo, useState } from "react";
import { TiltCard } from "@/components/tilt-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { PointIcon, LinePointIcon } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function RewardsWinners() {
  const [weeksData, setWeeksData] = useState<WeekEntry[]>(FALLBACK_WEEKS);
  const [finalData, setFinalData] = useState<FinalData>(FALLBACK_FINAL);
  const [active, setActive] = useState<Target>(1);

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
        cardBorder: "1.5px solid rgba(255,195,0,0.25)",
        cardShadow: "0 0 48px rgba(255,195,0,0.12), 0 8px 32px rgba(0,0,0,0.45)",
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
      cardBorder: "none",
      cardShadow: "none",
      lockedTitle: `Week ${active} — Coming Soon`,
      lockedSub: `Winners announced on ${ordinal(meta.day)} ${meta.month} ${meta.year}`,
    };
  }, [active, byWeek, finalData]);

  return (
    <section id="rewards" className="flex min-h-svh flex-col justify-center py-[clamp(40px,6vw,72px)]">
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading eyebrow="Rewards" title="$10,000 Up for grabs" />
        <p className="-mt-6 mb-10 max-w-[520px] text-pretty text-[15px] text-muted-foreground">
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

        <div className="mt-12 flex justify-center">
          <Tabs
            value={String(active)}
            onValueChange={(v) => setActive(v === "final" ? "final" : Number(v))}
          >
            <TabsList className="h-auto max-w-full flex-wrap gap-1 rounded-full bg-[#1c1c1e] p-1">
              {WEEKS_META.map((m) => (
                <TabsTrigger
                  key={m.week}
                  value={String(m.week)}
                  className="rounded-full px-4.5 py-2 text-[13px] font-semibold"
                >
                  Week {m.week}
                </TabsTrigger>
              ))}
              <TabsTrigger value="final" className="rounded-full px-4.5 py-2 text-[13px] font-semibold">
                Grand Draw
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
          ? "border-[1.5px] border-[rgba(255,195,0,0.25)] p-[22px] shadow-[0_0_48px_rgba(255,195,0,0.12),0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-[0_0_64px_rgba(255,195,0,0.22),0_12px_36px_rgba(0,0,0,0.5)]"
          : "p-[22px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(51,115,246,0.18),0_0_0_1px_rgba(51,115,246,0.3)]"
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[.06em]"
          style={{ background: badgeBg, color: badgeColor }}
        >
          <PointIcon className="size-3" style={{ color: badgeColor }} /> {badge}
        </div>
        <div className="text-[13px] font-semibold text-muted-foreground">{cadence}</div>
      </div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[30px] font-extrabold tracking-[-0.02em] tabular-nums">{amount}</div>
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
