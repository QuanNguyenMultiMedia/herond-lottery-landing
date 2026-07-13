"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 position;
out vec2 v_uv;
void main() {
  v_uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
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

// Brand palette: primary blue, CTA purple, accent pink, plus reddish accent.
const CORE_COLORS = new Float32Array([
  0.2, 0.451, 0.965, // primary #3373f6
  0.4, 0.318, 0.918, // hp-cta-to-ish purple #6651ea
  1.0, 0.502, 0.592, // hp-pink #ff8097
  0.803, 0.036, 0.13, // reddish #e83669
  0.2, 0.451, 0.965, // repeat primary to close the loop
  0, 0, 0,
  0, 0, 0,
  0, 0, 0,
]);
const CORE_POSITIONS = new Float32Array([0.1, 0.275, 0.45, 0.625, 0.15, 0, 0, 0]);
const CORE_WIDTHS = new Float32Array([0.2, 0.2, 0.2, 0.2, 0.14, 0, 0, 0]);
const CORE_HEIGHTS = new Float32Array([1, 1, 1, 1, 1.6, 1, 1, 1]);
const CORE_GLOWS = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);

export function FooterAurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: true });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
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
      // Backing store must track devicePixelRatio — without it, the shader's
      // per-pixel grain/dither is sized in CSS px and reads as blotchy/coarse
      // on any HiDPI screen instead of the fine grain it's meant to be.
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
      gl.uniform3fv(coreColorsLoc, CORE_COLORS);
      gl.uniform1fv(beamPosLoc, CORE_POSITIONS);
      gl.uniform1fv(beamWidthLoc, CORE_WIDTHS);
      gl.uniform1fv(beamHeightLoc, CORE_HEIGHTS);
      gl.uniform1fv(glowLoc, CORE_GLOWS);
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
