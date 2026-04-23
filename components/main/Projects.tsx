"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Project, TeamMember } from '@prisma/client';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiTypescript,
  SiPrisma,
  SiNodedotjs,
  SiPostgresql,
} from "react-icons/si";

interface ProjectWithAuthors extends Project {
  authors: TeamMember[];
}

interface ProjectsProps {
  projects: ProjectWithAuthors[];
  showViewAll?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

/* ── tech icons — all inherit theme color, no brand colors ──────── */
const getTagIcon = (tag: string) => {
  const t = tag.toLowerCase();
  const props = { className: "shrink-0", size: 11 } as const;
  if (t.includes("next")) return <SiNextdotjs {...props} />;
  if (t.includes("react")) return <SiReact {...props} />;
  if (t.includes("tailwind")) return <SiTailwindcss {...props} />;
  if (t.includes("framer") || t.includes("motion")) return <SiFramer {...props} />;
  if (t.includes("typescript") || t.includes(" ts")) return <SiTypescript {...props} />;
  if (t.includes("prisma")) return <SiPrisma {...props} />;
  if (t.includes("node")) return <SiNodedotjs {...props} />;
  if (t.includes("postgres")) return <SiPostgresql {...props} />;
  return null;
};

/* ══════════════════════════════════════════════════════════════════ */
/*  FEATURED PROJECT — single hero card, full width                   */
/* ══════════════════════════════════════════════════════════════════ */
function FeaturedProject({
  project,
  inView,
}: {
  project: ProjectWithAuthors;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="relative group"
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:translate-y-1"
      />
      <article className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] border-2 border-foreground bg-card overflow-hidden">
        {/* image side */}
        <ProjectImage project={project} aspect="aspect-[16/10] lg:aspect-auto" />

        {/* content side */}
        <div className="flex flex-col gap-5 p-6 md:p-10">
          <span className="self-start text-xs font-semibold px-2.5 py-1 bg-primary text-primary-foreground">
            Featured
          </span>

          <h3 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05] text-foreground">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed font-serif line-clamp-4">
              {project.description}
            </p>
          )}

          {project.authors?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-foreground/60 font-serif italic">
              <span>by</span>
              <span className="text-foreground not-italic font-semibold">
                {project.authors.map((a) => a.name).join(", ")}
              </span>
            </div>
          )}

          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-1 border border-foreground/30 text-foreground/80"
                >
                  {getTagIcon(tag)}
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-auto pt-6 border-t border-foreground/15">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="group/btn inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors px-5 py-3 text-sm font-semibold"
              >
                <ExternalLink size={14} strokeWidth={2.5} />
                Visit live
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.5}
                  className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                />
              </Link>
            )}
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-2 border-foreground bg-card hover:bg-primary transition-colors px-5 py-3 text-sm font-semibold"
              >
                <ArrowUpRight size={14} strokeWidth={2.5} />
                Source
              </Link>
            )}
          </div>
        </div>
      </article>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  STANDARD CARD                                                     */
/* ══════════════════════════════════════════════════════════════════ */
function ProjectCard({
  project,
  index,
}: {
  project: ProjectWithAuthors;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease }}
      className="relative group h-full"
    >
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      />
      <article className="relative flex flex-col h-full border-2 border-foreground bg-card overflow-hidden hover:bg-primary/5 transition-colors duration-300">
        <ProjectImage project={project} aspect="aspect-[4/3]" />

        <div className="flex flex-col gap-3 p-5 md:p-6 flex-1">
          <h3 className="text-xl md:text-2xl font-serif tracking-tight leading-tight text-foreground line-clamp-2">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-sm text-foreground/65 font-serif leading-relaxed line-clamp-2">
              {project.description}
            </p>
          )}

          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 border border-foreground/30 text-foreground/75"
                >
                  {getTagIcon(tag)}
                  {tag}
                </span>
              ))}
              {project.tags.length > 4 && (
                <span className="text-[11px] text-foreground/50 self-center">
                  +{project.tags.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-foreground/15">
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              {project.demoUrl && (
                <Link
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  aria-label="Visit live site"
                >
                  <ExternalLink size={12} strokeWidth={2.5} />
                  <span>Live</span>
                </Link>
              )}
              {project.githubUrl && (
                <>
                  {project.demoUrl && (
                    <span className="w-1 h-1 rounded-full bg-foreground/30" />
                  )}
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    aria-label="View source"
                  >
                    {/* <Github size={12} strokeWidth={2.5} /> */}
                    <span>Source</span>
                  </Link>
                </>
              )}
            </div>

            <div className="w-8 h-8 border border-foreground/30 flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors duration-200">
              <ArrowUpRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  IMAGE — shared by both featured & standard                        */
/* ══════════════════════════════════════════════════════════════════ */
function ProjectImage({
  project,
  aspect,
}: {
  project: ProjectWithAuthors;
  aspect: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-foreground/5 border-b-2 border-foreground ${aspect}`}
    >
      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary overflow-hidden">
          {/* halftone dots texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-foreground) 1.5px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }}
          />
          <span className="relative font-serif italic font-bold text-foreground text-7xl md:text-8xl select-none -rotate-6">
            {project.title.substring(0, 2).toLowerCase()}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PROJECTS SECTION                                                  */
/* ══════════════════════════════════════════════════════════════════ */
const Projects: React.FC<ProjectsProps> = ({ projects, showViewAll = false }) => {
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  if (projects.length === 0) return null;

  // split: first featured (or first project) is the hero, rest are in the grid
  const featured = projects.find((p) => p.isFeatured) ?? projects[0];
  const rest = projects.filter((p) => p.id !== featured.id);

  return (
    <section
      ref={containerRef}
      className="relative py-8 px-4 md:px-8"
      id="projects"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] text-foreground">
            What we've{" "}
            <span className="italic relative inline-block">
              shipped
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h2>

          {showViewAll && (
             <Link 
               href="/projects" 
               className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-widest hover:text-accent hover:border-accent transition-all duration-300"
             >
                View all projects
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
             </Link>
          )}
        </div>

        {/* featured hero */}
        <FeaturedProject project={featured} inView={inView} />

        {/* grid of the rest */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rest.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;