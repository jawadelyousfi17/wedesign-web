"use client";

import React, { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CalendarEvent } from "@prisma/client";
import Link from "next/link";
import { MapPin, ArrowUpRight, Clock } from "lucide-react";

interface CalendarProps {
  events: CalendarEvent[];
}

const ease = [0.22, 1, 0.36, 1] as const;

/* ── helpers ──────────────────────────────────────────────────── */
const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);

/* ══════════════════════════════════════════════════════════════════ */
const PaperTexture = () => (
  <>
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.6] mix-blend-multiply dark:mix-blend-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.1]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent 0, transparent 39px, var(--color-foreground) 39px, var(--color-foreground) 40px)",
      }}
    />
  </>
);

/* ══════════════════════════════════════════════════════════════════ */
const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const today = startOfDay(new Date());

  const structure = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );
    const months = new Map<
      string,
      { label: string; year: number; events: CalendarEvent[] }
    >();
    for (const e of sorted) {
      const d = new Date(e.date);
      const mk = monthKey(d);
      if (!months.has(mk)) {
        months.set(mk, {
          label: d.toLocaleString("en-US", { month: "long" }).toUpperCase(),
          year: d.getFullYear(),
          events: [],
        });
      }
      months.get(mk)!.events.push(e);
    }
    return Array.from(months.entries()).map(([mk, v]) => ({ key: mk, ...v }));
  }, [events]);

  const nextUpcomingId = useMemo(() => {
    const upcoming = events
      .filter((e) => new Date(e.date).getTime() >= today.getTime())
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    return upcoming[0]?.id ?? null;
  }, [events, today]);

  return (
    <section ref={ref} className="relative py-16 md:py-24 px-4 md:px-8" id="calendar">
      <div className="mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] text-foreground">
            The{" "}
            <span className="italic relative inline-block">
              agenda
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>

        </div>

        {events.length === 0 ? (
          <EmptyAgenda />
        ) : (
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <div className="relative border-2 border-foreground bg-card overflow-hidden">
              {structure.map((month, mi) => (
                <React.Fragment key={month.key}>
                  <MonthBanner label={month.label} year={month.year} count={month.events.length} />
                  {month.events.map((event, ei) => (
                    <DayPage
                      key={event.id}
                      event={event}
                      today={today}
                      delayIndex={mi * 5 + ei}
                      inView={inView}
                      isNext={event.id === nextUpcomingId}
                      isLast={ei === month.events.length - 1}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
function MonthBanner({
  label,
  year,
  count,
}: {
  label: string;
  year: number;
  count: number;
}) {
  return (
    <div className="relative bg-foreground text-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 flex justify-around px-12 py-2 pointer-events-none opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-background/40"
            style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}
          />
        ))}
      </div>

      <div className="relative px-6 md:px-10 pt-10 pb-6 flex items-end justify-between gap-6 flex-wrap">
        <h3
          className="font-serif font-semibold tracking-tighter leading-[0.8]"
          style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
        >
          {label}
        </h3>
        <div className="flex flex-col items-end gap-1">
          <span
            className="font-serif italic tabular-nums leading-none"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            '{String(year).slice(-2)}
          </span>
          <span className="text-xs opacity-60 font-serif italic">
            {count} {count === 1 ? "event" : "events"}
          </span>
        </div>
      </div>

      <div
        aria-hidden
        className="h-3 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 6px, var(--color-background) 3px, transparent 3.5px)",
          backgroundSize: "16px 12px",
          backgroundPosition: "0 center",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
function DayPage({
  event,
  today,
  delayIndex,
  inView,
  isNext,
  isLast,
}: {
  event: CalendarEvent;
  today: Date;
  delayIndex: number;
  inView: boolean;
  isNext: boolean;
  isLast: boolean;
}) {
  const date = new Date(event.date);
  const diff = daysBetween(today, date);
  const isToday = diff === 0;
  const isTomorrow = diff === 1;
  const isPast = diff < 0;
  const weekday = date.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  const monthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(delayIndex * 0.05, 0.6), ease }}
      className={`relative ${!isLast ? "border-b-2 border-foreground" : ""} ${
        isPast ? "opacity-55" : ""
      }`}
    >
      <Link
        href={`/calendar/${event.id}`}
        className="group relative grid grid-cols-[110px_1fr] md:grid-cols-[200px_1fr] focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
      >
        {/* LEFT — torn calendar page */}
        <div
          className={`relative flex flex-col items-center justify-center px-4 py-8 md:py-10 border-r-2 border-foreground ${
            isToday ? "bg-primary text-foreground" : "bg-card"
          }`}
        >
          <PaperTexture />

          {isToday && (
            <div
              className="absolute -left-1 top-5 z-20 bg-accent text-accent-foreground font-bold text-[10px] uppercase tracking-[0.2em] px-2 py-1"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 6px) 50%, 100% 100%, 0 100%)",
              }}
            >
              Today
            </div>
          )}

          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-6 opacity-30 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <span
              className={`text-[10px] md:text-xs font-bold tracking-[0.25em] mb-1 ${
                isToday ? "" : "text-foreground/70"
              }`}
            >
              {weekday}
            </span>
            <span
              className={`font-serif font-semibold leading-none tabular-nums tracking-tight ${
                isToday ? "" : "text-foreground"
              }`}
              style={{ fontSize: "clamp(4rem, 9vw, 6.5rem)" }}
            >
              {day}
            </span>
            <span
              className={`text-[10px] md:text-xs font-bold tracking-[0.25em] mt-2 ${
                isToday ? "" : "text-foreground/70"
              }`}
            >
              {monthShort}
            </span>

            {isTomorrow && (
              <span className="mt-3 text-[10px] font-serif italic text-foreground/60">
                tomorrow
              </span>
            )}
          </div>

          <div
            aria-hidden
            className="absolute top-0 bottom-0 right-0 w-1.5 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 3px 8px, var(--color-background) 2px, transparent 2.5px)",
              backgroundSize: "6px 16px",
            }}
          />
        </div>

        {/* RIGHT — ruled notes page */}
        <div className="relative bg-card group-hover:bg-primary/10 transition-colors duration-200">
          <PaperTexture />

          {/* red margin */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-8 md:left-10 w-px opacity-40 pointer-events-none"
            style={{ background: "var(--color-accent)" }}
          />

          {/* next-up marker */}
          {isNext && (
            <span
              aria-hidden
              className="absolute left-8 md:left-10 top-4 bottom-4 w-1 bg-accent"
            />
          )}

          <div className="relative z-10 pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 flex flex-col gap-3">
            {/* time + type */}
            <div className="flex items-center gap-4  text-foreground/70">
              <span
                className={`flex items-center gap-1.5  tabular-nums ${
                  isPast ? "line-through opacity-70" : ""
                }`}
              >
                <Clock size={13} />
                {time}
              </span>
              <span className="w-1 h-1 bg-foreground/40 rounded-full" />
              <span className="uppercase text-foreground/60">
                {event.type}
              </span>
            </div>

            {/* title */}
            <h4
              className={`text-2xl md:text-4xl font-serif tracking-tight leading-[1.1] line-clamp-3 transition-transform duration-200 group-hover:translate-x-1 ${
                isPast ? "text-foreground/60" : "text-foreground"
              }`}
            >
              {event.title}
            </h4>

            {/* location */}
            {event.location && (
              <span className="flex items-center gap-1.5  text-foreground/65  mt-1">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}

            {/* footer strip */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-dashed border-foreground/25">
              <span className="text-sm text-foreground font-semibold group-hover:mr-1 transition-[margin] duration-200">
                View entry
              </span>
              <div className="w-8 h-8 border border-foreground/30 flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors duration-200">
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
function EmptyAgenda() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
      <div className="relative border-2 border-foreground bg-card p-12 md:p-20 flex flex-col items-center text-center gap-3 overflow-hidden">
        <PaperTexture />
        <div className="relative z-10 flex flex-col gap-3 items-center">
          <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight">
            The calendar is clear.
          </h3>
          <p className="text-sm text-foreground/60 max-w-md font-serif italic">
            No events on the books right now — new ones drop every couple of weeks.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Calendar;