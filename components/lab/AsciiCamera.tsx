"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, AlertCircle } from "lucide-react";

// Density string from darkest to lightest
const ASCII_CHARS = " .:-=+*#%@";

export default function AsciiCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const requestRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or device not found.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsActive(false);
    }
    cancelAnimationFrame(requestRef.current);
    setAsciiArt("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const renderAscii = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestRef.current = requestAnimationFrame(renderAscii);
      return;
    }

    // Set resolution for ASCII conversion (lower is better for performance & ASCII look)
    // 100 characters wide provides a good balance
    const width = 100;
    // Multiply by 0.5 because characters are typically twice as tall as they are wide
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5); 
    
    canvas.width = width;
    canvas.height = height;

    // Draw video frame to hidden canvas
    ctx.drawImage(video, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let asciiStr = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Mirror the image horizontally (like a typical webcam)
        const mirroredX = width - 1 - x;
        const offset = (y * width + mirroredX) * 4;
        
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        
        // Calculate perceived brightness (luminance)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
        
        // Map brightness (0-255) to ASCII character index
        const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
        asciiStr += ASCII_CHARS[charIndex];
      }
      asciiStr += "\n";
    }

    setAsciiArt(asciiStr);
    requestRef.current = requestAnimationFrame(renderAscii);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(renderAscii);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive]);

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-[#050505] border-2 border-foreground overflow-hidden">
      {/* Hidden Video and Canvas Elements */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* UI Overlay: Permissions */}
      {!isActive && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-background/80 backdrop-blur-sm">
          <Camera size={48} className="text-foreground/40" />
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/60 max-w-sm text-center">
            This experiment requires camera access to render your feed in real-time ASCII.
          </p>
          <button 
            onClick={startCamera}
            className="px-8 py-4 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-foreground transition-colors"
          >
            Initialize Camera
          </button>
        </div>
      )}

      {/* UI Overlay: Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30 bg-destructive/10">
          <AlertCircle size={48} className="text-destructive" />
          <p className="font-mono text-sm uppercase tracking-widest text-destructive text-center px-4">
            {error}
          </p>
          <button 
            onClick={startCamera}
            className="mt-4 px-6 py-3 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ASCII Display */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 p-4 w-full h-full flex items-center justify-center"
        >
          <pre className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.1] md:leading-[1.1] tracking-tighter text-accent overflow-hidden whitespace-pre selection:bg-accent selection:text-black">
            {asciiArt}
          </pre>
          
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
        </motion.div>
      )}

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] uppercase tracking-widest text-foreground/30 pointer-events-none flex flex-col gap-1">
        <span>$ ./ascii_cam.sh</span>
        <span>$ status: {isActive ? "capturing" : error ? "failed" : "idle"}</span>
        {isActive && <span className="text-accent">$ filter: text/plain</span>}
      </div>

      {/* Controls Overlay */}
      {isActive && (
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={stopCamera}
            className="px-4 py-2 border border-foreground/20 text-xs font-mono uppercase text-foreground/50 hover:bg-foreground hover:text-background transition-colors"
          >
            Terminate
          </button>
        </div>
      )}
    </div>
  );
}
