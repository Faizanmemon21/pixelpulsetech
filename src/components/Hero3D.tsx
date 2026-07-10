"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

// The three.js scene is a separate chunk so the headline paints
// immediately while the 3D code downloads in the background.
const HeroScene = lazy(() => import("./HeroScene"));

/* =========================
   HERO — hardware front and center
========================= */

export default function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  // Don't create this second WebGL context (or download the chunk) until
  // the section approaches — it sits at the bottom of the page, so paying
  // for it during initial load starves low-end machines
  const [everInView, setEverInView] = useState(false);

  // Pause the WebGL frameloop once the hero is scrolled out of view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      { threshold: 0.05, rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* WEBGL SCENE */}
      {everInView && (
        <Suspense fallback={null}>
          <HeroScene active={inView} />
        </Suspense>
      )}

      {/* UI OVERLAY — left-aligned beside the rig on desktop */}
      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="w-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <div className="max-w-xl text-center md:text-left bg-black/30 md:bg-transparent rounded-2xl py-8 md:py-0">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
              <img
                src="/logo.png"
                alt="PixelPulse Tech"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <p className="text-xs tracking-[0.35em] text-cyan-300 font-mono">
                CUSTOM RIGS
              </p>
            </div>

            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              NEXT GEN
              <br />
              <span className="text-cyan-400">GAMING PCS</span>
            </h1>

            <p className="text-gray-300 mt-6 max-w-md mx-auto md:mx-0">
              High-performance custom rigs powered by next-gen GPU
              architecture. Benchmark-matched to your target framerate.
            </p>

            {/* HUD spec chips */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6 font-mono text-[11px] tracking-wider">
              {["RTX 50 SERIES", "240 FPS", "DDR5-8000", "GEN5 NVME"].map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1.5 rounded border border-cyan-400/30 text-cyan-300 bg-cyan-950/30"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex gap-4 mt-8 justify-center md:justify-start pointer-events-auto">
              <a
                href="#/builds"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition"
              >
                Build Now
              </a>

              <a
                href="#inside"
                className="px-6 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition"
              >
                Explore
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 text-xs tracking-[0.3em] font-mono">
        SCROLL
      </div>
    </section>
  );
}
