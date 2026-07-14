"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Ported from a React Native Skia runtime shader (float2/half4 -> vec2/vec4,
// custom fragCoord param -> gl_FragCoord). uv.y is flipped vs. the Skia
// original since WebGL's fragment coordinate origin is bottom-left.
const FRAGMENT_SHADER = `
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

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0, 0, 0];
}

// Brand palette: primary blue, the CTA-gradient purple, and the accent pink —
// same trio used for the hero panel's conic border.
const COLOR_1 = hexToRgb("#3373f6");
const COLOR_2 = hexToRgb("#6651ea");
const COLOR_3 = hexToRgb("#ff8097");
const SKY = hexToRgb("#101010");

export function Aurora({ className }: { className?: string }) {
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
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
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
      gl.uniform3f(uColor2, 0.2000, 0.4510, 0.9647);
      gl.uniform3f(uColor3, 0.2000, 0.4510, 0.9647);
      gl.uniform3f(uSkyTop, 0.0118, 0.0078, 0.0353);
      gl.uniform3f(uSkyBottom, 0.0941, 0.0431, 0.1686);
      gl.uniform1f(uSpeed, 0.0500);
      gl.uniform1f(uIntensity, 1.4000);
      gl.uniform2f(uWaveDir, -26.5000, -23.5000);
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
