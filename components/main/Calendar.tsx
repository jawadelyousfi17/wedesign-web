"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CalendarEvent } from '@prisma/client';
import Link from 'next/link';

interface CalendarProps {
  events: CalendarEvent[];
}

const ease = [0.22, 1, 0.36, 1] as const;

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-8 px-8" id="calendar">
      <h2 className="text-5xl font-semibold mb-12">
        What’s coming up.
      </h2>

      <div className="flex flex-col border-t border-b border-foreground relative bg-card">
        {/* Paper Margin Line (Red, like legal or ruled paper) */}
        <div className="absolute top-0 bottom-0 left-[2rem] md:left-[12rem] w-px bg-red-400/50 z-0"></div>
        <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[12.25rem] w-px bg-red-400/50 z-0"></div>

        {events.length === 0 ? (
          <div className="p-16 text-center z-10">
             <span className="font-serif italic text-2xl text-foreground/50 md:ml-[13rem]">
                No upcoming events for now. Stay tuned.
             </span>
          </div>
        ) : (
          events.map((e, i) => {
            const eventDate = new Date(e.date);
            const day = eventDate.getDate().toString().padStart(2, '0');
            const month = eventDate.toLocaleString('en-US', { month: 'long' });
            const year = eventDate.getFullYear().toString();
            const time = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            return (
              <Link href={`/calendar/${e.id}`} key={e.id} className="contents">
                <motion.article
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease }}
                  className="group relative border-b border-foreground/20 last:border-b-0 p-8 flex flex-col md:flex-row md:items-center gap-8 hover:bg-primary transition-colors duration-300 cursor-pointer overflow-hidden z-10"
                >
                  {/* Date Block (Agenda left column) */}
                  <div className="md:w-32 shrink-0 flex flex-col gap-1 pl-12 md:pl-0">
                    <div className="text-6xl font-bold font-serif leading-none tracking-tight text-foreground transition-colors group-hover:text-black">
                      {day}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-foreground/60 transition-colors group-hover:text-black/60">
                      {month} · {year}
                    </div>
                  </div>

                  {/* Event Info (Agenda right body) */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-8 pl-12 md:pl-8 border-t border-foreground/10 md:border-t-0 pt-6 md:pt-0">
                    <div className="flex flex-col gap-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-[0.65rem] uppercase tracking-widest px-2 py-1 bg-foreground text-background transition-colors group-hover:bg-foreground">
                          {e.type}
                        </span>
                        <span className="text-sm font-mono text-foreground/60 transition-colors group-hover:text-black/60">
                          {time}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-serif tracking-tight leading-tight transition-colors group-hover:text-black">
                        {e.title}
                      </h3>
                    </div>

                    {/* Location & Interaction */}
                    <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                      <div className="text-xs uppercase tracking-widest text-foreground/60 flex items-center gap-2 transition-colors group-hover:text-black/60">
                        <span>{e.location}</span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-foreground/30 pb-1 hover:border-black transition-colors group-hover:text-black"
                      >
                        <span>RSVP</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Calendar;
