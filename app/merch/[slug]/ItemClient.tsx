"use client";

import React, { useEffect, useState } from "react";
import { MerchItem } from "@prisma/client";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { placeMerchOrder } from "../actions";

type Errors = Partial<Record<"name" | "phone" | "address", string>>;

export default function ItemClient({ item }: { item: MerchItem }) {
  /* ── parse colors "Label:#hex" ──────────────────────────────── */
  const parsedColors = item.colors.map((c) => {
    const [label, hex] = c.split(":");
    return { label: label.trim(), hex: hex?.trim() || "#ccc" };
  });

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(item.sizes[0] || "");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /* ── form state ────────────────────────────────────────────── */
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof form, boolean>>>({});

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* when color changes, jump to its corresponding image if one exists */
  useEffect(() => {
    if (item.images[selectedColorIndex]) {
      setActiveImageIndex(selectedColorIndex);
    }
  }, [selectedColorIndex, item.images]);

  /* ── validation ───────────────────────────────────────────── */
  const validate = (field: keyof typeof form, value: string): string => {
    if (field === "name" && value.trim().length < 2) return "Tell us your name.";
    if (field === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 8) return "Include your full number.";
    }
    if (field === "address" && value.trim().length < 6)
      return "Where should we send it?";
    return "";
  };

  const setField = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      const msg = validate(field, value);
      if (!msg) setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validate(field, form[field]) }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: Errors = {};
    (Object.keys(form) as (keyof typeof form)[]).forEach((k) => {
      const msg = validate(k, form[k]);
      if (msg) newErrors[k] = msg;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, phone: true, address: true });
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("itemId", item.id);
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("color", parsedColors[selectedColorIndex]?.label || "");
      formData.append("size", selectedSize);

      const result = await placeMerchOrder(formData);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || "Something went wrong. Try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  const nextImage = () =>
    setActiveImageIndex((p) => (p + 1) % item.images.length);
  const prevImage = () =>
    setActiveImageIndex((p) => (p - 1 + item.images.length) % item.images.length);

  /* ══════════════════════════════════════════════════════════ */
  /*  SUCCESS STATE                                             */
  /* ══════════════════════════════════════════════════════════ */
  if (isSuccess) {
    return (
      <div className="pt-10 md:pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
            />
            <div className="relative border-2 border-foreground bg-card p-10 md:p-14 flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 bg-primary border-2 border-foreground flex items-center justify-center">
                <CheckCircle2 size={32} strokeWidth={2.5} className="text-foreground" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight leading-none">
                Order placed.
              </h2>
              <p className="text-base md:text-lg text-foreground/70 font-serif leading-relaxed max-w-sm">
                We've got your request for <strong className="font-semibold not-italic">{item.title}</strong>.
                Someone from the crew will call you within a day to confirm delivery.
              </p>
              <Link
                href="/merch"
                className="mt-2 border-2 border-foreground bg-foreground text-background px-6 py-3 hover:bg-primary hover:text-foreground transition-colors text-sm font-semibold"
              >
                Back to the gear
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════ */
  /*  MAIN                                                      */
  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col pt-10 md:pt-28 pb-20">
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-10">
        <Link
          href="/merch"
          className="group inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span>Back to club gear</span>
        </Link>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* ═══ LEFT: GALLERY ═════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          <div className="relative group">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
            />
            <div className="relative aspect-[4/5] border-2 border-foreground overflow-hidden bg-foreground/5">
              {item.images[activeImageIndex] ? (
                <Image
                  src={item.images[activeImageIndex]}
                  alt={`${item.title} – view ${activeImageIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-serif italic text-foreground/30 text-4xl">
                  No image
                </div>
              )}

              {/* nav arrows */}
              {item.images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={prevImage}
                    className="w-10 h-10 bg-card border-2 border-foreground flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="w-10 h-10 bg-card border-2 border-foreground flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* image counter */}
              {item.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-foreground text-background px-2.5 py-1 text-xs tabular-nums">
                  {activeImageIndex + 1} / {item.images.length}
                </div>
              )}
            </div>
          </div>

          {/* thumbnails */}
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {item.images.map((img, idx) => {
                const active = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={active}
                    className={`relative aspect-square border-2 overflow-hidden transition-all ${
                      active
                        ? "border-foreground"
                        : "border-foreground/20 hover:border-foreground/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="120px"
                      unoptimized
                      className="object-cover"
                    />
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-0 ring-2 ring-inset ring-accent pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: INFO + FORM ════════════════════════════════ */}
        <div className="flex flex-col gap-10">
          {/* product header */}
          <div className="flex flex-col gap-3">
            {item.category && (
              <span className="self-start text-xs text-foreground/60 border border-foreground/30 px-2 py-0.5">
                {item.category}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl font-serif tracking-tight leading-[1] text-foreground">
              {item.title}
            </h1>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl md:text-4xl font-serif font-semibold tabular-nums">
                {item.price}
              </span>
              <span className="text-lg text-foreground/60 font-serif italic">
                MAD
              </span>
            </div>
            {item.description && (
              <p className="text-foreground/70 font-serif leading-relaxed max-w-md mt-3">
                {item.description}
              </p>
            )}
          </div>

          {/* form wrapped in offset-shadow card */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground"
            />
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative border-2 border-foreground bg-card p-6 md:p-8 flex flex-col gap-8"
            >
              {/* COLORS */}
              {parsedColors.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-foreground/70">Color</span>
                    <span className="text-sm font-semibold text-foreground">
                      {parsedColors[selectedColorIndex].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {parsedColors.map((color, idx) => {
                      const active = selectedColorIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          aria-label={color.label}
                          aria-pressed={active}
                          title={color.label}
                          className="relative group/color"
                        >
                          <div
                            className={`w-11 h-11 border-2 transition-all flex items-center justify-center ${
                              active
                                ? "border-foreground scale-105"
                                : "border-foreground/30 group-hover/color:border-foreground/70"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {active && (
                              <Check
                                size={16}
                                strokeWidth={3}
                                /* mix-blend-difference gives contrast against any bg */
                                className="text-background mix-blend-difference"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZES */}
              {item.sizes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-foreground/70">Size</span>
                    <span className="text-sm font-semibold text-foreground">
                      {selectedSize || "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size) => {
                      const active = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          aria-pressed={active}
                          className={`min-w-[52px] h-11 px-4 flex items-center justify-center border-2 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-foreground text-background border-foreground"
                              : "border-foreground/30 text-foreground/70 hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DELIVERY DETAILS */}
              <div className="flex flex-col gap-6 pt-6 border-t-2 border-foreground/15">
                <h3 className="text-lg font-serif italic tracking-tight">
                  Delivery details.
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Name"
                    error={touched.name ? errors.name : undefined}
                  >
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Jawad El…"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      className="bg-transparent border-b border-foreground/30 py-2 font-serif text-lg md:text-xl focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 w-full"
                    />
                  </Field>

                  <Field
                    label="Phone"
                    error={touched.phone ? errors.phone : undefined}
                  >
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+212 6…"
                      autoComplete="tel"
                      inputMode="tel"
                      aria-invalid={!!errors.phone}
                      className="bg-transparent border-b border-foreground/30 py-2 font-serif text-lg md:text-xl tabular-nums focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 w-full"
                    />
                  </Field>
                </div>

                <Field
                  label="Address"
                  error={touched.address ? errors.address : undefined}
                >
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    placeholder="UM6P Campus, Block X, Room …"
                    autoComplete="street-address"
                    aria-invalid={!!errors.address}
                    className="bg-transparent border-b border-foreground/30 py-2 font-serif text-lg md:text-xl focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/25 w-full"
                  />
                </Field>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="border-2 border-destructive bg-destructive/10 p-3 flex items-start gap-2"
                >
                  <AlertCircle
                    size={16}
                    className="text-destructive flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-foreground">{submitError}</span>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isPending}
                className="group border-2 border-foreground bg-foreground text-background px-6 py-5 flex items-center justify-between gap-4 hover:bg-primary hover:text-foreground transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:text-background"
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-xs opacity-60 font-serif italic">
                    {isPending ? "Placing your order" : "Ready when you are"}
                  </span>
                  <span className="text-lg md:text-xl font-serif italic tracking-tight">
                    {isPending
                      ? "Sending…"
                      : `Place order · ${item.price} MAD`}
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

              {/* inline shipping note */}
              <p className="text-xs text-foreground/60 font-serif italic leading-relaxed">
                Free delivery on UM6P campus. Off-campus delivery arranged by
                phone — small fee may apply.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  FIELD WRAPPER                                                     */
/* ══════════════════════════════════════════════════════════════════ */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 group/field">
      <span className="text-sm text-foreground/70 group-focus-within/field:text-foreground transition-colors">
        {label}
      </span>
      {children}
      {error && (
        <span className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={13} strokeWidth={2.5} className="shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}