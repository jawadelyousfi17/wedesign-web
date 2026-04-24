"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, Maximize2, Minimize2, Download, X, ScanFace, Loader2 } from "lucide-react";

const ASCII_CHARS = " .:-=+*#%@";

// Dynamic script loader
const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export default function AsciiCamera() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRef = useRef<HTMLPreElement>(null); 
  
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Neural State
  const [neuralMode, setNeuralMode] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const faceMeshRef = useRef<any>(null);
  const latestLandmarksRef = useRef<any>(null);

  const requestRef = useRef<number>(0);

  // --- Neural Engine Setup ---
  const initNeuralEngine = async () => {
    if (faceMeshRef.current) return;
    setIsModelLoading(true);
    
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
      
      const faceMesh = new (window as any).FaceMesh({
        locateFile: (file: string) => {
          // Explicitly target the full URL to prevent the "undefined assets" error
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          latestLandmarksRef.current = results.multiFaceLandmarks[0];
        } else {
          latestLandmarksRef.current = null;
        }
      });

      // Initialize the model
      await faceMesh.initialize();
      faceMeshRef.current = faceMesh;
    } catch (err) {
      console.error("Neural Engine error:", err);
      setError("Biometric models failed to initialize.");
    } finally {
      setIsModelLoading(false);
    }
  };

  const toggleNeuralMode = async () => {
    if (!neuralMode) {
      await initNeuralEngine();
    }
    setNeuralMode(!neuralMode);
  };

  // --- Camera Controls ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
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

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setNeuralMode(false);
    cancelAnimationFrame(requestRef.current);
    if (preRef.current) preRef.current.textContent = "";
  }, []);

  // --- Main Render Loop ---
  const renderLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !preRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const width = isFullscreen ? 160 : 120;
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5); 
    
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    // Draw and capture frame
    ctx.drawImage(video, 0, 0, width, height);
    
    // Process FaceMesh if active (every few frames to save CPU)
    if (neuralMode && faceMeshRef.current && Math.random() > 0.5) {
       faceMeshRef.current.send({ image: video });
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 1. Build basic ASCII grid
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        const mirroredX = width - 1 - x;
        const offset = (y * width + mirroredX) * 4;
        const brightness = (0.299 * data[offset] + 0.587 * data[offset+1] + 0.114 * data[offset+2]);
        row.push(ASCII_CHARS[Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))]);
      }
      grid.push(row);
    }

    // 2. Inject Biometric Overlays
    if (neuralMode && latestLandmarksRef.current) {
      const landmarks = latestLandmarksRef.current;
      
      // Calculate face bounds
      let minX = width, maxX = 0, minY = height, maxY = 0;
      landmarks.forEach((pt: any) => {
        const x = Math.floor((1 - pt.x) * width); // Mirrored
        const y = Math.floor(pt.y * height);
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      });

      // Draw HUD corners
      const pad = 4;
      minX = Math.max(0, minX - pad); maxX = Math.min(width - 1, maxX + pad);
      minY = Math.max(0, minY - 2); maxY = Math.min(height - 1, maxY + 2);

      const drawBox = () => {
        for(let i=0; i<5; i++) {
          if (grid[minY][minX+i]) grid[minY][minX+i] = "+";
          if (grid[minY+i]?.[minX]) grid[minY+i][minX] = "|";
          if (grid[maxY][maxX-i]) grid[maxY][maxX-i] = "+";
          if (grid[maxY-i]?.[maxX]) grid[maxY-i][maxX] = "|";
        }
      }
      drawBox();

      // Eye Tracking
      const drawEye = (idx: number) => {
        const pt = landmarks[idx];
        const x = Math.floor((1 - pt.x) * width);
        const y = Math.floor(pt.y * height);
        if (grid[y]?.[x]) {
          grid[y][x-1] = "["; grid[y][x] = "*"; grid[y][x+1] = "]";
        }
      }
      drawEye(159); // Left
      drawEye(386); // Right

      // Status Text
      const status = " [ NEURAL_LOCK_ACTIVE ] ";
      if (minY > 1) {
        for(let i=0; i<status.length; i++) {
          if (grid[minY-1]?.[minX+i]) grid[minY-1][minX+i] = status[i];
        }
      }
    }

    preRef.current.textContent = grid.map(r => r.join('')).join('\n');
    requestRef.current = requestAnimationFrame(renderLoop);
  }, [isFullscreen, neuralMode]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(renderLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, renderLoop]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-center bg-[#050505] border-2 border-foreground overflow-hidden transition-all duration-500 ${isFullscreen ? 'h-screen' : 'h-[70vh] min-h-[600px]'}`}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {!isActive && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-background/80 backdrop-blur-sm">
          <Camera size={48} className="text-foreground/40" />
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">Initialize Optical Processor</p>
          <button onClick={startCamera} className="px-10 py-5 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-foreground transition-colors">
            Start Stream
          </button>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30 bg-destructive/10">
          <AlertCircle size={48} className="text-destructive" />
          <p className="font-mono text-sm text-destructive uppercase tracking-widest">{error}</p>
          <button onClick={startCamera} className="px-6 py-3 border-2 border-destructive text-destructive uppercase text-xs font-bold">Retry</button>
        </div>
      )}

      {isActive && (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
          <pre 
            ref={preRef} 
            className="font-mono leading-[1.05] tracking-tight text-accent whitespace-pre select-none"
            style={{ fontSize: isFullscreen ? 'min(0.65vw, 0.95vh)' : 'min(0.8vw, 1.1vh)' }}
          />
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] uppercase tracking-widest text-foreground/30 pointer-events-none flex flex-col gap-1">
        <span>$ status: {isActive ? "capturing" : "idle"}</span>
        {neuralMode && <span className="text-accent">$ neural_link: established</span>}
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
            <button 
              onClick={toggleNeuralMode}
              className={`p-4 border-2 transition-all ${neuralMode ? 'bg-accent text-black border-accent' : 'bg-card text-foreground border-foreground hover:bg-foreground hover:text-background'}`}
              title="Toggle Biometrics"
            >
              {isModelLoading ? <Loader2 size={20} className="animate-spin" /> : <ScanFace size={20} />}
            </button>
            <button onClick={toggleFullscreen} className="p-4 bg-card text-foreground border-2 border-foreground hover:bg-foreground hover:text-background transition-all">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={stopCamera} className="p-4 bg-card text-foreground border-2 border-foreground hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
