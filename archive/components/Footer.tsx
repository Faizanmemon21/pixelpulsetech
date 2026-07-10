import { Vortex } from "@/components/ui/vortex";
import { Facebook, Linkedin, Twitter, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-black">
      {/* Vortex CTA — colour earned through motion, on a black canvas */}
      <div className="h-screen w-full overflow-hidden">
        <Vortex
          backgroundColor="black"
          baseHue={180}
          rangeY={300}
          particleCount={350}
          className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
        >
          <p className="text-xs tracking-[0.35em] text-cyan-300 font-mono mb-6">
            FEEL THE PULSE
          </p>

          <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Your dream rig is one build away.
          </h2>

          <p className="text-white/60 text-sm md:text-lg max-w-xl mt-6">
            Custom-built, benchmark-matched, and shipped ready to boot. Talk to
            a builder and spec your PixelPulse today.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <a
              href="mailto:builds@pixelpulsetech.com"
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-400 transition duration-200 rounded-lg text-white font-semibold"
            >
              Start your build <ArrowUpRight className="size-4" />
            </a>
            <a
              href="#pricing"
              className="px-6 py-3 text-white/80 hover:text-white transition"
            >
              Compare tiers →
            </a>
          </div>
        </Vortex>
      </div>

      {/* Utility bar — minimal, like the rest of the IA */}
      <div className="border-t border-white/10 px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/70">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PixelPulse Tech"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span>© 2026</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> Built &amp; shipped from the USA
            </span>
            <a href="tel:+18007493577" className="flex items-center gap-2 hover:text-white transition">
              <Phone className="size-4" /> 1-800-749-3577
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white transition p-3 -m-1 inline-flex"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-white transition p-3 -m-1 inline-flex"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter / X"
              className="hover:text-white transition p-3 -m-1 inline-flex"
            >
              <Twitter className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
