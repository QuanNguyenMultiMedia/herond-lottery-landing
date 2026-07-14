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

interface GvizResponse {
  table?: { rows?: GvizRow[] };
}

function extractSheetId(url: string): string | null {
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

/**
 * The gviz endpoint sends no Access-Control-Allow-Origin header, so a plain
 * fetch() from a browser is CORS-blocked on every origin except Google's own
 * — it fails silently and looks like a dead link. gviz is actually designed
 * for JSONP embedding (that's what its `responseHandler` param is for), so we
 * load it as a <script> tag instead, which never triggers CORS.
 */
function fetchGvizViaJsonp(sheetId: string): Promise<GvizResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__gvizCallback_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");

    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("gviz request timed out"));
    }, 8000);

    (window as unknown as Record<string, (json: GvizResponse) => void>)[callbackName] = (json) => {
      cleanup();
      resolve(json);
    };

    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json;responseHandler=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("gviz script failed to load"));
    };
    document.head.appendChild(script);
  });
}

function parseGvizTable(json: GvizResponse): SheetData {
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
    const sheetId = extractSheetId(sheetUrl.trim());
    if (!sheetId) return null;
    const json = await fetchGvizViaJsonp(sheetId);
    return parseGvizTable(json);
  } catch (err) {
    console.warn("Winners sheet unavailable — showing fallback data.", err);
    return null;
  }
}
