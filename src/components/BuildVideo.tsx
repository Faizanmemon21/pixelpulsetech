"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Minimal, elegant overlay copy — cycles like a product commercial
const TAGLINES = [
  "HAND BUILT",
  "CABLE MANAGED",
  "STRESS TESTED",
  "RTX READY",
  "QUALITY CHECKED",
  "BUILT FOR PERFORMANCE",
];

const TAGLINE_INTERVAL_MS = 3200;

export default function BuildVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Commercial-style rotating copy
  useEffect(() => {
    const id = setInterval(
      () => setTaglineIndex((i) => (i + 1) % TAGLINES.length),
      TAGLINE_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, []);

  // Play only while on screen — no decoding work when scrolled past
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* FULL-BLEED FOOTAGE — fills the viewport edge to edge */}
      <video
        ref={videoRef}
        src="/videos/pc-build.mp4"
        className="cine-video absolute inset-0 h-full w-full object-cover"
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* grade: deep blacks top and bottom, soft center */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      <div className="cine-vignette pointer-events-none absolute inset-0" />

      {/* heading overlaid on the footage */}
      <div className="pointer-events-none absolute top-20 inset-x-0 text-center px-6">
        <p className="text-xs tracking-[0.35em] text-red-400 font-mono mb-4">
          WATCH THE BUILD
        </p>
        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
          Every rig, <span className="text-red-500">assembled on camera</span>
        </h2>
      </div>

      {/* rotating tagline, bottom-left */}
      <div className="pointer-events-none absolute bottom-10 left-6 md:left-12 h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={taglineIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-xs tracking-[0.45em] text-white/85 font-mono"
          >
            {TAGLINES[taglineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* watermark — small, semi-transparent, bottom-right */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-6 md:right-12 h-10 w-10 rounded-lg object-cover opacity-[0.08] select-none"
      />
    </section>
  );
}
