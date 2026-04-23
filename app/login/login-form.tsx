"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-2">
      {/* ══ THE BUTTON ════════════════════════════════════════════ */}
      <div className="relative group">
        {/* offset ink block behind button — snaps closer on hover */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-active:translate-x-0 group-active:translate-y-0"
        />

        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className="relative w-full bg-background border-2 border-foreground overflow-hidden disabled:cursor-not-allowed cursor-pointer"
        >
          {/* diagonal color wipe — primary color reveals on hover */}
          <div
            aria-hidden
            className="absolute inset-0 bg-primary origin-left scale-x-0 group-hover:scale-x-100 group-disabled:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          />

          {/* content */}
          <div className="relative flex items-center justify-between px-6 md:px-8 py-5 md:py-6 gap-4">
            {/* left: icon + label */}
            <div className="flex items-center gap-4">
              <motion.div
                className="relative flex items-center justify-center w-11 h-11 bg-foreground text-background border-2 border-foreground"
                whileHover={{ rotate: [-8, 8, 0] }}
                transition={{ duration: 0.5 }}
              >
                {/* GitHub mark */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0C17.99 4.66 19 4.98 19 4.98c.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </motion.div>

              <div className="flex flex-col items-start">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 group-hover:text-foreground/80 transition-colors duration-500">
                  OAuth · Secure
                </span>
                <span className="font-sans text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                  Continue with GitHub
                </span>
              </div>
            </div>

            {/* right: animated arrow with trail */}
            <motion.div
              className="relative hidden sm:flex items-center justify-center w-10 h-10 text-foreground flex-shrink-0"
              animate={{ x: loading ? [0, 4, 0] : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
            >
              {/* trailing line — expands on hover */}
              <span
                aria-hidden
                className="absolute right-5 top-1/2 -translate-y-1/2 h-0.5 bg-foreground w-0 group-hover:w-6 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                className="w-5 h-5 relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>

          {/* bottom loading marquee — appears only when loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="relative overflow-hidden bg-foreground text-background border-t-2 border-foreground"
              >
                <motion.div
                  className="flex gap-6 whitespace-nowrap py-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="flex items-center gap-6">
                      <span>Connecting to GitHub</span>
                      <span className="text-primary">✷</span>
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ══ SUPPORTING ROW — fine print / alt info ═══════════════════ */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>End-to-end encrypted</span>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
            <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          <span>Server online</span>
        </div>
      </div>

      {/* ══ FINE PRINT ═══════════════════════════════════════════════ */}
      <p className="font-mono text-[10px] leading-relaxed text-foreground/50 uppercase tracking-[0.15em] max-w-md">
        By continuing, you agree to the club{" "}
        <a
          href="/terms"
          className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
        >
          manifesto
        </a>{" "}
        and accept the{" "}
        <a
          href="/privacy"
          className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
        >
          data terms
        </a>
        .
      </p>
    </div>
  );
}