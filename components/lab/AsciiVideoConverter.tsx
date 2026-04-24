"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Play, Pause, FileVideo, Terminal, Settings, Eye, Type } from "lucide-react";

const CHAR_SETS = {
  standard: "@%#*+=-:. ",
  blocks: "█▓▒░ ",
  numbers: "876543210 ",
  binary: "10 ",
  minimal: "#+· ",
  shapes: "⬢⬡⬟⬠⬥⬦◆◇◈ ",
};

type CharSetKey = keyof typeof CHAR_SETS;

export default function AsciiVideoConverter() {
  const [mode, setStatus] = useState<"convert" | "player">("convert");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [asciiFrames, setAsciiFrames] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(15);
  const [resolution, setResolution] = useState(80);
  const [selectedCharSet, setSelectedCharSet] = useState<CharSetKey>("standard");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Conversion logic
  const convertToAscii = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        resolve(null);
      };
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    
    // Adjust height for font aspect ratio (typically ~2:1)
    const width = resolution;
    const height = Math.floor(width * (video.videoHeight / video.videoWidth) * 0.5);
    canvas.width = width;
    canvas.height = height;

    const frames: string[] = [];
    const duration = video.duration;
    const interval = 1 / fps;
    let currentTime = 0;
    const currentChars = CHAR_SETS[selectedCharSet];

    while (currentTime < duration) {
      video.currentTime = currentTime;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let frameStr = "";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const brightness = (r + g + b) / 3;
          const charIndex = Math.floor((brightness / 255) * (currentChars.length - 1));
          frameStr += currentChars[charIndex];
        }
        frameStr += "\n";
      }

      frames.push(frameStr);
      currentTime += interval;
      setProgress(Math.floor((currentTime / duration) * 100));
    }

    setAsciiFrames(frames);
    setIsProcessing(false);
    setStatus("player");
    setCurrentFrame(0);
  };

  const exportAscii = () => {
    const blob = new Blob([JSON.stringify({ frames: asciiFrames, fps, resolution, charSet: selectedCharSet })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-ascii-export.wd";
    a.click();
  };

  const importAscii = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.frames) {
          setAsciiFrames(data.frames);
          setFps(data.fps || 15);
          setResolution(data.resolution || 80);
          if (data.charSet) setSelectedCharSet(data.charSet);
          setStatus("player");
          setCurrentFrame(0);
        }
      } catch (err) {
        alert("Invalid ASCII export file.");
      }
    };
    reader.readAsText(file);
  };

  // Playback control
  useEffect(() => {
    if (isPlaying && asciiFrames.length > 0) {
      playerTimerRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % asciiFrames.length);
      }, 1000 / fps);
    } else {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    }
    return () => {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    };
  }, [isPlaying, asciiFrames, fps]);

  return (
    <div className="max-w-6xl mx-auto p-6 font-mono text-foreground">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Controls */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          
          <div className="flex border-2 border-foreground bg-card shadow-ink">
            <button 
              onClick={() => setStatus("convert")}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${mode === "convert" ? "bg-foreground text-background" : "hover:bg-primary/20"}`}
            >
              Convert
            </button>
            <button 
              onClick={() => setStatus("player")}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${mode === "player" ? "bg-foreground text-background" : "hover:bg-primary/20"}`}
            >
              Player
            </button>
          </div>

          {mode === "convert" ? (
            <div className="flex flex-col gap-4 border-2 border-foreground p-6 bg-card shadow-ink">
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={16} />
                <span className="text-xs font-bold uppercase">Source_Input</span>
              </div>
              
              <label className="group flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 py-10 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <FileVideo className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Load Video File</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) convertToAscii(file);
                  }}
                  disabled={isProcessing}
                />
              </label>

              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-50">
                    <Type size={12} />
                    <span>Character Set</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(CHAR_SETS) as CharSetKey[]).map((set) => (
                      <button
                        key={set}
                        onClick={() => setSelectedCharSet(set)}
                        className={`text-[9px] py-1 border-2 transition-all uppercase font-bold ${selectedCharSet === set ? "bg-primary border-foreground text-foreground" : "border-foreground/10 hover:border-foreground/30"}`}
                      >
                        {set}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                    <span>Resolution</span>
                    <span>{resolution}px</span>
                  </div>
                  <input 
                    type="range" min="40" max="150" step="10" 
                    value={resolution} onChange={(e) => setResolution(parseInt(e.target.value))}
                    className="accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                    <span>Target FPS</span>
                    <span>{fps}</span>
                  </div>
                  <input 
                    type="range" min="5" max="30" step="5" 
                    value={fps} onChange={(e) => setFps(parseInt(e.target.value))}
                    className="accent-primary"
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="pt-4 space-y-2">
                  <div className="h-1.5 w-full bg-foreground/10 overflow-hidden border border-foreground">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase animate-pulse">Processing: {progress}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 border-2 border-foreground p-6 bg-card shadow-ink">
               <div className="flex items-center gap-2 mb-2">
                <Play size={16} />
                <span className="text-xs font-bold uppercase">Playback_Control</span>
              </div>

              <label className="group flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 py-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <Upload size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Execute .wd ASCII</span>
                <input 
                  type="file" 
                  accept=".wd" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importAscii(file);
                  }}
                />
              </label>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={asciiFrames.length === 0}
                  className="flex-1 bg-primary text-foreground border-2 border-foreground py-2 font-bold uppercase text-xs flex items-center justify-center gap-2"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button 
                  onClick={exportAscii}
                  disabled={asciiFrames.length === 0}
                  className="bg-card text-foreground border-2 border-foreground p-2 hover:bg-muted transition-colors"
                  title="Export .wd file"
                >
                  <Download size={14} />
                </button>
              </div>

              {asciiFrames.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase opacity-50">Frame: {currentFrame + 1} / {asciiFrames.length}</span>
                  <div className="h-1 bg-foreground/10 w-full overflow-hidden">
                    <div className="h-full bg-foreground transition-all duration-100" style={{ width: `${((currentFrame + 1) / asciiFrames.length) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-2 border-foreground p-4 bg-muted/50">
            <span className="text-[9px] uppercase font-bold tracking-widest block mb-2 opacity-50 underline">System Note</span>
            <p className="text-[9px] uppercase leading-relaxed opacity-70">
              The neural converter utilizes per-frame brightness analysis. exported files use the custom .wd protocol for WeDesign ASCII playback.
            </p>
          </div>
        </div>

        {/* Right: Preview / Canvas */}
        <div className="flex-1 border-2 border-foreground bg-black shadow-ink-lg flex flex-col relative overflow-hidden">
          <div className="bg-foreground text-background p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Realtime_ASCII_Stream</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold opacity-70">
               <span>RES: {resolution}px</span>
               <span>STATUS: {isPlaying ? "STREAMING" : "IDLE"}</span>
            </div>
          </div>

          <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-auto min-h-[500px]">
            {asciiFrames.length > 0 ? (
              <pre className="text-[8px] leading-[0.6] tracking-tight font-mono text-primary whitespace-pre select-none">
                {asciiFrames[currentFrame]}
              </pre>
            ) : (
              <div className="text-center opacity-30 flex flex-col items-center gap-4">
                <Terminal size={48} strokeWidth={1} />
                <span className="text-xs uppercase tracking-[0.4em]">Awaiting Uplink...</span>
              </div>
            )}
          </div>

          {/* Noise overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-noise" />
        </div>

      </div>
    </div>
  );
}
