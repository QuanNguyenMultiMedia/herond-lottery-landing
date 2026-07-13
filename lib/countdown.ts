"use client";

import { useEffect, useState } from "react";
import { WeekMeta } from "@/data/season";

const MONTH_INDEX: Record<string, number> = { June: 5, July: 6, August: 7 };

export interface CountdownState {
  active: boolean;
  label: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

function computeCountdown(weeksMeta: WeekMeta[], drawTime: string, now: number): CountdownState {
  const [hRaw, mRaw] = drawTime.split(":");
  const drawH = parseInt(hRaw, 10) || 0;
  const drawM = parseInt(mRaw, 10) || 0;

  let next: { date: Date; meta: WeekMeta } | null = null;
  for (const meta of weeksMeta) {
    const date = new Date(meta.year, MONTH_INDEX[meta.month], meta.day, drawH, drawM, 0);
    if (date.getTime() > now) {
      next = { date, meta };
      break;
    }
  }

  if (!next) {
    return { active: false, label: "", days: "00", hours: "00", mins: "00", secs: "00" };
  }

  let diff = Math.max(0, Math.floor((next.date.getTime() - now) / 1000));
  const days = Math.floor(diff / 86400);
  diff %= 86400;
  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;

  return {
    active: true,
    label: `Monday, ${next.meta.day} ${next.meta.month}`,
    days: pad(days),
    hours: pad(hours),
    mins: pad(mins),
    secs: pad(secs),
  };
}

const INITIAL_STATE: CountdownState = {
  active: false,
  label: "",
  days: "00",
  hours: "00",
  mins: "00",
  secs: "00",
};

/**
 * Live countdown to the next Monday weekly draw, ticking every second.
 * Starts inactive so server and first client render match exactly, then
 * computes the real value on mount — avoids a hydration mismatch from
 * server/client clock skew.
 */
export function useCountdown(weeksMeta: WeekMeta[], drawTime: string): CountdownState {
  const [state, setState] = useState<CountdownState>(INITIAL_STATE);

  useEffect(() => {
    const tick = () => setState(computeCountdown(weeksMeta, drawTime, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weeksMeta, drawTime]);

  return state;
}
