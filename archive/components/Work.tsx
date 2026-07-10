import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Signature PixelPulse builds — full-bleed image, name bottom-left,
// brief spec context.
const slides = [
  {
    title: "Vortex X",
    client: "4K FLAGSHIP",
    desc: "RTX 5090 · Ryzen 9 9950X3D · custom loop — 120 fps at max settings.",
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Neon Strike",
    client: "1440P ESPORTS",
    desc: "RTX 5070 Ti · 9800X3D — 165+ fps for ranked grinders.",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Pulse Core",
    client: "1080P STARTER",
    desc: "RTX 5060 · Ryzen 5 9600X — 144 fps Ultra without breaking the bank.",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Ghost White",
    client: "CREATOR HYBRID",
    desc: "Stream, edit and game on one silent, all-white showpiece.",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Aurora RGB",
    client: "SHOWCASE BUILD",
    desc: "Wall-to-wall glass and addressable RGB synced to your gameplay.",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const totalScroll = (slides.length - 1) * window.innerWidth;

      // Main horizontal scroll
      const scrollTween = gsap.to(trackRef.current, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Progress bar animation
      gsap.to(progressRef.current, {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalScroll}`,
          scrub: true,
        },
      });

      // Parallax + text reveal per slide — skipped for reduced-motion users
      // so slide titles are never trapped at opacity 0
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".panel");

        panels.forEach((panel) => {
          const img = panel.querySelector("img");
          const text = panel.querySelector("h2");

          gsap.fromTo(
            img,
            { scale: 1.2 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );

          gsap.fromTo(
            text,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrollTween,
                start: "left center",
                end: "center center",
                scrub: true,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="builds"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-white/10 z-50">
        <div
          ref={progressRef}
          className="h-full w-full bg-cyan-400 scale-x-0 origin-left"
        />
      </div>

      {/* Section label */}
      <div className="absolute top-8 left-8 z-40">
        <p className="text-xs tracking-[0.35em] text-white/50 font-mono">
          FEATURED BUILDS
        </p>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex h-screen"
        style={{ width: `${slides.length * 100}vw` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="panel relative w-screen h-screen flex items-center justify-center overflow-hidden"
          >
            {/* Image */}
            <img
              src={slide.image}
              alt={`${slide.title} — ${slide.client} gaming PC build`}
              loading="lazy"
              className="absolute w-full h-full object-cover opacity-60"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Text */}
            <h2 className="relative text-white text-6xl md:text-8xl font-bold tracking-tight text-center px-6">
              {slide.title}
            </h2>

            {/* Build card — glass panel, name bottom-left, spec + price */}
            <div className="absolute bottom-10 left-8 md:left-12 max-w-sm rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-5">
              <p className="text-xs tracking-[0.3em] text-cyan-300 font-mono mb-2">
                {slide.client.toUpperCase()}
              </p>
              <p className="text-white/80 text-sm leading-relaxed">
                {slide.desc}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="font-mono text-white font-semibold">
                  from ${slide.price.toLocaleString()}
                </span>
                <a
                  href="#pricing"
                  className="text-rose-400 hover:text-rose-300 text-sm font-semibold transition"
                >
                  Configure →
                </a>
              </div>
            </div>

            <div className="absolute bottom-10 right-8 md:right-12 text-white/60 text-sm font-mono">
              {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
