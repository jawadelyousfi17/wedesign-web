"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

type FormState = {
  name: string;
  login: string;
  email: string;
  whatsapp: string;
  why: string;
  agreed: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const ApplyForm: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [data, setData] = useState<FormState>({
    name: "",
    login: "",
    email: "",
    whatsapp: "",
    why: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── validation ─────────────────────────────────────────────── */
  const validate = (field: keyof FormState, value: string | boolean): string => {
    switch (field) {
      case "name":
        if (typeof value === "string" && value.trim().length < 2)
          return "Tell us your name.";
        return "";
      case "login":
        if (typeof value === "string") {
          const v = value.trim().toLowerCase();
          if (v.length < 2) return "What's your 1337 login?";
          if (!/^[a-z0-9-]+$/.test(v))
            return "Only lowercase letters, numbers, and dashes.";
        }
        return "";
      case "email":
        if (typeof value === "string") {
          if (!value.trim()) return "We need an email to reach you.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return "That email doesn't look right.";
        }
        return "";
      case "whatsapp":
        if (typeof value === "string") {
          const digits = value.replace(/\D/g, "");
          if (digits.length < 8) return "Include your full number.";
        }
        return "";
      case "why":
        if (typeof value === "string" && value.trim().length < 20)
          return "Tell us a bit more — at least a sentence.";
        if (typeof value === "string" && value.length > 500)
          return "Keep it under 500 characters.";
        return "";
      case "agreed":
        if (!value) return "You need to agree to the manifesto.";
        return "";
      default:
        return "";
    }
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [field]: value }));
    if (errors[field]) {
      const msg = validate(field, value);
      if (!msg) setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const msg = validate(field, data[field]);
    setErrors((e) => ({ ...e, [field]: msg || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // validate everything
    const newErrors: FormErrors = {};
    (Object.keys(data) as (keyof FormState)[]).forEach((k) => {
      const msg = validate(k, data[k]);
      if (msg) newErrors[k] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(
        Object.keys(data).reduce(
          (acc, k) => ({ ...acc, [k]: true }),
          {} as Partial<Record<keyof FormState, boolean>>
        )
      );
      // focus first error
      const firstErrorField = (Object.keys(data) as (keyof FormState)[]).find(
        (k) => newErrors[k]
      );
      if (firstErrorField) {
        document
          .getElementById(`field-${firstErrorField}`)
          ?.querySelector<HTMLElement>("input, textarea")
          ?.focus();
      }
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Please try again.");
    }
  };

  /* ── SUCCESS STATE ──────────────────────────────────────────── */
  if (status === "success") {
    return (
      <section ref={ref} className="relative py-16 md:py-24 px-4 md:px-8" id="apply">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
            />
            <div className="relative border-2 border-foreground bg-card p-10 md:p-14 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 bg-primary border-2 border-foreground flex items-center justify-center">
                <CheckCircle2 size={32} strokeWidth={2.5} className="text-foreground" />
              </div>
              <h2 className="text-5xl md:text-6xl font-serif italic tracking-tight leading-none">
                Application sent.
              </h2>
              <p className="text-base md:text-lg text-foreground/70 max-w-lg font-serif leading-relaxed">
                We read everything — usually within a week. You'll hear from us by
                email, and if it's a fit, we'll invite you to the next crit.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ── FORM ───────────────────────────────────────────────────── */
  return (
    <section ref={ref} className="relative  px-4 md:px-8" id="apply">
      <div className="mmx-auto flex flex-col gap-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] text-foreground">
            Apply to{" "}
            <span className="italic relative inline-block">
              join
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>
          <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed font-serif">
            Five quick questions. We review applications every Sunday and reply by
            the end of the week — no templates, an actual human reads it.
          </p>
        </motion.div>

        {/* form card with offset shadow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
          />

          <form
            onSubmit={handleSubmit}
            noValidate
            className="relative border-2 border-foreground bg-card p-6 md:p-10 flex flex-col gap-8"
          >
            {/* submit error banner */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="alert"
                  className="border-2 border-destructive bg-destructive/10 p-4 flex items-start gap-3"
                >
                  <AlertCircle
                    size={20}
                    className="text-destructive flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-foreground">{submitError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* name */}
            <Field
              id="field-name"
              label="Your name"
              step={1}
              total={5}
              error={touched.name ? errors.name : undefined}
            >
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Jane Doe"
                autoComplete="name"
                className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                aria-invalid={!!errors.name}
              />
            </Field>

            {/* login + whatsapp side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field
                id="field-login"
                label="1337 login"
                step={2}
                total={5}
                error={touched.login ? errors.login : undefined}
              >
                <input
                  id="login"
                  type="text"
                  value={data.login}
                  onChange={(e) =>
                    setField("login", e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                  onBlur={() => handleBlur("login")}
                  placeholder="jdoe"
                  autoComplete="username"
                  className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                  aria-invalid={!!errors.login}
                />
              </Field>

              <Field
                id="field-whatsapp"
                label="WhatsApp"
                step={3}
                total={5}
                hint="+212…"
                error={touched.whatsapp ? errors.whatsapp : undefined}
              >
                <input
                  id="whatsapp"
                  type="tel"
                  value={data.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                  onBlur={() => handleBlur("whatsapp")}
                  placeholder="+212 6 00 00 00 00"
                  autoComplete="tel"
                  inputMode="tel"
                  className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                  aria-invalid={!!errors.whatsapp}
                />
              </Field>
            </div>

            {/* email */}
            <Field
              id="field-email"
              label="Email"
              step={4}
              total={5}
              error={touched.email ? errors.email : undefined}
            >
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="hello@example.com"
                autoComplete="email"
                inputMode="email"
                className="bg-transparent border-b border-foreground/30 py-2 text-2xl md:text-3xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full"
                aria-invalid={!!errors.email}
              />
            </Field>

            {/* why */}
            <Field
              id="field-why"
              label="Why do you want to join?"
              step={5}
              total={5}
              hint={`${data.why.length}/500`}
              error={touched.why ? errors.why : undefined}
            >
              <textarea
                id="why"
                value={data.why}
                onChange={(e) => setField("why", e.target.value.slice(0, 500))}
                onBlur={() => handleBlur("why")}
                placeholder="A sentence or two is enough — what are you working on, what do you want to learn?"
                rows={4}
                className="bg-transparent border-b border-foreground/30 py-2 text-lg md:text-xl font-serif leading-relaxed focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 text-foreground w-full resize-none"
                aria-invalid={!!errors.why}
              />
            </Field>

            {/* manifesto agreement */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={data.agreed}
                  onChange={(e) => {
                    setField("agreed", e.target.checked);
                    setTouched((t) => ({ ...t, agreed: true }));
                  }}
                  className="sr-only peer"
                />
                <span
                  className={`w-5 h-5 border-2 border-foreground flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    data.agreed ? "bg-foreground" : "bg-transparent"
                  }`}
                  aria-hidden
                >
                  {data.agreed && (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-background"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="square"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-foreground/75 leading-relaxed">
                  I've read the{" "}
                  <Link
                    href="/manifesto"
                    className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
                  >
                    manifesto
                  </Link>{" "}
                  and I'm in.
                </span>
              </label>
              {touched.agreed && errors.agreed && (
                <span className="text-sm text-destructive flex items-center gap-2 ml-8">
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {errors.agreed}
                </span>
              )}
            </div>

            {/* submit */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-foreground/15">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group relative flex-1 border-2 border-foreground bg-foreground text-background px-6 py-4 md:py-5 flex items-center justify-between gap-4 hover:bg-primary hover:text-foreground transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:text-background"
              >
                <span className="text-lg md:text-xl font-serif italic tracking-tight">
                  {status === "sending" ? "Sending…" : "Send application"}
                </span>
                {status === "sending" ? (
                  <Loader2 className="animate-spin shrink-0" size={20} />
                ) : (
                  <ArrowRight
                    size={20}
                    strokeWidth={2.5}
                    className="shrink-0 group-hover:translate-x-1 transition-transform duration-200"
                  />
                )}
              </button>

              <p className="text-xs text-foreground/60 md:max-w-[180px] leading-relaxed font-serif italic">
                Reply by end of the week. No templates.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
/*  FIELD WRAPPER                                                     */
/* ══════════════════════════════════════════════════════════════════ */
function Field({
  id,
  label,
  step,
  total,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  step: number;
  total: number;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="flex flex-col gap-2 group/field">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id.replace("field-", "")}
          className="text-sm text-foreground/70 flex items-center gap-2 group-focus-within/field:text-foreground transition-colors"
        >
          <span className="text-foreground/40 tabular-nums text-xs">
            {String(step).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
          <span>{label}</span>
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

export default ApplyForm;