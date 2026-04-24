import React from "react";
import { Zap, Beaker, Type, Move, Wind, Terminal, Camera, ScanFace, MousePointer2, Video } from "lucide-react";

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
    slug: "gravity-terminal",
    title: "Gravity Terminal",
    description: "A physics-defying command line where words become physical objects you can grab and throw.",
    date: "2026-04-27",
    difficulty: "Advanced",
    icon: <Type className="w-5 h-5" />,
    tags: ["Matter.js", "Physics", "Interactive"],
  },
  {
    slug: "animal-vision",
    title: "How Animals See",
    description: "Experience the world through the eyes of different species using real-time camera filters.",
    date: "2026-04-28",
    difficulty: "Intermediate",
    icon: <Camera className="w-5 h-5" />,
    tags: ["Computer Vision", "Canvas", "Biology"],
    },
    {
    slug: "neural-interface",
    title: "Holistic Neural Interface",
    description: "Advanced biometric tracking. Real-time mapping of face, hands, and skeletal pose in a digital brutalist environment.",
    date: "2026-04-29",
    difficulty: "Advanced",
    icon: <ScanFace className="w-5 h-5" />,
    tags: ["MediaPipe", "Holistic", "Biometrics"],
    },
    {
    slug: "virtual-hand-mouse",
    title: "Virtual Hand Mouse",
    description: "Control the interface with your hand. Point to move, pinch to click, and use a peace sign to scroll.",
    date: "2026-04-30",
    difficulty: "Advanced",
    icon: <MousePointer2 className="w-5 h-5" />,
    tags: ["Gesture Control", "Neural", "UX"],
    },
    {
    slug: "video-ascii-converter",
    title: "Video ASCII Converter",
    description: "Neural frame-by-frame ASCII conversion. Process video files into text animations, export them as .wd files, and play them back in real-time.",
    date: "2026-05-02",
    difficulty: "Advanced",
    icon: <Video className="w-5 h-5" />,
    tags: ["Canvas", "ASCII", "Binary Export"],
    },
    {
    slug: "rock-paper-scissors",
    title: "Rock Paper Scissors ML",
    description: "Battle the AI in a high-stakes duel. Use your actual hand to play Rock, Paper, or Scissors via real-time computer vision.",
    date: "2026-05-01",
    difficulty: "Intermediate",
    icon: <ScanFace className="w-5 h-5" />,
    tags: ["Computer Vision", "Gaming", "MediaPipe"],
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
