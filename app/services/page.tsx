import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Monitor,
  Layout,
  Smartphone,
  Palette,
} from "lucide-react";

const SERVICES = [
  {
    id: "01",
    slug: "web-design",
    title: "Interface Design",
    tagline: "Pixels with a point of view.",
    description:
      "High-fidelity interfaces built on clear hierarchy, motion that tells a story, and brutalist typography that earns its weight.",
    icon: Layout,
    deliverables: [
      "Design system",
      "Interactive prototype",
      "Component library",
    ],
  },
  {
    id: "02",
    slug: "web-dev",
    title: "Web Applications",
    tagline: "Fast, typed, and tested.",
    description:
      "Production-grade web apps in Next.js, TypeScript, and Postgres. Clean code, real deployments, no framework-of-the-week chaos.",
    icon: Monitor,
    deliverables: [
      "Full-stack Next.js app",
      "Database + auth",
      "Deployed to production",
    ],
  },
  {
    id: "03",
    slug: "mobile",
    title: "Mobile Apps",
    tagline: "For the palm of your hand.",
    description:
      "Cross-platform apps that feel native on iOS and Android. Built once in React Native, shipped to both stores with one codebase.",
    icon: Smartphone,
    deliverables: [
      "iOS + Android build",
      "Store submission",
      "Offline-first state",
    ],
  },
  {
    id: "04",
    slug: "graphic",
    title: "Graphic Design",
    tagline: "Off-screen identity.",
    description:
      "Brand systems, typography, and print-adjacent work for zines, posters, and the occasional t-shirt nobody asked for.",
    icon: Palette,
    deliverables: ["Brand identity", "Print collateral", "Social templates"],
  },
];

const NOT_US = [
  "Crypto launchpads",
  "SEO spam farms",
  "WordPress rescue missions",
  "Corporate intranets",
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col pt-10 md:pt-28 pb-20">
      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-16 md:mb-24">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[1.05] text-foreground">
            What we do.
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/70 font-serif leading-relaxed max-w-2xl">
            Four things we do well, one way we do them — together, in the open,
            with crits every Friday. No agencies, no account managers, no
            decks.
          </p>
        </div>
      </section>

      {/* ═══ SERVICES GRID ═══════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* ═══ NOT-US STRIP ════════════════════════════════════════ */}
      {/* <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-20 md:mt-28">
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12 border-t-2 border-foreground pt-8">
          <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight leading-[1] shrink-0">
            What we <span className="text-accent">don't</span>.
          </h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg md:text-xl text-foreground/60 font-serif">
            {NOT_US.map((item, i) => (
              <li key={item} className="flex items-center gap-6">
                {i > 0 && (
                  <span className="hidden md:inline text-foreground/30">·</span>
                )}
                <span className="line-through decoration-accent decoration-2 underline-offset-2">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section> */}

      {/* ═══ CTA ══════════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-20 md:mt-28">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground"
          />
          <div className="relative border-2 border-foreground bg-card p-10 md:p-20 flex flex-col items-center text-center gap-7 overflow-hidden">
            {/* halftone dots texture */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(var(--color-foreground) 1.5px, transparent 1.5px)",
                backgroundSize: "12px 12px",
              }}
            />

            <span className="relative z-10 text-sm text-foreground/60 font-serif italic">
              Ready when you are.
            </span>

            <h2 className="relative z-10 text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1]">
              Got something that{" "}
              <span className="italic text-accent">has to exist</span>?
            </h2>

            <p className="relative z-10 text-base md:text-lg text-foreground/70 font-serif leading-relaxed max-w-xl">
              Tell us what it is. We'll tell you if we're the right crew for it.
              Usually within a week.
            </p>

            <Link
              href="/contact"
              className="group relative z-10 mt-2 inline-flex items-center gap-3 bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors px-7 py-4 text-sm md:text-base font-semibold border-2 border-foreground"
            >
              Start a conversation
              <ArrowUpRight
                size={18}
                strokeWidth={2.5}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SERVICE CARD                                                      */
/* ══════════════════════════════════════════════════════════════════ */
function ServiceCard({
  service,
}: {
  service: (typeof SERVICES)[number];
}) {
  const Icon = service.icon;

  return (
    <Link
      href={`/contact?service=${service.slug}`}
      className="group relative block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 "
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-primary group-hover:bg-primary transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      />
      <article className="relative h-full border-2 border-foreground bg-card p-8 md:p-10 flex flex-col gap-8 hover:bg-primary/5 transition-colors duration-300">
        {/* top row: number + icon */}
        <div className="flex justify-between items-start">
          <span className="text-sm text-foreground/50 tabular-nums font-serif italic">
            No. {service.id}
          </span>
          <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-card group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
            <Icon size={20} strokeWidth={2} />
          </div>
        </div>

        {/* title + tagline */}
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl md:text-4xl font-serif tracking-tight leading-[1.05] text-foreground">
            {service.title}
          </h3>
          <span className="text-base md:text-lg font-serif italic text-accent ">
            {service.tagline}
          </span>
        </div>

        {/* description */}
        <p className="text-foreground/70 font-serif leading-relaxed max-w-md">
          {service.description}
        </p>

        {/* deliverables — "what you get" */}
        <div className="flex flex-col gap-2 mt-auto">
          <span className="text-xs text-foreground/50 font-serif italic">
            You get:
          </span>
          <ul className="flex flex-col gap-1.5">
            {service.deliverables.map((d) => (
              <li
                key={d}
                className="flex items-center gap-2 text-sm text-foreground/80"
              >
                <span className="text-accent shrink-0">✷</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* footer strip */}
        <div className="flex items-center justify-between pt-6 border-t border-foreground/15">
          <span className="text-sm text-foreground font-semibold group-hover:mr-1 transition-[margin] duration-200">
            Tell us about it
          </span>
          <div className="w-8 h-8 border border-foreground/30 flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors duration-200">
            <ArrowUpRight
              size={14}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}