"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Form } from "@prisma/client";
import { submitForm } from "@/app/admin/forms/actions";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

interface FormClientProps {
  form: Form;
}

type FieldDef = {
  id: string;
  name: string;
  label: string;
  type: "TEXT" | "LONG_TEXT" | "NUMBER" | "DATE" | "SELECT";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  min?: number;
  max?: number;
};

export default function FormClient({ form }: FormClientProps) {
  const fields = form.fields as FieldDef[];

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // autofocus first field on mount
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  // progress calculation — counts completed required fields
  const requiredFields = useMemo(() => fields.filter((f) => f.required), [fields]);
  const completedRequired = useMemo(
    () =>
      requiredFields.filter((f) => {
        const v = formData[f.name];
        return v !== undefined && v !== null && String(v).trim() !== "";
      }).length,
    [requiredFields, formData]
  );
  const progress =
    requiredFields.length === 0 ? 100 : Math.round((completedRequired / requiredFields.length) * 100);

  const validateField = (field: FieldDef, value: any): string => {
    if (field.required) {
      if (value === undefined || value === null || String(value).trim() === "") {
        return "This field is required.";
      }
    }
    if (field.type === "NUMBER" && value !== "" && value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) return "Must be a valid number.";
      if (field.min !== undefined && num < field.min) return `Must be at least ${field.min}.`;
      if (field.max !== undefined && num > field.max) return `Must be at most ${field.max}.`;
    }
    if (field.maxLength && typeof value === "string" && value.length > field.maxLength) {
      return `Keep it under ${field.maxLength} characters.`;
    }
    return "";
  };

  const handleInputChange = (field: FieldDef, value: any) => {
    setFormData((prev) => ({ ...prev, [field.name]: value }));
    // clear error as user types, only if previously errored
    if (errors[field.name]) {
      const msg = validateField(field, value);
      if (!msg) setErrors((prev) => ({ ...prev, [field.name]: "" }));
    }
  };

  const handleBlur = (field: FieldDef) => {
    setTouched((prev) => ({ ...prev, [field.name]: true }));
    const msg = validateField(field, formData[field.name]);
    setErrors((prev) => ({ ...prev, [field.name]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // validate all
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    fields.forEach((f) => {
      newTouched[f.name] = true;
      const msg = validateField(f, formData[f.name]);
      if (msg) newErrors[f.name] = msg;
    });
    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // scroll to first error
      const firstErrorField = fields.find((f) => newErrors[f.name]);
      if (firstErrorField) {
        const el = document.getElementById(`field-${firstErrorField.name}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el?.querySelector<HTMLElement>("input, textarea, select")?.focus(), 300);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForm(form.id, formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════ */
  /*  SUCCESS STATE                                                 */
  /* ══════════════════════════════════════════════════════════════ */
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* offset ink block */}
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <div className="relative bg-card border-2 border-foreground p-10 flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 bg-primary border-2 border-foreground flex items-center justify-center">
                <CheckCircle2 size={32} strokeWidth={2.5} className="text-foreground" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Submission · Received
                </span>
                <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight leading-none">
                  Data logged.
                </h2>
              </div>

              <p className="text-sm text-foreground/70 leading-relaxed max-w-sm">
                Thanks — your response came through. You'll hear back by email if a reply is needed.
              </p>

              <div className="w-full flex flex-col gap-3 mt-4">
                <Link
                  href="/"
                  className="border-2 border-foreground bg-foreground text-background px-6 py-4 hover:bg-primary hover:text-foreground transition-colors uppercase text-xs tracking-[0.2em] font-bold font-mono w-full text-center"
                >
                  Return home
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({});
                    setErrors({});
                    setTouched({});
                  }}
                  className="border-2 border-foreground/30 px-6 py-3 hover:border-foreground transition-colors uppercase text-[10px] tracking-[0.2em] font-bold font-mono w-full text-foreground/70 hover:text-foreground"
                >
                  Submit another response
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════ */
  /*  FORM                                                          */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-12 md:py-20 flex flex-col gap-12">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex flex-col gap-5 border-b-2 border-foreground pb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Active Protocol · {form.slug}
          </span>

          {requiredFields.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
              {completedRequired} / {requiredFields.length} required
            </span>
          )}
        </div>

        <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[0.95] text-foreground">
          {form.title}
        </h1>

        {form.description && (
          <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed">
            {form.description}
          </p>
        )}

        {/* progress bar */}
        {requiredFields.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1 bg-foreground/10 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 tabular-nums">
              {progress}%
            </span>
          </div>
        )}
      </header>

      {/* ── SUBMIT-LEVEL ERROR BANNER ──────────────────────────── */}
      {submitError && (
        <div
          ref={errorRef}
          role="alert"
          className="border-2 border-destructive bg-destructive/10 p-4 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-destructive font-bold">
              Submission failed
            </span>
            <span className="text-sm text-foreground">{submitError}</span>
          </div>
        </div>
      )}

      {/* ── FORM ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
        <div className="flex flex-col border-2 border-foreground">
          {fields.map((field, idx) => {
            const value = formData[field.name] ?? "";
            const error = touched[field.name] ? errors[field.name] : "";
            const isLast = idx === fields.length - 1;

            return (
              <FieldRow
                key={field.id}
                field={field}
                index={idx + 1}
                total={fields.length}
                value={value}
                error={error}
                isLast={isLast}
                onChange={(v) => handleInputChange(field, v)}
                onBlur={() => handleBlur(field)}
                inputRef={idx === 0 ? (firstFieldRef as any) : undefined}
              />
            );
          })}
        </div>

        {/* ── SUBMIT ROW ───────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex-1 border-2 border-foreground bg-foreground text-background px-8 py-5 flex items-center justify-between gap-4 hover:bg-primary hover:text-foreground transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:text-background"
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
                {isSubmitting ? "Processing" : "Ready when you are"}
              </span>
              <span className="text-xl font-serif italic tracking-tight">
                {isSubmitting ? "Submitting…" : "Submit response"}
              </span>
            </span>
            {isSubmitting ? (
              <Loader2 className="animate-spin flex-shrink-0" size={22} />
            ) : (
              <ArrowRight
                size={22}
                strokeWidth={2.5}
                className="flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200"
              />
            )}
          </button>

          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-center md:text-right md:max-w-[140px]">
            Your data stays private. You'll get a confirmation email.
          </div>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  FIELD ROW                                                         */
/* ══════════════════════════════════════════════════════════════════ */
interface FieldRowProps {
  field: FieldDef;
  index: number;
  total: number;
  value: any;
  error: string;
  isLast: boolean;
  onChange: (v: any) => void;
  onBlur: () => void;
  inputRef?: React.Ref<any>;
}

function FieldRow({
  field,
  index,
  total,
  value,
  error,
  isLast,
  onChange,
  onBlur,
  inputRef,
}: FieldRowProps) {
  const id = `field-${field.name}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const baseInput =
    "w-full bg-transparent focus:outline-none placeholder:text-foreground/30";
  const commonProps = {
    id,
    name: field.name,
    required: field.required,
    "aria-invalid": !!error,
    "aria-describedby": [error ? errorId : null, field.helpText ? helpId : null]
      .filter(Boolean)
      .join(" ") || undefined,
    onBlur,
  };

  const charCount =
    field.type === "LONG_TEXT" && typeof value === "string" ? value.length : null;

  return (
    <div
      id={id}
      className={`group/row relative flex flex-col gap-3 p-6 md:p-8 ${
        !isLast ? "border-b-2 border-foreground" : ""
      } focus-within:bg-primary/5 transition-colors`}
    >
      {/* label row */}
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor={id}
          className="font-mono text-[11px] uppercase tracking-[0.25em] font-bold text-foreground flex items-center gap-2"
        >
          <span className="text-foreground/40 tabular-nums">
            {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
          <span>{field.label}</span>
          {field.required ? (
            <span className="text-accent" aria-label="required">
              *
            </span>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/40 px-1.5 py-0.5 border border-foreground/20">
              optional
            </span>
          )}
        </label>

        {charCount !== null && field.maxLength && (
          <span
            className={`font-mono text-[10px] tabular-nums ${
              charCount > field.maxLength * 0.9
                ? "text-accent"
                : "text-foreground/40"
            }`}
          >
            {charCount}/{field.maxLength}
          </span>
        )}
      </div>

      {field.helpText && (
        <p id={helpId} className="text-xs text-foreground/60 -mt-1">
          {field.helpText}
        </p>
      )}

      {/* input */}
      {field.type === "TEXT" && (
        <input
          {...commonProps}
          ref={inputRef}
          type="text"
          value={value}
          maxLength={field.maxLength}
          placeholder={field.placeholder || "Type here…"}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} text-xl md:text-2xl font-serif`}
        />
      )}

      {field.type === "LONG_TEXT" && (
        <textarea
          {...commonProps}
          ref={inputRef as any}
          rows={4}
          value={value}
          maxLength={field.maxLength}
          placeholder={field.placeholder || "Take your time…"}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} text-lg md:text-xl font-serif resize-none leading-relaxed`}
        />
      )}

      {field.type === "NUMBER" && (
        <input
          {...commonProps}
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder || "0"}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} text-xl md:text-2xl font-serif tabular-nums`}
        />
      )}

      {field.type === "DATE" && (
        <input
          {...commonProps}
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} text-base md:text-lg font-mono uppercase tracking-wider`}
        />
      )}

      {field.type === "SELECT" && (
        <div className="relative">
          <select
            {...commonProps}
            ref={inputRef as any}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInput} text-lg md:text-xl font-serif appearance-none cursor-pointer pr-8 ${
              !value ? "text-foreground/40" : ""
            }`}
          >
            <option value="">Select one…</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none"
          />
        </div>
      )}

      {/* inline error */}
      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive font-mono"
        >
          <AlertCircle size={14} strokeWidth={2.5} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* focus indicator strip on the left */}
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 origin-top transition-transform duration-200 group-focus-within/row:scale-y-100"
      />
    </div>
  );
}