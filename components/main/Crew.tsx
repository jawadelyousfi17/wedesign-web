"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  login1337: string | null;
  role: string;
  focus: string | null;
  year: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
  githubUrl?: string | null;
  profileUrl?: string | null;
}

const AVATAR_SHAPES = [
  "[border-radius:63%_37%_54%_46%/55%_48%_52%_45%]",
  "[border-radius:42%_58%_38%_62%/51%_43%_57%_49%]",
  "[border-radius:71%_29%_62%_38%/48%_52%_46%_54%]",
  "[border-radius:35%_65%_43%_57%/60%_40%_58%_42%]",
  "[border-radius:55%_45%_71%_29%/42%_58%_35%_65%]",
  "[border-radius:48%_52%_39%_61%/64%_36%_55%_45%]",
];

/* ══════════════════════════════════════════════════════════════════ */
/*  MEMBER CARD                                                       */
/* ══════════════════════════════════════════════════════════════════ */
const MemberCard: React.FC<{
  member: Member;
  shape: string;
  onTagClick: (tag: string) => void;
  activeTag: string | null;
}> = ({ member, shape, onTagClick, activeTag }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springCfg = { stiffness: 220, damping: 22, mass: 0.5 };
  const mxs = useSpring(mx, springCfg);
  const mys = useSpring(my, springCfg);
  const rotateX = useTransform(mys, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mxs, [-0.5, 0.5], [-5, 5]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const href = member.profileUrl || member.githubUrl;
  const Inner: React.ElementType = href ? "a" : "div";
  const innerProps = href
    ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" }
    : {};

  return (
    <div style={{ perspective: 1400 }} className="relative h-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full will-change-transform group"
      >
        {/* offset ink shadow — same signature as journal */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        />

        <Inner
          {...innerProps}
          className="relative flex flex-col h-full border-2 border-foreground bg-card hover:bg-primary/5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {/* avatar */}
          <div
            className="relative p-6 pb-4 flex items-center justify-center"
            style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
          >
            {href && (
              <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpRight size={14} className="text-foreground/70" />
              </span>
            )}

            <div
              className={`relative w-44 h-44 md:w-48 md:h-48 bg-primary p-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${shape}`}
            >
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  className={`w-full h-full object-cover ${shape}`}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div className={`w-full h-full bg-foreground flex items-center justify-center ${shape}`}>
                  <span className="text-6xl font-serif italic text-background">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* info block */}
          <div
            className="flex flex-col gap-3 px-6 pb-6 flex-1"
            style={{ transform: "translateZ(15px)" }}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-foreground/70">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {member.role}
              </span>
              {member.year && (
                <span className="font-serif italic text-foreground/60 text-xs">
                  {member.year}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-[26px] font-serif tracking-tight leading-[1.05] text-foreground">
              {member.name}
            </h3>

            {member.login1337 && (
              <div className="text-xs text-foreground/50 tabular-nums -mt-2">
                {member.login1337}
              </div>
            )}

            {member.focus && (
              <p className="text-sm text-foreground/75 leading-snug">{member.focus}</p>
            )}

            {member.bio && (
              <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2 italic font-serif">
                “{member.bio}”
              </p>
            )}

            {member.tags && member.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                {member.tags.slice(0, 4).map((tag) => {
                  const active = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTagClick(tag);
                      }}
                      className={`text-xs px-2 py-0.5 border transition-colors ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/25 text-foreground/70 hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {member.tags.length > 4 && (
                  <span className="text-xs text-foreground/40 self-center">
                    +{member.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </Inner>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
/*  CREW SECTION                                                      */
/* ══════════════════════════════════════════════════════════════════ */
export const Crew: React.FC<{ members: Member[] }> = ({ members }) => {
  const [query, setQuery] = useState("");
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const roles = useMemo(() => {
    const counts = new Map<string, number>();
    members.forEach((m) => m.role && counts.set(m.role, (counts.get(m.role) || 0) + 1));
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (activeRole && m.role !== activeRole) return false;
      if (activeTag && !(m.tags ?? []).includes(activeTag)) return false;
      if (!q) return true;
      const hay = [m.name, m.login1337, m.focus, m.role, m.year, m.bio, ...(m.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [members, query, activeRole, activeTag]);

  const hasFilters = !!(query || activeRole || activeTag);
  const clearFilters = () => {
    setQuery("");
    setActiveRole(null);
    setActiveTag(null);
  };
  const handleTagClick = (tag: string) =>
    setActiveTag((prev) => (prev === tag ? null : tag));

  return (
    <section className="relative  px-4 md:px-8" id="crew">
      <div className=" mx-auto flex flex-col gap-10">
        {/* header */}
        <div className="flex flex-col gap-5">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] text-foreground">
            Meet the{" "}
            <span className="italic relative inline-block">
              crew
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>
          {/* <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed font-serif">
            Designers, developers, and in-betweeners who argue about kerning and
            semicolons with equal passion.
          </p> */}
        </div>

        {/* search + filters */}
        {/* <div className="flex flex-col gap-5">
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
                placeholder="Search the crew…"
                className="w-full bg-card border-2 border-foreground pl-11 pr-10 py-3 text-base placeholder:text-foreground/40 focus:outline-none focus:bg-primary/5"
                aria-label="Search crew"
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

            {roles.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRole(null)}
                  className={`text-sm px-4 py-2 border-2 transition-colors ${
                    activeRole === null
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
                  }`}
                >
                  All
                  <span className="opacity-50 ml-1.5 tabular-nums">{members.length}</span>
                </button>
                {roles.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => setActiveRole(activeRole === r.name ? null : r.name)}
                    className={`text-sm px-4 py-2 border-2 transition-colors ${
                      activeRole === r.name
                        ? "bg-foreground text-background border-foreground"
                        : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {r.name}
                    <span className="opacity-50 ml-1.5 tabular-nums">{r.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between gap-4 text-sm text-foreground/60 flex-wrap">
              <div className="flex items-center gap-3">
                <span>
                  <span className="text-foreground font-semibold tabular-nums">
                    {filtered.length}
                  </span>{" "}
                  of {members.length}
                </span>
                {activeTag && (
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-0.5 border border-foreground text-xs">
                    #{activeTag}
                    <button
                      onClick={() => setActiveTag(null)}
                      aria-label={`Clear ${activeTag} filter`}
                      className="hover:opacity-70"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="underline decoration-primary decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div> */}

        {/* grid */}
        {filtered.length === 0 ? (
          <EmptyState query={query} onClear={clearFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((member, i) => (
              <MemberCard
                key={member.id}
                member={member}
                shape={AVATAR_SHAPES[i % AVATAR_SHAPES.length]}
                onTagClick={handleTagClick}
                activeTag={activeTag}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
      <div className="relative border-2 border-foreground bg-card p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center">
          <Search size={24} className="text-foreground/50" />
        </div>
        <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight">
          Nobody matches {query ? `"${query}"` : "those filters"}.
        </h3>
        <p className="text-sm text-foreground/60 max-w-md">
          Either they haven't joined yet, or your search is sharper than the roster.
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

export default Crew;