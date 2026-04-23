"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function AsciiDonut() {
  const [frame, setFrame] = useState("");
  const requestRef = useRef<number>(0);
  
  useEffect(() => {
    let A = 0;
    let B = 0;

    const render = () => {
      const b: string[] = [];
      const z: number[] = [];
      A += 0.04;
      B += 0.02;
      const cA = Math.cos(A), sA = Math.sin(A),
            cB = Math.cos(B), sB = Math.sin(B);
      
      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 === 79 ? "\n" : " ";
        z[k] = 0;
      }

      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i),
                h = ct + 2, // R1 + R2*cos(theta)
                D = 1 / (sp * h * sA + st * cA + 5), // 1/(z)
                t = sp * h * cA - st * sA; // x

          const x = Math.floor(40 + 30 * D * (cp * h * cB - t * sB)),
                y = Math.floor(12 + 15 * D * (cp * h * sB + t * cB)),
                o = x + 80 * y,
                N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));

          if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
            z[o] = D;
            const charIndex = Math.max(0, Math.min(11, N));
            b[o] = ".,-~:;=!*#$@"[charIndex];
          }
        }
      }
      setFrame(b.join(""));
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-card border-2 border-foreground overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none opacity-20">
        <div className="w-[50vw] h-[50vw] bg-accent rounded-full blur-[100px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 p-4"
      >
        <pre className="font-mono text-[8px] sm:text-[10px] md:text-sm leading-none text-foreground tracking-tighter md:tracking-normal">
          {frame}
        </pre>
      </motion.div>

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] uppercase tracking-widest text-foreground/30 pointer-events-none">
        $ ./donut.c <br />
        $ status: rendering
      </div>
    </div>
  );
}
