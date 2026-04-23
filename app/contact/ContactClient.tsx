"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageCircle,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { submitContactForm } from "./actions";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactClient() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof data, boolean>>>({});
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── validation ─────────────────────────────────────────────── */
  const validate = (field: keyof typeof data, value: string): string => {
    if (field === "name") {
      if (value.trim().length < 2) return "Tell us your name.";
    }
    if (field === "email") {
      if (!value.trim()) return "We need a way to reply.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "That email doesn't look right.";
    }
    if (field === "message") {
      if (value.trim().length < 10) return "A sentence or two is enough.";
      if (value.length > 2000) return "Keep it under 2000 characters.";
    }
    return "";
  };

  const setField = (field: keyof typeof data, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    if (errors[field]) {
      const msg = validate(field, value);
      if (!msg) setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof typeof data) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validate(field, data[field]) }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: Errors = {};
    (Object.keys(data) as (keyof typeof data)[]).forEach((k) => {
      const msg = validate(k, data[k]);
      if (msg) newErrors[k] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, message: true });
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("message", data.message);

      const result = await submitContactForm(formData);
      if (result.success) {
        setIsSuccess(true);
        setData({ name: "", email: "", message: "" });
        setErrors({});
        setTouched({});
      } else {
        setSubmitError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col pt-3 md:pt-28 pb-20">
      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-14 md:mb-20">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight leading-[0.95]">
            Contact{" "}
            <span className="italic relative inline-block">
              Us
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/70 font-serif leading-relaxed max-w-2xl">
            Project idea, collab, question, or just want to talk type. we read
            everything. A human usually replies within a day.
          </p>
        </div>
      </section>

      {/* ═══ GRID ═════════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 md:gap-16">
        {/* ── LEFT: form ──────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          {isSuccess ? (
            <SuccessCard onReset={() => setIsSuccess(false)} />
          ) : (
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
              />
              <form
                onSubmit={handleSubmit}
                noValidate
                className="relative border-2 border-foreground bg-card p-6 md:p-10 flex flex-col gap-7"
              >
                {submitError && (
                  <div
                    role="alert"
                    className="border-2 border-destructive bg-destructive/10 p-4 flex items-start gap-3"
                  >
                    <AlertCircle
                      size={18}
                      className="text-destructive flex-shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-foreground">{submitError}</span>
                  </div>
                )}

                <Field
                  label="Name"
                  htmlFor="name"
                  error={touched.name ? errors.name : undefined}
                >
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                  />
                </Field>

                <Field
                  label="Email"
                  htmlFor="email"
                  error={touched.email ? errors.email : undefined}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@wherever.com"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={!!errors.email}
                    className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                  />
                </Field>

                <Field
                  label="Message"
                  htmlFor="message"
                  hint={`${data.message.length}/2000`}
                  error={touched.message ? errors.message : undefined}
                >
                  <textarea
                    id="message"
                    name="message"
                    value={data.message}
                    onChange={(e) =>
                      setField("message", e.target.value.slice(0, 2000))
                    }
                    onBlur={() => handleBlur("message")}
                    rows={5}
                    placeholder="What's on your mind?"
                    aria-invalid={!!errors.message}
                    className="bg-transparent border-b border-foreground/30 py-2 text-lg md:text-xl font-serif leading-relaxed focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full resize-none"
                  />
                </Field>

                <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-foreground/15">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group flex-1 relative border-2 border-foreground bg-foreground text-background px-6 py-4 md:py-5 flex items-center justify-between gap-4 hover:bg-primary hover:text-foreground transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:text-background"
                  >
                    <span className="flex flex-col items-start gap-0.5">
                      <span className="text-xs opacity-60 font-serif italic">
                        {isPending ? "Sending" : "Ready when you are"}
                      </span>
                      <span className="text-lg md:text-xl font-serif italic tracking-tight">
                        {isPending ? "Sending…" : "Send message"}
                      </span>
                    </span>
                    {isPending ? (
                      <Loader2 className="animate-spin shrink-0" size={20} />
                    ) : (
                      <ArrowUpRight
                        size={20}
                        strokeWidth={2.5}
                        className="shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                      />
                    )}
                  </button>

                  <p className="text-xs text-foreground/60 md:max-w-[160px] leading-relaxed font-serif italic">
                    We reply within a day. No templates.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── RIGHT: direct channels + location ───────────────── */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl md:text-3xl font-serif italic tracking-tight">
              Or reach us directly.
            </h2>

            <ContactLink
              href="mailto:hello@wedesign.club"
              icon={Mail}
              label="Email"
              value="hello@wedesign.club"
            />
            <ContactLink
              href="https://wa.me/212600000000"
              icon={MessageCircle}
              label="WhatsApp"
              value="+212 600-000000"
              external
            />
          </div>

          {/* location card */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground"
            />
            <div className="relative border-2 border-foreground bg-card p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-foreground/70">
                <MapPin size={14} strokeWidth={2.5} />
                <span className="text-xs uppercase tracking-wider">Find us</span>
              </div>
              <p className="text-xl md:text-2xl font-serif leading-snug">
                1337 Coding School

                <span className="italic text-foreground/70">Khouribga, Morocco.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  FIELD WRAPPER                                                     */
/* ══════════════════════════════════════════════════════════════════ */
function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 group/field">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-sm text-foreground/70 group-focus-within/field:text-foreground transition-colors"
        >
          {label}
        </label>
        {hint && !error && (
          <span className="text-xs text-foreground/50 tabular-nums">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <span className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={14} strokeWidth={2.5} className="shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  CONTACT LINK CARD                                                 */
/* ══════════════════════════════════════════════════════════════════ */
function ContactLink({
  href,
  icon: Icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group relative block"
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      />
      <div className="relative border-2 border-foreground bg-card p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-primary/5 transition-colors duration-300">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 border-2 border-foreground flex items-center justify-center bg-card group-hover:bg-foreground group-hover:text-background transition-colors duration-300 shrink-0">
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-foreground/60 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-lg md:text-xl font-serif italic text-foreground truncate">
              {value}
            </span>
          </div>
        </div>
        <ArrowUpRight
          size={18}
          className="text-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0"
        />
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SUCCESS CARD                                                      */
/* ══════════════════════════════════════════════════════════════════ */
function SuccessCard({ onReset }: { onReset: () => void }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
      />
      <div className="relative border-2 border-foreground bg-card p-10 md:p-14 flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary border-2 border-foreground flex items-center justify-center">
          <CheckCircle2 size={32} strokeWidth={2.5} className="text-foreground" />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight leading-none">
          Message received.
        </h2>
        <p className="text-base md:text-lg text-foreground/70 font-serif leading-relaxed max-w-sm">
          Thanks — a human reads every message. Expect a reply by email within a day.
        </p>
        <button
          onClick={onReset}
          className="mt-2 border-2 border-foreground/30 px-5 py-2.5 hover:border-foreground transition-colors text-sm font-semibold"
        >
          Send another
        </button>
      </div>
    </div>
  );
}