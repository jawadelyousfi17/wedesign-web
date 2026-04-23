"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CalendarEvent } from "@prisma/client";
import Link from "next/link";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
}

const ease = [0.22, 1, 0.36, 1] as const;

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
export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const pastEvents = initialEvents.filter((e) => e.status === "PAST");
  const currentEvents = initialEvents.filter((e) => e.status === "CURRENT");
  const upcomingEvents = initialEvents.filter((e) => e.status === "UPCOMING");

  return (
    <div ref={ref} className="bg-background w-full px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto flex flex-col gap-10">
        {/* header */}
        <header className="flex flex-col gap-5">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight leading-[0.95]">
            The{" "}
            <span className="italic relative inline-block">
              agenda
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h1>
       
        </header>

        {/* the book */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
          />
          <div className="relative border-2 border-foreground bg-card overflow-hidden">
            {/* CURRENT */}
            {currentEvents.length > 0 && (
              <SectionBanner label="Happening Now" tone="hot" />
            )}
            {currentEvents.map((event, i) => (
              <DayPage
                key={event.id}
                event={event}
                state="current"
                delayIndex={i}
                inView={inView}
                isLast={i === currentEvents.length - 1}
              />
            ))}

            {/* UPCOMING */}
            {upcomingEvents.length > 0 && (
              <SectionBanner label="Still Ahead" tone="cool" />
            )}
            {upcomingEvents.map((event, i) => (
              <DayPage
                key={event.id}
                event={event}
                state="upcoming"
                delayIndex={currentEvents.length + i}
                inView={inView}
                isLast={i === upcomingEvents.length - 1}
              />
            ))}

            {/* PAST */}
            {pastEvents.length > 0 && (
              <SectionBanner label="Already Behind Us" tone="muted" />
            )}
            {pastEvents.map((event, i) => (
              <DayPage
                key={event.id}
                event={event}
                state="past"
                delayIndex={
                  currentEvents.length + upcomingEvents.length + i
                }
                inView={inView}
                isLast={i === pastEvents.length - 1}
              />
            ))}

            {initialEvents.length === 0 && (
              <div className="relative p-12 md:p-20 text-center overflow-hidden">
                <PaperTexture />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <h3 className="text-3xl md:text-4xl font-serif italic tracking-tight">
                    The calendar is clear.
                  </h3>
                  <p className="text-sm text-foreground/60 max-w-md font-serif italic">
                    Nothing on the books yet — come back soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
function SectionBanner({
  label,
  tone,
}: {
  label: string;
  tone: "hot" | "cool" | "muted";
}) {
  const toneStyles = {
    hot: "bg-foreground text-background",
    cool: "bg-foreground text-background",
    muted: "bg-foreground/90 text-background",
  }[tone];

  return (
    <div className={`relative ${toneStyles} overflow-hidden`}>
      <div className="absolute top-0 left-0 right-0 flex justify-around px-12 py-2 pointer-events-none opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-background/40"
            style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}
          />
        ))}
      </div>

      <div className="relative px-6 md:px-10 pt-8 pb-5 flex items-center gap-4">
        <h3
          className="font-serif font-semibold tracking-tight leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          {label}
        </h3>
        {tone === "hot" && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-accent" />
          </span>
        )}
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
  state,
  delayIndex,
  inView,
  isLast,
}: {
  event: CalendarEvent;
  state: "current" | "upcoming" | "past";
  delayIndex: number;
  inView: boolean;
  isLast: boolean;
}) {
  const date = new Date(event.date);
  const weekday = date.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  const monthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isPast = state === "past";
  const isCurrent = state === "current";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(delayIndex * 0.05, 0.6), ease }}
      className={`relative ${!isLast ? "border-b-2 border-foreground" : ""} ${
        isPast ? "opacity-55 hover:opacity-100 transition-opacity" : ""
      }`}
    >
      <Link
        href={`/calendar/${event.id}`}
        className="group relative grid grid-cols-[110px_1fr] md:grid-cols-[200px_1fr] focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
      >
        {/* LEFT — torn date page */}
        <div
          className={`relative flex flex-col items-center justify-center px-4 py-8 md:py-10 border-r-2 border-foreground ${
            isCurrent ? "bg-accent/80" : "bg-card"
          }`}
        >
          <PaperTexture />

          {isCurrent && (
            <div
              className="absolute -left-1 top-5 z-20 bg-green-500 text-accent-foreground font-bold text-[10px] uppercase tracking-[0.2em] px-2 py-1"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 6px) 50%, 100% 100%, 0 100%)",
              }}
            >
              Now
            </div>
          )}

          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-6 opacity-30 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <span
              className={`text-[10px] md:text-xs font-bold tracking-[0.25em] mb-1 ${
                isCurrent ? "" : "text-foreground/70"
              }`}
            >
              {weekday}
            </span>
            <span
              className={`font-serif font-semibold leading-none tabular-nums tracking-tight ${
                isCurrent ? "" : "text-foreground"
              } ${isPast ? "line-through decoration-2" : ""}`}
              style={{ fontSize: "clamp(4rem, 9vw, 6.5rem)" }}
            >
              {day}
            </span>
            <span
              className={`text-[10px] md:text-xs font-bold tracking-[0.25em] mt-2 ${
                isCurrent ? "" : "text-foreground/70"
              }`}
            >
              {monthShort}
            </span>
            <span
              className={`text-[10px] font-serif italic mt-1 ${
                isCurrent ? "" : "text-foreground/50"
              }`}
            >
              '{String(year).slice(-2)}
            </span>
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
        <div
          className={`relative bg-card transition-colors duration-200 ${
            !isPast ? "group-hover:bg-primary/10" : "group-hover:bg-foreground/5"
          }`}
        >
          <PaperTexture />

          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-8 md:left-10 w-px opacity-40 pointer-events-none"
            style={{ background: "var(--color-accent)" }}
          />

          <div className="relative z-10 pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 flex flex-col gap-3">
            <div className="flex items-center gap-4 text-sm text-foreground/70">
              <span
                className={`flex items-center gap-1.5 font-serif tabular-nums ${
                  isPast ? "line-through opacity-70" : ""
                }`}
              >
                <Clock size={13} />
                {time}
              </span>
              <span className="w-1 h-1 bg-foreground/40 rounded-full" />
              <span className="text-xs uppercase tracking-wider text-foreground/60">
                {event.type}
              </span>
            </div>

            <h4
              className={`text-2xl md:text-4xl font-serif tracking-tight leading-[1.1] line-clamp-3 transition-transform duration-200 group-hover:translate-x-1 ${
                isPast
                  ? "text-foreground/60 line-through decoration-foreground/30"
                  : "text-foreground"
              }`}
            >
              {event.title}
            </h4>

            {event.location && (
              <span className="flex items-center gap-1.5 text-sm text-foreground/65 font-serif italic mt-1">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-dashed border-foreground/25">
              <span className="text-sm text-foreground font-semibold group-hover:mr-1 transition-[margin] duration-200">
                {isPast ? "View recap" : "More"}
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