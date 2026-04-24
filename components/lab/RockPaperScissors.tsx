"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Move   = "rock" | "paper" | "scissors";
type Phase  = "boot" | "loading" | "countdown" | "reveal" | "error";
type Result = "win" | "lose" | "draw";

const EMOJI: Record<Move, string> = { rock:"✊", paper:"🖐", scissors:"✌️" };
const BEATS: Record<Move, Move>   = { rock:"scissors", scissors:"paper", paper:"rock" };

const TRASH: Record<Result, string[]> = {
  win:  [
    "Seriously? I didn't even try.",
    "Bro I'm basically telepathic.",
    "You're making this too easy 😴",
    "Did you even look at your hand?",
    "I could beat you with my eyes closed. Oh wait — I don't have eyes.",
    "Another one. Classic.",
    "Maybe try a different hand?",
  ],
  lose: [
    "Ok ok ok. Lucky.",
    "You got me. This round.",
    "FINE. Take it.",
    "Was that even legal?",
    "I let you have that one. Obviously.",
    "My model glitched. Definitely.",
    "I was going easy on you. Promise.",
  ],
  draw: [
    "We're literally the same person.",
    "Are you copying me??",
    "Stop mirroring me. It's weird.",
    "It's like looking in a mirror. Creepy.",
    "Jinx! You owe me a juice.",
  ],
};

function randomTrash(r: Result) {
  const p = TRASH[r]; return p[Math.floor(Math.random() * p.length)];
}
function getResult(p: Move | null, ai: Move): Result | null {
  if (!p) return null;
  if (p === ai) return "draw";
  return BEATS[p] === ai ? "win" : "lose";
}

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    const ex = document.querySelector(`script[src="${src}"]`) as any;
    if (ex) {
      if (ex._loaded) return resolve();
      ex.addEventListener("load", () => resolve(), { once: true });
      ex.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src; s.crossOrigin = "anonymous";
    s.onload = () => { (s as any)._loaded = true; resolve(); };
    s.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(s);
  });

function classify(lm: any[]): Move | null {
  const T = 0.025;
  const ext = (tip: number, pip: number) => lm[tip].y < lm[pip].y - T;
  const iE = ext(8,6), mE = ext(12,10), rE = ext(16,14), pE = ext(20,18);
  const n = [iE,mE,rE,pE].filter(Boolean).length;
  if (iE && mE && !rE && !pE) return "scissors";
  if (n >= 4) return "paper";
  if (n === 0) return "rock";
  return null;
}

/* ══════════════════════════════════════════════════════════════════ */
export default function RockPaperScissors() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const [phase, setPhase]           = useState<Phase>("boot");
  const [count, setCount]           = useState(3);
  const [detected, setDetected]     = useState<Move | null>(null);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [aiMove, setAiMove]         = useState<Move | null>(null);
  const [result, setResult]         = useState<Result | null>(null);
  const [trash, setTrash]           = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [score, setScore]           = useState({ win:0, lose:0, draw:0 });
  const [streak, setStreak]         = useState(0);
  const [round, setRound]           = useState(0);

  const handsRef       = useRef<any>(null);
  const runningRef     = useRef(false);
  const rafRef         = useRef<number>(0);
  const latestMove     = useRef<Move | null>(null);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef       = useRef<Phase>("boot");
  const autoReplayRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* sync source → preview */
  useEffect(() => {
    const sync = () => {
      const src = videoRef.current, local = previewRef.current;
      if (src?.srcObject && local && local.srcObject !== src.srcObject) {
        local.srcObject = src.srcObject; local.play().catch(() => {});
      }
    };
    sync(); const t = setInterval(sync, 400); return () => clearInterval(t);
  }, []);

  useEffect(() => () => teardown(), []);

  const teardown = () => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoReplayRef.current) clearTimeout(autoReplayRef.current);
    const v = videoRef.current;
    if (v?.srcObject) { (v.srcObject as MediaStream).getTracks().forEach(t => t.stop()); v.srcObject = null; }
    try { handsRef.current?.close(); } catch {}
    handsRef.current = null;
  };

  /* ── init ─────────────────────────────────────────────────── */
  const init = useCallback(async () => {
    setPhase("loading"); setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"user", width:{ideal:640}, height:{ideal:480} },
      });
      if (!videoRef.current) throw new Error("no video");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await new Promise<void>((res,rej) => {
        const v = videoRef.current!;
        if (v.readyState >= 2) return res();
        v.addEventListener("loadeddata", () => res(), { once:true });
        setTimeout(() => rej(new Error("timeout")), 5000);
      });

      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      if (!(window as any).Hands) throw new Error("MediaPipe unavailable");

      const hands = new (window as any).Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({ maxNumHands:1, modelComplexity:0, minDetectionConfidence:0.65, minTrackingConfidence:0.65 });
      hands.onResults(onResults);
      handsRef.current = hands;
      await hands.send({ image: videoRef.current });

      runningRef.current = true;
      rafLoop();
      beginCountdown();
    } catch (err: any) {
      setErrorMsg(err?.name === "NotAllowedError" ? "Camera denied." : err?.message || "Error");
      setPhase("error");
    }
  }, []);

  /* ── RAF ──────────────────────────────────────────────────── */
  const rafLoop = async () => {
    if (!runningRef.current) return;
    const v = videoRef.current, h = handsRef.current;
    if (v && h && v.readyState >= 2 && v.videoWidth > 0) {
      try { await h.send({ image:v }); } catch {}
    }
    rafRef.current = requestAnimationFrame(rafLoop);
  };

  /* ── results ──────────────────────────────────────────────── */
  const onResults = (res: any) => {
    const canvas = canvasRef.current, v = videoRef.current;
    if (!canvas || !v) return;
    const ctx = canvas.getContext("2d")!;
    if (canvas.width !== v.videoWidth && v.videoWidth > 0) {
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lm = res.multiHandLandmarks?.[0];
    if (!lm) { latestMove.current = null; setDetected(null); return; }

    const move = classify(lm);
    latestMove.current = move;
    setDetected(move);
    drawSkeleton(ctx, lm, canvas.width, canvas.height, move);

    /* auto-replay trigger — show any gesture while in reveal → new round */
    if (phaseRef.current === "reveal" && move !== null) {
      if (!autoReplayRef.current) {
        autoReplayRef.current = setTimeout(() => {
          autoReplayRef.current = null;
          beginCountdown();
        }, 850);
      }
    } else if (phaseRef.current !== "reveal" && autoReplayRef.current) {
      clearTimeout(autoReplayRef.current);
      autoReplayRef.current = null;
    }
  };

  /* ── countdown ────────────────────────────────────────────── */
  const beginCountdown = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoReplayRef.current) { clearTimeout(autoReplayRef.current); autoReplayRef.current = null; }
    setPhase("countdown");
    setPlayerMove(null); setAiMove(null); setResult(null); setTrash("");
    setCount(3);
    let n = 3;
    intervalRef.current = setInterval(() => {
      n -= 1; setCount(n);
      if (n <= 0) { if (intervalRef.current) clearInterval(intervalRef.current); lockIn(); }
    }, 1000);
  }, []);

  const lockIn = useCallback(() => {
    const player = latestMove.current;
    const moves: Move[] = ["rock","paper","scissors"];
    const ai = moves[Math.floor(Math.random() * 3)];
    const res = getResult(player, ai);
    setPlayerMove(player); setAiMove(ai); setResult(res);
    setRound(r => r + 1);
    if (res) {
      setTrash(randomTrash(res));
      setScore(s => ({ ...s, [res]: s[res] + 1 }));
      setStreak(st => res === "win" ? st + 1 : 0);
    } else {
      setTrash("I couldn't see your hand. Try again?");
    }
    setPhase("reveal");
  }, []);

  /* ── skeleton ─────────────────────────────────────────────── */
  function drawSkeleton(ctx: CanvasRenderingContext2D, lm: any[], w: number, h: number, move: Move | null) {
    const CONN = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    const c = move === "rock" ? "#f87171" : move === "paper" ? "#4ade80" : move === "scissors" ? "#60a5fa" : "rgba(255,255,255,0.4)";
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const [a,b] of CONN) { ctx.moveTo(lm[a].x*w, lm[a].y*h); ctx.lineTo(lm[b].x*w, lm[b].y*h); }
    ctx.stroke();
    for (const p of lm) { ctx.beginPath(); ctx.arc(p.x*w, p.y*h, 3.5, 0, Math.PI*2); ctx.fill(); }
    if (move) {
      ctx.font = "bold 15px sans-serif"; ctx.fillStyle = c;
      ctx.fillText(`${EMOJI[move]} ${move}`, 8, 22);
    }
  }

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* TOP BAR */}
      <div className="border-b-2 border-foreground sticky top-0 z-40 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            rps<span className="text-accent italic">/</span>arena
          </h1>
          {round > 0 && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <ScoreBadge label="W" value={score.win}  cls="bg-primary text-foreground" />
              <ScoreBadge label="L" value={score.lose} cls="bg-foreground text-background" />
              <ScoreBadge label="D" value={score.draw} cls="bg-card border border-foreground" />
              <span className="text-foreground/50 font-serif italic">round {round}</span>
              {streak >= 3 && (
                <span className="font-serif italic text-accent">
                  {streak} streak 🔥
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-7">

        {/* ARENA */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_100px_1fr] gap-5 items-center">

          {/* PLAYER */}
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <div className="relative border-2 border-foreground bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b-2 border-foreground flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">You</span>
                <span className="text-[10px] text-foreground/50 font-serif italic">
                  {phase === "countdown" && detected ? `${EMOJI[detected]} ${detected}` : phase === "countdown" ? "waiting…" : ""}
                </span>
              </div>
              <div className="relative aspect-video bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                <video ref={previewRef} autoPlay playsInline muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]" />

                {/* BOOT */}
                {phase === "boot" && (
                  <div className="absolute inset-0 bg-card/92 flex flex-col items-center justify-center gap-4 p-6">
                    <span className="text-7xl">✊</span>
                    <p className="font-serif italic text-foreground/70 text-sm text-center">
                      Hold any gesture to play
                    </p>
                    <button type="button" onClick={init}
                      className="border-2 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors px-6 py-3 text-sm font-semibold">
                      Enable camera
                    </button>
                  </div>
                )}

                {/* LOADING */}
                {phase === "loading" && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={30} className="animate-spin text-primary" />
                    <span className="text-xs text-white/50">loading hand model…</span>
                  </div>
                )}

                {/* ERROR */}
                {phase === "error" && (
                  <div className="absolute inset-0 bg-card/92 flex flex-col items-center justify-center gap-3 p-6">
                    <AlertCircle size={28} className="text-destructive" />
                    <p className="text-sm text-center">{errorMsg}</p>
                    <button type="button" onClick={init}
                      className="border-2 border-foreground px-4 py-2 text-xs font-semibold hover:bg-primary transition-colors">
                      Retry
                    </button>
                  </div>
                )}

                {/* COUNTDOWN TIMER */}
                {phase === "countdown" && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                      <motion.div key={count}
                        initial={{ scale: 2.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-foreground text-background w-14 h-14 flex items-center justify-center border-2 border-background/20 font-serif text-2xl font-semibold tabular-nums">
                        {count <= 0 ? "!" : count}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {/* REVEAL RESULT */}
                {phase === "reveal" && (
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                    {playerMove ? (
                      <motion.div
                        initial={{ scale:0.3, opacity:0, rotate:-8 }}
                        animate={{ scale:1, opacity:1, rotate:0 }}
                        transition={{ type:"spring", stiffness:280, damping:20 }}>
                        <MoveCard move={playerMove} highlight={result === "win"} />
                      </motion.div>
                    ) : (
                      <div className="bg-card border-2 border-foreground px-4 py-2 font-serif italic text-sm">
                        no hand detected
                      </div>
                    )}
                    {detected && (
                      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                        className="text-[10px] text-white/55 font-serif italic">
                        hold any gesture → auto replay
                      </motion.p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VS + RESULT */}
          <div className="flex lg:flex-col items-center justify-center gap-4">
            <span className="text-2xl font-serif italic text-foreground/30 select-none">vs</span>
            <AnimatePresence>
              {phase === "reveal" && result && (
                <motion.div key="chip"
                  initial={{ scale:0, rotate:-15 }}
                  animate={{ scale:1, rotate:0 }}
                  exit={{ scale:0, opacity:0 }}
                  transition={{ type:"spring", stiffness:260, damping:18 }}>
                  <ResultChip result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI */}
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <div className="relative border-2 border-foreground bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b-2 border-foreground bg-foreground text-background flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">AI</span>
                <span className="text-[10px] opacity-50 font-serif italic">
                  {phase === "countdown" ? "thinking…" : ""}
                </span>
              </div>
              <div className="relative aspect-video flex items-center justify-center bg-foreground/5">
                {(phase === "boot" || phase === "loading" || phase === "error") && (
                  <span className="text-7xl opacity-20 select-none">?</span>
                )}
                {phase === "countdown" && <FlipperAI />}
                {phase === "reveal" && aiMove && (
                  <motion.div
                    initial={{ scale:0.3, opacity:0, rotate:8 }}
                    animate={{ scale:1, opacity:1, rotate:0 }}
                    transition={{ type:"spring", stiffness:280, damping:20, delay:0.1 }}>
                    <MoveCard move={aiMove} highlight={result === "lose"} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TRASH TALK */}
        <AnimatePresence>
          {trash && phase === "reveal" && (
            <motion.div key={trash}
              initial={{ opacity:0, y:14, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.35 }}
              className="relative">
              <div aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
              <div className="relative border-2 border-foreground bg-card px-5 py-4 flex items-center gap-3">
                <span className="text-3xl shrink-0">🤖</span>
                <p className="font-serif italic text-base text-foreground leading-snug">{trash}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GESTURE LEGEND */}
        <div className="grid grid-cols-3 gap-3 border-t-2 border-foreground/15 pt-6">
          {(["rock","paper","scissors"] as Move[]).map(m => (
            <div key={m} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl">{EMOJI[m]}</span>
              <span className="text-sm font-serif font-semibold capitalize">{m}</span>
              <span className="text-[11px] text-foreground/55 font-serif italic">
                {m === "rock" && "fist closed"}
                {m === "paper" && "all fingers open"}
                {m === "scissors" && "index + middle up"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────────── */

function MoveCard({ move, highlight = false }: { move: Move; highlight?: boolean }) {
  return (
    <div className={cn(
      "border-2 border-foreground px-6 py-4 flex flex-col items-center gap-2",
      highlight ? "bg-primary" : "bg-card"
    )}>
      <span className="text-5xl select-none">{EMOJI[move]}</span>
      <span className="text-sm font-serif font-semibold capitalize">{move}</span>
    </div>
  );
}

function ResultChip({ result }: { result: Result }) {
  const cls = result === "win"
    ? "bg-primary text-foreground"
    : result === "lose"
    ? "bg-foreground text-background"
    : "bg-card text-foreground";
  const labels = { win:"You win 🎉", lose:"AI wins 😈", draw:"Draw 🤝" };
  return (
    <div className={`px-3 py-1.5 border-2 border-foreground text-xs font-semibold text-center whitespace-nowrap ${cls}`}>
      {labels[result]}
    </div>
  );
}

function ScoreBadge({ label, value, cls }: { label:string; value:number; cls:string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 border border-foreground ${cls}`}>
      <span className="opacity-60 text-[10px]">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function FlipperAI() {
  const [idx, setIdx] = useState(0);
  const moves: Move[] = ["rock","paper","scissors"];
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1)%3), 220);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          initial={{ y:-12, opacity:0 }}
          animate={{ y:0, opacity:1 }}
          exit={{ y:12, opacity:0 }}
          transition={{ duration:0.1 }}
          className="text-7xl select-none">
          {EMOJI[moves[idx]]}
        </motion.span>
      </AnimatePresence>
      <span className="text-[10px] text-foreground/40 font-serif italic">deciding…</span>
    </div>
  );
}