"use client";

import { useState, useEffect, useRef } from "react";
import { GridBackground } from "@/components/backgrounds/Grid";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const words = ["The Future.", "The Web.", "Experiences.", "Tomorrow.", "Wonder."];
const badgeEvents = ["48H JAM — 19 MAY", "DESIGN TALK — 12 JUN", "WEB AWARDS — 05 JUL"];

/* ══════════════════════════════════════════════════════════════════ */
/*  MORPH — slot-machine word swap with 3D flip + optional shimmer    */
/* ══════════════════════════════════════════════════════════════════ */
function Morph({
  words,
  interval = 2600,
  className = "",
  style = {},
  gradient = false,
}: {
  words: string[];
  interval?: number;
  className?: string;
  style?: React.CSSProperties;
  gradient?: boolean;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        overflow: "hidden",
        verticalAlign: "bottom",
        lineHeight: 1,
        ...style,
      }}
    >
      <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap" }}>
        {longest}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0, rotateX: -60, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, rotateX: 0, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, rotateX: 60, filter: "blur(8px)" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            whiteSpace: "nowrap",
            transformOrigin: "center bottom",
            transformStyle: "preserve-3d",
            ...(gradient && {
              backgroundImage:
                "linear-gradient(110deg, var(--color-accent) 0%, var(--color-primary) 40%, var(--color-accent) 60%, var(--color-primary) 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 6s linear infinite",
            }),
          }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SPLITWORD — per-letter reveal with hover jiggle                   */
/* ══════════════════════════════════════════════════════════════════ */
function SplitWord({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={className} style={{ display: "inline-block" }}>
      {text.split("").map((ch, idx) => (
        <motion.span
          key={`${ch}-${idx}`}
          initial={{ y: "115%", opacity: 0, rotate: 8, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          whileHover={{
            y: -12,
            rotate: [0, -6, 6, 0],
            color: "var(--color-accent)",
            transition: { duration: 0.4 },
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            delay: delay + idx * 0.045,
          }}
          style={{ display: "inline-block", cursor: "default", willChange: "transform" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  ROTATING STAMP                                                    */
/* ══════════════════════════════════════════════════════════════════ */
function RotatingStamp() {
  return (
    <motion.div
      className="absolute top-8 left-4 md:top-16 md:left-10 z-20 pointer-events-none select-none"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 1.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative w-28 h-28 md:w-40 md:h-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-foreground">
          <defs>
            <path
              id="circlePath"
              d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
              fill="transparent"
            />
          </defs>
          <text
            className="fill-current"
            style={{ fontSize: 16, letterSpacing: 6, fontFamily: "monospace" }}
          >
            <textPath href="#circlePath" startOffset="0%">
              WEDESIGN • WEB CLUB • 1337 UM6P • EST 2024 •
            </textPath>
          </text>
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl text-accent"
          animate={{ rotate: -360, scale: [1, 1.15, 1] }}
          transition={{
            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          ✷
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  HANGING BADGE                                                     */
/* ══════════════════════════════════════════════════════════════════ */
function HangingBadge() {
  const rotate = useMotionValue(-3);
  const smoothRotate = useSpring(rotate, { stiffness: 60, damping: 8, mass: 1.2 });

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      rotate.set(Math.sin(elapsed * 1.1) * 2.5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rotate]);

  const kick = () => rotate.set(rotate.get() + (Math.random() > 0.5 ? 14 : -14));

  return (
    <motion.div
      className="absolute top-0 right-4 lg:right-16 z-20"
      initial={{ y: -500, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 11, delay: 1.4 }}
    >
      <motion.div
        style={{ rotate: smoothRotate, transformOrigin: "top center" }}
        className="relative flex flex-col items-center"
      >
        <div className="flex gap-24 -mb-0.5">
          <div className="w-px h-32 md:h-44 bg-foreground/70" />
          <div className="w-px h-32 md:h-44 bg-foreground/70" />
        </div>

        <motion.div
          onHoverStart={kick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="relative bg-primary text-foreground font-mono font-bold text-sm md:text-base px-6 py-3 border border-foreground cursor-pointer select-none"
          style={{ boxShadow: "6px 6px 0 var(--color-foreground)" }}
        >
          <span className="absolute -top-1.5 left-3 w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="absolute -top-1.5 right-3 w-2.5 h-2.5 rounded-full bg-foreground" />
          <Morph words={badgeEvents} interval={3500} />
        </motion.div>

        <motion.div
          className="w-20 h-1 bg-foreground/20 rounded-full mt-4 blur-sm"
          animate={{ scaleX: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  MAGNETIC CTA                                                      */
/* ══════════════════════════════════════════════════════════════════ */
function MagneticCTA() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="group relative inline-flex items-center gap-3 bg-foreground text-background font-mono font-bold text-xs md:text-sm tracking-[0.25em] uppercase px-8 py-4 border border-foreground overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
      <span className="relative z-10 flex items-center gap-3 group-hover:text-foreground transition-colors duration-500">
        Explore the club
        <motion.span
          className="inline-block"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PARTICLES                                                         */
/* ══════════════════════════════════════════════════════════════════ */
function Particles() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; d: number; s: number }[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 8 + Math.random() * 12,
        s: 2 + Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {dots.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-accent/40 rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TICKER                                                            */
/* ══════════════════════════════════════════════════════════════════ */
function Ticker() {
  const items = [
    "WEDESIGN",
    "✷",
    "WEB CLUB",
    "✷",
    "1337 UM6P",
    "✷",
    "EST. 2024",
    "✷",
    "CRAFT / CODE / CHAOS",
    "✷",
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-foreground/20 py-3 bg-background/40 backdrop-blur-sm">
      <motion.div
        className="flex gap-10 whitespace-nowrap font-mono text-sm tracking-[0.3em] text-foreground/70"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  HERO SECTION                                                      */
/* ══════════════════════════════════════════════════════════════════ */
export function HeroSection() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 80,
    damping: 20,
  });
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), {
    stiffness: 80,
    damping: 20,
  });

  const gridX = useSpring(useTransform(mx, [-0.5, 0.5], [-20, 20]), {
    stiffness: 50,
    damping: 20,
  });
  const gridY = useSpring(useTransform(my, [-0.5, 0.5], [-20, 20]), {
    stiffness: 50,
    damping: 20,
  });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      onMouseMove={onMove}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Parallax grid */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          x: gridX,
          y: gridY,
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)",
        }}
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GridBackground />
      </motion.div>

      <Particles />
      <RotatingStamp />
      <HangingBadge />

      {/* Top label */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 font-mono text-[10px] md:text-xs tracking-[0.5em] text-foreground/60 uppercase"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="w-10 h-px bg-foreground/50" />
        <span>A Design Club</span>
        <span className="w-10 h-px bg-foreground/50" />
      </motion.div>

      {/* Main stack */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center px-4 md:px-10 w-full"
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}
      >
        <div className="w-full overflow-hidden">
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-foreground font-sans text-center w-full">
            <SplitWord text="We Design" delay={0.3} />
          </h1>
        </div>

        <div className="w-full overflow-hidden">
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-foreground font-sans w-full flex items-center justify-center gap-4 md:gap-6">
            <SplitWord text="for" delay={0.7} />
            <motion.svg
              width="90"
              height="90"
              viewBox="0 0 90 90"
              className="hidden md:inline-block text-accent"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.8, ease: "backOut" }}
            >
              <motion.path
                d="M 12 45 L 72 45 M 55 28 L 72 45 L 55 62"
                stroke="currentColor"
                strokeWidth="7"
                fill="none"
                strokeLinecap="square"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 0.9, ease: "easeOut" }}
              />
            </motion.svg>
          </h1>
        </div>

        {/* Accent morph word */}
        <motion.div
          className="mt-2 md:mt-6 w-full flex justify-center"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <Morph
            words={words}
            gradient
            className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-bold italic"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="mt-10 md:mt-14 text-center font-mono text-[11px] md:text-xs tracking-[0.3em] text-foreground/70 uppercase flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1 }}
        >
          <span className="inline-block w-10 h-px bg-foreground/50" />
          <span>Craft · Code · Chaos</span>
          <span className="inline-block w-10 h-px bg-foreground/50" />
        </motion.p>

        {/* CTA */}
        <div className="mt-8 md:mt-10">
          <MagneticCTA />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-foreground/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
      >
        <span>SCROLL</span>
        <div className="relative w-px h-10 bg-foreground/20 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 h-3 bg-accent"
            animate={{ y: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <Ticker />
    </section>
  );
}