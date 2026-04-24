"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Play, RefreshCcw, Info } from "lucide-react";

type Move = "rock" | "paper" | "scissors" | "none";
type GameStatus = "idle" | "counting" | "processing" | "result";

const MOVES: Move[] = ["rock", "paper", "scissors"];

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = () => {
      (s as any)._loaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

export default function RockPaperScissors() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [countdown, setCountdown] = useState(3);
  const [userMove, setUserMove] = useState<Move>("none");
  const [computerMove, setComputerMove] = useState<Move>("none");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });

  const currentMoveRef = useRef<Move>("none");

  const init = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }

      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      const hands = new (window as any).Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const runDetection = async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
        requestAnimationFrame(runDetection);
      };
      runDetection();
    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onResults = (results: any) => {
    const landmarks = results.multiHandLandmarks?.[0];
    if (!landmarks) {
      currentMoveRef.current = "none";
      return;
    }

    // Gesture detection logic
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexPip = landmarks[6];
    const middlePip = landmarks[10];
    const ringPip = landmarks[14];
    const pinkyPip = landmarks[18];

    const isIndexExt = indexTip.y < indexPip.y;
    const isMiddleExt = middleTip.y < middlePip.y;
    const isRingExt = ringTip.y < ringPip.y;
    const isPinkyExt = pinkyTip.y < pinkyPip.y;

    if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt) {
      currentMoveRef.current = "paper";
    } else if (isIndexExt && isMiddleExt && !isRingExt && !isPinkyExt) {
      currentMoveRef.current = "scissors";
    } else if (!isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
      currentMoveRef.current = "rock";
    } else {
      currentMoveRef.current = "none";
    }
  };

  const play = () => {
    setStatus("counting");
    setCountdown(3);
    setUserMove("none");
    setComputerMove("none");
    setResult("");

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          processResult();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  const processResult = () => {
    setStatus("processing");
    
    // Tiny delay to ensure we catch the final gesture
    setTimeout(() => {
      const finalUserMove = currentMoveRef.current;
      const finalComputerMove = MOVES[Math.floor(Math.random() * MOVES.length)];
      
      setUserMove(finalUserMove);
      setComputerMove(finalComputerMove);

      if (finalUserMove === "none") {
        setResult("STALL! SHOW YOUR HAND.");
      } else if (finalUserMove === finalComputerMove) {
        setResult("DRAW");
        setScore(s => ({ ...s, draw: s.draw + 1 }));
      } else if (
        (finalUserMove === "rock" && finalComputerMove === "scissors") ||
        (finalUserMove === "paper" && finalComputerMove === "rock") ||
        (finalUserMove === "scissors" && finalComputerMove === "paper")
      ) {
        setResult("YOU WIN");
        setScore(s => ({ ...s, win: s.win + 1 }));
      } else {
        setResult("AI WINS");
        setScore(s => ({ ...s, lose: s.lose + 1 }));
      }
      
      setStatus("result");
    }, 100);
  };

  useEffect(() => {
    init();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [init]);

  const MoveIcon = ({ move, label }: { move: Move, label: string }) => {
    const symbols = { rock: "✊", paper: "✋", scissors: "✌️", none: "?" };
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-widest opacity-50">{label}</span>
        <div className="w-24 h-24 flex items-center justify-center bg-card border-2 border-foreground shadow-[4px_4px_0_var(--color-foreground)] text-5xl">
          {symbols[move]}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-mono">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Camera & Detection */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video bg-black border-2 border-foreground shadow-ink overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>INITIALIZING_NEURAL_LINK...</span>
              </div>
            )}
            {!isLoading && isCameraReady && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-foreground text-[10px] font-bold uppercase">
                DETECTION: {currentMoveRef.current === "none" ? "WAITING..." : currentMoveRef.current}
              </div>
            )}
          </div>
          
          <div className="border-2 border-foreground p-4 bg-muted">
            <div className="flex items-center gap-2 mb-3 border-b border-foreground/10 pb-2">
              <Info size={14} />
              <span className="text-xs font-bold uppercase tracking-tighter">Instructions</span>
            </div>
            <ul className="text-[10px] space-y-2 uppercase leading-tight opacity-70">
              <li>• ROCK: FOLD ALL FINGERS ✊</li>
              <li>• PAPER: EXTEND ALL FINGERS ✋</li>
              <li>• SCISSORS: PEACE SIGN ✌️</li>
              <li>• PRESS PLAY AND SHOW YOUR MOVE AT 0</li>
            </ul>
          </div>
        </div>

        {/* Right: Game UI */}
        <div className="flex flex-col gap-6">
          {/* Scoreboard */}
          <div className="grid grid-cols-3 border-2 border-foreground bg-card text-center divide-x-2 divide-foreground shadow-ink">
            <div className="py-2">
              <div className="text-[10px] uppercase opacity-50">Wins</div>
              <div className="text-xl font-bold">{score.win}</div>
            </div>
            <div className="py-2 bg-primary/10">
              <div className="text-[10px] uppercase opacity-50">Losses</div>
              <div className="text-xl font-bold">{score.lose}</div>
            </div>
            <div className="py-2">
              <div className="text-[10px] uppercase opacity-50">Draws</div>
              <div className="text-xl font-bold">{score.draw}</div>
            </div>
          </div>

          {/* Game Arena */}
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-foreground bg-card shadow-ink-lg p-8 relative overflow-hidden">
            {status === "idle" && (
              <button
                onClick={play}
                disabled={!isCameraReady}
                className="group flex flex-col items-center gap-4 transition-all hover:scale-105 disabled:opacity-50"
              >
                <div className="w-20 h-20 rounded-full border-4 border-foreground flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Play size={32} fill="currentColor" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest border-b-2 border-foreground">Initiate_Bout</span>
              </button>
            )}

            {status === "counting" && (
              <div className="flex flex-col items-center gap-4">
                <span className="text-8xl font-black italic animate-in zoom-in duration-300">
                  {countdown === 0 ? "GO!" : countdown}
                </span>
                <span className="text-xs uppercase tracking-[0.3em] animate-pulse">Synchronizing...</span>
              </div>
            )}

            {(status === "result" || status === "processing") && (
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in zoom-in duration-300">
                <div className="flex justify-around w-full gap-4">
                  <MoveIcon move={userMove} label="You" />
                  <div className="flex items-center justify-center text-2xl font-black italic opacity-20 pt-8">VS</div>
                  <MoveIcon move={computerMove} label="AI_Core" />
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-black uppercase tracking-tighter bg-foreground text-background px-4 py-1">
                    {status === "processing" ? "CALCULATING..." : result}
                  </div>
                  {status === "result" && (
                    <button
                      onClick={play}
                      className="flex items-center gap-2 mx-auto text-[10px] font-bold uppercase border-2 border-foreground px-3 py-1 hover:bg-primary transition-colors"
                    >
                      <RefreshCcw size={12} /> Play Again
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Aesthetic Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-halftone" />
          </div>
        </div>
      </div>
    </div>
  );
}
