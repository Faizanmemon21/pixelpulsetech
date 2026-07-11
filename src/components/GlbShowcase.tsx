"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Wrench } from "lucide-react";

// The canvas (and the whole three.js chunk behind it) loads async — this
// shell with the headline is in the main bundle, so the LCP text paints
// without waiting for ~250KB of 3D code to download and parse
const GlbScene = lazy(() => import("./GlbScene"));

export default function GlbShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  // Mount the canvas once on first approach, then keep it alive and only
  // pause the frameloop — repeatedly creating/destroying WebGL contexts
  // while scrolling causes hitches and leaks GPU memory on weak hardware
  const [everInView, setEverInView] = useState(false);

  // Only render (and only download the model) once the section approaches
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rig"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {everInView && (
        <Suspense fallback={null}>
          <GlbScene active={inView} />
        </Suspense>
      )}

      {/* edge grade so copy reads over the render */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      {/* COPY + CTA — left anchored, red system */}
      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="w-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <div id="hero-copy" className="max-w-xl text-center md:text-left">
            <p className="text-xs tracking-[0.35em] text-red-400 font-mono mb-5">
              YOUR DREAM RIG AWAITS
            </p>

            <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              READY TO
              <br />
              <span className="text-red-500">DOMINATE?</span>
            </h2>

            <p className="text-gray-300 mt-6 max-w-md mx-auto md:mx-0">
              Pick a battle-proven rig or spec every component yourself. Hand
              built, stress tested, and shipped ready to boot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start pointer-events-auto">
              <a
                href="#/builds"
                className="glow-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl"
              >
                <Wrench className="size-4" />
                Start Your Build
                <ArrowUpRight className="size-4" />
              </a>

              <a
                href="mailto:builds@pixelpulsetech.pk"
                className="glow-btn inline-flex items-center justify-center px-7 py-3.5 border border-white/25 text-white rounded-xl hover:bg-white/10"
              >
                Talk to a Builder
              </a>
            </div>

            <p className="mt-10 font-mono text-[10px] tracking-[0.35em] text-white/40">
              PIXELPULSETECH · WWW.PIXELPULSETECH.PK
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 text-xs tracking-[0.3em] font-mono">
        SCROLL
      </div>
    </section>
  );
}
