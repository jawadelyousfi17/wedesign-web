"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import LoginForm from "./login-form";

/* ══════════════════════════════════════════════════════════════════ */
/*  ROTATING STAMP — small circular text for top-right corner         */
/* ══════════════════════════════════════════════════════════════════ */
function Stamp() {
  return (
    <motion.div
      className="absolute -top-10 -right-10 w-28 h-28 pointer-events-none select-none z-20"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-foreground">
          <defs>
            <path
              id="stampPath"
              d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
              fill="transparent"
            />
          </defs>
          <text
            className="fill-current"
            style={{ fontSize: 18, letterSpacing: 5, fontFamily: "monospace", fontWeight: 700 }}
          >
            <textPath href="#stampPath" startOffset="0%">
              AUTHORIZED • ACCESS • AUTHORIZED • ACCESS •
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-accent rotate-45 flex items-center justify-center">
            <span className="-rotate-45 text-accent-foreground font-bold text-sm">✷</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  CORNER CROPS — registration-mark style brackets                   */
/* ══════════════════════════════════════════════════════════════════ */
function CornerCrop({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-6 h-6 border-foreground";
  const map = {
    tl: "top-3 left-3 border-t-2 border-l-2",
    tr: "top-3 right-3 border-t-2 border-r-2",
    bl: "bottom-3 left-3 border-b-2 border-l-2",
    br: "bottom-3 right-3 border-b-2 border-r-2",
  };
  return <div className={`${base} ${map[position]}`} />;
}

/* ══════════════════════════════════════════════════════════════════ */
/*  LOGIN PAGE                                                        */
/* ══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // subtle 3D tilt toward cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 80, damping: 20 });
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-3, 3]), { stiffness: 80, damping: 20 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <main className="relative flex-1 w-full min-h-screen flex items-center justify-center py-16 px-4 md:px-8 overflow-hidden">
      {/* ── HALFTONE BACKDROP ────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* ── BIG TYPOGRAPHIC BACKGROUND WORDS ─────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
      >
        <h2
          className="font-serif italic font-bold text-foreground/[0.04] whitespace-nowrap"
          style={{ fontSize: "clamp(10rem, 25vw, 22rem)", letterSpacing: "-0.05em" }}
        >
          enter · enter · enter
        </h2>
      </motion.div>

      {/* ── FLOATING ACCENT SHAPES ───────────────────────────────── */}
      <motion.div
        className="absolute top-20 left-10 w-16 h-16 bg-primary hidden md:block"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 12 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ rotate: 24, scale: 1.1 }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-20 h-20 border-2 border-foreground hidden md:block"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: -15 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{ backgroundColor: "var(--color-secondary)" }}
      />
      <motion.div
        className="absolute top-1/2 left-8 w-6 h-6 rounded-full bg-accent hidden lg:block"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── MAIN CARD ────────────────────────────────────────────── */}
      <motion.div
        onMouseMove={onMove}
        className="relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1800 }}
      >
        {/* offset shadow layer — pure color block behind the card */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-2 translate-y-2 md:translate-x-3 md:translate-y-3 bg-foreground"
        />

        <div className="relative bg-card border-2 border-foreground grid md:grid-cols-[1.4fr_1fr] overflow-hidden">
          {/* ══ LEFT: Form panel ════════════════════════════════════ */}
          <div className="relative p-8 md:p-12 flex flex-col gap-8">
            <CornerCrop position="tl" />
            <CornerCrop position="bl" />

            {/* eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">
                System Access // Secure Channel
              </span>
            </motion.div>

            {/* headline — per-letter reveal */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-serif italic text-foreground leading-[0.85] tracking-tight"
            >
              {"Authenticate.".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0, rotate: 6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.04,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: "inline-block" }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </motion.h1>

            {/* description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="font-sans text-sm text-foreground/70 leading-relaxed max-w-md"
            >
              Connect your account to access the crew board, edit events,
              or drop a new journal entry.
            </motion.p>

            {/* divider with label */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
              className="flex items-center gap-3 mt-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 whitespace-nowrap">
                → Sign in
              </span>
              <span className="h-px flex-1 bg-foreground/30" />
            </motion.div>

            {/* the actual form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <LoginForm />
            </motion.div>

            {/* footer strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="mt-auto pt-6 border-t border-foreground/20 flex justify-between items-center font-mono text-[10px] text-foreground/60 uppercase tracking-[0.25em]"
            >
              <span>we/design</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                LIVE · {time || "--:--:--"}
              </span>
              <span>1337 · UM6P</span>
            </motion.div>
          </div>

          {/* ══ RIGHT: Poster panel (info column) ═══════════════════ */}
          <div className="relative bg-foreground text-background p-8 md:p-10 flex flex-col justify-between overflow-hidden min-h-[500px] md:min-h-0">
            <CornerCrop position="tr" />
            <CornerCrop position="br" />

            {/* noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-screen"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {/* big accent blob */}
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent blur-3xl opacity-30 pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <Stamp />

            {/* top content */}
            <div className="relative z-10 flex flex-col gap-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/60">
                Vol. 01 / Issue 04
              </div>

              <div className="font-serif italic text-4xl md:text-5xl leading-[0.9]">
                Members&nbsp;
                <span className="text-primary">only</span>.
                <br />
                No&nbsp;
                <span className="relative inline-block">
                  exceptions
                  <span className="absolute inset-x-0 top-1/2 h-0.5 bg-accent -rotate-2" />
                </span>
                .
              </div>

              <div className="h-px w-16 bg-background/40" />

              <p className="font-mono text-xs leading-relaxed text-background/70 max-w-xs uppercase tracking-wider">
                The crew board is a private channel.
                Only registered designers have access to events, journals, and the archive.
              </p>
            </div>

            {/* bottom stats */}
            <div className="relative z-10 grid grid-cols-2 gap-6 pt-8 border-t border-background/20 mt-8">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/50 mb-1">
                  Members
                </div>
                <div className="font-serif italic text-4xl text-primary">128</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/50 mb-1">
                  Est.
                </div>
                <div className="font-serif italic text-4xl">2024</div>
              </div>
            </div>

            {/* ticker strip */}
            <div className="relative z-10 mt-8 -mx-8 md:-mx-10 -mb-8 md:-mb-10 bg-primary text-primary-foreground overflow-hidden border-t-2 border-background">
              <motion.div
                className="flex gap-6 whitespace-nowrap py-2 font-mono text-xs font-bold uppercase tracking-[0.25em]"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-6">
                    <span>AUTHORIZED ACCESS</span>
                    <span>✷</span>
                    <span>WE/DESIGN 2024</span>
                    <span>✷</span>
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}