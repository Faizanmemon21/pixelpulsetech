"use client";

import * as React from "react";
import { Search, ShoppingCart } from "lucide-react";

const navLinks = [
  { name: "CUSTOM BUILD", href: "#/builds" },
  { name: "SHOP", href: "#/builds" },
  { name: "NEW ARRIVAL", href: "#/builds" },
  { name: "CATEGORY", href: "#/builds" },
  { name: "CONTACT", href: "#contact" },
];

export function Navbar() {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.hash = "#/builds";
  };

  return (
    <>
      <header className="relative z-40">
        {/* ANNOUNCEMENT BAR */}
      <div className="bg-black border-b border-white/10 px-4 py-2 text-center">
        <p className="text-[10px] md:text-xs font-mono tracking-[0.18em] text-white/85">
          POWER. PERFORMANCE. <span className="text-red-500">PRECISION.</span>{" "}
          — CUSTOM GAMING PCS BUILT FOR CHAMPIONS
        </p>
      </div>

      {/* MAIN ROW — wordmark · search · login · cart */}
      <div className="bg-[#0b0606] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-4">
          {/* logo icon + stretched text wordmark */}
          <a href="#top" className="order-1 flex items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 md:h-12 md:w-12 rounded-lg object-cover shrink-0"
            />
            <span className="leading-none">
              <span
                className="text-3xl md:text-4xl font-black tracking-wide text-white"
                style={{ fontFamily: '"Orbitron", sans-serif' }}
              >
                PIXEL<span className="text-red-600">PULSE</span>TECH
              </span>
              {/* brand heartbeat under the wordmark — spans the full wordmark
                  width; object-cover center-crops the wide image into a strip */}
              <img
                src="/pulse-line.webp"
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none block h-5 md:h-6 w-full object-cover -mt-1"
              />
            </span>
          </a>

          {/* search — full row on mobile, stretches in the middle on desktop */}
          <form
            onSubmit={handleSearch}
            className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-2xl flex h-11 rounded-md overflow-hidden bg-white"
          >
            <select
              aria-label="Search category"
              className="h-full bg-white text-black text-sm px-2 border-r border-black/15 focus:outline-none"
            >
              <option>All</option>
              <option>Gaming PCs</option>
              <option>Components</option>
            </select>
            <input
              type="search"
              placeholder="Search rigs & components…"
              className="h-full flex-1 min-w-0 px-3 text-sm text-black placeholder:text-black/40 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="glow-btn h-full w-12 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white"
            >
              <Search className="size-4" />
            </button>
          </form>

          {/* login + cart */}
          <div className="order-2 md:order-3 ml-auto flex items-center gap-4">
            <a
              href="mailto:info@pixelpulsetech.pk?subject=Account"
              className="glow-btn px-4 py-2 border border-white/40 rounded text-xs md:text-sm font-semibold text-white hover:bg-white/10 whitespace-nowrap"
            >
              LOGIN / REGISTER
            </a>
            <a
              href="#/builds"
              aria-label="Cart"
              className="glow-icon relative flex h-10 w-10 items-center justify-center rounded bg-white text-black hover:bg-white/85"
            >
              <ShoppingCart className="size-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                0
              </span>
            </a>
          </div>
        </div>
      </div>

      </header>

      {/* NAV ROW — sibling of the header so position:sticky keeps working
          after the banner scrolls away */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex h-12 items-center justify-center gap-4 sm:gap-8 overflow-x-auto">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="glow-link text-[12px] sm:text-[13px] font-semibold tracking-wide text-white/75 whitespace-nowrap"
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
