"use client";

import React, { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";

/* X / Twitter logo — not in lucide, inline SVG */
const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function PostActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [shareUsed, setShareUsed] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently fail */
    }
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({ title, url: getUrl() });
      setShareUsed(true);
      setTimeout(() => setShareUsed(false), 2000);
    } catch {
      /* user cancelled or unsupported — no-op */
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <p className="text-2xl md:text-3xl font-serif italic tracking-tight text-foreground">
        Did this land?
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="group inline-flex items-center gap-2 border-2 border-foreground bg-card hover:bg-primary transition-colors px-5 py-3 text-sm font-semibold"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Link copied</span>
            </>
          ) : (
            <>
              <Link2 size={14} strokeWidth={2.5} />
              <span>Copy link</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="group inline-flex items-center gap-2 border-2 border-foreground bg-card hover:bg-primary transition-colors px-5 py-3 text-sm font-semibold"
        >
          <Share2 size={14} strokeWidth={2.5} />
          <span>{shareUsed ? "Shared" : "Share"}</span>
        </button>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors px-5 py-3 text-sm font-semibold"
        >
          <XLogo size={13} />
          <span>Post on X</span>
        </a>
      </div>
    </div>
  );
}
