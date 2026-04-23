"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MerchItem } from "@prisma/client";
import { ArrowUpRight, ShoppingBag, Package } from "lucide-react";

interface MerchClientProps {
  items: MerchItem[];
}

/* tiny helper — accept both "#ff0000" and "red" style color strings */
const isHex = (s: string) => /^#([0-9a-f]{3,8})$/i.test(s.trim());

export default function MerchClient({ items }: MerchClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // derive categories with counts
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => {
      if (!i.category) return;
      counts.set(i.category, (counts.get(i.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const filtered = useMemo(
    () =>
      activeCategory
        ? items.filter((i) => i.category === activeCategory)
        : items,
    [items, activeCategory]
  );

  return (
    <div className="flex flex-col pt-5 md:pt-12 pb-20">
      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-6 md:mb-12">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight leading-[0.95]">
            Club{" "}
            <span className="italic relative inline-block">
              Merch
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h1>
      
        </div>
      </section>

      {/* ═══ FILTER BAR ══════════════════════════════════════════ */}
      {categories.length > 1 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`text-sm px-4 py-2 border-2 transition-colors ${
                activeCategory === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
              }`}
            >
              All
              <span className="opacity-50 ml-1.5 tabular-nums">{items.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === c.name ? null : c.name)
                }
                className={`text-sm px-4 py-2 border-2 transition-colors ${
                  activeCategory === c.name
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
                }`}
              >
                {c.name}
                <span className="opacity-50 ml-1.5 tabular-nums">{c.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══ GRID ═════════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        {filtered.length === 0 ? (
          items.length === 0 ? (
            <EmptyState />
          ) : (
            <FilteredEmptyState onReset={() => setActiveCategory(null)} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ═══ POLICY STRIP ═════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-20 md:mt-28">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground"
          />
          <div className="relative border-2 border-foreground bg-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-12">
            <h3 className="text-2xl md:text-3xl font-serif italic tracking-tight shrink-0">
              How drops work.
            </h3>
            <div className="flex flex-col gap-3 text-foreground/80 font-serif leading-relaxed max-w-2xl">
              <p>
                Merch is made in small runs — usually 30 to 50 pieces per drop.
                Once they're gone, that design doesn't come back.
              </p>
              <p className="text-foreground/60 italic">
                Active club members and UM6P students get first access. Release
                signals go out on Discord the day before every drop.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  MERCH CARD                                                        */
/* ══════════════════════════════════════════════════════════════════ */
function MerchCard({ item }: { item: MerchItem }) {
  // sold out = zero stock if you track it; fallback to false
  const soldOut = (item as any).stock === 0;

  return (
    <Link
      href={`/merch/${item.slug}`}
      className="group relative block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      />
      <article className="relative flex flex-col h-full border-2 border-foreground bg-card overflow-hidden transition-colors duration-300">
        {/* ── IMAGE ───────────────────────────────────────────── */}
        <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5 border-b-2 border-foreground">
          {item.images[0] ? (
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              unoptimized
              className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
                soldOut ? "grayscale opacity-60" : ""
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-primary">
              {/* halftone texture */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "radial-gradient(var(--color-foreground) 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />
              <ShoppingBag
                size={64}
                strokeWidth={1.5}
                className="relative text-foreground/70"
              />
            </div>
          )}

          {/* price tag — top-right, ink block */}
          <div className="absolute top-3 right-3 bg-foreground text-background px-3 py-1.5 font-serif font-semibold tabular-nums text-sm">
            {item.price} MAD
          </div>

          {/* category tag — top-left */}
          {item.category && (
            <div className="absolute top-3 left-3 bg-card border border-foreground px-2.5 py-1 text-xs">
              {item.category}
            </div>
          )}

          {/* sold out stamp */}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="bg-accent text-accent-foreground font-bold text-xl md:text-2xl tracking-[0.2em] uppercase px-6 py-2 border-2 border-accent-foreground -rotate-6"
                style={{
                  boxShadow: "3px 3px 0 var(--color-foreground)",
                }}
              >
                Sold out
              </span>
            </div>
          )}
        </div>

        {/* ── INFO ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 p-5 md:p-6 flex-1 group-hover:bg-[#eaddcf] transition-colors duration-300">
          <h2 className="text-xl md:text-2xl font-serif tracking-tight leading-tight text-foreground line-clamp-2">
            {item.title}
          </h2>

          {item.description && (
            <p className="text-sm text-foreground/65 font-serif leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}

          {/* variants row — colors + sizes preview */}
          <div className="flex items-center gap-5 mt-1">
            {item.colors?.length > 0 && (
              <ColorSwatches colors={item.colors} />
            )}
            {item.sizes?.length > 0 && <SizeList sizes={item.sizes} />}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-foreground/15">
            <span className="text-sm text-foreground font-semibold group-hover:mr-1 transition-[margin] duration-200">
              {soldOut ? "Details" : "See details"}
            </span>
            <div className="w-8 h-8 border border-foreground/30 flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors duration-200">
              <ArrowUpRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  COLOR SWATCHES — show up to 4 actual dots                         */
/* ══════════════════════════════════════════════════════════════════ */
function ColorSwatches({ colors }: { colors: string[] }) {
  const visible = colors.slice(0, 4);
  const extra = colors.length - visible.length;

  return (
    <div className="flex items-center gap-1.5" title={colors.map(c => c.split(':')[0]).join(", ")}>
      {visible.map((c, i) => {
        const [label, hexRaw] = c.split(':');
        const hex = hexRaw?.trim() || "#ccc";
        return (
          <span
            key={`${c}-${i}`}
            className="w-4 h-4 rounded-full border border-foreground/40 shadow-sm"
            style={{ backgroundColor: hex }}
            aria-label={label?.trim()}
          />
        );
      })}
      {extra > 0 && (
        <span className="text-xs text-foreground/50 tabular-nums">+{extra}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SIZE LIST                                                         */
/* ══════════════════════════════════════════════════════════════════ */
function SizeList({ sizes }: { sizes: string[] }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-foreground/60">
      <span className="italic font-serif">sizes</span>
      <span className="text-foreground tabular-nums">
        {sizes.join(" · ")}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  EMPTY STATES                                                      */
/* ══════════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
      />
      <div className="relative border-2 border-foreground bg-card p-16 md:p-24 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center">
          <Package size={28} className="text-foreground/60" strokeWidth={1.5} />
        </div>
        <h3 className="text-3xl md:text-5xl font-serif italic tracking-tight">
          The shelves are bare.
        </h3>
        <p className="text-sm text-foreground/60 max-w-md font-serif italic">
          Next drop is cooking. Follow the Discord for the signal.
        </p>
      </div>
    </div>
  );
}

function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-2 border-foreground border-dashed p-12 md:p-16 flex flex-col items-center text-center gap-4">
      <h3 className="text-2xl md:text-3xl font-serif italic tracking-tight">
        Nothing here right now.
      </h3>
      <p className="text-sm text-foreground/60 max-w-md">
        No pieces in this category at the moment.
      </p>
      <button
        onClick={onReset}
        className="mt-2 border-2 border-foreground bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:bg-primary hover:text-foreground transition-colors"
      >
        Show all
      </button>
    </div>
  );
}
