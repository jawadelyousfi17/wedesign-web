"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQ_DATA = [
  {
    q: "Who can join the club?",
    a: "Anyone currently enrolled at 1337 Coding School. Whether you're a seasoned designer or a developer who just discovered CSS, if you care about the intersection of design and code, you belong here.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. We have members who only live in Figma and members who only write Rust. The goal is to bring both worlds together and learn from each other.",
  },
  {
    q: "How often do you meet?",
    a: "We hold weekly design crits (critiques) every Friday. We also run larger workshops and hackathons a few times a month. Check the Calendar for the exact schedule.",
  },
  {
    q: "What's a 'crit'?",
    a: "A critique. It's a session where members present what they are working on, and the rest of the crew provides honest, constructive feedback. It's how we all get better.",
  },
  {
    q: "Why brutalism?",
    a: "Because the modern web is too polished and boring. We believe in interfaces that have character, expose their structure, and don't hide behind unnecessary gloss.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="relative py-16 md:py-24 px-4 md:px-8 bg-card" id="faq">
      <div className="mx-auto flex flex-col gap-12 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-5xl md:text-7xl font-serif tracking-tight leading-[0.95] text-foreground">
            Frequently Asked{" "}
            <span className="italic relative inline-block">
              Questions
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>
        </motion.div>

        <div className="flex flex-col border-t-2 border-foreground">
          {FAQ_DATA.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease }}
                className="border-b-2 border-foreground"
              >
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full flex items-center justify-between py-6 md:py-8 text-left focus:outline-none group transition-colors hover:bg-primary/5 px-4 md:px-6"
                >
                  <span className="text-2xl md:text-3xl font-serif tracking-tight text-foreground group-hover:text-black transition-colors pr-8">
                    {faq.q}
                  </span>
                  <span className="shrink-0 text-foreground/50 group-hover:text-black transition-colors">
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 px-4 md:px-6">
                        <p className="text-lg md:text-xl font-serif italic text-foreground/75 leading-relaxed max-w-3xl">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
