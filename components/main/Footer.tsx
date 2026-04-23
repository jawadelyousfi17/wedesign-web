"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Crew", href: "#crew" },
  { label: "Projects", href: "#projects" },
  { label: "Calendar", href: "#calendar" },
  { label: "Journal", href: "#journal" },
  { label: "Apply", href: "#apply" },
];

const SOCIALS = [];

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // keep year honest across New Year's if the tab stays open
  useEffect(() => {
    const t = setInterval(() => setYear(new Date().getFullYear()), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer
      id="contact"
      className="relative bg-foreground text-background overflow-hidden"
    >
      {/* ── TOP STRIP — newsletter ─────────────────────────────── */}
      <div className="border-b border-background/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1] text-background">
              Get the <span className="italic text-primary">dispatch</span>.
            </h3>
            <p className="text-base text-background/70 font-serif max-w-md leading-relaxed">
              One email when something's worth your inbox — event invites, new
              journal entries, the occasional rant. That's it.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@wherever.com"
                disabled={status === "sending" || status === "success"}
                aria-label="Email address"
                className="flex-1 bg-transparent border-2 border-background/40 focus:border-background px-4 py-3 text-background placeholder:text-background/40 focus:outline-none transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "sending" || status === "success"}
                className="group relative bg-primary text-primary-foreground border-2 border-primary px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:bg-background hover:text-foreground hover:border-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {status === "sending"
                    ? "Sending…"
                    : status === "success"
                      ? "Subscribed"
                      : "Subscribe"}
                </span>
                {status !== "success" && (
                  <ArrowRight
                    size={16}
                    strokeWidth={2.5}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
            {status === "error" && (
              <span className="text-sm text-primary">
                Check the email — something's off.
              </span>
            )}
            {status === "success" && (
              <span className="text-sm text-background/70 font-serif italic">
                Thanks — you're on the list.
              </span>
            )}
          </form>
        </div>
      </div>

      {/* ── MIDDLE — nav grid ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-12 md:gap-8">
        {/* brand column */}
        <div className="flex flex-col gap-5">
          <p className="text-base text-background/70 max-w-xs leading-relaxed font-serif">
            Where design meets the terminal. A student-run club at 1337 Coding
            School, blending code and brutalist aesthetics.
          </p>

          <div className="flex flex-col gap-2 mt-4">
            <span className="text-xs text-background/50">
              In partnership with
            </span>
            <div className="flex gap-3 items-center flex-wrap">
              <span className="text-xl font-bold tracking-tight text-background border border-background/40 px-3 py-1">
                1337
              </span>
              <span className="text-xl font-bold tracking-tight text-background border border-background/40 px-3 py-1">
                UM6P
              </span>
            </div>
          </div>
        </div>

        {/* sitemap */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-background/50">Sitemap</span>
          <nav className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center gap-2 text-base text-background/90 hover:text-primary transition-colors"
              >
                <span className="w-0 overflow-hidden group-hover:w-4 transition-[width] duration-300 text-primary">
                  →
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* socials */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-background/50">Find us elsewhere</span>
          <div className="flex flex-col gap-2.5">
            {/* {SOCIALS.map(({ label, href, icon: Icon, handle }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-background/90 hover:text-primary transition-colors"
              >
                <span className="w-8 h-8 border border-background/40 group-hover:border-primary flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-base">{label}</span>
                  <span className="text-xs text-background/50 font-serif italic">
                    {handle}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            ))} */}
          </div>
        </div>
      </div>

      {/* ── BIG WORDMARK ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
        <h2
          className="font-serif font-semibold tracking-tighter leading-[0.85] text-background select-none"
          style={{ fontSize: "clamp(4rem, 18vw, 16rem)" }}
        >
          we<span className="italic text-primary">/</span>design
        </h2>
      </div>

      {/* ── BOTTOM META ────────────────────────────────────────── */}
      <div className="border-t border-background/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-background/60">
          <span>© {year} we/design — made at 1337, shipped on a Friday.</span>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span>All systems live</span>
            </span>
            <Link
              href="/privacy"
              className="hover:text-background transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-background transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
