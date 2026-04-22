"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CalendarEvent } from '@prisma/client';
import Link from 'next/link';

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Group events organically for rendering
  const pastEvents = initialEvents.filter(e => e.status === 'PAST');
  const currentEvents = initialEvents.filter(e => e.status === 'CURRENT');
  const upcomingEvents = initialEvents.filter(e => e.status === 'UPCOMING');

  const renderEventList = (events: CalendarEvent[], isDimmed: boolean = false) => (
    events.map((e, i) => {
      const eventDate = new Date(e.date);
      const day = eventDate.getDate().toString().padStart(2, '0');
      const month = eventDate.toLocaleString('en-US', { month: 'long' });
      const year = eventDate.getFullYear().toString();
      const time = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      return (
        <Link href={`/calendar/${e.id}`} key={e.id} className="contents group ">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease }}
            className={`group relative border-b border-foreground/20  last:border-b-0 p-8 flex flex-col md:flex-row md:items-center gap-8 hover:bg-[#eaddcf] transition-colors duration-300 cursor-pointer overflow-hidden z-10 ${isDimmed ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}`}
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
                  <span className="text-[0.65rem] uppercase tracking-widest px-2 py-1 bg-foreground text-background transition-colors group-hover:bg-black">
                    {e.type}
                  </span>
                  <span className="text-sm text-foreground/60 transition-colors group-hover:text-black/60">
                    {time}
                  </span>
                </div>
                
                <h3 className={`text-3xl font-serif tracking-tight leading-tight transition-colors group-hover:text-black ${e.status === 'PAST' ? 'line-through decoration-foreground/40' : ''}`}>
                  {e.title}
                </h3>
              </div>

              {/* Interaction */}
              <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-foreground/30 pb-1 hover:border-black transition-colors group-hover:text-black"
                >
                   <span>{e.status === 'PAST' ? 'View Recap' : 'RSVP'}</span>
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
  );

  return (
    <div className="bg-card mx-auto w-full px-4  md:px-8 py-16" ref={ref}>
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] mb-6">
          The Agenda
        </h1>
        <p className="text-sm uppercase tracking-widest text-foreground/60 max-w-lg leading-relaxed">
          All our {initialEvents.length} events. From what we've already done, to what's happening right now, to what’s coming next.
        </p>
      </header>

      {/* Unified Notebook/Agenda Wrapper */}
      <div className="flex flex-col border-t border-b border-foreground relative bg-card  mb-24">
        {/* Global Paper Margin Lines */}
        <div className="absolute top-0 bottom-0 left-[2rem] md:left-[12rem] w-px bg-red-400/50 z-0"></div>
        <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[12.25rem] w-px bg-red-400/50 z-0"></div>

        {/* Section: Current */}
        <div className="relative z-10 border-b border-foreground/30 bg-primary/10">
          <div className="py-6 pl-12 md:pl-8 text-xs uppercase tracking-[0.3em] font-semibold md:ml-[13rem]">
            • Current Events
          </div>
        </div>
        {renderEventList(currentEvents)}
        
        {/* Section: Upcoming */}
        <div className="relative z-10 border-y border-foreground/30 bg-foreground text-background">
          <div className="py-6 pl-12 md:pl-8 text-xs uppercase tracking-[0.3em] font-semibold md:ml-[13rem]">
            → Upcoming Events
          </div>
        </div>
        {renderEventList(upcomingEvents)}

        {/* Section: Past */}
        <div className="relative z-10 border-y border-foreground/30 bg-foreground/5 text-foreground/60">
          <div className="py-6 pl-12 md:pl-8 text-xs uppercase tracking-[0.3em] font-semibold md:ml-[13rem]">
            — Past Events
          </div>
        </div>
        {renderEventList(pastEvents, true)}
        
      </div>
    </div>
  );
}
