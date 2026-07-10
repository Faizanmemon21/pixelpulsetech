"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/* =========================
   SCROLL SCRIPT — the camera "zooms into" regions of the real
   PC photo. x/y = transform-origin (% of image), s = zoom level.
========================= */

const FOCUS = [
  { x: 50, y: 50, s: 1 }, // overview — whole rig
  { x: 45, y: 36, s: 2.0 }, // CPU / pump block
  { x: 53, y: 33, s: 2.2 }, // RAM sticks
  { x: 42, y: 62, s: 2.0 }, // GPU
  { x: 47, y: 15, s: 2.0 }, // 360mm radiator up top
  { x: 50, y: 50, s: 1.06 }, // finale pull-back
];

const SEGMENTS = FOCUS.length - 1;

const PARTS = [
  { label: "PROCESSOR", title: "AMD Ryzen 7 9800X3D", img: "/specs/cpu.jpg" },
  { label: "MEMORY", title: "32GB DDR5 6000MHz", img: "/specs/ram.jpg" },
  { label: "GRAPHICS", title: "NVIDIA GeForce RTX 5080", img: "/specs/gpu.jpg" },
  { label: "COOLING", title: "360mm ARGB Liquid Cooler", img: "/specs/cooler.jpg" },
];

export default function SpecJourney() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const step = Math.round(self.progress * SEGMENTS);
        setActive((prev) => (prev === step ? prev : step));
      },
    });

    return () => st.kill();
  }, []);

  const focus = FOCUS[active];
  const part = active >= 1 && active <= PARTS.length ? PARTS[active - 1] : null;

  return (
    <section ref={trackRef} id="inside" className="relative bg-black h-[550vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* THE RIG — real photo; scroll moves the "camera" between details */}
        <img
          src="/specs/pc-showcase.jpg"
          alt="PixelPulse custom gaming PC with red RGB lighting"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `scale(${focus.s})`,
            transformOrigin: `${focus.x}% ${focus.y}%`,
            transition:
              "transform 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* grade — keeps edges dark so the UI reads over the photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
        <div className="cine-vignette pointer-events-none absolute inset-0" />

        {/* overview label */}
        <div
          className={`absolute top-24 inset-x-0 text-center transition-all duration-700 ${
            active === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-xs tracking-[0.35em] text-red-400 font-mono mb-3">
            INSIDE THE MACHINE
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
            Gaming PC
          </h2>
          <p className="text-white/50 text-sm mt-3 font-mono tracking-widest">
            SCROLL TO EXPLORE EVERY COMPONENT
          </p>
        </div>

        {/* spec card — branded panel image per component */}
        <div className="absolute inset-x-4 bottom-8 md:inset-x-auto md:bottom-auto md:right-14 md:top-1/2 md:-translate-y-1/2 md:w-[26rem] max-w-full">
          <AnimatePresence mode="wait">
            {part && (
              <motion.div
                key={part.label}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <img
                  src={part.img}
                  alt={`${part.label}: ${part.title}`}
                  className="w-full h-auto rounded-2xl border border-red-500/25 shadow-[0_0_50px_-12px_rgba(244,63,94,0.45)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* finale — big text + pulse */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${
            active === SEGMENTS
              ? "opacity-100 bg-black/60"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="pulse-ring absolute h-40 w-40 rounded-full border-2 border-rose-500/60" />
            <span
              className="pulse-ring absolute h-40 w-40 rounded-full border-2 border-red-400/50"
              style={{ animationDelay: "-0.8s" }}
            />
          </div>

          {["POWER.", "PERFORMANCE.", "PRECISION."].map((word, i) => (
            <h2
              key={word}
              className={`text-white text-4xl md:text-7xl font-bold tracking-tight leading-tight transition-all duration-700 ${
                active === SEGMENTS
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 180}ms` }}
            >
              {i === 2 ? <span className="text-red-500">{word}</span> : word}
            </h2>
          ))}
        </div>

        {/* scroll hint */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] font-mono transition-opacity duration-500 ${
            active === SEGMENTS ? "opacity-0" : "opacity-100"
          }`}
        >
          SCROLL
        </div>
      </div>
    </section>
  );
}
