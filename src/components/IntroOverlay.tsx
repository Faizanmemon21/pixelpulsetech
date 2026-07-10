"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

// Full text lives inside BOTH panels (overflow-hidden shows one half each),
// so the wordmark physically cracks apart when the screen splits.
function Wordmark() {
  return (
    <span
      className="intro-text inline-block whitespace-nowrap text-white font-bold text-2xl md:text-4xl tracking-[0.35em]"
      style={{
        fontFamily: '"Orbitron", sans-serif',
        textShadow: "0 0 24px rgba(244,63,94,0.55), 0 0 60px rgba(244,63,94,0.25)",
      }}
    >
      PIXEL<span className="text-red-500">PULSE</span>TECH
    </span>
  );
}

// Module-level flag: the intro plays once per page load, even if the
// user navigates to another route and back (remounting this component)
let hasPlayed = false;

export default function IntroOverlay() {
  const [done, setDone] = useState(hasPlayed);

  useEffect(() => {
    // Reduced-motion users skip straight to the site; replays are skipped too
    if (hasPlayed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    hasPlayed = true;

    // Lock scrolling until the reveal finishes
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setDone(true);
        },
      });

      tl.set("#hero-copy", { y: 48, opacity: 0 })
        // wordmark fades and scales in
        .fromTo(
          ".intro-text",
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" }
        )
        // glowing seam ignites down the center
        .fromTo(
          ".intro-line",
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 0.35, ease: "power2.inOut" },
          0.5
        )
        .to(".intro-line", { opacity: 0, duration: 0.25 }, 1.0)
        // the screen cracks from the center — panels slide apart
        // with a touch of motion blur
        .to(
          ".intro-left",
          { xPercent: -100, filter: "blur(5px)", duration: 0.95, ease: "power4.inOut" },
          1.0
        )
        .to(
          ".intro-right",
          { xPercent: 100, filter: "blur(5px)", duration: 0.95, ease: "power4.inOut" },
          1.0
        )
        // hero copy rises into place underneath
        .to(
          "#hero-copy",
          { y: 0, opacity: 1, duration: 0.95, ease: "power4.out" },
          1.2
        );
    });

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden="true">
      {/* left half — shows the left half of the wordmark */}
      <div className="intro-left absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-black">
        <div className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2">
          <Wordmark />
        </div>
      </div>

      {/* right half — shows the right half of the wordmark */}
      <div className="intro-right absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-black">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
          <Wordmark />
        </div>
      </div>

      {/* glowing seam where the screen cracks open */}
      <div
        className="intro-line absolute top-0 h-full w-[2px]"
        style={{
          left: "calc(50% - 1px)",
          transformOrigin: "center",
          background:
            "linear-gradient(to bottom, transparent, #f43f5e 20%, #fff 50%, #f43f5e 80%, transparent)",
          boxShadow: "0 0 18px 2px rgba(244,63,94,0.8)",
        }}
      />
    </div>
  );
}
