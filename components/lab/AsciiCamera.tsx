"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, Maximize2, Minimize2, Download, X } from "lucide-react";

// Density string from darkest to lightest
const ASCII_CHARS = " .:-=+*#%@";

export default function AsciiCamera() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRef = useRef<HTMLPreElement>(null); 
  
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const requestRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or device not found.");
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    cancelAnimationFrame(requestRef.current);
    if (preRef.current) preRef.current.textContent = "";
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const takePicture = () => {
    if (!preRef.current) return;
    setIsCapturing(true);
    
    const asciiText = preRef.current.textContent || "";
    const lines = asciiText.split("\n");
    
    // Create a high-res canvas for the snapshot
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 12;
    const lineHeight = fontSize * 1.1;
    
    // Measure character width (monospace)
    ctx.font = `${fontSize}px monospace`;
    const charWidth = ctx.measureText("M").width;
    
    canvas.width = lines[0].length * charWidth + 40;
    canvas.height = lines.length * lineHeight + 40;
    
    // Draw background
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = "#ff4d14"; // Use accent color
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 20 + i * lineHeight);
    });

    // Add watermark
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "10px monospace";
    ctx.fillText("WEDESIGN // ASCII_CAPTURE", 20, canvas.height - 15);

    // Download
    const link = document.createElement("a");
    link.download = `ascii-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    setTimeout(() => setIsCapturing(false), 500);
  };

  const renderAscii = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !preRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx || video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
      requestRef.current = requestAnimationFrame(renderAscii);
      return;
    }

    // Increased resolution for "bigger" look
    const width = isFullscreen ? 160 : 120;
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5); 
    
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let asciiStr = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mirroredX = width - 1 - x;
        const offset = (y * width + mirroredX) * 4;
        const brightness = (0.299 * data[offset] + 0.587 * data[offset+1] + 0.114 * data[offset+2]);
        asciiStr += ASCII_CHARS[Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))];
      }
      asciiStr += "\n";
    }

    preRef.current.textContent = asciiStr;
    requestRef.current = requestAnimationFrame(renderAscii);
  }, [isFullscreen]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(renderAscii);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, renderAscii]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-center bg-[#050505] border-2 border-foreground overflow-hidden transition-all duration-500 ${isFullscreen ? 'h-screen' : 'h-[70vh] min-h-[600px]'}`}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Permissions Overlay */}
      {!isActive && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-background/80 backdrop-blur-sm">
          <div className="relative">
             <div className="absolute inset-0 bg-accent blur-2xl opacity-20 animate-pulse" />
             <Camera size={64} className="text-foreground/40 relative z-10" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground/60 max-w-sm text-center">
            Initialize optical signal processor
          </p>
          <button 
            onClick={startCamera}
            className="group relative px-10 py-5 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] overflow-hidden"
          >
            <span className="relative z-10">Start Capture</span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30 bg-destructive/10">
          <AlertCircle size={48} className="text-destructive" />
          <p className="font-mono text-sm uppercase tracking-widest text-destructive text-center px-4">
            {error}
          </p>
          <button onClick={startCamera} className="mt-4 px-6 py-3 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            Retry Connection
          </button>
        </div>
      )}

      {/* ASCII Display */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 w-full h-full flex items-center justify-center p-2 md:p-8"
        >
          <pre 
            ref={preRef} 
            className="font-mono leading-[1.05] tracking-tight text-accent whitespace-pre select-none"
            style={{ 
              fontSize: isFullscreen ? 'min(0.65vw, 0.95vh)' : 'min(0.8vw, 1.1vh)',
            }}
          />
          
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>
      )}

      {/* Interface Overlays */}
      <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] uppercase tracking-widest text-foreground/30 pointer-events-none hidden md:flex flex-col gap-1">
        <span className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full animate-ping" /> Capturing signal_01</span>
        <span>Resolution: {isFullscreen ? '160xAuto' : '120xAuto'}</span>
        <span className="text-accent">$ system.draw(optical_buffer)</span>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-6 right-6 z-30 flex items-center gap-3"
          >
            {/* Take Picture */}
            <button 
              onClick={takePicture}
              disabled={isCapturing}
              className="p-4 bg-foreground text-background hover:bg-accent hover:text-foreground transition-all duration-300 rounded-none border border-foreground/10 group"
              title="Take Snapshot"
            >
              {isCapturing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} className="group-hover:scale-110 transition-transform" />}
            </button>

            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen}
              className="p-4 bg-card text-foreground border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {/* Terminate */}
            <button 
              onClick={stopCamera}
              className="p-4 bg-card text-foreground border-2 border-foreground hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300"
              title="Terminate Processor"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={className}
        >
            <Camera size={size} />
        </motion.div>
    );
}
