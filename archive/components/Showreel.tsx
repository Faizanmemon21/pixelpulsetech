import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap } from "lucide-react";
import { useState, type CSSProperties } from "react";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

// RGB lighting profiles — clicking the center preview cycles the whole
// frame's color scheme, like flipping presets on your rig's controller.
const PROFILES = [
  { name: "CYAN SURGE", c1: "#00ffff", c2: "#0066ff" },
  { name: "VIOLET STORM", c1: "#a855f7", c2: "#6d28d9" },
  { name: "EMERALD GHOST", c1: "#00ff88", c2: "#0d9488" },
  { name: "INFERNO", c1: "#f43f5e", c2: "#f97316" },
];

const totalProfiles = PROFILES.length;

// Animated lighting panel that stands in for video footage:
// two drifting neon orbs + scanlines on a near-black field.
function RgbPanel({
  profile,
  id,
  className,
  style,
  showName = false,
}: {
  profile: (typeof PROFILES)[number];
  id?: string;
  className?: string;
  style?: CSSProperties;
  showName?: boolean;
}) {
  return (
    <div
      id={id}
      className={`relative overflow-hidden bg-[#05050a] ${className ?? ""}`}
      style={style}
    >
      <div
        className="rgb-orb absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full opacity-60"
        style={{ background: profile.c1 }}
      />
      <div
        className="rgb-orb-alt absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full opacity-50"
        style={{ background: profile.c2 }}
      />
      <div className="scanlines absolute inset-0" />
      {showName && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold text-[7vw] tracking-widest select-none"
            style={{ color: `${profile.c1}22` }}
          >
            {profile.name}
          </span>
        </div>
      )}
    </div>
  );
}

const Showreel = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const handleMiniClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalProfiles) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    // Decorative clip morph only runs when the user allows motion
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set("#video-frame", {
        clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
        borderRadius: "0% 0% 40% 10%",
      });
      gsap.from("#video-frame", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        borderRadius: "0% 0% 0% 0%",
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: "#video-frame",
          start: "center center",
          end: "bottom center",
          scrub: true,
        },
      });
    });
  });

  const current = PROFILES[currentIndex - 1];
  const next = PROFILES[currentIndex % totalProfiles];

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden bg-black">
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-[#05050a]"
      >
        <div>
          {/* full-bleed lighting panel — the current RGB profile */}
          <RgbPanel
            profile={current}
            showName
            className="absolute left-0 top-0 size-full"
          />

          {/* center mini preview — hover to reveal the NEXT profile, click to switch */}
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <RgbPanel
                  profile={next}
                  id="current-video"
                  className="size-64 origin-center scale-150 rounded-lg border border-white/20"
                />
                <span className="absolute inset-x-0 bottom-4 text-center font-mono text-[10px] tracking-[0.3em] text-white/80">
                  TAP // {next.name}
                </span>
              </div>
            </VideoPreview>
          </div>

          {/* zooming panel that expands from the preview on click */}
          <RgbPanel
            profile={current}
            id="next-video"
            showName
            className="absolute-center invisible absolute z-20 size-64 rounded-lg"
          />
        </div>

        <h2 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
          G<b>A</b>MING
        </h2>

        <div className="absolute left-0 top-0 z-40 size-full pointer-events-none">
          <div className="mt-24 px-5 sm:px-10">
            <h2 className="special-font hero-heading text-blue-100">
              redefi<b>n</b>e
            </h2>

            <p className="mb-5 max-w-72 font-robert-regular text-blue-100">
              Your rig, your spectrum <br /> Click the core to cycle RGB
            </p>

            <div className="pointer-events-auto w-fit" onClick={handleMiniClick}>
              <Button
                id="cycle-rgb"
                title="Cycle RGB profile"
                leftIcon={<Zap className="inline size-4 mr-1 -mt-0.5" />}
                containerClass="bg-cyan-400 flex-center gap-1"
              />
            </div>
          </div>
        </div>

        {/* HUD readout of the active profile */}
        <div className="absolute bottom-6 left-5 sm:left-10 z-40 font-mono text-[11px] tracking-[0.25em] text-white/80 border border-white/20 bg-black/40 backdrop-blur-sm rounded px-3 py-2">
          RGB PROFILE // <span style={{ color: current.c1 }}>{current.name}</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="special-font hero-heading absolute bottom-5 right-5 text-blue-75"
      >
        G<b>A</b>MING
      </div>
    </div>
  );
};

export default Showreel;
