"use client";

import { useEffect, useState } from "react";
import { HEROND_POINT_LINK } from "@/data/season";

/** Bump when a new Herond Browser build ships. */
const VERSION = "2_6_1";

/** Generic download page — used whenever OS/arch can't be resolved confidently. */
const FALLBACK_LINK = "https://herond.org/download";

/** Reliable Safari detection via vendor string (more robust than UA regex). */
function isSafari(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Safari/i.test(navigator.userAgent) &&
    /Apple Computer/i.test(navigator.vendor)
  );
}

/** Detects Apple Silicon via the WebGL renderer string — works in Safari, which hides userAgentData. */
function detectMacArchViaWebGL(): "arm" | "x64" | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;

    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string;

    // Safari < 16.4: renderer = "Apple M1 GPU", "Apple M2 GPU", etc.
    if (/Apple M\d/i.test(renderer)) return "arm";
    // Safari 16.4+: renderer is the generic "Apple GPU" (privacy reasons) — only
    // appears on Apple Silicon; Intel Macs report "Intel Iris", "AMD Radeon", etc.
    if (/Apple GPU/i.test(renderer) && /Apple/i.test(vendor)) return "arm";

    return "x64";
  } catch {
    return null;
  }
}

function installerFor(os: string, arch: string): string {
  switch (`${os}-${arch}`) {
    case "Mac-arm":
      return `https://dl.herond.org/mac_stable_arm64/herond_browser_${VERSION}.dmg`;
    case "Mac-x64":
      return `https://dl.herond.org/mac_stable_x64/herond_browser_${VERSION}.dmg`;
    case "Windows-x64":
      return `https://dl.herond.org/win_stable_x64/herond_installer_meta_en_${VERSION}.exe`;
    case "Windows-x86":
      return `https://dl.herond.org/win_stable_x86/herond_installer_meta_en_32_${VERSION}.exe`;
  }
  switch (os) {
    case "Android":
      return "https://play.google.com/store/apps/details?id=com.herond.android.browser&hl=en";
    case "iOS":
      return "https://apps.apple.com/vn/app/herond-browser/id6462850011";
    default:
      return FALLBACK_LINK;
  }
}

interface NavigatorUAData {
  getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; bitness?: string }>;
}

/**
 * Resolves the right install link (installer/App Store/Play Store) for the
 * visitor's OS + architecture, client-side only. Starts at HEROND_POINT_LINK
 * during detection/SSR and swaps in the resolved link once known.
 */
export function useDownloadLink(): string {
  const [href, setHref] = useState(HEROND_POINT_LINK);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";

    let os = "Other";
    if (/iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      os = "iOS";
    } else if (/android/i.test(ua)) {
      os = "Android";
    } else if (/Win/i.test(ua)) {
      os = "Windows";
    } else if (/Mac/i.test(ua)) {
      os = "Mac";
    }

    // macOS Safari: WebGL renderer instead of userAgentData (Safari doesn't expose it).
    if (os === "Mac" && isSafari()) {
      setHref(installerFor(os, detectMacArchViaWebGL() ?? "x64"));
      return;
    }

    const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
    if (nav.userAgentData) {
      nav.userAgentData
        .getHighEntropyValues(["architecture", "bitness"])
        .then((data) => {
          let arch = "";
          if (os === "Windows") arch = data.bitness === "64" ? "x64" : "x86";
          if (os === "Mac") arch = data.architecture === "arm" ? "arm" : "x64";
          setHref(installerFor(os, arch));
        })
        .catch(() => setHref(installerFor(os, "")));
      return;
    }

    // UA-string fallback (no userAgentData — Safari on Mac already handled above).
    let arch = "";
    if (os === "Windows") {
      arch = ua.includes("Win64") || ua.includes("WOW64") ? "x64" : "x86";
    } else if (os === "Mac") {
      arch = "x64";
    }
    setHref(installerFor(os, arch));
  }, []);

  return href;
}
