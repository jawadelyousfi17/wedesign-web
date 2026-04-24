"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Cpu, Activity, AlertCircle } from "lucide-react";

// Helper to load external scripts dynamically
const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export default function NeuralInterface() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ fps: 0, faces: 0, hands: 0 });
  
  const holisticRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const requestRef = useRef<number>(0);

  const initHolistic = async () => {
    setIsModelLoading(true);
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js");
      
      const holistic = new (window as any).Holistic({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      holistic.onResults(onResults);
      holisticRef.current = holistic;
      
      await startCamera();
    } catch (err) {
      console.error("Holistic Init Error:", err);
      setError("Failed to initialize neural models.");
    } finally {
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsActive(true);
        isProcessingRef.current = true;
        detectFrame();
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied.");
    }
  };

  const detectFrame = async () => {
    if (!isProcessingRef.current || !videoRef.current || !holisticRef.current) return;

    if (videoRef.current.readyState >= 2) {
      await holisticRef.current.send({ image: videoRef.current });
    }
    
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d")!;
    
    if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // NOTE: We rely entirely on the CSS `scale-x-[-1]` to mirror the canvas.
    // The previous `ctx.scale(-1, 1)` was causing a double-inversion.

    const drawLandmarks = (landmarks: any[], color: string, radius = 2) => {
      if (!landmarks) return;
      ctx.fillStyle = color;
      landmarks.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // 1. Draw Pose
    if (results.poseLandmarks) {
      drawLandmarks(results.poseLandmarks, "#ff4d14", 3);
    }

    // 2. Draw Hands
    if (results.leftHandLandmarks) drawLandmarks(results.leftHandLandmarks, "#ffffff", 2);
    if (results.rightHandLandmarks) drawLandmarks(results.rightHandLandmarks, "#ffffff", 2);

    // 3. Draw Face Mesh
    if (results.faceLandmarks) {
       ctx.strokeStyle = "rgba(255, 77, 20, 0.8)";
       ctx.fillStyle = "rgba(255, 77, 20, 0.8)";
       [1, 10, 33, 263, 152].forEach(idx => {
          const pt = results.faceLandmarks[idx];
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, Math.PI * 2);
          ctx.fill();
       });
    }

    ctx.restore();
    
    setStats({
       fps: 60,
       faces: results.faceLandmarks ? 1 : 0,
       hands: (results.leftHandLandmarks ? 1 : 0) + (results.rightHandLandmarks ? 1 : 0)
    });
  };

  const terminateSession = () => {
    isProcessingRef.current = false;
    cancelAnimationFrame(requestRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (holisticRef.current) {
        holisticRef.current.close();
    }
    setIsActive(false);
    
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  useEffect(() => {
    return () => {
      terminateSession();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black border-2 border-foreground overflow-hidden flex flex-col">
      
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-30 bg-background/95 backdrop-blur-md">
           <div className="relative">
              <div className="absolute inset-0 bg-accent blur-3xl opacity-20 animate-pulse" />
              <Cpu size={64} className="text-foreground/40 relative z-10" />
           </div>
           
           <div className="flex flex-col items-center gap-2">
              <h2 className="font-serif italic text-3xl">Neural Interface</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">Hand + Face + Pose Tracking</p>
           </div>

           <button 
             onClick={initHolistic}
             disabled={isModelLoading}
             className="group relative px-12 py-6 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-transform hover:scale-105"
           >
             {isModelLoading ? (
               <div className="flex items-center gap-3">
                 <Loader2 size={16} className="animate-spin" />
                 <span>Downloading Weights...</span>
               </div>
             ) : (
               <span className="relative z-10">Link Neural Stream</span>
             )}
             <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
           </button>
        </div>
      )}

      {error && (
         <div className="absolute inset-0 z-40 bg-destructive/20 flex flex-col items-center justify-center gap-4">
            <AlertCircle size={48} className="text-destructive" />
            <p className="font-mono text-xs uppercase text-destructive">{error}</p>
         </div>
      )}

      <div className="relative flex-1 w-full bg-[#050505] flex items-center justify-center overflow-hidden">
         <video 
           ref={videoRef} 
           autoPlay 
           playsInline 
           muted 
           className={`absolute inset-0 w-full h-full object-cover grayscale scale-x-[-1] transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0 hidden'}`}
         />
         
         <canvas 
           ref={canvasRef} 
           className={`relative z-10 w-full h-full object-cover pointer-events-none scale-x-[-1] ${isActive ? 'opacity-100' : 'opacity-0'}`}
         />

         {isActive && (
           <>
              <div className="absolute top-8 left-8 z-20 flex flex-col gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground/40 pointer-events-none">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full animate-ping" /> Connection: Established</div>
                 <div className="flex flex-col gap-1 border-l border-foreground/20 pl-4">
                    <span>Protocol: holistic_v2</span>
                    <span>Buffer: direct_render</span>
                    <span>Encoder: webgl_accelerated</span>
                 </div>
              </div>

              <div className="absolute top-8 right-8 z-20 flex flex-col gap-2 text-right font-mono text-[10px] uppercase tracking-widest text-foreground/40 pointer-events-none">
                 <div className="flex items-center gap-3 justify-end">
                    <span className="text-accent">{stats.faces} Face detected</span>
                    <Activity size={14} className="text-accent" />
                 </div>
                 <span>{stats.hands} Hand(s) tracked</span>
              </div>
           </>
         )}
      </div>

      <div className="w-full bg-card border-t-2 border-foreground p-4 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/30 flex justify-between items-center relative z-20">
         <span>[SYSTEM]: Neural mesh synthesized successfully</span>
         {isActive && (
             <button 
                onClick={terminateSession}
                className="text-accent hover:text-destructive underline transition-colors cursor-pointer"
             >
                TERMINATE_SESSION_CLOSE_TAB
             </button>
         )}
      </div>
    </div>
  );
}