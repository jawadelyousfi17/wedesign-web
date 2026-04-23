import React from "react";
import { Zap, Beaker, Type, Move, Wind, Terminal, Camera } from "lucide-react";

export interface Experiment {
  slug: string;
  title: string;
  description: string;
  date: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: React.ReactNode;
  tags: string[];
}

export const EXPERIMENTS: Experiment[] = [
  {
    slug: "ascii-camera",
    title: "Real-time ASCII Camera",
    description: "A live video feed filtered through a terminal lens. Converts brightness to ASCII characters in real-time.",
    date: "2026-04-26",
    difficulty: "Intermediate",
    icon: <Camera className="w-5 h-5" />,
    tags: ["MediaDevices", "Canvas", "Math"],
  },
  {
    slug: "ascii-donut",
    title: "ASCII Spinning Donut",
    description: "The classic donut.c spinning torus rendered entirely in ASCII characters.",
    date: "2026-04-25",
    difficulty: "Beginner",
    icon: <Terminal className="w-5 h-5" />,
    tags: ["Math", "ASCII", "React"],
  },
  {
    slug: "kinetic-glyphs",
    title: "Kinetic Glyph Distortion",
    description: "A responsive grid of characters that react to mouse movement in 3D space.",
    date: "2026-04-23",
    difficulty: "Intermediate",
    icon: <Move className="w-5 h-5" />,
    tags: ["Framer Motion", "3D", "Interactive"],
  },
  {
    slug: "glyph-3d",
    title: "Magnetic 3D Glyphs",
    description: "A high-performance WebGL field of 3D typography that reacts to your cursor with magnetic force.",
    date: "2026-04-24",
    difficulty: "Advanced",
    icon: <Type className="w-5 h-5" />,
    tags: ["Three.js", "WebGL", "Shaders"],
  },
  {
    slug: "halftone-shifty",
    title: "Dynamic Halftone Pulse",
    description: "Coming soon: An experiment in shader-like textures and procedural patterns.",
    date: "2026-05-12",
    difficulty: "Advanced",
    icon: <Zap className="w-5 h-5" />,
    tags: ["Shaders", "Canvas", "Math"],
  }
];
