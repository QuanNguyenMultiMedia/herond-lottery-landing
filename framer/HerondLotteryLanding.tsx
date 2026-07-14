"use client";

/**
 * Herond Lottery Landing — single-file Framer Code Component.
 *
 * USAGE: In Framer, go to Assets > Code > + > "New Code File", paste this
 * entire file's contents (or drag-and-drop this .tsx file in), then drag the
 * resulting "Herond Lottery Landing" component onto the canvas and set its
 * layer sizing to Fill (or Fixed) so `style` sizing propagates correctly.
 * Media referenced below (/assets/*.mp4, *.webm, *.webp, *.svg) are the
 * original site's local files — re-upload them to Framer's Asset panel (or
 * any CDN) and swap the `src` strings below, or drop the <video>/<img> tags.
 *
 * DROPPED: Lenis smooth-scroll (no JS smooth-scroll polyfill in Framer).
 * REPLACED: GSAP + ScrollTrigger timelines -> framer-motion whileInView /
 *   animate reveals with manually staggered `delay` props (approximate,
 *   not frame-identical to the original easing curves).
 * SIMPLIFIED: The hero's "fly the video panel to viewport center, then
 *   settle" page-load choreography (GSAP + sessionStorage gate) -> a single
 *   simple fade/slide-up on mount. Visual intent preserved, exact sequencing
 *   is not.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/* =========================================================================
 * Inlined data (from data/season.ts)
 * =======================================================================*/

interface WeekMeta {
  week: number;
  day: number;
  month: string;
  year: number;
}
interface Draw {
  title: string;
  time: string;
  winners: string[];
}
interface WeekEntry {
  week: number;
  draws: Draw[];
}
interface FinalData {
  drawn: boolean;
  draws: Draw[];
}

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1qkVNNGnnYhiGNds5tr3fxzyOXGbiCUFD8-2I8-3YKK8/edit?usp=sharing";

const DRAW_TIME = "17:00";

const WEEKS_META: WeekMeta[] = [
  { week: 1, day: 28, month: "June", year: 2026 },
  { week: 2, day: 5, month: "July", year: 2026 },
  { week: 3, day: 12, month: "July", year: 2026 },
  { week: 4, day: 19, month: "July", year: 2026 },
  { week: 5, day: 26, month: "July", year: 2026 },
  { week: 6, day: 2, month: "August", year: 2026 },
  { week: 7, day: 9, month: "August", year: 2026 },
  { week: 8, day: 16, month: "August", year: 2026 },
];

const FALLBACK_WEEKS: WeekEntry[] = [
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

const FALLBACK_FINAL: FinalData = { drawn: false, draws: [] };

const FAQS: { q: string; paras: string[] }[] = [
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
      "Every Sunday for the Weekly Draw, plus one Grand Draw at the end of Season 1.",
      "Tickets are never consumed. Every one you earn keeps counting toward the Grand Draw all season.",
    ],
  },
];

const HEROND_POINT_LINK = "https://points.herond.org/?utm_source=website&utm_medium=campaign1";

/* =========================================================================
 * Inlined lib/countdown.ts
 * =======================================================================*/

const MONTH_INDEX: Record<string, number> = { June: 5, July: 6, August: 7 };

interface CountdownState {
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
    const date = new Date(Date.UTC(meta.year, MONTH_INDEX[meta.month], meta.day, drawH, drawM, 0));
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
    label: `Sunday, ${next.meta.day} ${next.meta.month}`,
    days: pad(days),
    hours: pad(hours),
    mins: pad(mins),
    secs: pad(secs),
  };
}

const INITIAL_COUNTDOWN_STATE: CountdownState = {
  active: false,
  label: "",
  days: "00",
  hours: "00",
  mins: "00",
  secs: "00",
};

function useCountdown(weeksMeta: WeekMeta[], drawTime: string): CountdownState {
  const [state, setState] = useState<CountdownState>(INITIAL_COUNTDOWN_STATE);

  useEffect(() => {
    const tick = () => setState(computeCountdown(weeksMeta, drawTime, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weeksMeta, drawTime]);

  return state;
}

/* =========================================================================
 * Inlined lib/winners.ts
 * =======================================================================*/

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

function extractSheetId(url: string): string | null {
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

interface GvizResponse {
  table?: { rows?: GvizRow[] };
}

/**
 * The gviz endpoint sends no Access-Control-Allow-Origin header, so a plain
 * fetch() from a browser is CORS-blocked on every origin except Google's own
 * — including a Framer-published site's domain. gviz is actually designed
 * for JSONP embedding (that's what its `responseHandler` param is for), so
 * we load it as a <script> tag instead, which never triggers CORS.
 */
function fetchGvizViaJsonp(sheetId: string): Promise<GvizResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__gvizCallback_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("gviz request timed out"));
    }, 8000);
    function cleanup() {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
      clearTimeout(timer);
    }

    (window as unknown as Record<string, (json: GvizResponse) => void>)[callbackName] = (json) => {
      cleanup();
      resolve(json);
    };

    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json;responseHandler:${callbackName}`;
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

    const isGrand =
      week === "grand" || week === "final" || week === "grand draw" || (!week && /grand/i.test(title));

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

async function fetchWinners(sheetUrl: string): Promise<SheetData | null> {
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

/* =========================================================================
 * Inlined icons (components/icons.tsx + hand-rolled lucide chevrons)
 * =======================================================================*/

function PointIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 17 18" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.07227 0.272731C7.70399 -0.0908033 8.48151 -0.0906919 9.11328 0.272731L15.1602 3.75222C15.7946 4.11731 16.1864 4.79372 16.1865 5.52566V12.4739C16.1865 13.206 15.7947 13.8822 15.1602 14.2473L9.11328 17.7268C8.48149 18.0904 7.70404 18.0904 7.07227 17.7268L1.02539 14.2473C0.391012 13.8822 0 13.2059 0 12.4739V5.52566C0.000100522 4.79373 0.390997 4.11731 1.02539 3.75222L7.07227 0.272731ZM8.32129 2.70632C8.2564 2.46532 7.91463 2.46544 7.84961 2.70632L6.93164 6.57644C6.90374 6.69415 6.77115 6.7527 6.66504 6.69461L5.46582 6.03836C5.25179 5.92142 5.01771 6.15631 5.13477 6.37039L5.79688 7.58132C5.85418 7.68664 5.79611 7.81801 5.67969 7.84695L1.98242 8.76589C1.74146 8.83086 1.74152 9.1726 1.98242 9.23757L5.66309 10.1516C5.77932 10.1805 5.83724 10.311 5.78027 10.4163L5.13086 11.6106C5.01485 11.8246 5.24925 12.0584 5.46289 11.9417L6.66016 11.2854C6.76621 11.2273 6.89876 11.286 6.92676 11.4036L7.84961 15.2796C7.9147 15.5203 8.25625 15.5204 8.32129 15.2796L9.23926 11.4182C9.26713 11.301 9.39891 11.2419 9.50488 11.2991L10.6963 11.9446C10.9107 12.0607 11.1449 11.8252 11.0273 11.6116L10.3721 10.4221C10.3143 10.3169 10.3719 10.1857 10.4883 10.1565L14.1875 9.23757C14.4285 9.17268 14.4285 8.83087 14.1875 8.76589L10.4941 7.84793C10.3781 7.81908 10.3204 7.68854 10.377 7.58328L11.0312 6.37234C11.1472 6.15758 10.9107 5.92388 10.6973 6.04226L9.50781 6.70242C9.40167 6.76128 9.26824 6.70236 9.24023 6.58425L8.32129 2.70632Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinePointIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 17" fill="none" {...props}>
      <path
        d="M8.15007 4.19547C8.10898 4.04617 7.89101 4.04617 7.84991 4.19547L7.26449 6.59416C7.24662 6.66707 7.16206 6.70353 7.09416 6.66707L6.33663 6.25909C6.20084 6.1856 6.05076 6.33027 6.12461 6.46279L6.5409 7.21162C6.57723 7.27701 6.5409 7.35745 6.46645 7.37539L4.11523 7.94309C3.96158 7.98302 3.96158 8.19482 4.11523 8.23475L6.47003 8.80303C6.54447 8.82097 6.5808 8.90256 6.54388 8.96738L6.12699 9.70348C6.05195 9.83542 6.20084 9.98125 6.33722 9.90949L7.09595 9.51019C7.16325 9.47489 7.24722 9.51135 7.26509 9.58369L7.84991 11.972C7.8916 12.1207 8.10898 12.1207 8.15007 11.972L8.73728 9.57443C8.75515 9.50151 8.83912 9.46505 8.90701 9.50151L9.66931 9.90718C9.80569 9.97951 9.95458 9.83484 9.88073 9.70232L9.46742 8.96391C9.43109 8.89851 9.46742 8.8175 9.54187 8.79956L11.8848 8.23475C12.0384 8.19482 12.0384 7.98302 11.8848 7.94309L9.53115 7.37481C9.4567 7.35687 9.42037 7.27586 9.4567 7.21047L9.87835 6.46164C9.9528 6.32912 9.80331 6.18386 9.66693 6.25678L8.90344 6.66302C8.83614 6.6989 8.75157 6.66302 8.73371 6.58953L8.14947 4.19605L8.15007 4.19547Z"
        fill="currentColor"
      />
      <path
        d="M8.83428 0.97243C8.31811 0.675857 7.68266 0.675857 7.16573 0.97243L2.22355 3.80779C1.70509 4.10513 1.38545 4.65635 1.38545 5.25254V10.9141C1.38545 11.5103 1.70509 12.0615 2.22355 12.3589L7.16573 15.1942C7.68189 15.4908 8.31735 15.4908 8.83428 15.1942L13.7765 12.3604C14.2949 12.0631 14.6146 11.5118 14.6146 10.9156V5.25331C14.6146 4.65711 14.2949 4.10589 13.7765 3.80856L8.83428 0.97243Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/* =========================================================================
 * Aurora (components/aurora.tsx) — nearly verbatim, WebGL1 hero banner glow
 * =======================================================================*/

const AURORA_VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const AURORA_FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 skyTop;
uniform vec3 skyBottom;
uniform float speed;
uniform float intensity;
uniform vec2 waveDirection;

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = 3.0;
  vec2 u = f * f * (a - 2.0 * f);
  return mix(
    mix(hash(i.x + hash(i.y)), hash(i.x + 1.0 + hash(i.y)), u.x),
    mix(hash(i.x + hash(i.y + 1.0)), hash(i.x + 1.0 + hash(i.y + 1.0)), u.x),
    u.y
  );
}

vec3 auroraLayer(vec2 uv, float layerSpeed, float layerIntensity, vec3 color) {
  float t = time * layerSpeed * speed;
  vec2 p = uv * 2.0 + t * waveDirection;
  float n = noise(p + noise(color.xy + p + t));
  float aurora = (n - uv.y * 0.5);
  return color * aurora * layerIntensity * intensity * 2.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.x *= resolution.x / resolution.y;
  uv.y = 1.0 - uv.y;

  vec3 color = vec3(0.0);
  color += auroraLayer(uv, 0.05, 0.3, color1);
  color += auroraLayer(uv, 0.1, 0.4, color2);
  color += auroraLayer(uv, 0.15, 0.2, color3);
  color += auroraLayer(uv, 0.25, 0.3, color1 * 0.5 + color3 * 0.2);

  color += skyTop * (1.0 - smoothstep(0.4, 1.0, uv.y));
  color += skyBottom * (1.0 - smoothstep(0.5, 0.9, uv.y));

  gl_FragColor = vec4(color, 1.0);
}
`;

function Aurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, AURORA_VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, AURORA_FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "resolution");
    const uTime = gl.getUniformLocation(program, "time");
    const uColor1 = gl.getUniformLocation(program, "color1");
    const uColor2 = gl.getUniformLocation(program, "color2");
    const uColor3 = gl.getUniformLocation(program, "color3");
    const uSkyTop = gl.getUniformLocation(program, "skyTop");
    const uSkyBottom = gl.getUniformLocation(program, "skyBottom");
    const uSpeed = gl.getUniformLocation(program, "speed");
    const uIntensity = gl.getUniformLocation(program, "intensity");
    const uWaveDir = gl.getUniformLocation(program, "waveDirection");

    let raf = 0;
    const start = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      const t = reduceMotion ? 0 : (now - start) / 1000;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform3f(uColor1, 0.9098, 0.2118, 0.4118);
      gl.uniform3f(uColor2, 0.2, 0.451, 0.9647);
      gl.uniform3f(uColor3, 0.2, 0.451, 0.9647);
      gl.uniform3f(uSkyTop, 0.0118, 0.0078, 0.0353);
      gl.uniform3f(uSkyBottom, 0.0941, 0.0431, 0.1686);
      gl.uniform1f(uSpeed, 0.05);
      gl.uniform1f(uIntensity, 1.4);
      gl.uniform2f(uWaveDir, -26.5, -23.5);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

/* =========================================================================
 * FooterAurora (components/footer-aurora.tsx) — nearly verbatim, WebGL2
 * =======================================================================*/

const FOOTER_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 position;
out vec2 v_uv;
void main() {
  v_uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FOOTER_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_color_cores[8];
uniform float u_beam_positions[8];
uniform float u_beam_widths[8];
uniform float u_beam_heights[8];
uniform float u_core_glow_enabled[8];
uniform int u_core_count;
uniform float u_beam_intensity;
uniform float u_bg_prominence;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
vec3 r2o(vec3 c){
float l=0.4122214*c.r+0.5363325*c.g+0.051446*c.b,m=0.2119035*c.r+0.6806995*c.g+0.107397*c.b,s=0.0883025*c.r+0.2817188*c.g+0.6298787*c.b;
float l_=sign(l)*pow(abs(l),1./3.),m_=sign(m)*pow(abs(m),1./3.),s_=sign(s)*pow(abs(s),1./3.);
return vec3(0.210454*l_+0.7936178*m_-0.004072*s_,1.977998*l_-2.428592*m_+0.450593*s_,0.025904*l_+0.782771*m_-0.808675*s_);
}
vec3 o2r(vec3 c){
float l_=c.x+0.396337*c.y+0.215803*c.z,m_=c.x-0.105561*c.y-0.063854*c.z,s_=c.x-0.089484*c.y-1.291485*c.z;
float l=l_*l_*l_,m=m_*m_*m_,s=s_*s_*s_;
return vec3(4.076741*l-3.307711*m+0.230969*s,-1.268438*l+2.609757*m-0.341319*s,-0.004196*l-0.703418*m+1.707614*s);
}
vec3 r2s(vec3 c){vec3 m=step(vec3(.0031308),c);return mix(c*12.92,1.055*pow(abs(c),vec3(1./2.4))-.055,m);}
vec3 cycle_dynamic_colors(vec3 colors[8], int count, vec3 accent, float progress) {
int total_count = count + 1;
float p = mod(progress, float(total_count));
int idx = int(floor(p));
float t = fract(p);
t = smoothstep(0.0, 1.0, t);
vec3 c1 = vec3(0.0);
vec3 c2 = vec3(0.0);
for (int i = 0; i < 9; i++) {
if (i == idx) {
c1 = (i == count) ? accent : colors[i];
}
if (i == (idx + 1) % total_count) {
c2 = (i == count) ? accent : colors[i];
}
}
vec3 lab1 = r2o(c1);
vec3 lab2 = r2o(c2);
return o2r(mix(lab1, lab2, t));
}
void main(){
vec2 uv=v_uv;
vec2 warped_uv=uv;
warped_uv.x+=sin(uv.y*2.0+u_time*0.5+-1.48000)*0.015*uv.y;
float warp=1.08000*(1.0-pow(1.0-warped_uv.y,4.65000));
float horizontal_shift=u_time*0.75000*0.15+-1.48000;
float beam_u=warped_uv.x-warp-horizontal_shift;
float spread_factor=1.0+warped_uv.y*1.5;
vec3 color_accent=vec3(0.00000,0.60383,0.52712);
vec3 base_accent=color_accent;
vec3 cycled_cores[8];
for (int i = 0; i < 8; i++) {
if (i < u_core_count) {
cycled_cores[i] = u_color_cores[i];
}
}
if(0.00000>0.0||0.00000>0.0){
float shift_progress=u_time*0.00000+0.00000;
base_accent=cycle_dynamic_colors(u_color_cores,u_core_count,color_accent,shift_progress+float(u_core_count));
for(int i=0;i<8;i++){
if(i<u_core_count){
cycled_cores[i]=cycle_dynamic_colors(u_color_cores,u_core_count,color_accent,shift_progress+float(i));
}
}
}
vec3 beams=vec3(0.0);
float sum_val=0.0;
vec3 lab_sum=vec3(0.0);
vec3 glow_accum=vec3(0.0);
for(int i=0;i<8;i++){
if(i>=u_core_count)break;
float c=u_beam_positions[i];
float w=(u_beam_widths[i]*0.60000)*spread_factor;
float decay_y=2.5-float(i)*0.3;
if(decay_y<1.0)decay_y=1.0;
float vertical_decay=decay_y/((u_bg_prominence*u_beam_heights[i])+0.05);
float y_decay=exp(-pow(warped_uv.y*vertical_decay,1.36500));
float dist=(fract((beam_u-c)/1.50000+0.5)-0.5)*1.50000;
float w_scaled=w*(u_bg_prominence+0.1);
float val=exp(-pow(abs(dist/w_scaled),2.10000))*y_decay;
vec3 col=cycled_cores[i];
col*=1.4;
lab_sum+=r2o(col)*val;
sum_val+=val;
float glow_radial=exp(-pow(abs(dist/(w*1.6)),1.5))*exp(-3.0*warped_uv.y);
glow_accum+=col*glow_radial*1.5*u_core_glow_enabled[i];
}
    if(sum_val>0.001){
        vec3 mixed_lab=lab_sum/sum_val;
        vec3 mixed_rgb=o2r(mixed_lab);
        float total_intensity=1.0-exp(-sum_val*1.5);
        beams=mixed_rgb*total_intensity;
    }
    beams+=glow_accum;
    beams*=u_beam_intensity;
vec3 base_color=vec3(0.0052,0.0052,0.0052);
vec3 sky_color=mix(base_color*0.4,base_color,uv.y);
vec3 final_color=sky_color+beams-(sky_color*beams);
vec3 stars_color=vec3(0.0);
if(uv.y>0.1&&0.50000>0.0){
vec2 star_uv=uv*vec2(u_res.x/u_res.y,1.0)*160.0;
vec2 ipos=floor(star_uv);vec2 fpos=fract(star_uv);
float n=h21(ipos);
float threshold=1.0-(0.50000*0.018);
if(n>threshold){
float center_dist=length(fpos-vec2(n,fract(n*10.0)));
float star_intensity=smoothstep(0.12,0.0,center_dist);
float twinkle=1.0;
if(2.50000>0.0||0.02000>0.0){
twinkle=0.4+0.6*sin(u_time*2.50000+n*123.4+0.02000);
}
float sky_darkness=smoothstep(0.0,0.35,length(final_color));
float star_val=star_intensity*(0.3+0.7*fract(n*100.0))*twinkle*(1.0-sky_darkness)*smoothstep(0.1,0.4,uv.y);
stars_color=vec3(star_val*1.50000);
}
}
final_color+=stars_color;
float horizon_mask=exp(-140.0*uv.y);
vec3 edge_core=color_accent;
for(int i=0;i<8;i++){
if(i==u_core_count-1){
edge_core=cycled_cores[i];
}
}
vec3 horizon_color=mix(mix(color_accent,vec3(1.0),0.5),mix(edge_core,vec3(1.0),0.4),uv.x);
final_color=mix(final_color,horizon_color,horizon_mask*0.90);
float raw_noise=h21(uv*u_res+vec2(u_time*0.01));
float luminance=dot(final_color,vec3(0.2126,0.7152,0.0722));
float grain_mask=1.0-pow(abs(luminance-0.5)*2.0,2.0);
final_color+=(raw_noise-0.5)*0.15000*grain_mask;
ivec2 pc=ivec2(gl_FragCoord.xy);
float b[16]=float[](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
float dv=b[(pc.y%4)*4+(pc.x%4)]/16.0;
final_color+=vec3(dv-0.5)*(1.0/255.0);
fragColor=vec4(r2s(clamp(final_color,0.0,1.0)),1.0);
}`;

const FOOTER_CORE_COLORS = new Float32Array([
  0.2, 0.451, 0.965,
  0.4, 0.318, 0.918,
  1.0, 0.502, 0.592,
  0.803, 0.036, 0.13,
  0.2, 0.451, 0.965,
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
]);
const FOOTER_CORE_POSITIONS = new Float32Array([0.1, 0.275, 0.45, 0.625, 0.15, 0, 0, 0]);
const FOOTER_CORE_WIDTHS = new Float32Array([0.2, 0.2, 0.2, 0.2, 0.14, 0, 0, 0]);
const FOOTER_CORE_HEIGHTS = new Float32Array([1, 1, 1, 1, 1.6, 1, 1, 1]);
const FOOTER_CORE_GLOWS = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);

function FooterAurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: true });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, FOOTER_VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FOOTER_FRAGMENT_SHADER);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tLoc = gl.getUniformLocation(program, "u_time");
    const rLoc = gl.getUniformLocation(program, "u_res");
    const coreColorsLoc = gl.getUniformLocation(program, "u_color_cores");
    const beamPosLoc = gl.getUniformLocation(program, "u_beam_positions");
    const beamWidthLoc = gl.getUniformLocation(program, "u_beam_widths");
    const beamHeightLoc = gl.getUniformLocation(program, "u_beam_heights");
    const glowLoc = gl.getUniformLocation(program, "u_core_glow_enabled");
    const countLoc = gl.getUniformLocation(program, "u_core_count");
    const beamIntensityLoc = gl.getUniformLocation(program, "u_beam_intensity");
    const bgProminenceLoc = gl.getUniformLocation(program, "u_bg_prominence");

    let raf = 0;
    const start = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.useProgram(program);
      gl.uniform1f(tLoc, reduceMotion ? 0 : (performance.now() - start) * 0.001);
      gl.uniform2f(rLoc, w, h);
      gl.uniform3fv(coreColorsLoc, FOOTER_CORE_COLORS);
      gl.uniform1fv(beamPosLoc, FOOTER_CORE_POSITIONS);
      gl.uniform1fv(beamWidthLoc, FOOTER_CORE_WIDTHS);
      gl.uniform1fv(beamHeightLoc, FOOTER_CORE_HEIGHTS);
      gl.uniform1fv(glowLoc, FOOTER_CORE_GLOWS);
      gl.uniform1i(countLoc, 5);
      gl.uniform1f(beamIntensityLoc, 1.65);
      gl.uniform1f(bgProminenceLoc, 0.8);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduceMotion) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

/* =========================================================================
 * Small shared components (TiltCard, CtaLink, GradientText, SectionHeading)
 * =======================================================================*/

function TiltCard({ children, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`hlp-tilt-card ${className ?? ""}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CtaLink({
  className,
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) {
  return (
    <motion.a
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      href={href ?? HEROND_POINT_LINK}
      target={href ? "_blank" : undefined}
      rel="noreferrer"
      className={`hlp-cta-link ${className ?? ""}`}
      {...props}
    >
      {children}
    </motion.a>
  );
}

function GradientText({
  className,
  children,
  as: Component = "span",
  style,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);
  return (
    <MotionComponent className={`hlp-gradient-text ${className ?? ""}`} style={style} {...props}>
      {children}
      <span className="hlp-gradient-text-wash" />
      <span className="hlp-gradient-text-grain" />
    </MotionComponent>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title?: React.ReactNode }) {
  return (
    <>
      <div className={title ? "hlp-section-heading-row hlp-mb-4" : "hlp-section-heading-row hlp-mb-8"}>
        <span className="hlp-eyebrow">{eyebrow}</span>
        <span className="hlp-hairline-flex" />
      </div>
      {title && <h2 className="hlp-section-title">{title}</h2>}
    </>
  );
}

/* =========================================================================
 * Nav
 * =======================================================================*/

const NAV_LINKS = [
  { href: "#rewards", label: "Rewards" },
  { href: "#how", label: "How it Works" },
  { href: "#rules", label: "Rules" },
  { href: "#faq", label: "FAQ" },
];

function Nav() {
  return (
    <nav className="hlp-nav">
      <div className="hlp-nav-left">
        <video
          src="/assets/herond-icon-loop.webm"
          autoPlay
          loop
          muted
          playsInline
          className="hlp-nav-icon"
        />
        <span className="hlp-nav-title">Herond Point</span>
        <span className="hlp-nav-divider" />
        <span className="hlp-nav-subtitle">Lottery Ticket</span>
      </div>
      <div className="hlp-nav-right">
        <div className="hlp-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hlp-nav-link">
              {link.label}
            </a>
          ))}
        </div>
        <a href={HEROND_POINT_LINK} target="_blank" rel="noreferrer" className="hlp-nav-cta">
          Claim Your Ticket
        </a>
      </div>
    </nav>
  );
}

/* =========================================================================
 * Hero
 * =======================================================================*/

const COUNTDOWN_UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "mins", label: "Mins" },
  { key: "secs", label: "Secs" },
] as const;

function Hero() {
  const cd = useCountdown(WEEKS_META, DRAW_TIME);

  return (
    <section className="hlp-hero">
      <div className="hlp-hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hlp-hero-badge">
            <span className="hlp-hero-badge-left">
              <span className="hlp-pulse-dot" />
              Season 1 Grand Launch
            </span>
            <span className="hlp-hero-badge-sep">·</span>
            <span className="hlp-hero-badge-right">$10,000 Lottery Pool</span>
          </div>

          <h1 className="hlp-hero-title">
            Check in daily.
            <br />
            <span className="hlp-text-primary">Win real rewards</span>
            <br />
            every week.
          </h1>

          <p className="hlp-hero-copy">
            Every check-in earns a ticket. Every ticket is a shot at the $10,000 pool!
          </p>

          {cd.active && (
            <div className="hlp-countdown">
              <div className="hlp-countdown-header">
                <span className="hlp-countdown-label">Next Weekly Draw</span>
                <span className="hlp-hairline-flex hlp-hairline-max" />
                <span className="hlp-countdown-date">{cd.label}</span>
              </div>
              <div className="hlp-countdown-units">
                {COUNTDOWN_UNITS.map((unit) => (
                  <div key={unit.key} className="hlp-countdown-unit">
                    <div className={`hlp-countdown-value ${unit.key === "secs" ? "hlp-text-primary" : ""}`}>
                      {cd[unit.key]}
                    </div>
                    <div className="hlp-countdown-unit-label">{unit.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="hlp-hero-cta-label">Get Your First Ticket</div>
          <CtaLink>
            <PointIcon className="hlp-icon-18" />
            Install Herond
          </CtaLink>
          <div className="hlp-hero-footnote">
            Free to enter · 1-minute install · Tickets never expire
          </div>
        </motion.div>

        <motion.div
          className="hlp-hero-panel-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="hlp-hero-panel">
            <div className="hlp-hero-panel-inner">
              <video
                src="/assets/hero-showcase.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="hlp-hero-video"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
 * RewardsWinners
 * =======================================================================*/

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

type Target = number | "final";

const NAV_ITEMS: { value: Target; label: string }[] = [
  ...WEEKS_META.map((m) => ({ value: m.week as Target, label: `Week ${m.week}` })),
  { value: "final" as const, label: "Grand Draw" },
];
const VISIBLE_COUNT = 3;

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

function PoolCard({ badge, badgeColor, badgeBg, cadence, amount, winners, note, prizes, glow }: PoolCardProps) {
  return (
    <TiltCard className={`hlp-pool-card ${glow ? "hlp-pool-card-glow" : ""}`}>
      <div className="hlp-pool-card-head">
        <div className="hlp-pool-card-badge" style={{ background: badgeBg, color: badgeColor }}>
          <PointIcon className="hlp-icon-12" style={{ color: badgeColor }} /> {badge}
        </div>
        <div className="hlp-pool-card-cadence">{cadence}</div>
      </div>
      <div className="hlp-pool-card-amount-row">
        <div className="hlp-pool-card-amount">{amount}</div>
        <div className="hlp-pool-card-winners">
          <b>{winners}</b> winners {winners === "500+" ? "" : "/ week"}
        </div>
      </div>
      <p className="hlp-pool-card-note">{note}</p>
      <div className="hlp-hairline" />
      <div className="hlp-pool-card-prize-label">Prize breakdown</div>
      <div className="hlp-pool-card-prizes">
        {prizes.map((prize) => (
          <span key={prize} className="hlp-pool-card-prize">
            {prize}
          </span>
        ))}
      </div>
    </TiltCard>
  );
}

function RewardsWinners() {
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
        badgeText: isDrawn ? `${finalData.draws.length} draw${finalData.draws.length > 1 ? "s" : ""}` : "Coming Soon",
        badgeBg: "rgba(255,195,0,0.12)",
        badgeColor: "#ffd60a",
        cardBorder: "1px solid rgba(255,214,10,0.24)",
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
      badgeText: isDrawn ? `${entry!.draws.length} draw${entry!.draws.length > 1 ? "s" : ""}` : "Coming Soon",
      badgeBg: isDrawn ? "rgba(40,201,104,0.12)" : "rgba(116,116,128,0.18)",
      badgeColor: isDrawn ? "#28c968" : "rgba(235,235,245,0.6)",
      cardBorder: "1px solid var(--hlp-border)",
      lockedTitle: `Week ${active} — Coming Soon`,
      lockedSub: `Winners announced on ${ordinal(meta.day)} ${meta.month} ${meta.year}`,
    };
  }, [active, byWeek, finalData]);

  return (
    <section id="rewards" className="hlp-section">
      <div className="hlp-container">
        <SectionHeading
          eyebrow="Rewards"
          title={
            <>
              <GradientText className="hlp-gradient-inline">$10,000</GradientText> Up for grabs
            </>
          }
        />
        <p className="hlp-rewards-intro">
          Real prizes every week, plus a Grand Draw built from every ticket you&apos;ve earned all season.
        </p>

        <div className="hlp-pool-grid">
          <PoolCard
            badge="WEEKLY POOL"
            badgeColor="#3373f6"
            badgeBg="rgba(51,115,246,0.12)"
            cadence="Every Sunday"
            amount="Up to $400"
            winners="30"
            note="Each weekly draw uses only that week's tickets."
            prizes={["$20 (ETH on Base)", "$10 (ETH on Base)", "$5 (ETH on Base)", "Google Play $10", "Starbucks $5"]}
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

        {/* Mobile: 3-item window with prev/next arrows */}
        <div className="hlp-week-pager hlp-week-pager-mobile">
          <button
            type="button"
            aria-label="Show earlier weeks"
            onClick={() => setNavStart((s) => Math.max(0, s - 1))}
            disabled={navStart === 0}
            className="hlp-pager-arrow"
          >
            <ChevronLeftIcon className="hlp-icon-16" />
          </button>

          <div className="hlp-pager-items">
            {visibleItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActive(item.value)}
                aria-pressed={active === item.value}
                className={`hlp-pager-item ${active === item.value ? "hlp-pager-item-active" : ""}`}
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
            className="hlp-pager-arrow"
          >
            <ChevronRightIcon className="hlp-icon-16" />
          </button>
        </div>

        {/* Wider screens: full range at once */}
        <div className="hlp-week-pager hlp-week-pager-desktop">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setActive(item.value)}
              aria-pressed={active === item.value}
              className={`hlp-pager-item-lg ${active === item.value ? "hlp-pager-item-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hlp-winners-panel-wrap">
          <div className="hlp-winners-panel" style={{ border: panel.cardBorder }}>
            <div className="hlp-winners-panel-head">
              <h3 className="hlp-winners-panel-title">{panel.title}</h3>
              <span className="hlp-winners-panel-badge" style={{ background: panel.badgeBg, color: panel.badgeColor }}>
                {panel.badgeText}
              </span>
            </div>
            <div className="hlp-winners-panel-body">
              {panel.isDrawn ? (
                panel.draws.map((draw, i) => (
                  <div key={i} className="hlp-draw-row">
                    <div className="hlp-draw-title">{draw.title}</div>
                    <div className="hlp-draw-time">{draw.time}</div>
                    <div className="hlp-draw-winners">
                      {draw.winners.map((name, wi) => (
                        <div key={wi} className="hlp-draw-winner">
                          <span className="hlp-draw-winner-index">{String(wi + 1).padStart(2, "0")}</span>
                          <span className="hlp-draw-winner-name">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="hlp-locked-row">
                  <div className="hlp-locked-icon">
                    <LinePointIcon className="hlp-icon-20" />
                  </div>
                  <div>
                    <h4 className="hlp-locked-title">{panel.lockedTitle}</h4>
                    <p className="hlp-locked-sub">{panel.lockedSub}</p>
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

/* =========================================================================
 * HowItWorks
 * =======================================================================*/

const STEPS = [
  {
    n: 1,
    title: "Install",
    body: "Get Herond Browser on iOS, Android, or desktop. Under a minute.",
    image: "/assets/how-it-works/step-1.webp",
  },
  {
    n: 2,
    title: "Check in daily",
    body: "Log in to Herond Point and check in every day to collect your tickets.",
    image: "/assets/how-it-works/step-2.webp",
  },
  {
    n: 3,
    title: "Stay active, win more",
    body: "Check in 5 of 7 days for a bonus ticket. Every ticket automatically enters each Sunday's Weekly Draw and the Grand Draw at season's end.",
    image: "/assets/how-it-works/step-3.webp",
  },
] as const;

function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="how" className="hlp-section">
      <div className="hlp-container hlp-container-narrow">
        <SectionHeading eyebrow="How it works" title="Three steps to your first ticket" />

        <div className="hlp-how-frame">
          <div className="hlp-how-inner">
            <div className="hlp-how-tabs">
              {STEPS.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`hlp-how-tab ${active === i ? "hlp-how-tab-active" : ""}`}
                >
                  <span className={`hlp-how-tab-num ${active === i ? "hlp-how-tab-num-active" : ""}`}>{s.n}</span>
                  <span className={`hlp-how-tab-title ${active === i ? "hlp-text-foreground" : ""}`}>{s.title}</span>
                </button>
              ))}
            </div>

            <p className="hlp-how-body">{step.body}</p>

            <div className="hlp-how-image-wrap">
              <div className="hlp-how-image-frame">
                <img key={step.image} src={step.image} alt={step.title} className="hlp-how-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * RulesFaq
 * =======================================================================*/

const RULES = [
  {
    Icon: PointIcon,
    iconColor: "hlp-text-primary",
    title: "Earn Tickets",
    body: (
      <>
        Daily Check-In = <span className="hlp-strong-fg">1</span> Lottery Ticket. Active 5/7 days ={" "}
        <span className="hlp-strong-success">+1</span> Bonus Ticket.
      </>
    ),
  },
  {
    Icon: PointIcon,
    iconColor: "hlp-text-primary",
    title: "Win Weekly",
    body: (
      <>
        Weekly Draw every <span className="hlp-strong-fg">Sunday</span>. Your tickets enter automatically —
        nothing else to do.
      </>
    ),
  },
  {
    Icon: LinePointIcon,
    iconColor: "hlp-text-primary",
    title: "Tickets Never Reset",
    body: (
      <>
        Tickets are <span className="hlp-strong-fg">NOT</span> consumed after weekly draws. They accumulate for the
        Season 1 Grand Draw.
      </>
    ),
  },
  {
    Icon: PointIcon,
    iconColor: "hlp-text-success",
    title: "Boost Your Rewards",
    body: (
      <>
        Herond Keyless Wallet + 1 transaction = <span className="hlp-strong-success">+15%</span> Bonus Tickets.
      </>
    ),
  },
];

function Accordion({ q, paras }: { q: string; paras: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hlp-accordion">
      <button type="button" className="hlp-accordion-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {q}
        <span className={`hlp-accordion-chevron ${open ? "hlp-accordion-chevron-open" : ""}`}>
          <ChevronRightIcon className="hlp-icon-16" style={{ transform: "rotate(90deg)" }} />
        </span>
      </button>
      {open && (
        <div className="hlp-accordion-content">
          {paras.map((p, pi) => (
            <p key={pi} className="hlp-accordion-para">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function RulesFaq() {
  return (
    <section id="rules" className="hlp-section">
      <div className="hlp-container hlp-container-narrow hlp-rules-grid">
        <div>
          <SectionHeading eyebrow="Rules" title="Maximize your chances" />
          <div className="hlp-rules-cards">
            {RULES.map((rule) => (
              <TiltCard key={rule.title} className="hlp-rule-card">
                <div className="hlp-rule-card-head">
                  <rule.Icon className={`hlp-icon-16 ${rule.iconColor}`} />
                  <h4 className="hlp-rule-card-title">{rule.title}</h4>
                </div>
                <p className="hlp-rule-card-body">{rule.body}</p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div id="faq">
          <SectionHeading eyebrow="FAQ" />
          <div className="hlp-faq-list">
            {FAQS.map((faq, i) => (
              <Accordion key={i} q={faq.q} paras={faq.paras} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * FinalCta
 * =======================================================================*/

function FinalCta() {
  return (
    <section className="hlp-final-cta">
      <motion.div
        className="hlp-fc-glow"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 0.4, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        animate={{ rotate: 360 }}
        style={{ transitionProperty: "opacity, scale" }}
      />

      <div className="hlp-fc-ticket">
        <GradientText as="div" className="hlp-fc-top-stub" style={{}}>
          <div className="hlp-fc-top-stub-inner">
            <div className="hlp-fc-eyebrow">Season 1 Grand Draw</div>
            <motion.div
              className="hlp-fc-amount"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              $10,000
            </motion.div>
            <div className="hlp-fc-total-label">Total prize pool</div>
          </div>
        </GradientText>

        <div className="hlp-fc-perforation-wrap">
          <div className="hlp-fc-perforation" />
        </div>

        <div className="hlp-fc-bottom-stub">
          <div className="hlp-fc-bottom-stub-inner">
            <motion.h2
              className="hlp-fc-title"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Your next check-in could be the one.
            </motion.h2>
            <motion.p
              className="hlp-fc-copy"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Free to start. One check-in a day. Install Herond and you&apos;re in.
            </motion.p>
            <motion.div
              className="hlp-fc-cta"
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <div className="hlp-hero-cta-label">Get Your First Ticket</div>
              <CtaLink className="hlp-fc-cta-link">
                <PointIcon className="hlp-icon-18" />
                Install Herond
              </CtaLink>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * Footer
 * =======================================================================*/

const FOOTER_LINKS = [
  { href: "https://herond.org", label: "herond.org" },
  { href: "https://discord.gg/YgZ6vfWrK5", label: "Discord" },
  { href: "https://t.me/herond_browser", label: "Telegram" },
];

function Footer() {
  return (
    <footer className="hlp-footer">
      <div className="hlp-footer-aurora-wrap">
        <FooterAurora className="hlp-footer-aurora" />
      </div>
      <div className="hlp-footer-scrim" />
      <div className="hlp-footer-brand">
        <img src="/assets/herond-logo.svg" alt="Herond" className="hlp-footer-logo" />
        <span>© 2026 Herond Browser</span>
      </div>
      <div className="hlp-footer-links">
        {FOOTER_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="hlp-footer-link">
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

/* =========================================================================
 * StickyMobileCta
 * =======================================================================*/

function StickyMobileCta() {
  return (
    <div className="hlp-sticky-cta">
      <a href={HEROND_POINT_LINK} target="_blank" rel="noreferrer" className="hlp-sticky-cta-link">
        <PointIcon className="hlp-icon-18" style={{ color: "#fff" }} />
        Install Herond — Get Your First Ticket
      </a>
    </div>
  );
}

/* =========================================================================
 * CSS — single embedded stylesheet, scoped under .hlp-root
 * =======================================================================*/

const HLP_CSS = `
.hlp-root {
  --hlp-background: #101010;
  --hlp-foreground: #ffffff;
  --hlp-card: #1e1e1f;
  --hlp-card-hover: #232324;
  --hlp-primary: #3373f6;
  --hlp-muted-foreground: rgba(235, 235, 245, 0.6);
  --hlp-border: rgba(255, 255, 255, 0.09);
  --hlp-success: #28c968;
  --hlp-warning: #ffd60a;
  --hlp-pink: #ff8097;
  --hlp-cta-from: #2563eb;
  --hlp-cta-to: #1d4ed8;
  --hlp-muted-pill: rgba(255, 255, 255, 0.06);
  --hlp-hairline: rgba(255, 255, 255, 0.1);
  --hlp-gradient-1: 221 89% 58%;
  --hlp-gradient-2: 248 78% 62%;
  --hlp-gradient-3: 351 100% 75%;
  --hlp-gradient-4: 340 76% 56%;

  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 100%;
  background: var(--hlp-background);
  color: var(--hlp-foreground);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  font-size: 15px;
  line-height: 1.55;
  letter-spacing: -0.006em;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.hlp-root * { box-sizing: border-box; }
.hlp-root a { color: var(--hlp-primary); text-decoration: none; }
.hlp-root a:hover { color: #5e8ff8; }
.hlp-root button { font: inherit; cursor: pointer; }
.hlp-root ::-webkit-scrollbar { width: 8px; height: 8px; }
.hlp-root ::-webkit-scrollbar-track { background: transparent; }
.hlp-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 999px; }
.hlp-root ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.32); }

@keyframes hlp-neon-pulse {
  0%, 100% { box-shadow: 0 6px 20px rgba(37,99,235,0.28), 0 0 0 1px rgba(255,255,255,0.06) inset; }
  50% { box-shadow: 0 8px 28px rgba(37,99,235,0.42), 0 0 0 1px rgba(255,255,255,0.06) inset; }
}
@keyframes hlp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes hlp-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@property --hlp-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
@keyframes hlp-border-spin { to { --hlp-angle: 360deg; } }
@keyframes hlp-gradient-pan {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .hlp-root *, .hlp-root *::before, .hlp-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Aurora banner */
.hlp-aurora-banner {
  pointer-events: none;
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 0;
  height: 320px;
  width: 100%;
  overflow: hidden;
}
.hlp-aurora-canvas { position: absolute; inset: 0; height: 100%; width: 100%; opacity: 0.8; }
.hlp-aurora-fade {
  pointer-events: none;
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 208px;
  background: linear-gradient(to bottom, transparent, var(--hlp-background));
}

/* Nav */
.hlp-nav {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--hlp-border);
  background: rgba(16,16,16,0.8);
  backdrop-filter: blur(20px);
  padding: 12px 16px;
}
@media (min-width: 640px) { .hlp-nav { padding: 12px 32px; } }
.hlp-nav-left { display: flex; min-width: 0; align-items: center; gap: 8px; }
@media (min-width: 640px) { .hlp-nav-left { gap: 10px; } }
.hlp-nav-icon { display: block; height: 22px; width: 22px; flex: none; }
@media (min-width: 640px) { .hlp-nav-icon { height: 26px; width: 26px; } }
.hlp-nav-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
@media (min-width: 640px) { .hlp-nav-title { font-size: 17px; } }
.hlp-nav-divider { display: none; height: 18px; width: 1px; flex: none; background: var(--hlp-border); }
@media (min-width: 400px) { .hlp-nav-divider { display: block; } }
.hlp-nav-subtitle { display: none; white-space: nowrap; font-size: 13px; font-weight: 500; color: var(--hlp-muted-foreground); }
@media (min-width: 400px) { .hlp-nav-subtitle { display: block; } }
.hlp-nav-right { display: flex; flex: none; align-items: center; gap: 4px; }
.hlp-nav-links { display: none; align-items: center; gap: 2px; }
@media (min-width: 640px) { .hlp-nav-links { display: flex; } }
.hlp-nav-link { border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 500; color: var(--hlp-muted-foreground); transition: color 0.15s, background-color 0.15s; }
.hlp-nav-link:hover { background: rgba(255,255,255,0.02); color: var(--hlp-foreground); }
.hlp-nav-cta { margin-left: 4px; white-space: nowrap; border-radius: 999px; background: var(--hlp-primary); padding: 8px 14px; font-size: 12px; font-weight: 600; color: #fff; transition: background-color 0.15s; }
.hlp-nav-cta:hover { background: #4680ff; color: #fff; }
@media (min-width: 640px) { .hlp-nav-cta { margin-left: 8px; padding: 10px 20px; font-size: 13px; } }

/* Layout helpers */
.hlp-main { position: relative; }
.hlp-section { padding: clamp(72px, 10vw, 128px) 0; }
.hlp-container { margin-inline: auto; width: 100%; min-width: 0; max-width: 1080px; padding-inline: 24px; }
.hlp-container-narrow { max-width: 720px; }
.hlp-section-heading-row { display: flex; align-items: center; gap: 16px; }
.hlp-mb-4 { margin-bottom: 16px; }
.hlp-mb-8 { margin-bottom: 32px; }
.hlp-eyebrow { white-space: nowrap; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(51,115,246,0.8); }
.hlp-hairline-flex { height: 1px; flex: 1 1 auto; background: var(--hlp-hairline); }
.hlp-hairline-max { max-width: 120px; }
.hlp-hairline { margin-block: 14px; height: 1px; background: var(--hlp-hairline); }
.hlp-section-title { margin-bottom: 40px; font-size: clamp(26px, 3.2vw, 34px); font-weight: 600; letter-spacing: -0.02em; }
.hlp-text-primary { color: var(--hlp-primary); }
.hlp-text-success { color: var(--hlp-success); }
.hlp-text-foreground { color: var(--hlp-foreground); }
.hlp-strong-fg { font-weight: 700; color: var(--hlp-foreground); }
.hlp-strong-success { font-weight: 700; color: var(--hlp-success); }
.hlp-icon-12 { width: 12px; height: 12px; }
.hlp-icon-16 { width: 16px; height: 16px; }
.hlp-icon-18 { width: 18px; height: 18px; }
.hlp-icon-20 { width: 20px; height: 20px; }

/* Shared card */
.hlp-tilt-card { border-radius: 18px; border: 1px solid var(--hlp-border); background: var(--hlp-card); transition: border-color 0.2s ease-out; }
.hlp-tilt-card:hover { border-color: rgba(255,255,255,0.15); }

/* CtaLink */
.hlp-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  background: var(--hlp-primary);
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8px 24px -6px rgba(51,115,246,0.55);
  transition: background-color 0.15s, box-shadow 0.15s;
}
.hlp-cta-link:hover { background: #4680ff; color: #fff; box-shadow: 0 10px 30px -6px rgba(51,115,246,0.7); }

/* GradientText */
.hlp-gradient-text { position: relative; display: inline-flex; overflow: hidden; background: var(--hlp-background); }
.hlp-gradient-inline { border-radius: 8px; padding-inline: 4px; }
.hlp-gradient-text-wash {
  pointer-events: none;
  position: absolute;
  inset: 0;
  animation: hlp-gradient-pan 10s ease-in-out infinite;
  mix-blend-mode: lighten;
  background-image: linear-gradient(115deg, hsl(var(--hlp-gradient-1)), hsl(var(--hlp-gradient-2)), hsl(var(--hlp-gradient-3)), hsl(var(--hlp-gradient-4)));
  background-size: 280% 280%;
}
.hlp-gradient-text-grain {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.12;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Hero */
.hlp-hero { position: relative; display: flex; min-height: 100svh; align-items: center; padding-block: clamp(48px, 7vw, 88px); }
.hlp-hero-grid { margin-inline: auto; display: grid; grid-template-columns: 1fr; align-items: center; gap: 56px; max-width: 1080px; padding-inline: 24px; }
@media (min-width: 768px) { .hlp-hero-grid { grid-template-columns: 1fr 1fr; } }
.hlp-hero-badge { margin-bottom: 24px; display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px 4px; border-radius: 999px; border: 1px solid var(--hlp-border); background: #1a1a1b; padding: 6px 14px; font-size: 12.5px; font-weight: 500; }
.hlp-hero-badge-left { display: flex; align-items: center; gap: 8px; white-space: nowrap; color: var(--hlp-muted-foreground); }
.hlp-pulse-dot { height: 6px; width: 6px; border-radius: 999px; background: var(--hlp-success); animation: hlp-pulse 2s ease-in-out infinite; }
.hlp-hero-badge-sep { color: rgba(255,255,255,0.25); }
.hlp-hero-badge-right { white-space: nowrap; font-weight: 600; color: var(--hlp-primary); }
.hlp-hero-title { margin-bottom: 18px; font-size: clamp(38px, 4.8vw, 62px); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; }
.hlp-hero-copy { margin-bottom: 26px; max-width: 460px; font-size: 18px; color: var(--hlp-muted-foreground); }
.hlp-countdown { margin-bottom: 28px; }
.hlp-countdown-header { margin-bottom: 12px; display: flex; align-items: center; gap: 14px; }
.hlp-countdown-label { white-space: nowrap; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2.75px; color: var(--hlp-muted-foreground); }
.hlp-countdown-date { font-size: 12px; font-weight: 600; color: var(--hlp-muted-foreground); }
.hlp-countdown-units { display: flex; flex-wrap: wrap; gap: 8px; }
.hlp-countdown-unit { min-width: 60px; border-radius: 8px; border: 1px solid var(--hlp-border); background: #161617; padding: 10px 8px; text-align: center; }
.hlp-countdown-value { font-size: 24px; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.hlp-countdown-unit-label { margin-top: 3px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.hlp-hero-cta-label { margin-bottom: 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(51,115,246,0.7); }
.hlp-hero-footnote { margin-top: 16px; font-size: 12.5px; color: rgba(255,255,255,0.3); }
.hlp-hero-panel-wrap { display: flex; justify-content: center; }
.hlp-hero-panel {
  width: 100%;
  max-width: 400px;
  border-radius: 18px;
  padding: 1px;
  box-shadow: 0 20px 50px -20px rgba(37,99,235,0.5);
  background: conic-gradient(from var(--hlp-angle), rgba(51,115,246,0) 0%, rgba(51,115,246,0.9) 12%, rgba(102,81,234,0.9) 22%, rgba(51,115,246,0) 38%, rgba(51,115,246,0) 55%, rgba(255,128,151,0.7) 68%, rgba(51,115,246,0) 82%);
  animation: hlp-border-spin 14s linear infinite, hlp-float 8s ease-in-out infinite;
}
.hlp-hero-panel-inner { position: relative; aspect-ratio: 716 / 482; overflow: hidden; border-radius: 17px; background: var(--hlp-background); }
.hlp-hero-video { display: block; height: 100%; width: 100%; border-radius: 17px; background: var(--hlp-background); object-fit: cover; }

/* Rewards */
.hlp-rewards-intro { margin-top: -24px; margin-bottom: 40px; max-width: 420px; font-size: 15px; color: var(--hlp-muted-foreground); }
.hlp-pool-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 1024px) { .hlp-pool-grid { grid-template-columns: 1fr 1fr; } }
.hlp-pool-card { padding: 24px; }
.hlp-pool-card-glow { border-color: rgba(255,214,10,0.28) !important; }
.hlp-pool-card-glow:hover { border-color: rgba(255,214,10,0.45) !important; }
.hlp-pool-card-head { margin-bottom: 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.hlp-pool-card-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.hlp-pool-card-cadence { font-size: 13px; font-weight: 500; color: var(--hlp-muted-foreground); }
.hlp-pool-card-amount-row { margin-bottom: 8px; display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
.hlp-pool-card-amount { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.hlp-pool-card-winners { font-size: 13px; color: var(--hlp-muted-foreground); }
.hlp-pool-card-winners b { font-size: 15px; color: var(--hlp-foreground); }
.hlp-pool-card-note { margin-bottom: 16px; font-size: 13px; line-height: 1.4; color: var(--hlp-muted-foreground); }
.hlp-pool-card-prize-label { margin-bottom: 10px; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.hlp-pool-card-prizes { display: flex; flex-wrap: wrap; gap: 6px; }
.hlp-pool-card-prize { white-space: nowrap; border-radius: 999px; background: var(--hlp-muted-pill); padding: 6px 12px; font-size: 11.5px; font-weight: 500; color: var(--hlp-muted-foreground); }

.hlp-week-pager { margin-top: 48px; }
.hlp-week-pager-mobile { display: flex; align-items: center; justify-content: center; gap: 8px; }
@media (min-width: 640px) { .hlp-week-pager-mobile { display: none; } }
.hlp-week-pager-desktop { display: none; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; border-radius: 999px; border: 1px solid var(--hlp-border); background: #161617; padding: 6px; }
@media (min-width: 640px) { .hlp-week-pager-desktop { display: flex; } }
.hlp-pager-arrow { display: flex; height: 36px; width: 36px; flex: none; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid var(--hlp-border); background: #161617; color: rgba(255,255,255,0.7); transition: color 0.15s, border-color 0.15s; }
.hlp-pager-arrow:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); color: var(--hlp-foreground); }
.hlp-pager-arrow:disabled { pointer-events: none; opacity: 0.3; }
.hlp-pager-items { display: flex; min-width: 0; justify-content: center; gap: 4px; border-radius: 999px; border: 1px solid var(--hlp-border); background: #161617; padding: 4px; }
.hlp-pager-item { flex-shrink: 0; white-space: nowrap; border-radius: 999px; border: none; background: transparent; padding: 6px 10px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.55); transition: color 0.15s; }
.hlp-pager-item:hover { color: var(--hlp-foreground); }
.hlp-pager-item-active, .hlp-pager-item-active:hover { background: #2c2c2e; font-weight: 600; color: var(--hlp-foreground); }
.hlp-pager-item-lg { border-radius: 999px; border: none; background: transparent; padding: 6px 16px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55); transition: color 0.15s; }
.hlp-pager-item-lg:hover { color: var(--hlp-foreground); }

.hlp-winners-panel-wrap { margin-top: 20px; }
.hlp-winners-panel { overflow: hidden; border-radius: 18px; background: var(--hlp-card); }
.hlp-winners-panel-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--hlp-border); padding: 16px 22px; }
.hlp-winners-panel-title { font-size: 15px; font-weight: 700; }
.hlp-winners-panel-badge { white-space: nowrap; border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 700; }
.hlp-winners-panel-body { max-height: 640px; overflow-y: auto; padding: 6px 22px 18px; }
.hlp-draw-row { border-bottom: 1px solid rgba(255,255,255,0.06); padding-block: 16px; }
.hlp-draw-row:last-child { border-bottom: none; }
.hlp-draw-title { font-size: 13px; font-weight: 700; color: var(--hlp-foreground); }
.hlp-draw-time { margin: 2px 0 12px; font-size: 11px; color: rgba(255,255,255,0.3); }
.hlp-draw-winners { display: grid; grid-template-columns: 1fr; gap: 18px 8px; }
@media (min-width: 640px) { .hlp-draw-winners { grid-template-columns: 1fr 1fr; } }
.hlp-draw-winner { display: flex; align-items: center; gap: 10px; }
.hlp-draw-winner-index { display: flex; height: 25px; width: 25px; flex: none; align-items: center; justify-content: center; border-radius: 8px; background: rgba(51,115,246,0.12); font-family: ui-monospace, "SF Mono", monospace; font-size: 10.5px; font-weight: 700; color: var(--hlp-primary); }
.hlp-draw-winner-name { font-family: ui-monospace, "SF Mono", monospace; font-size: 12.5px; color: var(--hlp-muted-foreground); }
.hlp-locked-row { display: flex; align-items: center; gap: 14px; padding-block: 18px; }
.hlp-locked-icon { display: flex; height: 44px; width: 44px; flex: none; align-items: center; justify-content: center; border-radius: 10px; background: #2d2d2e; color: rgba(255,255,255,0.3); }
.hlp-locked-title { margin-bottom: 2px; font-size: 14.5px; font-weight: 700; }
.hlp-locked-sub { font-size: 12.5px; color: rgba(255,255,255,0.3); }

/* HowItWorks */
.hlp-how-frame { border-radius: 18px; padding: 1px; box-shadow: 0 24px 60px -30px rgba(37,99,235,0.45); background: linear-gradient(150deg, rgba(51,115,246,0.55), rgba(102,81,234,0.4) 45%, rgba(255,128,151,0.35) 100%); }
.hlp-how-inner { overflow: hidden; border-radius: 17px; background: var(--hlp-card); }
.hlp-how-tabs { display: grid; grid-template-columns: 1fr; border-bottom: 1px solid rgba(255,255,255,0.06); }
@media (min-width: 640px) { .hlp-how-tabs { grid-template-columns: 1fr 1fr 1fr; } }
.hlp-how-tab { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); background: transparent; border-inline: none; border-top: none; padding: 14px 16px; text-align: left; transition: background-color 0.15s; }
.hlp-how-tab:last-child { border-bottom: none; }
@media (min-width: 640px) {
  .hlp-how-tab { border-bottom: none; border-right: 1px solid rgba(255,255,255,0.06); }
  .hlp-how-tab:last-child { border-right: none; }
}
.hlp-how-tab:hover { background: var(--hlp-card-hover); }
.hlp-how-tab-active { background: var(--hlp-card-hover); }
.hlp-how-tab-num { display: flex; height: 28px; width: 28px; flex: none; align-items: center; justify-content: center; border-radius: 999px; background: #2d2d2e; font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.4); }
.hlp-how-tab-num-active { background: linear-gradient(to bottom, var(--hlp-cta-from), var(--hlp-cta-to)); color: #fff; }
.hlp-how-tab-title { font-size: 13.5px; font-weight: 700; color: var(--hlp-muted-foreground); }
.hlp-how-body { display: flex; height: 84px; align-items: center; justify-content: center; padding-inline: 24px; text-align: center; font-size: 13.5px; color: var(--hlp-muted-foreground); }
.hlp-how-image-wrap { padding: 0 20px 20px; }
.hlp-how-image-frame { position: relative; aspect-ratio: 1200 / 1142; width: 100%; overflow: hidden; border-radius: 12px; background: var(--hlp-background); }
.hlp-how-image { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: contain; }

/* RulesFaq */
.hlp-rules-grid { display: grid; grid-template-columns: 1fr; gap: 48px; }
.hlp-rules-cards { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .hlp-rules-cards { grid-template-columns: 1fr 1fr; } }
.hlp-rule-card { padding: 20px; }
.hlp-rule-card-head { margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.hlp-rule-card-title { font-size: 13.5px; font-weight: 600; }
.hlp-rule-card-body { font-size: 13px; line-height: 1.5; color: var(--hlp-muted-foreground); }
.hlp-faq-list { display: grid; grid-template-columns: 1fr; gap: 8px; }
.hlp-accordion { border-radius: 14px; border: 1px solid var(--hlp-border); background: var(--hlp-card); overflow: hidden; }
.hlp-accordion-trigger { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 8px; border: none; background: transparent; padding: 14px 16px; text-align: left; font-size: 14px; font-weight: 500; color: var(--hlp-foreground); }
.hlp-accordion-chevron { display: inline-flex; flex: none; color: rgba(255,255,255,0.4); transition: transform 0.15s; }
.hlp-accordion-chevron-open { transform: rotate(90deg); }
.hlp-accordion-content { padding: 0 16px 14px; }
.hlp-accordion-para { margin-bottom: 6px; font-size: 13px; line-height: 1.5; color: var(--hlp-muted-foreground); }
.hlp-accordion-para:last-child { margin-bottom: 0; }

/* FinalCta */
.hlp-final-cta { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding-block: clamp(80px, 12vw, 140px); text-align: center; }
.hlp-fc-glow {
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  height: 480px;
  width: 480px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  filter: blur(100px);
  background: conic-gradient(from 0deg, rgba(51,115,246,0.5), rgba(102,81,234,0.35), rgba(255,128,151,0.3), rgba(51,115,246,0.5));
}
.hlp-fc-ticket { position: relative; margin-inline: auto; width: 100%; max-width: 540px; padding-inline: 24px; }
.hlp-fc-top-stub {
  display: block;
  width: 100%;
  border-radius: 28px 28px 0 0;
  border: 1px solid var(--hlp-border);
  border-bottom: none;
  background: var(--hlp-card);
  box-shadow: 0 -20px 50px -36px rgba(0,0,0,0.6);
  -webkit-mask-image: radial-gradient(circle 14px at 0 100%, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 100%, transparent 14px, black 15px);
  -webkit-mask-composite: source-in;
  mask-image: radial-gradient(circle 14px at 0 100%, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 100%, transparent 14px, black 15px);
  mask-composite: intersect;
}
.hlp-fc-top-stub-inner { position: relative; z-index: 10; padding: 44px 32px 36px; }
@media (min-width: 640px) { .hlp-fc-top-stub-inner { padding-inline: 48px; } }
.hlp-fc-eyebrow { margin-bottom: 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.9); filter: drop-shadow(0 1px 6px rgba(0,0,0,0.5)); }
.hlp-fc-amount { margin-bottom: 6px; font-size: clamp(46px, 8.5vw, 76px); font-weight: 700; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: var(--hlp-foreground); filter: drop-shadow(0 2px 10px rgba(0,0,0,0.45)); }
.hlp-fc-total-label { font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.75); filter: drop-shadow(0 1px 6px rgba(0,0,0,0.5)); }
.hlp-fc-perforation-wrap { position: relative; height: 24px; }
.hlp-fc-perforation { position: absolute; inset-inline: 24px; top: 50%; border-top: 1px dashed var(--hlp-hairline); }
.hlp-fc-bottom-stub {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 28px 28px;
  border: 1px solid var(--hlp-border);
  border-top: none;
  background: var(--hlp-card);
  box-shadow: 0 40px 90px -36px rgba(0,0,0,0.6);
  -webkit-mask-image: radial-gradient(circle 14px at 0 0, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 0, transparent 14px, black 15px);
  -webkit-mask-composite: source-in;
  mask-image: radial-gradient(circle 14px at 0 0, transparent 14px, black 15px), radial-gradient(circle 14px at 100% 0, transparent 14px, black 15px);
  mask-composite: intersect;
}
.hlp-fc-bottom-stub-inner { padding: 36px 32px 44px; }
@media (min-width: 640px) { .hlp-fc-bottom-stub-inner { padding-inline: 48px; } }
.hlp-fc-title { margin-bottom: 10px; font-size: clamp(20px, 2.4vw, 26px); font-weight: 600; letter-spacing: -0.02em; }
.hlp-fc-copy { margin-bottom: 28px; font-size: 14.5px; color: var(--hlp-muted-foreground); }
.hlp-fc-cta { display: inline-flex; flex-direction: column; align-items: center; gap: 10px; }
.hlp-fc-cta-link { padding: 14px 32px; font-size: 16px; }

/* Footer */
.hlp-footer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  border-top: 1px solid var(--hlp-border);
  padding: 28px 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.3);
}
@media (min-width: 640px) {
  .hlp-footer { flex-direction: row; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 26px 32px; text-align: left; }
}
.hlp-footer-aurora-wrap { pointer-events: none; position: absolute; inset-inline: 0; bottom: 0; height: 120px; overflow: hidden; }
.hlp-footer-aurora { position: absolute; inset: 0; height: 100%; width: 100%; }
.hlp-footer-scrim { pointer-events: none; position: absolute; inset: 0; background: rgba(16,16,16,0.55); }
.hlp-footer-brand { position: relative; z-index: 10; display: flex; align-items: center; gap: 10px; }
.hlp-footer-logo { display: block; height: 20px; width: auto; opacity: 0.8; }
.hlp-footer-links { position: relative; z-index: 10; display: flex; flex-wrap: wrap; justify-content: center; gap: 18px; }
.hlp-footer-link { color: rgba(255,255,255,0.3); }
.hlp-footer-link:hover { color: var(--hlp-muted-foreground); }

/* Sticky mobile CTA */
.hlp-sticky-cta { position: sticky; bottom: 0; z-index: 20; border-top: 1px solid var(--hlp-border); background: rgba(16,16,16,0.85); backdrop-filter: blur(20px); padding: 12px 16px; }
@media (min-width: 640px) { .hlp-sticky-cta { display: none; } }
.hlp-sticky-cta-link { display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 12px; background: var(--hlp-primary); padding: 14px 24px; font-size: 15px; font-weight: 600; color: #fff; box-shadow: 0 8px 24px -6px rgba(51,115,246,0.55); }
`;

/* =========================================================================
 * Root component
 * =======================================================================*/

export default function HerondLotteryLanding({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="hlp-root" style={style}>
      <style>{HLP_CSS}</style>

      <div className="hlp-aurora-banner">
        <Aurora className="hlp-aurora-canvas" />
        <div className="hlp-aurora-fade" />
      </div>

      <Nav />

      <main className="hlp-main">
        <Hero />
        <RewardsWinners />
        <HowItWorks />
        <RulesFaq />
        <FinalCta />
        <StickyMobileCta />
      </main>

      <Footer />
    </div>
  );
}

HerondLotteryLanding.displayName = "Herond Lottery Landing";
