"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, MousePointer2, Type } from "lucide-react";

export default function GravityTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [input, setQuery] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Matter.js setup
    const engine = Matter.Engine.create();
    engineRef.current = engine;
    const world = engine.world;
    
    // Renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio
      }
    });

    // Boundaries
    const thickness = 100;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const ground = Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true });
    
    Matter.World.add(world, [ground, leftWall, rightWall]);

    // Mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);

    // Run
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    setIsReady(true);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  const spawnText = (text: string) => {
    if (!engineRef.current || !text.trim()) return;

    const words = text.split(" ");
    const startX = 100;
    
    words.forEach((word, i) => {
      const fontSize = 24;
      // Rough estimate of word width
      const wordWidth = word.length * 15;
      const wordHeight = 35;

      const body = Matter.Bodies.rectangle(
        startX + (i * 60), 
        50, 
        wordWidth, 
        wordHeight, 
        {
          restitution: 0.6,
          friction: 0.1,
          render: {
            visible: false // We will draw manually or via DOM sync
          }
        }
      );

      // Store word data on the body
      (body as any).word = word;
      (body as any).color = i % 2 === 0 ? "#ff4d14" : "#ffffff";

      Matter.World.add(engineRef.current!.world, body);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    spawnText(input);
    setQuery("");
  };

  const clearCanvas = () => {
    if (!engineRef.current) return;
    const world = engineRef.current.world;
    const allBodies = Matter.Composite.allBodies(world);
    const toRemove = allBodies.filter(b => !b.isStatic);
    Matter.World.remove(world, toRemove);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#050505] border-2 border-foreground overflow-hidden flex flex-col">
      {/* Physics Container */}
      <div ref={containerRef} className="absolute inset-0 z-10">
        <canvas ref={canvasRef} className="block w-full h-full" />
        <MatterSync engine={engineRef.current} />
      </div>

      {/* Terminal UI */}
      <div className="relative z-20 p-6 pointer-events-none">
        <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
           <Type size={14} />
           <span>Gravity_System_Loaded</span>
        </div>
        
        <form onSubmit={handleSubmit} className="pointer-events-auto flex items-center gap-4 max-w-xl">
           <span className="text-accent font-mono font-bold">$</span>
           <input 
             type="text"
             value={input}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Type words and hit Enter..."
             className="flex-1 bg-transparent border-b border-foreground/20 py-2 font-mono text-xl text-foreground focus:outline-none focus:border-accent transition-colors"
           />
        </form>
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 z-30 flex gap-2">
         <button 
           onClick={clearCanvas}
           className="p-3 border border-foreground/20 text-foreground/40 hover:bg-red-600 hover:text-white transition-all rounded-none"
           title="Clear Workspace"
         >
           <Trash2 size={18} />
         </button>
      </div>

      <div className="absolute bottom-6 left-6 z-30 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/20 pointer-events-none">
         <span>Interaction: drag & drop objects</span> <br />
         <span>Physics: matter.js v0.19.0</span>
      </div>
    </div>
  );
}

// Internal component to bridge Matter.js state to React/DOM
function MatterSync({ engine }: { engine: Matter.Engine | null }) {
  const [bodies, setBodies] = useState<any[]>([]);

  useEffect(() => {
    if (!engine) return;

    const update = () => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      setBodies(
        allBodies
          .filter(b => !b.isStatic)
          .map(b => ({
            id: b.id,
            x: b.position.x,
            y: b.position.y,
            angle: b.angle,
            word: (b as any).word,
            color: (b as any).color
          }))
      );
      requestAnimationFrame(update);
    };

    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [engine]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bodies.map((b) => (
        <div
          key={b.id}
          className="absolute font-mono font-bold text-xl md:text-2xl px-3 py-1 whitespace-nowrap select-none"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${b.x}px, ${b.y}px) rotate(${b.angle}rad) translate(-50%, -50%)`,
            color: b.color,
            textShadow: b.color === '#ff4d14' ? '0 0 10px rgba(255, 77, 20, 0.3)' : 'none'
          }}
        >
          {b.word}
        </div>
      ))}
    </div>
  );
}
