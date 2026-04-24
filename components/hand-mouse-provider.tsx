"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Hand,
  Loader2,
  Power,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Terminal,
  Bug,
} from "lucide-react";

type Gesture = "idle" | "point" | "pinch" | "scroll";

const GESTURE_LABEL: Record<Gesture, string> = {
  idle: "Show your hand",
  point: "Pointing",
  pinch: "Clicking",
  scroll: "Scrolling",
};

const STORAGE_KEY = "wd-hand-mouse-panel";
const OVERLAY_ATTR = "data-hand-mouse-overlay";

type LogLevel = "info" | "ok" | "warn" | "err";
interface LogEntry {
  id: number;
  t: number;
  level: LogLevel;
  msg: string;
}

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true }
      );
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

export default function VirtualMouse() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── cursor is a raw DOM div — we drive it with style.left / style.top ── */
  const cursorDotRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [gesture, setGesture] = useState<Gesture>("idle");
  const [pinchStrength, setPinchStrength] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [videoReady, setVideoReady] = useState(false);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [scrollDir, setScrollDir] = useState<"up" | "down" | null>(null);
  const scrollDirTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debugCoords, setDebugCoords] = useState({ x: 0, y: 0 });

  const handsRef = useRef<any>(null);
  const runningRef = useRef(false);
  const isInitLocked = useRef(false);
  const rafRef = useRef<number>(0);

  const cursorPos = useRef({ x: -100, y: -100 }); 
  const targetPos = useRef({ x: -100, y: -100 });

  const pinchState = useRef<{ holding: boolean; lastClickAt: number }>({
    holding: false,
    lastClickAt: 0,
  });
  
  // Cleaned up scroll state for 1:1 proportional drag
  const scrollState = useRef<{ anchorY: number | null }>({ anchorY: null });
  
  const lastHandSeenAt = useRef(0);
  const frameTimes = useRef<number[]>([]);
  const logIdRef = useRef(0);
  const framesRef = useRef(0);
  const firstFrameReceivedRef = useRef(false);
  const gestureRef = useRef<Gesture>("idle");

  const showDebugRef = useRef(showDebug);
  useEffect(() => {
    showDebugRef.current = showDebug;
  }, [showDebug]);

  const log = useCallback((level: LogLevel, msg: string) => {
    const entry: LogEntry = { id: logIdRef.current++, t: Date.now(), level, msg };
    setLogs((l) => [...l, entry].slice(-50));
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.expanded === "boolean") setExpanded(p.expanded);
        if (typeof p.showLogs === "boolean") setShowLogs(p.showLogs);
        if (typeof p.showDebug === "boolean") setShowDebug(p.showDebug);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ expanded, showLogs, showDebug }));
    } catch {}
  }, [expanded, showLogs, showDebug, mounted]);

  useEffect(() => {
    document.body.style.cursor = isActive ? "none" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [isActive]);

  const enable = useCallback(async () => {
    if (isInitLocked.current) return;
    isInitLocked.current = true;

    setIsLoading(true);
    setError(null);
    setVideoReady(false);
    setFramesProcessed(0);
    framesRef.current = 0;
    firstFrameReceivedRef.current = false;
    log("info", "Enable requested");

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("No getUserMedia API");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      log("ok", `Camera granted`);

      if (!videoRef.current) throw new Error("Video element not mounted");
      videoRef.current.srcObject = stream;

      await videoRef.current.play();
      await new Promise<void>((res, rej) => {
        const v = videoRef.current!;
        if (v.readyState >= 2) return res();
        const onReady = () => { v.removeEventListener("loadeddata", onReady); res(); };
        v.addEventListener("loadeddata", onReady);
        setTimeout(() => rej(new Error("Video timeout (5s)")), 5000);
      });
      setVideoReady(true);

      log("info", "Loading MediaPipe script…");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      if (!(window as any).Hands) throw new Error("window.Hands is undefined");

      const hands = new (window as any).Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      hands.onResults(onResults);
      handsRef.current = hands;

      await hands.send({ image: videoRef.current });

      cursorPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      targetPos.current = { ...cursorPos.current };

      setIsActive(true);
      setIsLoading(false);
      runningRef.current = true;
      loop();
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError" ? "Camera access denied." : err?.message || "Couldn't start.";
      log("err", msg);
      setError(msg);
      setIsLoading(false);
      isInitLocked.current = false;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [log]);

  const disable = useCallback(() => {
    log("info", "Stopping…");
    runningRef.current = false;
    isInitLocked.current = false;
    cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    try { handsRef.current?.close(); } catch {}
    handsRef.current = null;
    setIsActive(false);
    setVideoReady(false);
    setGesture("idle");
    setPinchStrength(0);
    cursorPos.current = { x: -100, y: -100 };
    if (cursorDotRef.current) cursorDotRef.current.style.opacity = "0";
    if (canvasRef.current) canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [log]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        if (isActive) disable();
        else enable();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, enable, disable]);

  useEffect(() => () => disable(), [disable]);

  const loop = async () => {
    if (!runningRef.current) return;
    const now = performance.now();

    frameTimes.current.push(now);
    while (frameTimes.current[0] < now - 1000) frameTimes.current.shift();
    setFps(frameTimes.current.length);

    const v = videoRef.current;
    const hands = handsRef.current;
    if (v && hands && v.readyState >= 2 && v.videoWidth > 0) {
      try {
        await hands.send({ image: v });
        framesRef.current++;
        if (framesRef.current % 30 === 0) setFramesProcessed(framesRef.current);
      } catch (e) {
        log("err", `send failed: ${e}`);
      }
    }

    cursorPos.current.x += (targetPos.current.x - cursorPos.current.x) * 0.22;
    cursorPos.current.y += (targetPos.current.y - cursorPos.current.y) * 0.22;

    const cx = Math.round(cursorPos.current.x);
    const cy = Math.round(cursorPos.current.y);

    const dot = cursorDotRef.current;
    if (dot) {
      const idleFor = now - lastHandSeenAt.current;
      const visible = idleFor < 800;
      dot.style.opacity = visible ? "1" : "0";
      dot.style.left = `${cx}px`;
      dot.style.top = `${cy}px`;
    }

    if (showDebugRef.current) {
      setDebugCoords({ x: cx, y: cy });
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  const onResults = (results: any) => {
    if (!runningRef.current) return;

    if (!firstFrameReceivedRef.current) {
      firstFrameReceivedRef.current = true;
      log("ok", "First result from model ✓");
    }

    const canvas = canvasRef.current;
    const v = videoRef.current;
    if (!canvas || !v) return;
    const ctx = canvas.getContext("2d")!;
    if (canvas.width !== v.videoWidth && v.videoWidth > 0) {
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const landmarks = results.multiHandLandmarks?.[0];
    if (!landmarks) {
      setGesture("idle");
      gestureRef.current = "idle";
      setPinchStrength(0);
      scrollState.current.anchorY = null;
      return;
    }

    lastHandSeenAt.current = performance.now();

    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexTip = landmarks[8];
    const middlePip = landmarks[10];
    const middleTip = landmarks[12];
    const ringPip = landmarks[14];
    const ringTip = landmarks[16];
    const pinkyPip = landmarks[18];
    const pinkyTip = landmarks[20];

    const indexExt = indexTip.y < indexPip.y - 0.02;
    const middleExt = middleTip.y < middlePip.y - 0.02;
    const ringExt = ringTip.y < ringPip.y - 0.02;
    const pinkyExt = pinkyTip.y < pinkyPip.y - 0.02;

    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const refDist = Math.hypot(indexMcp.x - indexTip.x, indexMcp.y - indexTip.y);
    const normPinch = refDist > 0 ? pinchDist / refDist : 1;
    const strength = Math.max(0, Math.min(1, 1 - normPinch / 0.5));
    setPinchStrength(strength);

    const isScroll = indexExt && middleExt && !ringExt && !pinkyExt; // Peace sign
    const isPinching = normPinch < 0.35;

    const g: Gesture = isScroll ? "scroll" : isPinching ? "pinch" : "point";
    setGesture(g);
    gestureRef.current = g;

    const pointer = isScroll
      ? { x: (indexTip.x + middleTip.x) / 2, y: (indexTip.y + middleTip.y) / 2 }
      : indexTip;

    const MARGIN = 0.08;
    const nx = Math.max(0, Math.min(1, (1 - pointer.x - MARGIN) / (1 - MARGIN * 2)));
    const ny = Math.max(0, Math.min(1, (pointer.y - MARGIN) / (1 - MARGIN * 2)));
    
    // Only update position if NOT scrolling. 
    // This locks the cursor in place while you scroll so it feels stable.
    if (!isScroll) {
        targetPos.current = {
          x: nx * window.innerWidth,
          y: ny * window.innerHeight,
        };
    }

    /* ── CLICK GESTURE ── */
    if (g === "pinch") {
      pinchState.current.holding = true;
    } else if (pinchState.current.holding) {
      pinchState.current.holding = false;
      const now = Date.now();
      if (now - pinchState.current.lastClickAt > 250) {
        pinchState.current.lastClickAt = now;
        fireClick(cursorPos.current.x, cursorPos.current.y);
        setClickCount((c) => c + 1);
      }
    }

    /* ── DIRECT DRAG SCROLL GESTURE ── 
       1:1 proportional drag. Move hand up = scroll page down. */
    if (g === "scroll") {
      const handY = pointer.y; 
      
      if (scrollState.current.anchorY === null) {
        // Lock the anchor on the first frame of the scroll gesture
        scrollState.current.anchorY = handY;
      } else {
        const deltaY = handY - scrollState.current.anchorY;
        
        // Apply a tiny deadzone to prevent jitter
        if (Math.abs(deltaY) > 0.003) {
          // Multiplier: how many pixels per viewport height unit
          // 2500 makes a small hand movement cover the screen nicely
          const scrollAmount = deltaY * 2500; 
          scrollUnder(cursorPos.current.x, cursorPos.current.y, scrollAmount);
          
          // Reset the anchor to the current position to allow continuous scrolling
          scrollState.current.anchorY = handY;

          // Visual Feedback
          const dir = deltaY > 0 ? "down" : "up";
          if (scrollDirTimerRef.current) clearTimeout(scrollDirTimerRef.current);
          setScrollDir(dir);
          scrollDirTimerRef.current = setTimeout(() => setScrollDir(null), 300);
        }
      }
    } else {
      // Clear anchor when peace sign is dropped
      scrollState.current.anchorY = null;
    }

    drawSkeleton(ctx, landmarks, canvas.width, canvas.height, g, pointer);
  };

  const fireClick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el || el.closest(`[${OVERLAY_ATTR}]`)) return;
    ripple(x, y);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.focus();
  };

  const scrollUnder = (x: number, y: number, amount: number) => {
    let el = document.elementFromPoint(x, y) as HTMLElement | null;
    let scrolled = false;
    
    // Bubble up to find the nearest scrollable container
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.closest(`[${OVERLAY_ATTR}]`)) break;
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) {
        el.scrollBy({ top: amount });
        scrolled = true;
        break;
      }
      el = el.parentElement;
    }
    
    // Fallback to window scroll if no internal container is scrollable
    if (!scrolled) window.scrollBy({ top: amount });
  };

  const ripple = (x: number, y: number) => {
    const r = document.createElement("div");
    r.setAttribute(OVERLAY_ATTR, "");
    Object.assign(r.style, {
      position: "fixed", left: `${x}px`, top: `${y}px`, width: "20px", height: "20px",
      borderRadius: "9999px", border: "2px solid var(--color-accent, #ff4d14)",
      transform: "translate(-50%, -50%) scale(0.4)", opacity: "1", pointerEvents: "none",
      zIndex: "2147483646", transition: "transform 500ms cubic-bezier(.22,1,.36,1), opacity 500ms",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transform = "translate(-50%, -50%) scale(3.5)";
      r.style.opacity = "0";
    });
    setTimeout(() => r.remove(), 520);
  };

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number, g: Gesture, pointer: { x: number; y: number }
  ) => {
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16], [13,17],[17,18],[18,19],[19,20], [0,17],
    ];
    const color = g === "pinch" ? readCss("--color-accent", "#ff4d14") : g === "scroll" ? readCss("--color-primary", "#d2ff00") : "rgba(80,255,160,0.95)";

    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const [a, b] of CONNECTIONS) {
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
    }
    ctx.stroke();
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (showDebugRef.current) {
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const lm of landmarks) {
        minX = Math.min(minX, lm.x); maxX = Math.max(maxX, lm.x);
        minY = Math.min(minY, lm.y); maxY = Math.max(maxY, lm.y);
      }
      ctx.strokeStyle = "rgba(255,255,0,0.7)"; ctx.lineWidth = 1;
      ctx.strokeRect(minX * w - 8, minY * h - 8, (maxX - minX) * w + 16, (maxY - minY) * h + 16);

      ctx.fillStyle = "white"; ctx.font = "10px monospace";
      landmarks.forEach((lm, i) => ctx.fillText(String(i), lm.x * w + 5, lm.y * h - 3));

      ctx.strokeStyle = "red"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pointer.x * w - 12, pointer.y * h); ctx.lineTo(pointer.x * w + 12, pointer.y * h);
      ctx.moveTo(pointer.x * w, pointer.y * h - 12); ctx.lineTo(pointer.x * w, pointer.y * h + 12);
      ctx.stroke();
    }
  };

  if (!mounted) return null;
  const showPanel = isActive || isLoading || videoReady;

  return (
    <>
      <div {...{ [OVERLAY_ATTR]: "" }} style={{ position: "fixed", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}>
        <video ref={videoRef} autoPlay playsInline muted />
      </div>

      {isActive && (
        <div
          ref={cursorDotRef}
          {...{ [OVERLAY_ATTR]: "" }}
          style={{
            position: "fixed", left: `${cursorPos.current.x}px`, top: `${cursorPos.current.y}px`,
            transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 99999, opacity: 0,
            transition: "opacity 200ms ease-out", willChange: "left, top",
          }}
        >
          <HandCursor gesture={gesture} strength={pinchStrength} />
        </div>
      )}

      <div {...{ [OVERLAY_ATTR]: "" }} style={{ position: "fixed", right: 16, bottom: 16, zIndex: 2147483645 }} className="font-sans">
        {!showPanel && !error && (
          <button
            type="button" onClick={enable} disabled={isLoading}
            className="group flex items-center gap-2 border-2 border-foreground bg-card hover:bg-primary px-3 py-2 shadow-[3px_3px_0_var(--color-foreground)] transition-colors disabled:opacity-60"
            title="Enable hand control (Ctrl+Shift+H)"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Hand size={14} strokeWidth={2.5} />}
            <span className="text-xs font-semibold">{isLoading ? "Starting…" : "Hand control"}</span>
          </button>
        )}

        {error && !isActive && (
          <div className="flex flex-col gap-2 border-2 border-destructive bg-card p-3 shadow-[3px_3px_0_var(--color-destructive)] w-[340px]">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
              <span className="text-xs text-foreground flex-1">{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-foreground/60 hover:text-foreground">
                <X size={12} />
              </button>
            </div>
            <LogPanel logs={logs} />
            <button type="button" onClick={() => { setError(null); enable(); }} className="w-full border-2 border-foreground bg-card hover:bg-primary transition-colors py-1.5 text-xs font-semibold">
              Retry
            </button>
          </div>
        )}

        {showPanel && !error && (
          <div className="border-2 border-foreground bg-card shadow-[3px_3px_0_var(--color-foreground)] overflow-hidden w-[340px]">
            <button
              type="button" onClick={() => setExpanded((e) => !e)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: gesture === "pinch" ? "var(--color-accent)" : gesture === "scroll" ? "var(--color-primary)" : "#4ade80" }} />
                    <span className="relative rounded-full h-2 w-2" style={{ background: gesture === "pinch" ? "var(--color-accent)" : gesture === "scroll" ? "var(--color-primary)" : "#4ade80" }} />
                  </span>
                )}
                <span className="text-xs font-semibold truncate">
                  {isLoading ? "Starting…" : GESTURE_LABEL[gesture]}
                </span>
              </div>
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            {expanded && (
              <div className="flex flex-col gap-3 p-3">
                <div className="relative w-full aspect-video bg-black overflow-hidden border-2 border-foreground">
                  <LivePreviewVideo sourceRef={videoRef} />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]" />
                  {!videoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-[10px] uppercase tracking-wider opacity-70">Waiting for camera…</span>
                      </div>
                    </div>
                  )}
                  {showDebug && (
                    <div className="absolute top-2 left-2 bg-black/70 text-[#4ade80] font-mono text-[10px] px-2 py-1 pointer-events-none">
                      {debugCoords.x}px · {debugCoords.y}px
                    </div>
                  )}
                  {scrollDir && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-150" style={{ color: "var(--color-primary, #d2ff00)" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" style={{ transform: scrollDir === "up" ? "none" : "rotate(180deg)", filter: "drop-shadow(0 0 6px currentColor)" }}>
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <span className="text-[9px] font-mono uppercase tracking-widest">{scrollDir === "up" ? "scroll up" : "scroll down"}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <Stat label="Pinch" value={`${Math.round(pinchStrength * 100)}%`} active={gesture === "pinch"} />
                  <Stat label="Clicks" value={clickCount.toString()} />
                  <Stat label="FPS" value={fps.toString()} />
                  <Stat label="Frames" value={framesProcessed >= 1000 ? `${(framesProcessed / 1000).toFixed(1)}k` : framesProcessed.toString()} />
                </div>

                <div className="flex items-center justify-between border-t border-foreground/15 pt-2">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setShowLogs((v) => !v)} className={`flex items-center gap-1.5 text-[10px] transition-colors ${showLogs ? "text-foreground" : "text-foreground/60 hover:text-foreground"}`}>
                      <Terminal size={11} /> Logs
                    </button>
                    <button type="button" onClick={() => setShowDebug((v) => !v)} className={`flex items-center gap-1.5 text-[10px] transition-colors ${showDebug ? "text-accent" : "text-foreground/60 hover:text-foreground"}`}>
                      <Bug size={11} /> Debug
                    </button>
                  </div>
                  <span className="text-[10px] text-foreground/50 tabular-nums">
                    {logs.length} event{logs.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {showLogs && <LogPanel logs={logs} />}

                <div className="flex flex-col gap-1 text-[10px] border-t border-foreground/15 pt-2">
                  <LegendRow symbol="☝︎" label="Point" hint="Index finger up" />
                  <LegendRow symbol="🤏" label="Click" hint="Pinch + release" />
                  <LegendRow symbol="✌︎" label="Scroll" hint="Peace sign + drag up/down" />
                </div>

                <button type="button" onClick={disable} className="w-full border-2 border-foreground bg-card hover:bg-destructive hover:text-background hover:border-destructive transition-colors py-2 text-xs font-semibold flex items-center justify-center gap-2">
                  <Power size={12} strokeWidth={2.5} /> Stop (Ctrl+Shift+H)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function LivePreviewVideo({ sourceRef }: { sourceRef: React.RefObject<HTMLVideoElement | null> }) {
  const localRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const sync = () => {
      const src = sourceRef.current;
      const local = localRef.current;
      if (src?.srcObject && local && local.srcObject !== src.srcObject) {
        local.srcObject = src.srcObject;
        local.play().catch(() => {});
      } else if (!src?.srcObject && local?.srcObject) {
        local.srcObject = null;
      }
    };
    sync();
    const t = setInterval(sync, 500);
    return () => clearInterval(t);
  }, [sourceRef]);
  return <video ref={localRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />;
}

function LogPanel({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  const color = (l: LogLevel) => l === "ok" ? "text-[#4ade80]" : l === "warn" ? "text-[#facc15]" : l === "err" ? "text-destructive" : "text-foreground/70";
  const tag = (l: LogLevel) => l === "ok" ? "OK " : l === "warn" ? "WRN" : l === "err" ? "ERR" : "...";
  const fmt = (t: number) => { const d = new Date(t); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; };
  return (
    <div ref={ref} className="bg-black border border-foreground/20 p-2 max-h-36 overflow-y-auto font-mono text-[10px] leading-snug flex flex-col gap-0.5">
      {logs.length === 0 ? <span className="text-foreground/40">waiting…</span> : logs.map((l) => (
        <div key={l.id} className="flex gap-2 min-w-0">
          <span className="text-foreground/40 shrink-0">{fmt(l.t)}</span>
          <span className={`shrink-0 ${color(l.level)}`}>{tag(l.level)}</span>
          <span className="text-white/90 break-all">{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

function HandCursor({ gesture, strength }: { gesture: Gesture; strength: number }) {
  const fillColor = gesture === "pinch" ? "var(--color-accent, #ff4d14)" : gesture === "scroll" ? "var(--color-primary, #d2ff00)" : "var(--color-accent, #ff4d14)";
  const scale = gesture === "pinch" ? 0.75 : 1;
  const dot = 8 + strength * 14;
  const shadow = "drop-shadow(0 0 3px rgba(0,0,0,0.9)) drop-shadow(0 1px 6px rgba(0,0,0,0.6))";
  return (
    <div style={{ position: "relative", width: 0, height: 0, filter: shadow }}>
      <div style={{ position: "absolute", width: 40, height: 40, left: -20, top: -20, borderRadius: "9999px", border: "2.5px solid rgba(0,0,0,0.85)", outline: `2px solid ${fillColor}`, outlineOffset: "-4px", transform: `scale(${scale})`, backgroundColor: gesture === "pinch" ? "color-mix(in oklab, var(--color-accent, #ff4d14) 35%, transparent)" : "rgba(0,0,0,0.12)", transition: "transform 150ms ease-out, background-color 150ms" }} />
      <div style={{ position: "absolute", width: dot, height: dot, left: -(dot / 2), top: -(dot / 2), borderRadius: "9999px", background: fillColor, border: "1.5px solid rgba(0,0,0,0.7)", opacity: 1, transition: "width 80ms, height 80ms, left 80ms, top 80ms" }} />
    </div>
  );
}

function Stat({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`flex flex-col border-2 py-1 px-1 ${active ? "border-accent bg-accent/10" : "border-foreground/15"}`}>
      <span className={`text-xs font-semibold tabular-nums ${active ? "text-accent" : "text-foreground"}`}>{value}</span>
      <span className="text-[8px] text-foreground/60 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function LegendRow({ symbol, label, hint }: { symbol: string; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-4 shrink-0 text-center">{symbol}</span>
      <span className="font-semibold w-10 shrink-0">{label}</span>
      <span className="text-foreground/60">{hint}</span>
    </div>
  );
}

function readCss(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}