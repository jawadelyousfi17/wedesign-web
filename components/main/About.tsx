"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const manifesto = [
  { n: "01", text: "We design in the open. Pull requests, not PowerPoints." },
  { n: "02", text: "We ship on Fridays. Perfect is the enemy of posted." },
  { n: "03", text: "We run weekly crits. Feedback is a gift, not a threat." },
  { n: "04", text: "We build for 1337. Our community is our muse." },
  { n: "05", text: "We are inclusive. Great design comes from diverse minds." },
];

const paragraph = [
  { text: "WeDesign", accent: true },
  {
    text: "is the design & web-dev club of 1337. We believe great product work happens when",
    accent: false,
  },
  {
    text: "designers think like engineers and engineers think like designers",
    accent: true,
  },
  { text: "and both of them ship.", accent: false },
];

const ease = [0.22, 1, 0.36, 1] as const;

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  const words = paragraph.flatMap((seg, si) =>
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word, wi) => ({ word, accent: seg.accent, key: `${si}-${wi}` }))
  );

  return (
    <div ref={ref}>
      <motion.div
        className="border-t border-foreground  py-12"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          className="text-[6em] font-semibold leading-none"
          initial={{
            filter: "blur(30px)",
            opacity: 0,
            letterSpacing: "0.15em",
            scale: 1.04,
          }}
          animate={
            inView
              ? {
                  filter: "blur(0px)",
                  opacity: 1,
                  letterSpacing: "0em",
                  scale: 1,
                }
              : {}
          }
          transition={{ duration: 1.3, ease }}
        >
          Manifesto.
        </motion.h1>
      </motion.div>

      <div className="flex gap-22">
        <div className="flex-1/2 text-3xl font-light leading-[1.3]">
          {words.map(({ word, accent, key }, i) => (
            <motion.span
              key={key}
              className={`inline-block mr-[0.25em] ${
                accent ? "text-accent font-serif" : ""
              }`}
              initial={{ filter: "blur(8px)", opacity: 0, y: 8 }}
              animate={
                inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}
              }
              transition={{ duration: 0.6, delay: 0.5 + i * 0.022, ease }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="flex-1/2 border-t border-foreground"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
          onHoverEnd={() => setHovered(null)}
        >
          {manifesto.map(({ n, text }, i) => {
            const isHovered = hovered === i;
            const isDimmed = hovered !== null && hovered !== i;
            return (
              <motion.div
                key={n}
                className={`relative flex gap-12 py-4 items-center cursor-default overflow-hidden ${
                  i > 0 ? "border-t border-foreground/20" : ""
                }`}
                onHoverStart={() => setHovered(i)}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={
                  inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
                }
                transition={{ duration: 0.7, delay: 0.8 + i * 0.08, ease }}
              >
                <motion.div
                  className="absolute inset-0 bg-accent/10 origin-left"
                  initial={false}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.5, ease }}
                />
                <motion.div
                  className={`relative z-10 text-2xl w-12 transition-colors duration-300 ${
                    isHovered ? "text-accent" : "text-foreground/70"
                  }`}
                  animate={{
                    scale: isHovered ? 1.4 : 1,
                    opacity: isDimmed ? 0.25 : 1,
                  }}
                  transition={{ duration: 0.4, ease }}
                  style={{ transformOrigin: "left center" }}
                >
                  {n}
                </motion.div>
                <motion.div
                  className="relative z-10 text-2xl"
                  animate={{
                    x: isHovered ? 12 : 0,
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                  transition={{ duration: 0.4, ease }}
                >
                  {text}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default About;
