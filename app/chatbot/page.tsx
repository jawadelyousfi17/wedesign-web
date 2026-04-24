"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Terminal, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendMessage } from "./actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm the WeDesign AI. Ask me anything about the club, our projects, how to apply, or what we're building. What's on your mind?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* re-render every 30s so relative timestamps stay fresh */
  useEffect(() => {
    const t = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const userMsg: Message = { role: "user", content: text, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const allMsgs = [...messages, userMsg];
        const response = await sendMessage(allMsgs);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response, ts: Date.now() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Something went wrong on my end. Try again in a moment.",
            ts: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, isLoading, messages]
  );

  /* keyboard: Shift+Enter → newline (future textarea upgrade), Enter → send */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[0.95] text-foreground">
            Ask the{" "}
            <span className="italic relative inline-block">
              AI
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 h-2 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h1>
          <p className="text-base text-foreground/70 max-w-xl font-serif leading-relaxed">
            Anything about the club, our work, or how to join — it knows.
          </p>
        </div>

        {/* ── CHAT CARD ───────────────────────────────────────── */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
          />
          <div className="relative border-2 border-foreground bg-card overflow-hidden flex flex-col">
            {/* terminal bar */}
            <div className="bg-foreground text-background px-4 py-2.5 flex items-center justify-between border-b-2 border-foreground shrink-0">
              <div className="flex items-center gap-2">
                <Terminal size={14} strokeWidth={2.5} />
                <span className="text-xs font-semibold tracking-wider">
                  wedesign / assistant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] opacity-60">online</span>
              </div>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4"
              style={{ minHeight: "420px", maxHeight: "520px" }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className={`flex gap-3 items-end ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* avatar */}
                    <div
                      className={`w-8 h-8 shrink-0 border-2 border-foreground flex items-center justify-center ${
                        msg.role === "assistant"
                          ? "bg-primary"
                          : "bg-foreground text-background"
                      }`}
                      style={{
                        borderRadius:
                          "42% 58% 38% 62% / 51% 43% 57% 49%",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <Sparkles size={14} strokeWidth={2.5} className="text-foreground" />
                      ) : (
                        <User size={14} strokeWidth={2.5} />
                      )}
                    </div>

                    {/* bubble */}
                    <div
                      className={`relative max-w-[78%] flex flex-col gap-1 ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div
                          aria-hidden
                          className="absolute inset-0 translate-x-1 translate-y-1 bg-foreground"
                        />
                      )}
                      <div
                        className={`relative border-2 border-foreground px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-foreground"
                            : "bg-card text-foreground"
                        }`}
                      >
                        <div className="text-sm font-serif leading-relaxed break-words [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-foreground/10 [&_code]:px-1 [&_pre]:overflow-x-auto">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      <span className="text-[10px] text-foreground/50 px-1">
                        {relativeTime(msg.ts)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* loading bubble */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-end"
                >
                  <div
                    className="w-8 h-8 shrink-0 border-2 border-foreground bg-primary flex items-center justify-center"
                    style={{ borderRadius: "42% 58% 38% 62% / 51% 43% 57% 49%" }}
                  >
                    <Sparkles size={14} strokeWidth={2.5} className="text-foreground" />
                  </div>
                  <div className="relative">
                    <div
                      aria-hidden
                      className="absolute inset-0 translate-x-1 translate-y-1 bg-foreground"
                    />
                    <div className="relative border-2 border-foreground bg-card px-5 py-3.5">
                      <TypingDots />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-stretch gap-0 border-t-2 border-foreground shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                autoComplete="off"
                disabled={isLoading}
                className="flex-1 bg-card px-5 py-4 text-sm font-serif text-foreground placeholder:text-foreground/40 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="group border-l-2 border-foreground bg-card hover:bg-primary transition-colors px-5 py-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <Send
                    size={18}
                    strokeWidth={2.5}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                  />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* footer note */}
        <p className="text-xs text-foreground/50 text-center font-serif italic">
          Responses are generated by AI and may not be perfectly accurate — double-check
          anything important with the crew directly.
        </p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TYPING DOTS                                                       */
/* ══════════════════════════════════════════════════════════════════ */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-foreground/60"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            delay: i * 0.18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}