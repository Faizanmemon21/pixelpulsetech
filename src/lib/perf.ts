/**
 * Device-tier detection, decided once at startup — before any canvas mounts.
 *
 * "Lite" machines start at 1x pixel ratio with the bloom pass disabled,
 * instead of stuttering for a few seconds until PerformanceMonitor reacts
 * to dropped frames. The monitor stays active as a fallback for weak
 * hardware this heuristic misses.
 */
function detectLiteMode(): boolean {
  if (typeof window === "undefined") return false;

  const nav = navigator as Navigator & { deviceMemory?: number };
  // Few cores or little RAM — budget-laptop territory
  if ((nav.hardwareConcurrency ?? 8) <= 4) return true;
  if ((nav.deviceMemory ?? 8) <= 4) return true;

  // Integrated-GPU probe: Intel UHD/Iris and AMD APUs ("Radeon(TM) Graphics")
  // share system RAM and can't hold 60fps with post-processing at 1.5x dpr
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(
        dbg
          ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER)
      );
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (/intel|iris|uhd graphics|radeon\(tm\) graphics|vega \d/i.test(renderer)) {
        return true;
      }
    }
  } catch {
    // best-effort probe — fall through to full quality
  }

  return false;
}

export const liteMode = detectLiteMode();
