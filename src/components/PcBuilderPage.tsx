"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Plus, Send, Sparkles, X, Zap } from "lucide-react";
import {
  PC_PARTS,
  categoriesWithCatalog,
  partImage,
  type PartCategory,
  type PartOption,
} from "@/data/pcParts";
import { fetchCatalog } from "@/lib/catalog";

/* Selections: categoryId -> optionId. Starts empty; the visitor "equips"
   each slot and the reactor at the top powers up as the build fills in. */

function recommendedSelections(categories: PartCategory[]): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const category of categories) {
    if (category.options.length === 0) continue;
    const popular = category.options.find((o) => o.tag === "POPULAR");
    initial[category.id] = (popular ?? category.options[0]).id;
  }
  return initial;
}

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

const TOTAL_CATEGORIES = PC_PARTS.length;
const GAUGE_SEGMENTS = 14;

/* Gaming tier the build can drive, read off the chosen graphics card —
   the single part that most decides real-world resolution/framerate.
   Matches on the product name so admin-added cards still rate. */
function performanceTier(gpuName: string | undefined): { label: string; sub: string } {
  if (!gpuName) return { label: "STANDBY", sub: "Equip a graphics card to rate this build" };
  const n = gpuName.toLowerCase();
  if (n.includes("5090")) return { label: "4K EXTREME", sub: "Max settings, no limits" };
  if (n.includes("5080")) return { label: "1440p · 4K", sub: "4K-ready, high-refresh 1440p" };
  if (n.includes("5070")) return { label: "1440p HIGH", sub: "Smooth 1440p high-refresh" };
  if (n.includes("5060")) return { label: "1080p ULTRA", sub: "High-FPS esports & maxed 1080p" };
  return { label: "READY", sub: "Rig assembled" };
}

/* =========================
   PICKER OVERLAY — one component at a time, focused.
========================= */

function PickerModal({
  category,
  selectedId,
  onPick,
  onClose,
}: {
  category: PartCategory;
  selectedId?: string;
  onPick: (optionId: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const Icon = category.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Select ${category.label}`}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#0c0707] flex flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] tracking-[0.3em] text-red-400">EQUIP</p>
            <h2 className="text-lg font-bold tracking-tight">{category.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="glow-icon flex h-9 w-9 items-center justify-center rounded-lg text-white/60"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 grid gap-3 sm:grid-cols-2">
          {category.options.map((option) => {
            const isSelected = option.id === selectedId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option.id)}
                className={`glow-btn relative flex gap-3.5 text-left rounded-xl p-3 bg-white/[0.03] transition ${
                  isSelected ? "border-2 border-red-600" : "border border-white/10"
                }`}
              >
                {option.tag && (
                  <span className="absolute -top-2.5 left-3 z-10 px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-mono tracking-[0.2em]">
                    {option.tag}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
                {/* product thumbnail (real photo or category illustration) */}
                <img
                  src={partImage(category, option)}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg object-cover bg-black/40"
                />
                <div className="min-w-0 flex-1">
                  {option.brand && (
                    <p className="font-mono text-[9px] tracking-[0.25em] text-red-400">
                      {option.brand.toUpperCase()}
                    </p>
                  )}
                  <h3 className="font-bold mt-0.5 tracking-tight pr-6 leading-tight">{option.name}</h3>
                  <p className="text-xs text-white/55 mt-1">{option.spec}</p>
                  <p className="text-lg font-bold mt-1.5">{formatPrice(option.price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================
   LOADOUT SLOT — one equipment bay in the build grid.
========================= */

function LoadoutSlot({
  index,
  category,
  equipped,
  onOpen,
}: {
  index: number;
  category: PartCategory;
  equipped?: PartOption;
  onOpen: () => void;
}) {
  const Icon = category.icon;
  const filled = Boolean(equipped);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`glow-btn group relative overflow-hidden rounded-xl p-4 text-left transition ${
        filled
          ? "border border-red-600/60 bg-gradient-to-br from-red-950/30 to-black shadow-[0_0_40px_-24px_rgba(220,38,38,0.9)]"
          : "border border-dashed border-white/15 bg-white/[0.02]"
      }`}
    >
      {/* left accent rail lights up when equipped */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${filled ? "bg-red-600" : "bg-transparent"}`}
      />

      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
          {category.label}
        </span>
        {filled ? (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono tracking-wider text-red-400">
            <Check className="size-3" strokeWidth={3} /> EQUIPPED
          </span>
        ) : (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono tracking-wider text-white/30">
            <Plus className="size-3" strokeWidth={3} /> EMPTY
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3.5 min-h-[3.5rem]">
        {/* thumbnail — product photo when equipped, dim category icon when empty */}
        {equipped ? (
          <img
            src={partImage(category, equipped)}
            alt=""
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-lg object-cover bg-black/40"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/25">
            <Icon className="size-6" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          {equipped ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold leading-tight">
                  {equipped.brand ? `${equipped.brand} ` : ""}
                  <span className="text-white/80">{equipped.name}</span>
                </p>
                <span className="shrink-0 font-bold text-red-400">{formatPrice(equipped.price)}</span>
              </div>
              <p className="text-xs text-white/45 truncate mt-0.5">{equipped.spec}</p>
            </>
          ) : (
            <p className="text-sm text-white/40">
              Tap to equip a {category.label.toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {/* hover hint to re-open */}
      <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] font-mono tracking-wider text-white/0 group-hover:text-white/40 transition">
        {filled ? "CHANGE" : "SELECT"}
      </span>
    </button>
  );
}

/* =========================
   PAGE
========================= */

export default function PcBuilderPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  // Categories start from the built-in defaults, then swap to the live
  // admin-managed catalog once it loads (falls back silently if unset).
  const [categories, setCategories] = useState<PartCategory[]>(PC_PARTS);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    fetchCatalog().then((catalog) => {
      if (active && catalog) setCategories(categoriesWithCatalog(catalog));
    });
    return () => {
      active = false;
    };
  }, []);

  const lineItems = useMemo(
    () =>
      categories.map((category) => ({
        category,
        option: category.options.find((o) => o.id === selections[category.id]),
      })),
    [categories, selections]
  );

  const selectedCount = lineItems.filter((l) => l.option).length;
  const total = lineItems.reduce((sum, { option }) => sum + (option?.price ?? 0), 0);

  // Reactor charge: how "powerful" the build reads, from total spend, capped.
  const charge = Math.min(100, Math.round((total / 4500) * 100));
  const litSegments = Math.round((charge / 100) * GAUGE_SEGMENTS);
  const gpuName = lineItems.find((l) => l.category.id === "gpu")?.option?.name;
  const tier = performanceTier(gpuName);

  const pick = (categoryId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [categoryId]: optionId }));
    setModalCategory(null);
  };

  const emailHref = useMemo(() => {
    const lines = lineItems.map(
      ({ category, option }) =>
        `${category.label}: ${
          option
            ? `${option.brand ? `${option.brand} ` : ""}${option.name} (${formatPrice(option.price)})`
            : "— (not selected)"
        }`
    );
    const body = [
      "Hi PixelPulseTech, I'd like to order this custom build:",
      "",
      ...lines,
      "",
      `Performance tier: ${tier.label}`,
      `Estimated total: ${formatPrice(total)} (${selectedCount}/${TOTAL_CATEGORIES} parts)`,
    ].join("\n");
    return `mailto:builds@pixelpulsetech.pk?subject=${encodeURIComponent(
      "Custom PC Build Request"
    )}&body=${encodeURIComponent(body)}`;
  }, [lineItems, total, selectedCount, tier.label]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#/" className="glow-link flex items-center gap-3 text-sm text-white/70">
            <ArrowLeft className="size-4" />
            <img src="/logo.png" alt="PixelPulse Tech" className="h-8 w-8 rounded-lg object-cover" />
            <span className="hidden sm:inline">Back to home</span>
          </a>
          <a
            href="mailto:builds@pixelpulsetech.pk"
            className="glow-btn text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold"
          >
            Talk to a Builder
          </a>
        </div>
      </header>

      <section className="px-6 pt-10 pb-40 max-w-5xl mx-auto">
        {/* title */}
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-[0.35em] text-red-400">CUSTOM PC BUILDER</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">
            Assemble your <span className="text-red-500">loadout</span>
          </h1>
          <p className="text-white/55 mt-4 max-w-lg mx-auto">
            Equip each slot with the parts you want. The reactor rates your rig
            in real time, then send the finished build to our team.
          </p>
        </div>

        {/* REACTOR — live performance readout */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-br from-[#160909] to-black p-5 sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-600/20 blur-3xl"
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            {/* tier */}
            <div className="sm:w-56 shrink-0">
              <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.3em] text-red-400">
                <Zap className="size-3.5" /> PERFORMANCE TIER
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight leading-none">{tier.label}</p>
              <p className="mt-1.5 text-xs text-white/50">{tier.sub}</p>
            </div>

            {/* segmented charge gauge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/40">
                  REACTOR CHARGE
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/40">
                  {selectedCount}/{TOTAL_CATEGORIES} SLOTS
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: GAUGE_SEGMENTS }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-7 flex-1 rounded-sm transition-colors duration-300 ${
                      i < litSegments
                        ? "bg-gradient-to-t from-red-700 to-red-400 shadow-[0_0_10px_-2px_rgba(248,80,100,0.8)]"
                        : "bg-white/[0.06]"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-xs text-white/45">Estimated total</span>
                <span className="text-2xl font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* helper actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelections(recommendedSelections(categories))}
            className="glow-btn inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5"
          >
            <Sparkles className="size-4 text-red-500" />
            Auto-equip recommended
          </button>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => setSelections({})}
              className="glow-link text-sm text-white/50"
            >
              Clear loadout
            </button>
          )}
        </div>

        {/* LOADOUT GRID */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {categories.map((category, i) => (
            <LoadoutSlot
              key={category.id}
              index={i}
              category={category}
              equipped={category.options.find((o) => o.id === selections[category.id])}
              onOpen={() => setModalCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* sticky checkout bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] text-white/50">
              {selectedCount === 0
                ? "Reactor on standby — equip your first part"
                : `${tier.label} · ${selectedCount} of ${TOTAL_CATEGORIES} slots`}
            </p>
            <p className="text-xl font-bold leading-tight">
              {formatPrice(total)}
              <span className="ml-2 text-xs font-normal text-white/45">estimated</span>
            </p>
          </div>
          <a
            href={emailHref}
            className={`glow-btn inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-semibold ${
              selectedCount > 0
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-white/10 text-white/50 pointer-events-none"
            }`}
          >
            <Send className="size-4" />
            <span className="hidden sm:inline">Email This Build</span>
            <span className="sm:hidden">Email Build</span>
          </a>
        </div>
      </div>

      {modalCategory &&
        (() => {
          const cat = categories.find((c) => c.id === modalCategory);
          if (!cat) return null;
          return (
            <PickerModal
              category={cat}
              selectedId={selections[modalCategory]}
              onPick={(optionId) => pick(modalCategory, optionId)}
              onClose={() => setModalCategory(null)}
            />
          );
        })()}
    </div>
  );
}
