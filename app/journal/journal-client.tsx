"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Article, User } from "@prisma/client";
import { Search, X, ArrowUpRight } from "lucide-react";

type ArticleWithAuthor = Article & {
  author: User | null;
};

interface JournalClientProps {
  initialArticles: ArticleWithAuthor[];
}

/* ── helpers ──────────────────────────────────────────────────── */
const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const daysAgo = (date: Date | null) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
};

const relativeDate = (date: Date | null) => {
  const d = daysAgo(date);
  if (d === null) return "";
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) {
    const w = Math.floor(d / 7);
    return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  }
  return formatDate(date);
};

/* ══════════════════════════════════════════════════════════════ */
export default function JournalClient({ initialArticles }: JournalClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    initialArticles.forEach((a) => {
      if (!a.category) return;
      counts.set(a.category, (counts.get(a.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [initialArticles]);

  const sortedArticles = useMemo(
    () =>
      [...initialArticles].sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      }),
    [initialArticles]
  );

  const hasFilters = activeCategory !== null || query.trim() !== "";
  const featured = hasFilters ? null : sortedArticles[0];
  const listCandidates = featured ? sortedArticles.slice(1) : sortedArticles;

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listCandidates.filter((p) => {
      if (activeCategory && p.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const hay = [p.title, p.category, p.author?.name, p.author?.login1337]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [listCandidates, activeCategory, query]);

  const clearFilters = () => {
    setActiveCategory(null);
    setQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto w-full relative px-4 md:px-8 py-16 md:py-24">
      {/* ── FEATURED ─────────────────────────────────────────── */}
      {featured && <FeaturedCard article={featured} />}

      {/* ── SEARCH + FILTERS ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 mt-14 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative md:max-w-xs flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="w-full bg-card border-2 border-foreground pl-11 pr-10 py-3 text-base placeholder:text-foreground/40 focus:outline-none focus:bg-primary/5"
              aria-label="Search journal"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {categories.length > 0 && (
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
                <span className="opacity-50 ml-1.5 tabular-nums">
                  {initialArticles.length}
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.name ? null : cat.name)
                  }
                  className={`text-sm px-4 py-2 border-2 transition-colors ${
                    activeCategory === cat.name
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                  <span className="opacity-50 ml-1.5 tabular-nums">{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between gap-4 text-sm text-foreground/60">
            <span>
              <span className="text-foreground font-semibold tabular-nums">
                {filteredPosts.length}
              </span>{" "}
              {filteredPosts.length === 1 ? "entry" : "entries"}
            </span>
            <button
              onClick={clearFilters}
              className="underline decoration-primary decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── GRID ─────────────────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <EmptyState query={query} onClear={clearFilters} />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <EntryCard key={post.id} article={post} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  FEATURED CARD — offset shadow, big hero                       */
/* ══════════════════════════════════════════════════════════════ */
function FeaturedCard({ article }: { article: ArticleWithAuthor }) {
  const days = daysAgo(article.publishedAt);
  const isFresh = days !== null && days <= 7;

  return (
    <Link
      href={`/journal/${article.slug}`}
      className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:translate-y-1"
      />
      <article className="relative border-2 border-foreground bg-card p-6 md:p-10 flex flex-col gap-6 hover:bg-primary/5 transition-colors duration-300">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          {isFresh && (
            <span className="font-semibold px-2.5 py-1 bg-primary text-primary-foreground">
              New
            </span>
          )}
          {article.category && (
            <span className="px-2.5 py-1 border border-foreground/30 text-foreground/80">
              {article.category}
            </span>
          )}
          <span className="font-serif italic text-foreground/60 ml-auto">
            {relativeDate(article.publishedAt)}
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-[1.02] text-foreground max-w-4xl">
          {article.title}
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
          <AuthorStamp author={article.author} />

          <div className="flex items-center gap-4 text-sm text-foreground/70">
            {article.readTime && <span>{article.readTime}</span>}
            <span className="flex items-center gap-1.5 text-foreground font-semibold group-hover:gap-3 transition-all duration-300">
              Read entry
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  ENTRY CARD — same offset-shadow signature, smaller scale      */
/* ══════════════════════════════════════════════════════════════ */
function EntryCard({ article, index }: { article: ArticleWithAuthor; index: number }) {
  const days = daysAgo(article.publishedAt);
  const isFresh = days !== null && days <= 7;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="relative h-full"
    >
      <Link
        href={`/journal/${article.slug}`}
        className="group relative block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* offset ink shadow — same signature as featured card, at a smaller scale */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        />

        <article className="relative border-2 border-foreground bg-card p-6 md:p-7 flex flex-col gap-4 h-full min-h-[320px] hover:bg-primary/5 transition-colors duration-300">
          {/* top meta */}
          <div className="flex items-start justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {isFresh && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary text-primary-foreground">
                  New
                </span>
              )}
              {article.category && (
                <span className="text-xs px-2 py-0.5 border border-foreground/30 text-foreground/80">
                  {article.category}
                </span>
              )}
            </div>
            <span className="font-serif italic text-foreground/60 shrink-0 text-xs">
              {relativeDate(article.publishedAt)}
            </span>
          </div>

          {/* title */}
          <h3 className="text-2xl md:text-3xl font-serif tracking-tight leading-[1.1] text-foreground line-clamp-3 flex-1 mt-1">
            {article.title}
          </h3>

          {/* bottom meta */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-foreground/15 mt-auto">
            <AuthorStamp author={article.author} compact />

            <div className="flex items-center gap-3 text-xs text-foreground/60">
              {article.readTime && <span>{article.readTime}</span>}
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
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function AuthorStamp({ author, compact = false }: { author: User | null; compact?: boolean }) {
  if (!author) return null;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`${
          compact ? "w-7 h-7" : "w-10 h-10"
        } border border-foreground bg-primary flex items-center justify-center overflow-hidden shrink-0 [border-radius:42%_58%_38%_62%/51%_43%_57%_49%]`}
      >
        {author.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span
            className={`${
              compact ? "text-xs" : "text-sm"
            } font-serif italic text-primary-foreground`}
          >
            {(author.name || author.login1337)?.charAt(0)}
          </span>
        )}
      </div>
      <span
        className={`${
          compact ? "text-xs" : "text-sm"
        } font-semibold text-foreground truncate`}
      >
        {author.name || author.login1337}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
      />
      <div className="relative border-2 border-foreground bg-card p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center">
          <Search size={24} className="text-foreground/50" />
        </div>
        <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight">
          No entries match {query ? `"${query}"` : "those filters"}.
        </h3>
        <p className="text-sm text-foreground/60 max-w-md">
          Either the idea hasn't been written yet, or it's hiding under different words.
        </p>
        <button
          onClick={onClear}
          className="mt-2 border-2 border-foreground bg-foreground text-background px-6 py-3 hover:bg-primary hover:text-foreground transition-colors text-sm font-semibold"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
