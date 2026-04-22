"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function JournalPostClient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-50 border-b border-foreground/30 shadow-[0_2px_10px_rgba(239,68,68,0.2)]"
      style={{ scaleX }}
    />
  );
}
