import { ArrowUpRight, Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";

const supportLinks = [
  { name: "Contact us", href: "mailto:info@pixelpulsetech.pk" },
  { name: "Privacy Policy", href: "#" },
  { name: "Price Match Policy", href: "#" },
  { name: "Terms & Conditions", href: "#" },
  { name: "Communication Policy", href: "#" },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="relative bg-[#0c0707] border-t border-red-900/30">
      {/* soft red ambience along the top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(220,38,38,0.12), transparent 70%)",
        }}
      />

      {/* brand heartbeat — pulse line glowing behind the columns */}
      <img
        src="/pulse-line.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none select-none absolute left-1/2 top-1/2 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 opacity-30"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* brand + slogan */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PixelPulse Tech"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <h3 className="text-red-500 text-xl font-bold tracking-tight">
              PixelPulseTech
            </h3>
          </div>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Built for gamers who demand uncompromising performance. From custom
            gaming PCs to premium components, we deliver cutting-edge hardware,
            expert craftsmanship, and unbeatable value—all backed by reliable
            service you can trust.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="glow-icon flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="glow-icon flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="glow-icon flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
            >
              <Youtube className="size-4" />
            </a>
          </div>
        </div>

        {/* help & support */}
        <div>
          <h3 className="text-red-500 text-lg font-bold tracking-tight">
            Help &amp; Support
          </h3>
          <ul className="mt-4 space-y-3">
            {supportLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="glow-link text-sm text-white/70"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h3 className="text-red-500 text-lg font-bold tracking-tight">Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <a
                href="tel:+923311392238"
                className="glow-link flex items-center gap-2"
              >
                <Phone className="size-4 text-red-500" /> +92 331-1392238
              </a>
            </li>
            <li>
              <a
                href="mailto:info@pixelpulsetech.pk"
                className="glow-link flex items-center gap-2"
              >
                <Mail className="size-4 text-red-500" /> info@pixelpulsetech.pk
              </a>
            </li>
            <li className="font-mono text-[11px] tracking-[0.2em] text-white/50">
              WWW.PIXELPULSETECH.PK
            </li>
          </ul>
        </div>

        {/* facebook group */}
        <div>
          <h3 className="text-red-500 text-lg font-bold tracking-tight">
            Join Our Facebook Group!
          </h3>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Join our Facebook group for exclusive discounts, deals and
            giveaways!
          </p>
          <a
            href="#"
            className="glow-btn mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 text-sm text-white hover:bg-red-600 hover:border-red-600"
          >
            Join our Facebook Group <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-white/10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <span>© 2026 PixelPulseTech · Built for champions</span>
          <span className="font-mono text-[11px] tracking-[0.3em]">
            POWER. PERFORMANCE. <span className="text-red-500">PRECISION.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
