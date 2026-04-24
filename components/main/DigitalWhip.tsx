"use client";

import { useEffect, useRef } from "react";

class Node {
  x: number;
  y: number;
  oldX: number;
  oldY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
  }
}

export default function DigitalWhip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isWhipping = useRef(false);
  const whipStartTime = useRef(0);
  const nodes = useRef<Node[]>([]);
  const flashOpacity = useRef(0);
  const crackPos = useRef({ x: 0, y: 0 });

  const NUM_NODES = 32;
  const SEGMENT_LENGTH = 10;
  const GRAVITY = 1.0;
  const FRICTION = 0.92;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Start with nodes at the center
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    nodes.current = Array.from({ length: NUM_NODES }, (_, i) => new Node(startX, startY + i * SEGMENT_LENGTH));

    let rafId = 0;

    const loop = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const n = nodes.current;

      const centerX = w / 2;
      const centerY = h / 2;

      let handleX = centerX;
      let handleY = centerY;

      if (isWhipping.current) {
        const t = time - whipStartTime.current;
        const windup = 200;
        const strike = 100;
        const recoil = 500;

        if (t < windup) {
          // Windup: Move up and slightly right
          const p = t / windup;
          const ease = p * p;
          handleX = centerX + (w * 0.15) * ease;
          handleY = centerY - (h * 0.2) * ease;
        } else if (t < windup + strike) {
          // Strike: Snap down and left
          const p = (t - windup) / strike;
          const ease = 1 - Math.pow(1 - p, 3);
          const startX = centerX + (w * 0.15);
          const startY = centerY - (h * 0.2);
          handleX = startX - (w * 0.4) * ease;
          handleY = startY + (h * 0.35) * ease;
        } else if (t < windup + strike + recoil) {
          // Recoil: Return to center
          const p = (t - windup - strike) / recoil;
          const ease = p;
          const startX = centerX + (w * 0.15) - (w * 0.4);
          const startY = centerY - (h * 0.2) + (h * 0.35);
          handleX = startX + (centerX - startX) * ease;
          handleY = startY + (centerY - startY) * ease;
        } else {
          isWhipping.current = false;
        }

        // Trigger flash when tip accelerates
        if (t > windup + strike && t < windup + strike + 100 && flashOpacity.current === 0) {
           const tip = n[NUM_NODES - 1];
           const speed = Math.hypot(tip.x - tip.oldX, tip.y - tip.oldY);
           if (speed > 25) { 
             flashOpacity.current = 1;
             crackPos.current = { x: tip.x, y: tip.y };
           }
        }
      }

      // Set handle position
      n[0].x = handleX;
      n[0].y = handleY;

      // Verlet Integration
      for (let i = 1; i < NUM_NODES; i++) {
        const node = n[i];
        const vx = (node.x - node.oldX) * FRICTION;
        const vy = (node.y - node.oldY) * FRICTION;
        
        node.oldX = node.x;
        node.oldY = node.y;
        
        node.x += vx;
        node.y += vy + GRAVITY;
      }

      // Constraints
      for (let iter = 0; iter < 15; iter++) {
        for (let i = 0; i < NUM_NODES - 1; i++) {
          const n1 = n[i];
          const n2 = n[i + 1];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist === 0) continue;

          const diff = SEGMENT_LENGTH - dist;
          const percent = diff / dist / 2;
          const ox = dx * percent;
          const oy = dy * percent;

          if (i === 0) {
            n2.x += ox * 2;
            n2.y += oy * 2;
          } else {
            n1.x -= ox;
            n1.y -= oy;
            n2.x += ox;
            n2.y += oy;
          }
        }
      }

      // Rendering
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Draw the "shadow" or dark core of the whip for realism
      for (let i = 0; i < NUM_NODES - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(n[i].x, n[i].y);
        ctx.lineTo(n[i + 1].x, n[i + 1].y);
        
        const ratio = i / NUM_NODES;
        const thickness = Math.max(1, 8 * (1 - ratio));
        
        if (i < 2) {
          // Handle core
          ctx.strokeStyle = "#1a0f00"; // Deep leather brown
          ctx.lineWidth = 10;
        } else {
          // Body core
          ctx.strokeStyle = `rgba(40, 25, 15, ${1 - ratio * 0.3})`;
          ctx.lineWidth = thickness;
        }
        ctx.stroke();
      }

      // 2. Draw the visible highlight/detail stroke
      for (let i = 0; i < NUM_NODES - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(n[i].x, n[i].y);
        ctx.lineTo(n[i + 1].x, n[i + 1].y);
        
        const ratio = i / NUM_NODES;
        const thickness = Math.max(0.5, 5 * (1 - ratio));
        
        if (i < 2) {
          // Handle grip
          ctx.strokeStyle = "#d2ff00"; // Accent color for visibility
          ctx.lineWidth = 4;
        } else if (i === NUM_NODES - 2) {
          // The "cracker" at the very end
          ctx.strokeStyle = "#ff4d14"; // Vermillion for high visibility
          ctx.lineWidth = 2;
        } else {
          // Leather highlight
          ctx.strokeStyle = `rgba(139, 94, 60, ${0.8 - ratio * 0.5})`; // Braided leather highlight
          ctx.lineWidth = thickness * 0.6;
        }
        ctx.stroke();
      }

      // Crack Flash
      if (flashOpacity.current > 0) {
        const f = flashOpacity.current;
        const cx = crackPos.current.x;
        const cy = crackPos.current.y;
        
        // Intense electric spark flash
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${f})`);
        gradient.addColorStop(0.2, `rgba(210, 255, 0, ${f * 0.8})`); // Acid yellow tint
        gradient.addColorStop(0.5, `rgba(255, 77, 20, ${f * 0.4})`);  // Vermillion heat
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Optional: Small inner bright core for "crack"
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * f, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        
        flashOpacity.current -= 0.05; // Slightly slower fade for more impact
        if (flashOpacity.current < 0) flashOpacity.current = 0;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === "w" && !isWhipping.current) {
        isWhipping.current = true;
        whipStartTime.current = performance.now();
        flashOpacity.current = 0;
        // Dispatch global event for other components to react (like the chatbot)
        window.dispatchEvent(new CustomEvent("whip-cracked"));
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
