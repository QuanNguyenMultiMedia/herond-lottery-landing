export interface WeekMeta {
  week: number;
  day: number;
  month: string;
  year: number;
}

export interface Draw {
  title: string;
  time: string;
  winners: string[];
}

export interface WeekEntry {
  week: number;
  draws: Draw[];
}

export interface FinalData {
  drawn: boolean;
  draws: Draw[];
}

/** Google Sheet share URL — columns: Week | Draw Title | Draw Time | Winners */
export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1qkVNNGnnYhiGNds5tr3fxzyOXGbiCUFD8-2I8-3YKK8/edit?usp=sharing";

/** Local time draws close each Monday. */
export const DRAW_TIME = "12:30";

export const WEEKS_META: WeekMeta[] = [
  { week: 1, day: 29, month: "June", year: 2026 },
  { week: 2, day: 6, month: "July", year: 2026 },
  { week: 3, day: 13, month: "July", year: 2026 },
  { week: 4, day: 20, month: "July", year: 2026 },
  { week: 5, day: 27, month: "July", year: 2026 },
  { week: 6, day: 3, month: "August", year: 2026 },
  { week: 7, day: 10, month: "August", year: 2026 },
  { week: 8, day: 17, month: "August", year: 2026 },
];

/** Seed data shown before the live sheet loads (and if the sheet is unreachable). */
export const FALLBACK_WEEKS: WeekEntry[] = [
  {
    week: 1,
    draws: [
      {
        title: "Weekly Draw — $20 (ETH on Base)",
        time: "29/06/2026, 12:35:23",
        winners: ["cutiequinn.herond"],
      },
      {
        title: "Weekly Draw — $10 (ETH on Base)",
        time: "29/06/2026, 13:01:53",
        winners: [
          "prynxx.herond",
          "baovy06.herond",
          "zigkile.herond",
          "hajshhe516262.herond",
          "dinhvubkdn.herond",
          "wonderfullkx.herond",
        ],
      },
      {
        title: "Weekly Draw — Google Play Gift Card $10",
        time: "29/06/2026, 12:57:24",
        winners: ["wilonanatasha847.herond", "phuongtrang.herond", "icaaus.herond"],
      },
    ],
  },
];

export const FALLBACK_FINAL: FinalData = { drawn: false, draws: [] };

export const FAQS: { q: string; paras: string[] }[] = [
  {
    q: "Is it free to join?",
    paras: [
      "Yes. No purchase, no deposit, no crypto needed. Sign up to Herond Browser, check in, and you're in.",
    ],
  },
  {
    q: "How do I earn tickets? Can I boost my chances?",
    paras: [
      "Check in daily for 1 ticket. Stay active 5 of 7 days in a week for +1 bonus ticket.",
      "Create a Herond Keyless Wallet and make one transaction before the season snapshot for +15% bonus tickets.",
    ],
  },
  {
    q: "Do I need a crypto wallet?",
    paras: [
      "Not to play — you earn and win with daily check-ins alone. You'll only need a Herond Wallet to receive your rewards if you win.",
      "Optionally, connect your wallet and make one transaction to earn a +15% bonus on your total Grand Draw tickets.",
    ],
  },
  {
    q: "When are winners drawn? Do my tickets get used up when I win or enter a draw?",
    paras: [
      "Every Monday for the Weekly Draw, plus one Grand Draw at the end of Season 1.",
      "Tickets are never consumed. Every one you earn keeps counting toward the Grand Draw all season.",
    ],
  },
];

export const HEROND_POINT_LINK = "https://points.herond.org/?utm_source=website&utm_medium=campaign1";
