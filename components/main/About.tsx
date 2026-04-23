"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════════ */
/*  CONTENT                                                           */
/* ══════════════════════════════════════════════════════════════════ */
const manifesto = [
  { n: "01", text: "We design in the open.", tail: "Pull requests, not PowerPoints." },
  { n: "02", text: "We ship on Fridays.", tail: "Perfect is the enemy of posted." },
  { n: "03", text: "We run weekly crits.", tail: "Feedback is a gift, not a threat." },
  { n: "04", text: "We build for 1337.", tail: "Our community is our muse." },
  { n: "05", text: "We are inclusive.", tail: "Great design comes from diverse minds." },
];

/* Each segment is a chunk of the intro paragraph. `accent` phrases display
   in serif italic accent color — treat them as editorial pull-phrases. */
const paragraph = [
  { text: "WeDesign", accent: true },
  { text: "is the design & web-dev club of 1337. We believe great product work happens when", accent: false },
  { text: "designers think like engineers, engineers think like designers,", accent: true },
  { text: "and both of them ship.", accent: false },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ══════════════════════════════════════════════════════════════════ */
/*  COMPONENT                                                         */
/* ══════════════════════════════════════════════════════════════════ */
const About = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  // flatten paragraph into words for per-word reveal
  const words = paragraph.flatMap((seg, si) =>
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word, wi) => ({ word, accent: seg.accent, key: `${si}-${wi}` }))
  );

  return (
    <section ref={ref} className="relative py-16 md:py-24 px-4 md:px-8">
      <div className=" mx-auto flex flex-col gap-16 md:gap-24">
        {/* ═══ ACT 1 — INTRO ═══════════════════════════════════ */}
        <div className="flex flex-col gap-8">
          <motion.div
            className="flex items-center gap-3  uppercase  text-foreground/60"
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="w-10 h-px bg-foreground/50" />
            {/* <span>About · Prologue</span> */}
          </motion.div>

          <p className="text-2xl md:text-4xl lg:text-5xl font-serif leading-[1.2] tracking-tight text-foreground max-w-4xl">
            {words.map(({ word, accent, key }, i) => (
              <motion.span
                key={key}
                className={`inline-block mr-[0.25em] ${
                  accent ? "text-accent italic" : ""
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + i * 0.018,
                  ease,
                }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>

        {/* ═══ ACT 2 — MANIFESTO ═══════════════════════════════ */}
        <div className="flex flex-col gap-10">
          {/* header row */}
          <div className="flex items-end justify-between gap-6 border-b-2 border-foreground pb-6 flex-wrap">
            <motion.h2
              className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight leading-[0.9] text-foreground"
              initial={{ opacity: 0, y: 20, letterSpacing: "0.1em" }}
              animate={
                inView
                  ? { opacity: 1, y: 0, letterSpacing: "-0.02em" }
                  : {}
              }
              transition={{ duration: 1.1, ease }}
            >
              Manifesto<span className="italic text-accent">.</span>
            </motion.h2>

            
          </div>

          {/* manifesto list */}
          <ul
            className="flex flex-col"
            onMouseLeave={() => setHovered(null)}
          >
            {manifesto.map(({ n, text, tail }, i) => {
              const isHovered = hovered === i;
              const isDimmed = hovered !== null && hovered !== i;
              const isLast = i === manifesto.length - 1;

              return (
                <motion.li
                  key={n}
                  className={`relative group/item ${
                    !isLast ? "border-b border-foreground/20" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    delay: 0.6 + i * 0.08,
                    ease,
                  }}
                >
                  {/* primary color sweep on hover */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 bg-primary/15 origin-left pointer-events-none"
                    initial={false}
                    animate={{ scaleX: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.5, ease }}
                  />

                  {/* left-edge accent bar on hover */}
                  <motion.div
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent origin-top pointer-events-none"
                    initial={false}
                    animate={{ scaleY: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.35, ease }}
                  />

                  <button
                    type="button"
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    className="relative z-10 w-full grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-center text-left py-6 md:py-7 px-4 md:px-6 focus:outline-none focus-visible:bg-primary/5"
                  >
                    {/* number */}
                    <motion.span
                      className="font-mono text-xs md:text-sm font-bold tracking-widest text-foreground/50"
                      animate={{
                        opacity: isDimmed ? 0.2 : isHovered ? 1 : 0.6,
                        color: isHovered ? "var(--color-accent)" : "var(--color-foreground)",
                      }}
                      transition={{ duration: 0.3, ease }}
                    >
                      {n}
                    </motion.span>

                    {/* text */}
                    <motion.div
                      className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 min-w-0"
                      animate={{
                        x: isHovered ? 8 : 0,
                        opacity: isDimmed ? 0.3 : 1,
                      }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <span className="text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight leading-tight text-foreground">
                        {text}
                      </span>
                      <span className="text-base md:text-lg text-foreground/60 font-sans leading-snug">
                        {tail}
                      </span>
                    </motion.div>

                    {/* arrow indicator (desktop) */}
                    <motion.div
                      className="hidden md:flex items-center justify-center w-8 h-8 text-foreground shrink-0"
                      animate={{
                        opacity: isDimmed ? 0 : isHovered ? 1 : 0.2,
                        x: isHovered ? 4 : 0,
                      }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        className="w-5 h-5"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </button>
                </motion.li>
              );
            })}
          </ul>

          {/* footer signature strip */}
          {/* <motion.div
            className="flex items-center justify-between gap-4 pt-6 border-t border-foreground/20 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 flex-wrap"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <span>Signed · The Crew</span>
            <span className="flex items-center gap-2">
              <span>Amended anytime</span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span>Last rev · 2026</span>
            </span>
            <span>WeDesign · 1337</span>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
};

export default About;