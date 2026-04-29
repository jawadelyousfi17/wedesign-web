import React from "react";
import { notFound } from "next/navigation";
import { EXPERIMENTS } from "@/lib/lab-registry";
import KineticGlyphs from "@/components/lab/KineticGlyphs";
import Glyph3D from "@/components/lab/glyph3d";
import AsciiDonut from "@/components/lab/AsciiDonut";
import AsciiCamera from "@/components/lab/AsciiCamera";
import GravityTerminal from "@/components/lab/GravityTerminal";
import AnimalVision from "@/components/lab/AnimalVision";
import NeuralInterface from "@/components/lab/NeuralInterface";
import VirtualHandMouse from "@/components/lab/VirtualHandMouse";
import RockPaperScissors from "@/components/lab/RockPaperScissors";
import AsciiVideoConverter from "@/components/lab/AsciiVideoConverter";
import AudioPNGConverter from "@/components/lab/AudioPNGConverter";
import ParticleBlackHole from "@/components/lab/ParticleBlackHole";
import { Beaker, ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exp = EXPERIMENTS.find(e => e.slug === slug);
  if (!exp) return { title: "Experiment Not Found" };
  return { title: `${exp.title} | The Lab` };
}

export default async function ExperimentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experiment = EXPERIMENTS.find((e) => e.slug === slug);

  if (!experiment) notFound();

  // Map slugs to components
  const renderExperiment = () => {
    switch (slug) {
      case "particle-black-hole":
        return <ParticleBlackHole />;
      case "audio-png-converter":
        return <AudioPNGConverter />;
      case "video-ascii-converter":
        return <AsciiVideoConverter />;
      case "rock-paper-scissors":
        return <RockPaperScissors />;
      case "virtual-hand-mouse":
        return <VirtualHandMouse />;
      case "neural-interface":
        return <NeuralInterface />;
      case "animal-vision":
        return <AnimalVision />;
      case "gravity-terminal":
        return <GravityTerminal />;
      case "ascii-camera":
        return <AsciiCamera />;
      case "ascii-donut":
        return <AsciiDonut />;
      case "kinetic-glyphs":
        return <KineticGlyphs />;
      case "glyph-3d":
        return <Glyph3D height="100%" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 py-40">
             <Beaker size={64} strokeWidth={1} />
             <span className="font-mono uppercase tracking-[0.4em]">Synthesis in progress...</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-3 md:pt-28 pb-20 overflow-hidden">
      {/* Header */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col gap-6">
          <Link href="/lab" className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Lab
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
               <span className="text-accent font-mono text-[10px] uppercase tracking-[0.4em]">{experiment.difficulty} Experiment</span>
               <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-none">{experiment.title}</h1>
            </div>
            <div className="flex flex-col md:items-end gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
               <div className="flex items-center gap-2"><Calendar size={12} /> {experiment.date}</div>
               <div className="flex items-center gap-2"><Tag size={12} /> {experiment.tags.join(", ")}</div>
            </div>
          </div>
          
          <p className="text-lg text-foreground/60 font-serif leading-relaxed max-w-2xl">
            {experiment.description}
          </p>
        </div>
      </section>

      {/* Canvas */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="relative w-full h-[70vh] min-h-[500px]">
          {renderExperiment()}
        </div>
      </section>

      {/* Footer Info */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-12 border-t border-foreground/10 pt-8">
         <div className="flex flex-col md:flex-row justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/30">
            <span>Runtime: Vercel Edge</span>
            <span>Auth: Jawad / WeDesign</span>
            <span>Status: 200 OK</span>
         </div>
      </section>
    </div>
  );
}
