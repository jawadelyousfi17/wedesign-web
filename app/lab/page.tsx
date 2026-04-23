import React from "react";
import { EXPERIMENTS } from "@/lib/lab-registry";
import Link from "next/link";
import { ArrowUpRight, Beaker } from "lucide-react";

export default function LabPage() {
  return (
    <div className="flex flex-col pt-3 md:pt-28 pb-20 overflow-hidden">
      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-14 md:mb-20">
        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="flex items-center gap-3 text-accent font-mono text-xs uppercase tracking-[0.4em]">
             <Beaker size={14} />
             <span>Experimental Environment</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight leading-[0.95]">
            The{" "}
            <span className="italic relative inline-block">
              Lab
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 md:bottom-2 h-2 md:h-3 bg-primary -z-10 -skew-x-6"
              />
            </span>
            .
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/70 font-serif leading-relaxed max-w-2xl">
            A gallery of high-fidelity UI experiments, kinetic typography, and 
            digital brutalism. Click to enter the sandbox.
          </p>
        </div>
      </section>

      {/* ═══ EXPERIMENT GRID ═══════════════════════════════════════ */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-foreground/20">
          {EXPERIMENTS.map((exp) => (
            <Link 
              key={exp.slug} 
              href={`/lab/${exp.slug}`}
              className="group relative p-8 md:p-12 border-r border-b border-foreground/20 hover:bg-[#eaddcf] transition-all duration-500 flex flex-col gap-12 overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                   <span className="font-mono text-[10px] uppercase text-foreground/40">{exp.date}</span>
                   <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border w-fit ${
                      exp.difficulty === 'Beginner' ? 'border-green-500/30 text-green-600' :
                      exp.difficulty === 'Intermediate' ? 'border-orange-500/30 text-orange-600' :
                      'border-red-500/30 text-red-600'
                   }`}>
                      {exp.difficulty}
                   </span>
                </div>
                <div className="w-12 h-12 border border-foreground/10 flex items-center justify-center bg-background group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  {exp.icon}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight text-foreground group-hover:text-black transition-colors leading-tight">
                  {exp.title}
                </h2>
                <p className="text-foreground/60 group-hover:text-black/70 transition-colors font-serif leading-relaxed max-w-md">
                  {exp.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {exp.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest px-2 py-1 border border-foreground/10 font-mono group-hover:border-black/20 group-hover:text-black transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="absolute bottom-6 right-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                 <ArrowUpRight size={24} className="text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER MESSAGE */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-24 text-center">
         <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/30">
            End of stream. More synthesizing...
         </p>
      </section>
    </div>
  );
}
