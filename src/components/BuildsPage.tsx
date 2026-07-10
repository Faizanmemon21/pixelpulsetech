"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  MemoryStick,
  PlugZap,
} from "lucide-react";

/* =========================
   RED SYSTEM — 60/30/10 color discipline:
   60% near-black canvas · 30% dark surfaces · 10% red action/emphasis.
   red-500/600 = action, red-400 = small accent text (AA on black),
   white = hierarchy, warm gray for support copy.
========================= */

const RIGS = [
  {
    name: "PULSE CORE",
    price: "$1,299",
    tag: "1080p / 1440p esports",
    popular: false,
    specs: [
      "AMD Ryzen 5 9600X",
      "GeForce RTX 5060 Ti 16GB",
      "32GB DDR5 6000MHz",
      "1TB Gen4 NVMe SSD",
      "240mm Liquid Cooler",
      "750W Gold PSU",
    ],
  },
  {
    name: "PULSE PRO",
    price: "$2,199",
    tag: "1440p / 4K high-refresh",
    popular: true,
    specs: [
      "AMD Ryzen 7 9800X3D",
      "GeForce RTX 5080 16GB",
      "32GB DDR5 6000MHz RGB",
      "2TB Gen4 NVMe SSD",
      "360mm ARGB Liquid Cooler",
      "850W Gold PSU",
    ],
  },
  {
    name: "PULSE X",
    price: "$3,499",
    tag: "4K max settings, no limits",
    popular: false,
    specs: [
      "AMD Ryzen 9 9950X3D",
      "GeForce RTX 5090 32GB",
      "64GB DDR5 6400MHz RGB",
      "4TB Gen5 NVMe SSD",
      "420mm ARGB Liquid Cooler",
      "1200W Platinum PSU",
    ],
  },
];

const COMPONENTS = [
  {
    icon: Cpu,
    name: "Processors",
    desc: "AMD Ryzen 9000 & Intel Core Ultra — X3D gaming chips in stock",
  },
  {
    icon: CircuitBoard,
    name: "Graphics Cards",
    desc: "RTX 50 series from ASUS ROG, MSI Suprim & Gigabyte AORUS",
  },
  {
    icon: MemoryStick,
    name: "Memory",
    desc: "DDR5 6000–8000MHz RGB kits, tuned and XMP-validated",
  },
  {
    icon: HardDrive,
    name: "Storage",
    desc: "Gen4 & Gen5 NVMe SSDs up to 4TB — OS-ready, heatsinked",
  },
  {
    icon: Fan,
    name: "Cooling",
    desc: "240–420mm ARGB liquid coolers and premium air towers",
  },
  {
    icon: PlugZap,
    name: "Power Supplies",
    desc: "80+ Gold & Platinum, fully modular, ATX 3.1 ready",
  },
];

export default function BuildsPage() {
  // New page — always open at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="#/"
            className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="size-4" />
            <img
              src="/logo.png"
              alt="PixelPulse Tech"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="hidden sm:inline">Back to home</span>
          </a>
          <a
            href="mailto:builds@pixelpulsetech.pk"
            className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold transition"
          >
            Talk to a Builder
          </a>
        </div>
      </header>

      {/* page hero */}
      <section className="relative px-6 pt-20 pb-14 text-center overflow-hidden">
        {/* soft red ambience, kept at the edges (10% rule) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(220,38,38,0.18), transparent 70%)",
          }}
        />
        <p className="relative text-xs tracking-[0.35em] text-red-400 font-mono mb-4">
          PIXELPULSETECH ARSENAL
        </p>
        <h1 className="relative text-4xl md:text-6xl font-bold tracking-tight">
          Choose your <span className="text-red-500">weapon</span>
        </h1>
        <p className="relative text-white/60 mt-5 max-w-xl mx-auto">
          Three battle-proven rigs, or build your own from hand-picked
          components. Every machine is assembled, cable-managed and stress
          tested by our builders.
        </p>
      </section>

      {/* rigs */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 items-start">
          {RIGS.map((rig) => (
            <div
              key={rig.name}
              className={`relative rounded-2xl p-7 bg-[#120b0b] transition hover:-translate-y-1 duration-300 ${
                rig.popular
                  ? "border-2 border-red-600 shadow-[0_0_60px_-18px_rgba(220,38,38,0.55)]"
                  : "border border-white/10 hover:border-white/25"
              }`}
            >
              {rig.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-600 text-[10px] font-mono tracking-[0.25em]">
                  MOST POPULAR
                </span>
              )}

              <p className="font-mono text-[11px] tracking-[0.4em] text-red-400">
                {rig.tag.toUpperCase()}
              </p>
              <h2 className="text-2xl font-bold mt-3 tracking-tight">{rig.name}</h2>
              <p className="text-4xl font-bold mt-4">
                {rig.price}
                <span className="text-sm text-white/50 font-normal"> / built</span>
              </p>

              <ul className="mt-6 space-y-3">
                {rig.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-3 text-sm text-white/75">
                    <Check className="size-4 mt-0.5 shrink-0 text-red-500" />
                    {spec}
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:builds@pixelpulsetech.pk?subject=Configure ${rig.name}`}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                  rig.popular
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "border border-white/20 hover:bg-white/10 text-white"
                }`}
              >
                Configure This Rig <ArrowUpRight className="size-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* components */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.35em] text-red-400 font-mono mb-4">
              BUILD IT YOURSELF
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Premium components
            </h2>
            <p className="text-white/60 mt-4 max-w-lg mx-auto">
              Every part we sell is the part we'd put in our own rigs.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COMPONENTS.map(({ icon: Icon, name, desc }) => (
              <a
                key={name}
                href={`mailto:builds@pixelpulsetech.pk?subject=${name} inquiry`}
                className="group rounded-2xl border border-white/10 bg-[#120b0b] p-6 transition hover:border-red-600/60 hover:-translate-y-1 duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-semibold text-lg">{name}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-red-400 group-hover:text-red-300 transition">
                  Browse <ArrowUpRight className="size-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* bottom bar */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PixelPulse Tech"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span>© 2026 · Built for champions</span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.3em]">
            POWER. PERFORMANCE. <span className="text-red-500">PRECISION.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
