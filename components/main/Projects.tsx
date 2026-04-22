"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CalendarEvent } from '@prisma/client';
import Link from 'next/link';

interface ProjectsProps {
  events: CalendarEvent[];
}

const ease = [0.22, 1, 0.36, 1] as const;

const Projects: React.FC<ProjectsProps> = ({ events }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  if (events.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-8 px-8" id="projects">
      <h2 className="text-5xl font-semibold mb-12">
       What we’ve shipped.
      </h2>
    
      <div className="border-t border-b border-foreground bg-card">
        {events.map((e, i) => {
          const eventDate = new Date(e.date);
          const dateStr = `${eventDate.getFullYear()}.${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
          
          return (
            <Link href={`/calendar/${e.id}`} key={e.id} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease }}
                className="group relative  overflow-hidden border-t border-foreground/25 first:border-t-0 cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <div className="relative grid grid-cols-[6rem_1fr_auto] gap-8 items-baseline py-6 px-4 group-hover:px-6 transition-[padding] duration-300">
                  <div className="text-md uppercase tracking-widest  text-foreground/60 transition-colors duration-300 group-hover:text-foreground">
                    {dateStr}
                  </div>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-3xl font-semibold tracking-tight leading-tight">
                      {e.title}
                    </span>
                    <span className="text-sm text-accent font-medium transition-colors duration-300 group-hover:text-background p-1 border border-foreground/25  bg-foreground px-2">
                       {e.type}
                    </span>
                  </div>
                  <div className="text-md uppercase tracking-widest     text-foreground/60 text-right transition-colors duration-300 group-hover:text-foreground max-w-[300px] truncate">
                    {e.location || 'Distributed'}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
