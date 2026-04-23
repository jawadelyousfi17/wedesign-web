"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Terminal as TerminalIcon,
  Command,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  FileText,
  Package,
  Zap,
  Loader2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchEverything } from "@/app/actions/search";

/* ══════════════════════════════════════════════════════════════════ */
type ResultType = "project" | "article" | "merch" | "page" | "command";

interface SearchResult {
  id: string;
  title: string;
  type: ResultType;
  href: string;
  description?: string;
}

const PAGES: SearchResult[] = [
  { id: "p1", title: "Home", type: "page", href: "/" },
  { id: "p2", title: "Projects", type: "page", href: "/projects" },
  { id: "p3", title: "Journal", type: "page", href: "/journal" },
  { id: "p4", title: "Club gear", type: "page", href: "/merch" },
  { id: "p5", title: "Calendar", type: "page", href: "/calendar" },
  { id: "p6", title: "Services", type: "page", href: "/services" },
  { id: "p7", title: "Contact", type: "page", href: "/contact" },
  { id: "p8", title: "The crew", type: "page", href: "/team" },
  { id: "p9", title: "The Lab", type: "page", href: "/lab" },
  { id: "p10", title: "Apply", type: "page", href: "/apply" },
  { id: "l1", title: "Experiment: Kinetic Glyphs", type: "project", href: "/lab/kinetic-glyphs" },
  { id: "l2", title: "Experiment: Magnetic 3D Glyphs", type: "project", href: "/lab/glyph-3d" },
  { id: "l3", title: "Experiment: ASCII Spinning Donut", type: "project", href: "/lab/ascii-donut" },
  { id: "l4", title: "Experiment: Real-time ASCII Camera", type: "project", href: "/lab/ascii-camera" },
];

const COMMANDS: SearchResult[] = [
  {
    id: "c1",
    title: "whoami",
    type: "command",
    href: "/team",
    description: "Meet the crew",
  },
  {
    id: "c2",
    title: "ls projects",
    type: "command",
    href: "/projects",
    description: "List all shipped projects",
  },
  {
    id: "c3",
    title: "cat manifesto",
    type: "command",
    href: "/#manifesto",
    description: "Read the rules of the club",
  },
  {
    id: "c4",
    title: "sudo apply",
    type: "command",
    href: "/apply",
    description: "Force entry into the crew",
  },
  {
    id: "c5",
    title: "clear",
    type: "command",
    href: "#",
    description: "Clear the search",
  },
];

const RECENTS_KEY = "wd-palette-recents";
const MAX_RECENTS = 4;

/* ══════════════════════════════════════════════════════════════════ */
/*  COMMAND PALETTE                                                   */
/* ══════════════════════════════════════════════════════════════════ */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [recents, setRecents] = useState<SearchResult[]>([]);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    console.log("🏁 CommandPalette mounted and listening for keys...");
  }, []);

  /* load recents from sessionStorage */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECENTS_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const pushRecent = useCallback((result: SearchResult) => {
    setRecents((prev) => {
      const next = [result, ...prev.filter((r) => r.id !== result.id)].slice(
        0,
        MAX_RECENTS
      );
      try {
        sessionStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /* global shortcuts — bound once */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("⌨️ Key pressed:", e.key, "| Meta:", e.metaKey, "| Ctrl:", e.ctrlKey);
      
      // ⌘K / Ctrl+K → toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        console.log("🚀 CMD+K detected!");
        e.preventDefault();
        setIsOpen((o) => !o);
        return;
      }

      // Escape → close
      if (e.key === "Escape" && isOpenRef.current) {
        setIsOpen(false);
        return;
      }

      // "/" → open (only when not typing in an input)
      if (e.key === "/" && !isOpenRef.current) {
        const el = document.activeElement as HTMLElement | null;
        const typing =
          el?.tagName === "INPUT" ||
          el?.tagName === "TEXTAREA" ||
          el?.isContentEditable;
        if (!typing) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  /* focus input when opened */
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setDynamicResults([]);
      // rAF beats setTimeout; focuses after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  /* debounced dynamic search */
  useEffect(() => {
    if (!query || query.length < 2) {
      setDynamicResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchEverything(query);
        setDynamicResults(results as SearchResult[]);
      } catch {
        setDynamicResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  /* build grouped result sections */
  const sections = useMemo(() => {
    const q = query.toLowerCase().trim();

    const matches = (item: SearchResult) =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);

    if (!q) {
      // empty query — show recents + suggested pages/commands
      return [
        ...(recents.length > 0
          ? [{ label: "Recent", items: recents }]
          : []),
        { label: "Pages", items: PAGES.slice(0, 5) },
        { label: "Commands", items: COMMANDS.slice(0, 4) },
      ];
    }

    const pageMatches = PAGES.filter(matches);
    const commandMatches = COMMANDS.filter(matches);
    const articleMatches = dynamicResults.filter((r) => r.type === "article");
    const projectMatches = dynamicResults.filter((r) => r.type === "project");
    const merchMatches = dynamicResults.filter((r) => r.type === "merch");

    return [
      ...(pageMatches.length > 0 ? [{ label: "Pages", items: pageMatches }] : []),
      ...(commandMatches.length > 0
        ? [{ label: "Commands", items: commandMatches }]
        : []),
      ...(projectMatches.length > 0
        ? [{ label: "Projects", items: projectMatches }]
        : []),
      ...(articleMatches.length > 0
        ? [{ label: "Journal", items: articleMatches }]
        : []),
      ...(merchMatches.length > 0 ? [{ label: "Gear", items: merchMatches }] : []),
    ];
  }, [query, dynamicResults, recents]);

  /* flat list for keyboard navigation */
  const flatResults = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, sections.length]);

  const handleSelect = (result: SearchResult) => {
    if (result.title === "clear") {
      setQuery("");
      inputRef.current?.focus();
      return;
    }
    if (result.type !== "command" || result.href !== "#") {
      pushRecent(result);
    }
    setIsOpen(false);
    router.push(result.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(flatResults.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (i) => (i - 1 + flatResults.length) % Math.max(flatResults.length, 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) handleSelect(flatResults[selectedIndex]);
    }
  };

  /* track a global index across sections so selection works */
  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[999]"
          />

          {/* sheet */}
          <div
            className="fixed inset-0 z-[1000] flex items-start justify-center pt-[12vh] px-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl pointer-events-auto"
            >
              {/* offset ink shadow */}
              <div
                aria-hidden
                className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
              />
              <div className="relative bg-card border-2 border-foreground overflow-hidden">
                {/* ── HEADER BAR ─────────────────────────────── */}
                <div className="bg-foreground text-background px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={12} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                      wedesign-sh
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSearching ? (
                      <Loader2 size={12} className="animate-spin text-accent" />
                    ) : (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                        <span className="relative rounded-full h-2 w-2 bg-accent" />
                      </span>
                    )}
                  </div>
                </div>

                {/* ── INPUT ──────────────────────────────────── */}
                <div className="p-5 border-b-2 border-foreground">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-accent font-bold text-lg">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Search or type a command…"
                      aria-label="Search"
                      aria-autocomplete="list"
                      aria-controls="command-palette-results"
                      aria-activedescendant={
                        flatResults[selectedIndex]
                          ? `palette-item-${flatResults[selectedIndex].type}-${flatResults[selectedIndex].id}`
                          : undefined
                      }
                      className="flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-mono text-foreground placeholder:text-foreground/30"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          inputRef.current?.focus();
                        }}
                        className="text-foreground/50 hover:text-foreground transition-colors"
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* ── RESULTS ────────────────────────────────── */}
                <div
                  id="command-palette-results"
                  role="listbox"
                  className="max-h-[50vh] overflow-y-auto"
                >
                  {sections.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-2 border-foreground/30 flex items-center justify-center">
                        <Search size={20} className="text-foreground/40" />
                      </div>
                      <span className="font-mono text-sm text-foreground/60">
                        No results for{" "}
                        <span className="text-foreground">"{query}"</span>
                      </span>
                    </div>
                  ) : (
                    <div className="py-2">
                      {sections.map((section) => (
                        <div key={section.label} className="mb-1 last:mb-0">
                          <div className="px-5 pt-3 pb-1 text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                            {section.label === "Recent" && <Clock size={10} />}
                            {section.label}
                          </div>
                          {section.items.map((result) => {
                            globalIndex += 1;
                            const isSelected = globalIndex === selectedIndex;
                            return (
                              <ResultRow
                                key={`${result.type}-${result.id}`}
                                result={result}
                                isSelected={isSelected}
                                query={query}
                                index={globalIndex}
                                onSelect={() => handleSelect(result)}
                                onHover={() => setSelectedIndex(globalIndex)}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── FOOTER ─────────────────────────────────── */}
                <div className="px-4 py-2.5 bg-foreground/[0.04] border-t-2 border-foreground/15 flex justify-between items-center font-mono text-[10px] text-foreground/55">
                  <div className="flex items-center gap-4">
                    <KeyHint>
                      <ArrowUp size={9} />
                      <ArrowDown size={9} />
                    </KeyHint>
                    <span>navigate</span>
                    <KeyHint>
                      <CornerDownLeft size={10} />
                    </KeyHint>
                    <span>select</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <KeyHint>esc</KeyHint>
                    <KeyHint>⌘ K</KeyHint>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  RESULT ROW                                                        */
/* ══════════════════════════════════════════════════════════════════ */
function ResultRow({
  result,
  isSelected,
  query,
  index,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  isSelected: boolean;
  query: string;
  index: number;
  onSelect: () => void;
  onHover: () => void;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);

  /* scroll into view when keyboard-selected */
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  return (
    <button
      ref={rowRef}
      id={`palette-item-${result.type}-${result.id}`}
      role="option"
      aria-selected={isSelected}
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center justify-between gap-3 px-5 py-3 font-mono text-left transition-colors ${
        isSelected ? "bg-foreground text-background" : "text-foreground"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <ResultIcon type={result.type} isSelected={isSelected} />
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className="text-sm font-semibold truncate">
            <HighlightText text={result.title} query={query} />
          </span>
          {result.description && (
            <span
              className={`text-[11px] truncate ${
                isSelected ? "text-background/70" : "text-foreground/55"
              }`}
            >
              {result.description}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase shrink-0">
          <span>Run</span>
          <CornerDownLeft size={11} strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  HIGHLIGHT MATCHING SUBSTRING                                      */
/* ══════════════════════════════════════════════════════════════════ */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-accent">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
function ResultIcon({
  type,
  isSelected,
}: {
  type: ResultType;
  isSelected: boolean;
}) {
  const cls = `shrink-0 ${isSelected ? "text-background" : "text-foreground/70"}`;
  switch (type) {
    case "project":
      return <Zap size={14} className={cls} />;
    case "article":
      return <FileText size={14} className={cls} />;
    case "merch":
      return <Package size={14} className={cls} />;
    case "page":
      return <Command size={14} className={cls} />;
    case "command":
      return <TerminalIcon size={14} className={cls} />;
    default:
      return <Search size={14} className={cls} />;
  }
}

/* ══════════════════════════════════════════════════════════════════ */
function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 border border-foreground/25 text-[10px] font-mono leading-none min-h-[18px]">
      {children}
    </kbd>
  );
}