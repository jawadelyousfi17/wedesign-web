"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createEvent } from '../actions';
import { EventStatus } from '@prisma/client';
import { MarkdownEditor } from '@/components/customs/MarkdownEditor';

export default function NewEventPage() {
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/calendar" 
            className="text-xs font-sans uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Agenda
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            Schedule Event.
          </h1>
        </div>
      </header>

      <form action={createEvent} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g. Variable Fonts Workshop"
              className="bg-transparent border-b border-foreground/20 py-4 text-3xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/10"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              required
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Event Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              required
              placeholder="e.g. Workshop, Meetup, Talk"
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/10"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              placeholder="e.g. 1337 Khouribga, Online, etc."
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-foreground/10"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
              Initial Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="UPCOMING"
              className="bg-transparent border-b border-foreground/20 py-4 text-xl font-serif text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {Object.values(EventStatus).map((status) => (
                <option key={status} value={status} className="bg-background text-foreground uppercase tracking-widest text-xs">
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Markdown Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
            Description (Markdown)
          </label>
          <input type="hidden" name="description" value={description} />
          <MarkdownEditor 
            value={description} 
            onChange={setDescription} 
            placeholder="What's this event about? Support for markdown formatting and images."
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="self-end group relative border border-foreground/20 px-12 py-6 flex items-center justify-center bg-foreground text-background hover:bg-primary hover:text-foreground transition-all duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden"
        >
          <span className="text-sm font-sans font-bold uppercase tracking-widest z-10 relative">
            Confirm Event
          </span>
        </button>
      </form>
    </div>
  );
}
