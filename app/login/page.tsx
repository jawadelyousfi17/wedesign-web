import React from 'react';
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex-1 w-full relative flex items-center justify-center py-16 px-4 md:px-8">
      {/* Paper Margin Lines */}
      <div className="absolute top-0 bottom-0 left-[2rem] md:left-[4rem] w-px bg-red-400/30 z-0 hidden md:block"></div>
      <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-[4.25rem] w-px bg-red-400/30 z-0 hidden md:block"></div>

      <div className="relative z-10 w-full max-w-lg md:pl-24">
        <div className="border border-foreground/20 p-8 md:p-12 relative overflow-hidden flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
              System Access
            </span>
            <h1 className="text-5xl md:text-6xl font-serif italic text-foreground tracking-tight leading-tight">
              Authenticate.
            </h1>
            <p className="text-xs font-sans uppercase tracking-widest text-foreground/60 leading-relaxed">
              Connect your account to access the crew board, edit events, or drop a new journal entry.
            </p>
          </div>

          {/* Login Action Component */}
          <LoginForm />

          {/* Footer Flair */}
          <div className="mt-8 pt-4 border-t border-foreground/10 flex justify-between items-center text-[10px] text-foreground/40 uppercase tracking-widest">
            <span>we/design</span>
            <span>1337 // UM6P</span>
          </div>

        </div>
      </div>
    </main>
  );
}
