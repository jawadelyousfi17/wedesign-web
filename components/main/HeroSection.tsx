"use client";

import { useState, useEffect } from "react";
import { GridBackground } from "@/components/backgrounds/Grid";
import { motion } from "framer-motion";

const words = ["The future.", "The web.", "Experiences."];
const badgeEvents = ["48H jam - 19 MAY", "Design Talk - 12 JUN", "Web Awards - 05 JUL"];

// --- Morphing headline: swaps words with a mask reveal ---
function Morph({ words, interval = 2400, className = '', style = {} }: { words: string[], interval?: number, className?: string, style?: React.CSSProperties }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        lineHeight: 1,
        ...style,
      }}
    >
      {/* invisible longest word to hold width */}
      <span style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {words.reduce((a, b) => (b.length > a.length ? b : a), '')}
      </span>
      {words.map((w, idx) => (
        <span
          key={w}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            transform: idx === i ? 'translateY(0)' : idx < i ? 'translateY(-100%)' : 'translateY(100%)',
            opacity: idx === i ? 1 : 0,
            transition: 'transform 700ms cubic-bezier(.2,.8,.15,1), opacity 500ms ease',
            willChange: 'transform',
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  return (
    <div className="relative w-full min-h-[50vh] flex flex-col items-start justify-center overflow-hidden">
      {/* Background with fading corners */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)'
        }}
      >
        <GridBackground />
      </div>

      {/* Fancy Rotating Stamp / Badge */}
      {/* <motion.div 
        className="absolute top-12 right-6 md:top-32 md:right-24 z-20 flex items-center justify-center w-32 h-32 md:w-48 md:h-48 group select-none pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-foreground/80 opacity-60">
          <path id="textPath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="transparent" />
          <text className="text-[22px] font-sans uppercase tracking-[0.2em] fill-current">
            <textPath href="#textPath" startOffset="0%">
              • wedesign web club • 1337 UM6P 
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-5xl text-foreground/80 opacity-60">
          ✶
        </div>
      </motion.div> */}

      {/* Content */}
      <div className="z-10 flex flex-col items-start justify-center  px-4">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-foreground font-sans  text-center w-full ">
          We Design
        </h1>

         <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-foreground font-sans  w-full ml-3">
          for
        </h1>

        
        <div className="mt-4 md:mt-8  overflow-hidden w-full flex justify-center">
          <Morph 
            words={words} 
            className="text-[8rem] font-sans font-bold italic text-accent text-center" 
          />
        </div>

        {/* Bouncing Floating Badge */}
        <div className="absolute top-10 right-4 lg:top-16 lg:right-2 animate-bounce z-20 flex justify-center group cursor-pointer">
          {/* Cables hanging from the ceiling */}
          <div className="absolute bottom-1/2 left-6 w-0.5 h-[50vh] bg-foreground z-0 transition-transform duration-300 group-hover:-translate-y-1"></div>
          <div className="absolute bottom-1/2 right-6 w-0.5 h-[50vh] bg-foreground z-0 transition-transform duration-300 group-hover:-translate-y-1"></div>

          <div className="relative rotate-5 bg-primary text-foreground font-mono font-bold text-lg md:text-xl px-6 py-3 border-1 border-foreground shadow-[4px_4px_0_var(--color-foreground)] rounded-none whitespace-nowrap flex justify-center items-center z-10 transition-all duration-300 group-hover:rotate-0 group-hover:bg-foreground group-hover:text-background group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_var(--color-foreground)]">
            <Morph words={badgeEvents} interval={3500} />
          </div>
        </div>
      </div>
    </div>
  );
}
