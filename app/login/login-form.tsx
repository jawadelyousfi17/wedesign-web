"use client";

import React, { useState } from 'react';
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
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <button 
        onClick={handleGithubLogin}
        disabled={loading}
        className="group relative w-full border border-foreground/20 px-8 py-6 flex items-center justify-center gap-4 bg-transparent hover:bg-[#eaddcf] disabled:opacity-50 transition-all duration-500 ease-[0.22,1,0.36,1] cursor-pointer overflow-hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-foreground/80 group-hover:text-black transition-colors duration-500"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3.6-.45 6-2.28 6-6.28a4.3 4.3 0 0 0-1.24-3.2 4 4 0 0 0-.08-3.2s-1.03-.3-3.2 1.2a11.5 11.5 0 0 0-5.8 0C7.53 1.93 6.5 2.23 6.5 2.23a4 4 0 0 0-.08 3.2A4.3 4.3 0 0 0 5.18 8.64c0 4 2.4 5.83 6 6.28a4.8 4.8 0 0 0-1 3.24v4" />
          <path d="M5 19c-3 1-4-3-4-3" />
        </svg>
        <span className="text-2xl font-sans font-bold tracking-tight text-foreground/80 group-hover:text-black transition-colors duration-500">
          {loading ? 'Connecting...' : 'Continue with GitHub'}
        </span>

        {/* Animated Arrow */}
        <div className="absolute top-4 right-4 overflow-hidden w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute text-sm text-black transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-45">
            →
          </span>
        </div>
      </button>
    </div>
  );
}