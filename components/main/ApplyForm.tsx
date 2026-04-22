"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '../ui/button';

const ease = [0.22, 1, 0.36, 1] as const;

const ApplyForm: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-8 px-8" id="apply">
      <div className="flex items-end justify-between mb-12">
        <h2 className="text-5xl font-semibold">
          Apply to join.
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease }}
        className="   relative overflow-hidden"
      >
        {/* Decorative Grid Lines to match the paper/notebook agenda vibe */}
        {/* <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/20 z-0"></div>
        <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/20 z-0"></div> */}

        <form className="flex flex-col gap-12 relative z-10 p-2" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-2">
              <label htmlFor="login" className="text-xs uppercase tracking-widest text-foreground/60  focus-within:text-black transition-colors">
                1337 Login
              </label>
              <input 
                type="text" 
                id="login" 
                name="login"
                placeholder="johndoe"
                className="bg-transparent border-b border-foreground/20 py-2 text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20 text-foreground"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="whatsapp" className="text-xs uppercase tracking-widest text-foreground/60  focus-within:text-black transition-colors">
                WhatsApp Number
              </label>
              <input 
                type="tel" 
                id="whatsapp" 
                name="whatsapp"
                placeholder="+212 6XX XX XX XX"
                className="bg-transparent border-b border-foreground/20 py-2 text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20 text-foreground"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-foreground/60  focus-within:text-black transition-colors">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              placeholder="hello@example.com"
              className="bg-transparent border-b border-foreground/20 py-2 text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/20 text-foreground w-full"
              required
            />
          </div>

          <Button>Send Application</Button>
        </form>
      </motion.div>
    </section>
  );
};

export default ApplyForm;