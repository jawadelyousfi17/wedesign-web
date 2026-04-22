import React from 'react';
import ApplyForm from "@/components/main/ApplyForm";

export default function JoinPage() {
  return (
    <div className="max-w-7xl mx-auto w-full relative px-8 py-16">
      <div className="relative z-10  pr-4">
        <header className="mb-12">
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1] mb-6">
            Join Us.
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl leading-relaxed mb-8">
            Become part of the crew. We are always looking for passionate designers, developers, and thinkers to craft the future of we/design.
          </p>
        </header>

        <div className="border-t border-foreground/20 pt-6">
          <ApplyForm />
        </div>
      </div>
    </div>
  );
}
