import { Draw, FinalData, WeekEntry } from "@/data/season";

interface SheetData {
  weeks: WeekEntry[];
  final: FinalData | null;
}

interface GvizCell {
  v: unknown;
  f?: string;
}

interface GvizRow {
  c: (GvizCell | null)[];
}

/** Converts a Google Sheet share URL into its gviz JSON query endpoint. */
function toGvizEndpoint(url: string): string {
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (match && !url.includes("gviz")) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:json`;
  }
  return url;
}

/** The gviz endpoint wraps its JSON in a JS callback; strip it before parsing. */
function parseGviz(text: string): SheetData | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;

  const json = JSON.parse(text.slice(start, end + 1));
  const rows: GvizRow[] = json?.table?.rows ?? [];

  const byWeek: Record<number, Draw[]> = {};
  const final: FinalData = { drawn: false, draws: [] };

  for (const row of rows) {
    const cells = row.c ?? [];
    const cell = (i: number) => {
      const c = cells[i];
      if (!c) return "";
      return c.f ?? c.v ?? "";
    };

    const week = String(cell(0) ?? "").trim().toLowerCase();
    const title = String(cell(1) ?? "").trim();
    const time = String(cell(2) ?? "").trim();
    const winners = String(cell(3) ?? "")
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title || !winners.length) continue;
    const draw: Draw = { title, time, winners };

    const isGrand = week === "grand" || week === "final" || week === "grand draw" ||
      (!week && /grand/i.test(title));

    if (isGrand) {
      final.drawn = true;
      final.draws.push(draw);
    } else {
      const n = parseInt(week.replace(/[^0-9]/g, ""), 10);
      if (!n) continue;
      (byWeek[n] ??= []).push(draw);
    }
  }

  return {
    weeks: Object.keys(byWeek).map((n) => ({ week: +n, draws: byWeek[+n] })),
    final,
  };
}

/**
 * Fetches winners from the configured Google Sheet.
 * Returns null on any failure so callers can keep showing the fallback data.
 */
export async function fetchWinners(sheetUrl: string): Promise<SheetData | null> {
  try {
    const endpoint = toGvizEndpoint(sheetUrl.trim());
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    const text = await res.text();
    try {
      return JSON.parse(text) as SheetData;
    } catch {
      return parseGviz(text);
    }
  } catch (err) {
    console.warn("Winners sheet unavailable — showing fallback data.", err);
    return null;
  }
}
