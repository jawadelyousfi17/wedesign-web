"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, RefreshCcw, Info } from "lucide-react";

type Animal = "Dog" | "Bee" | "Snake" | "Bat" | "Shark" | "Eagle";

interface AnimalData {
  id: Animal;
  description: string;
  fact: string;
}

const ANIMALS: AnimalData[] = [
  { id: "Dog", description: "Dichromatic (Blue/Yellow)", fact: "Dogs lack red-green color receptors and see the world in shades of blue and yellow." },
  { id: "Bee", description: "UV & Hexagonal", fact: "Bees see ultraviolet light to find nectar. Their eyes have a hexagonal grid structure." },
  { id: "Snake", description: "Infrared / Thermal", fact: "Many snakes have pit organs that detect heat, allowing them to 'see' infrared radiation from prey." },
  { id: "Bat", description: "Echolocation / Edges", fact: "Bats use sound to map their surroundings, seeing primarily edges and movement in the dark." },
  { id: "Shark", description: "High Contrast Murk", fact: "Sharks have excellent contrast sensitivity but are mostly colorblind, seeing clearly in deep blue water." },
  { id: "Eagle", description: "Telephoto / Sharp", fact: "Eagles have massive centers of focus with 4-8 times higher resolution than humans." },
];

export default function AnimalVision() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeAnimal, setActiveAnimal] = useState<Animal>("Dog");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied.");
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx || video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(video, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Filter Logic
    switch (activeAnimal) {
      case "Dog":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          // Simple Dichromatic simulation: Map R/G to Yellow
          const avg = (r + g) / 2;
          data[i] = avg;     // R
          data[i+1] = avg;   // G
          data[i+2] = b;     // B (keep blue)
        }
        break;

      case "Snake":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const brightness = (r + g + b) / 3;
          // Thermal map: Cold (Blue) -> Medium (Green/Yellow) -> Hot (Red)
          if (brightness < 85) {
            data[i] = 0; data[i+1] = 0; data[i+2] = brightness * 3;
          } else if (brightness < 170) {
            data[i] = (brightness - 85) * 3; data[i+1] = 255; data[i+2] = 0;
          } else {
            data[i] = 255; data[i+1] = 255 - (brightness - 170) * 3; data[i+2] = 0;
          }
        }
        break;

      case "Shark":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const gray = (r * 0.3 + g * 0.59 + b * 0.11);
          data[i] = gray * 0.1; // Dark R
          data[i+1] = gray * 0.5; // Murky G
          data[i+2] = gray * 0.8; // Blue-ish B
        }
        break;
        
      case "Bat":
        // Edge detection simulation
        const copy = new Uint8ClampedArray(data);
        for (let i = 0; i < data.length; i += 4) {
          if (i % (w * 4) === 0) continue;
          const current = (copy[i] + copy[i+1] + copy[i+2]) / 3;
          const prev = (copy[i-4] + copy[i-3] + copy[i-2]) / 3;
          const diff = Math.abs(current - prev);
          const edge = diff > 20 ? 255 : 0;
          data[i] = 0; data[i+1] = edge; data[i+2] = 0; // Green sonar lines
        }
        break;
        
      case "Bee":
        // UV shift + Pixelation handled by CSS mostly, but hue shift here
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          data[i] = b; // Swap B and R
          data[i+1] = 0;
          data[i+2] = r;
        }
        break;

      case "Eagle":
        // High saturation + sharpening (handled by CSS overlay)
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    requestRef.current = requestAnimationFrame(processFrame);
  }, [activeAnimal]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [isActive, processFrame]);

  const activeData = ANIMALS.find(a => a.id === activeAnimal)!;

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black border-2 border-foreground overflow-hidden flex flex-col items-center">
      <video ref={videoRef} className="hidden" playsInline muted />
      
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-background/90 backdrop-blur-sm">
           <Camera size={48} className="text-foreground/20" />
           <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground/50">Optic_Relay_Offline</p>
           <button 
             onClick={startCamera}
             className="px-8 py-4 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-accent transition-colors"
           >
             Initialize Feed
           </button>
        </div>
      )}

      {/* Main Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480}
          className={`max-w-full max-h-full object-contain ${
            activeAnimal === 'Bee' ? 'image-pixelated grayscale' : 
            activeAnimal === 'Eagle' ? 'saturate-[2] contrast-[1.2]' : ''
          }`}
          style={{
             filter: activeAnimal === 'Bee' ? 'contrast(1.5) brightness(1.2)' : 'none'
          }}
        />
        
        {/* Overlay Effects */}
        {activeAnimal === "Bee" && (
           <div 
             className="absolute inset-0 pointer-events-none opacity-40" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 5v10l-10 5L0 15V5z' fill='none' stroke='black' stroke-width='0.5'/%3E%3C/svg%3E")`,
               backgroundSize: '15px 15px'
             }}
           />
        )}
        
        {activeAnimal === "Eagle" && (
           <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none rounded-full scale-150 blur-2xl" />
        )}
      </div>

      {/* Interface */}
      <div className="w-full bg-card border-t-2 border-foreground p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between z-20">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-3">
             <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Active_Subject</span>
             <h2 className="font-serif italic text-3xl">{activeAnimal}</h2>
          </div>
          <p className="text-sm text-foreground/60 font-serif leading-relaxed">
            {activeData.fact}
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
           {ANIMALS.map((animal) => (
             <button
               key={animal.id}
               onClick={() => setActiveAnimal(animal.id)}
               className={`flex flex-col items-center justify-center p-3 border transition-all ${
                 activeAnimal === animal.id 
                   ? 'bg-foreground text-background border-foreground shadow-[4px_4px_0_var(--color-accent)] -translate-x-1 -translate-y-1' 
                   : 'border-foreground/10 hover:border-foreground/40 grayscale'
               }`}
             >
               <span className="font-mono text-[10px] uppercase font-bold">{animal.id}</span>
             </button>
           ))}
        </div>
      </div>

      <style jsx global>{`
        .image-pixelated {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}
