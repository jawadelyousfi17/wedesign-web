import React from "react";
import Link from "next/link";
import { Locate, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import InterestButton from "./interest-button";
import { Metadata } from "next";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ 
  params 
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.calendarEvent.findUnique({
    where: { id }
  });

  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: `Join us for ${event.title} at ${event.location}. ${event.description?.substring(0, 100)}`,
  };
}

export async function generateStaticParams() {
  const events = await prisma.calendarEvent.findMany({
    select: { id: true }
  });
  return events.map((event) => ({
    id: event.id
  }));
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    include: {
      _count: {
        select: { interestedUsers: true }
      },
      interestedUsers: {
        select: { id: true }
      }
    }
  });

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = eventDate.toLocaleString('en-US', { month: 'long' });
  const year = eventDate.getFullYear().toString();
  const time = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex flex-col text-foreground font-sans">
      <main className="flex-1  mx-auto w-full relative py-16 px-6 md:px-12 bg-card">
        <article className="relative z-10">
          {/* Header */}
          <header className="mb-16 border-b border-foreground/20 pb-12">
            <div className="flex flex-wrap items-center gap-4 mb-8 text-xs uppercase tracking-widest text-foreground/75">
               <span className="bg-foreground text-background px-3 py-1 font-semibold tracking-widest">
                 {event.type}
               </span>
               <span className="italic font-serif text-sm">{month} {day}, {year}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[1.05] mb-8">
              {event.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-8 text-sm uppercase tracking-widest text-foreground/70">
              <div className="flex items-center gap-3">
                <Clock size={16} />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-3">
                <Locate size={16} />
                <span>{event.location}</span>
              </div>
            </div>
          </header>

          {/* Body content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="markdown-body text-foreground/90">
                <ReactMarkdown>{event.description || "_No description provided._"}</ReactMarkdown>
              </div>
            </div>

            {/* Sidebar / RSVP */}
            <div className="flex flex-col gap-8">
              <div className="border border-foreground bg-primary p-8 flex flex-col gap-6 shadow-sm">
                <h3 className="text-2xl font-serif tracking-tight">Reserve your spot</h3>
                <p className="text-sm text-foreground/80 font-medium">
                  Seats are highly limited to keep the crits tight and the coffee lines short.
                </p>
                
                <InterestButton 
                    eventId={event.id}
                    initialInterestedCount={event._count.interestedUsers}
                    interestedUserIds={event.interestedUsers.map(u => u.id)}
                />

                <button className="group relative inline-flex items-center justify-between px-6 py-4 bg-foreground text-background hover:bg-black transition-colors duration-300 mt-2">
                  <span className="text-xs uppercase tracking-widest font-semibold">RSVP Now</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-body {
          font-family: var(--font-sans);
        }
        .markdown-body p {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: var(--font-serif);
          line-height: 1.2;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          letter-spacing: -0.01em;
          color: var(--foreground);
        }
        .markdown-body h1 { font-size: 3rem; }
        .markdown-body h2 { font-size: 2.25rem; }
        .markdown-body h3 { font-size: 1.75rem; }
        
        .markdown-body blockquote {
          border-left: 4px solid var(--foreground);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-style: italic;
          color: var(--foreground/80);
        }
        .markdown-body ul {
          list-style-type: square;
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 1.15rem;
        }
        .markdown-body li {
          margin-bottom: 0.5rem;
        }
        .markdown-body pre {
          background: var(--foreground);
          color: var(--background);
          padding: 1.5rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          margin: 2rem 0;
        }
        .markdown-body img {
          max-width: 100%;
          height: auto;
          border: 1px solid var(--foreground/10);
          margin: 2.5rem 0;
        }
        .markdown-body code {
          background: var(--foreground/5);
          padding: 0.2rem 0.4rem;
          font-size: 0.9em;
          font-family: var(--font-mono);
        }
      `}} />
    </div>
  );
}
