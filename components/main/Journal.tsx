"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Article, TeamMember } from "@prisma/client";
import Link from "next/link";

type ArticleWithAuthor = Article & {
  author: TeamMember;
};

interface JournalProps {
  articles: ArticleWithAuthor[];
}

const ease = [0.22, 1, 0.36, 1] as const;

/* deterministic tiny-rotation per card index — papers tossed on a desk */
const ROTATIONS = [-1.2, 0.8, -0.6, 1.4, -1.8, 0.4, 1.1, -0.9, 1.6, -0.3];
const TAPE_OFFSETS = [35, 48, 52, 30, 55, 42, 38, 50, 45, 33]; // %

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

/* ══════════════════════════════════════════════════════════════════ */
/*  NOTE PAGE — one journal entry as a paper note                     */
/* ══════════════════════════════════════════════════════════════════ */
function NotePage({
  article,
  index,
  inView,
}: {
  article: ArticleWithAuthor;
  index: number;
  inView: boolean;
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const tapeLeft = TAPE_OFFSETS[index % TAPE_OFFSETS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation + (index % 2 ? 4 : -4) }}
      animate={
        inView
          ? { opacity: 1, y: 0, rotate: rotation }
          : {}
      }
      transition={{ duration: 0.7, delay: 0.1 + index * 0.08, ease }}
      style={{ transformOrigin: "center top" }}
      className="relative group"
    >
      <Link
        href={`/journal/${article.slug}`}
        className="block relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
      >
        {/* ── WASHI TAPE at top (pins the page to the board) ── */}
        <div
          aria-hidden
          className="absolute -top-3 z-20 h-6 w-20 -rotate-6 pointer-events-none"
          style={{
            left: `${tapeLeft}%`,
            transform: `translateX(-50%) rotate(${(index % 2 ? 4 : -4)}deg)`,
            background:
              "repeating-linear-gradient(135deg, var(--color-accent) 0 6px, color-mix(in oklab, var(--color-accent) 70%, transparent) 6px 12px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            opacity: 0.85,
          }}
        />

        {/* ── the paper itself ──────────────────────────────── */}
        <article
          className="relative bg-card border border-foreground/15 overflow-hidden transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-0 min-h-[360px] flex flex-col"
          style={{
            // soft paper shadow
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.04)",
            // warm cream tint on top of card bg (inherits from theme otherwise)
            backgroundImage:
              "linear-gradient(180deg, color-mix(in oklab, var(--color-card) 96%, var(--color-accent) 4%) 0%, var(--color-card) 40%)",
          }}
        >
          {/* torn / perforated top edge */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1.5 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 6px 6px, var(--color-background) 2px, transparent 2.5px)",
              backgroundSize: "12px 12px",
              backgroundPosition: "0 -3px",
            }}
          />

          {/* ruled lines */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.18]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent 0, transparent 31px, var(--color-foreground) 31px, var(--color-foreground) 32px)",
              backgroundPosition: "0 96px",
            }}
          />

          {/* red left margin line (two parallels, classic ruled paper) */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-14 w-px pointer-events-none opacity-30"
            style={{ background: "var(--color-accent)" }}
          />
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-[3.75rem] w-px pointer-events-none opacity-30"
            style={{ background: "var(--color-accent)" }}
          />

          {/* content — sits over the ruled paper */}
          <div className="relative z-10 pl-20 pr-8 py-8 flex flex-col h-full gap-6">
            {/* date + small page number */}
            <div className="flex items-center justify-between text-sm text-foreground/60 font-serif italic">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="tabular-nums text-xs opacity-70">
                No. {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* category as a small handwritten-feeling label */}
            {article.category && (
              <span className="self-start text-xs uppercase tracking-wider px-2 py-0.5 border border-foreground/40 text-foreground/80 -rotate-1 bg-card">
                {article.category}
              </span>
            )}

            {/* title — the hero, serif italic for handwriting-adjacent feel */}
            <h3 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05] text-foreground flex-1 transition-transform duration-300 group-hover:translate-x-1">
              {article.title}
            </h3>

            {/* excerpt as if jotted below */}
            {article.excerpt && (
              <p className="text-sm text-foreground/70 font-serif italic leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* footer row */}
            <div className="flex items-end justify-between gap-4 pt-4 border-t border-dashed border-foreground/25 mt-auto">
              <div className="flex flex-col">
                <span className="text-[11px] text-foreground/50 font-serif italic">
                  signed,
                </span>
                <span className="text-base text-foreground font-serif tracking-tight">
                  {article.author?.name}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-foreground/60">
                {article.readTime && <span>{article.readTime}</span>}
                <span className="flex items-center gap-1 text-foreground font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                  Read
                  <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 inline-block">
                    ↗
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* corner fold (dog-ear) */}
          <div
            aria-hidden
            className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none transition-transform duration-300 group-hover:scale-125"
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, color-mix(in oklab, var(--color-foreground) 15%, transparent) 50%, color-mix(in oklab, var(--color-foreground) 8%, transparent) 75%, transparent 100%)",
            }}
          />
        </article>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  JOURNAL SECTION                                                   */
/* ══════════════════════════════════════════════════════════════════ */
const Journal: React.FC<JournalProps> = ({ articles }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative px-4 mt-22" id="journal">
      {/* faint corkboard / desk texture behind the notes */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative  mx-auto flex flex-col gap-14">
        {/* header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] text-foreground">
            From the{" "}
            <span className="italic relative inline-block">
              notebook
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>
          {/* <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed font-serif italic">
            Loose pages torn from our shared notebook — thoughts, rants, and the
            occasional useful idea.
          </p> */}
        </div>

        {/* note grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 -mt-6 pb-8">
          {articles.map((article, i) => (
            <NotePage
              key={article.id}
              article={article}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* empty state */}
        {articles.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-2xl md:text-3xl font-serif italic text-foreground/60">
              The notebook is still blank.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Journal;