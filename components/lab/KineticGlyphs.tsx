"use client";

import React, { useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function KineticGlyphs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tracking
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Create a grid of glyphs
  const rows = 12;
  const cols = 24;
  const glyphs = ["/", "\\", "-", "|", "+", "*", ".", "0", "1"];

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 grid gap-0 p-8 select-none bg-card border-2 border-foreground overflow-hidden cursor-none"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        perspective: "1000px",
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const char = glyphs[(row + col) % glyphs.length];
        
        return (
          <Glyph 
            key={i} 
            char={char} 
            x={springX} 
            y={springY} 
            row={row} 
            col={col} 
            totalRows={rows}
            totalCols={cols}
          />
        );
      })}

      {/* Custom Cursor Indicator */}
      <motion.div 
        className="fixed top-0 left-0 w-12 h-12 border-2 border-accent rounded-full pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
        style={{
          x: useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 1200]), { stiffness: 400, damping: 30 }),
          y: useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 600]), { stiffness: 400, damping: 30 }),
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
          <div className="w-1 h-1 bg-accent rounded-full" />
      </motion.div>
    </div>
  );
}

function Glyph({ char, x, y, row, col, totalRows, totalCols }: any) {
  const rotateX = useTransform(y, [-0.5, 0.5], [45, -45]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-45, 45]);
  
  const delay = (row * totalCols + col) * 0.001;

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="flex items-center justify-center font-mono text-lg md:text-xl font-bold text-foreground/20 hover:text-accent transition-colors duration-300"
    >
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 + delay, duration: 0.5 }}
      >
        {char}
      </motion.span>
    </motion.div>
  );
}
