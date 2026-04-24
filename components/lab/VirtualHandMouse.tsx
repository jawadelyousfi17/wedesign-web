"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Hand,
  MousePointer2,
  AlertCircle,
  Power,
} from "lucide-react";

/* dynamic script loader */
const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

/* ══════════════════════════════════════════════════════════════════ */
/*  GESTURE TYPES                                                     */
/* ══════════════════════════════════════════════════════════════════ */
type Gesture = "idle" | "point" | "pinch" | "scroll";

const GESTURE_LABEL: Record<Gesture, string> = {
  idle: "No hand detected",
  point: "Pointing",
  pinch: "Clicking",
  scroll: "Scrolling",
};

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN                                                              */
/* ══════════════════════════════════════════════════════════════════ */
export default function VirtualHandMouse() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gesture, setGesture] = useState<Gesture>("idle");
  const [clickCount, setClickCount] = useState(0);
  const [pinchStrength, setPinchStrength] = useState(0);

  /* refs for hot-path state (no re-renders during RAF loop) */
  const handsRef = useRef<any>(null);
  const runningRef = useRef(false);
  const rafRef = useRef<number>(0);

  /* smoothed cursor position (in stage coords) */
  const cursorPos = useRef({ x: 0, y: 0 });
  const targetCursorPos = useRef({ x: 0, y: 0 });

  /* gesture state machine */
  const pinchState = useRef<{ holding: boolean; lastClickAt: number }>({
    holding: false,
    lastClickAt: 0,
  });
  const scrollState = useRef<{ active: boolean; anchorY: number | null }>({
    active: false,
    anchorY: null,
  });

  /* ────────────────────────────────────────────────────────────── */
  /*  INIT                                                          */
  /* ────────────────────────────────────────────────────────────── */
  const initHands = async () => {
    setIsModelLoading(true);
    setError(null);
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");

      const hands = new (window as any).Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1, // right hand only
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      await startCamera();
    } catch (err) {
      console.error(err);
      setError("Couldn't load the hand model.");
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      /* center the cursor so it doesn't start in the corner */
      const stage = stageRef.current;
      if (stage) {
        cursorPos.current = {
          x: stage.clientWidth / 2,
          y: stage.clientHeight / 2,
        };
        targetCursorPos.current = { ...cursorPos.current };
      }

      setIsActive(true);
      setIsModelLoading(false);
      runningRef.current = true;
      loop();
    } catch (err) {
      console.error(err);
      setError("Camera access denied.");
      setIsModelLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  MAIN LOOP                                                     */
  /* ────────────────────────────────────────────────────────────── */
  const loop = async () => {
    if (!runningRef.current) return;
    const v = videoRef.current;
    const hands = handsRef.current;
    if (v && hands && v.readyState >= 2) {
      await hands.send({ image: v });
    }

    /* smooth the cursor toward its target */
    cursorPos.current.x +=
      (targetCursorPos.current.x - cursorPos.current.x) * 0.25;
    cursorPos.current.y +=
      (targetCursorPos.current.y - cursorPos.current.y) * 0.25;

    /* paint cursor */
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) translate(-50%, -50%)`;
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  GESTURE DETECTION ON EVERY RESULT                             */
  /* ────────────────────────────────────────────────────────────── */
  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const v = videoRef.current;
    if (!canvas || !stage || !v) return;

    const ctx = canvas.getContext("2d")!;
    if (canvas.width !== v.videoWidth && v.videoWidth > 0) {
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const landmarks = results.multiHandLandmarks?.[0];
    if (!landmarks) {
      setGesture("idle");
      setPinchStrength(0);
      scrollState.current.active = false;
      scrollState.current.anchorY = null;
      return;
    }

    /* ── key landmarks ─────────────────────────────────────────
       0  wrist            5  index MCP    9  middle MCP
       4  thumb tip        8  index tip   12  middle tip
       20 pinky tip
       ────────────────────────────────────────────────────────── */
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    /* ── finger extension booleans ────────────────────────────
       A finger is "extended" if its tip is above its PIP joint
       (i.e., smaller y in image space). MediaPipe y=0 is top.
       ────────────────────────────────────────────────────────── */
    const indexExtended = indexTip.y < indexPip.y - 0.02;
    const middleExtended = middleTip.y < middlePip.y - 0.02;
    const ringExtended = ringTip.y < ringPip.y - 0.02;
    const pinkyExtended = pinkyTip.y < pinkyPip.y - 0.02;

    /* ── pinch distance ──────────────────────────────────────── */
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const pinchDist = Math.hypot(dx, dy);
    /* reference distance — index finger length — to normalize
       across different users and distances to camera */
    const refDist = Math.hypot(
      indexMcp.x - indexTip.x,
      indexMcp.y - indexTip.y
    );
    const normPinch = refDist > 0 ? pinchDist / refDist : 1;
    const strength = Math.max(0, Math.min(1, 1 - normPinch / 0.5));
    setPinchStrength(strength);

    /* ── detect active gesture ───────────────────────────────── */
    const isScroll =
      indexExtended && middleExtended && !ringExtended && !pinkyExtended;
    const isPinching = normPinch < 0.35;

    let currentGesture: Gesture = "point";
    if (isScroll) {
      currentGesture = "scroll";
    } else if (isPinching) {
      currentGesture = "pinch";
    }
    setGesture(currentGesture);

    /* ── cursor target position (flip X because video is mirrored) ── */
    const stageRect = stage.getBoundingClientRect();
    /* use index finger as pointer when pointing/pinching,
       middle of index+middle when scrolling (more stable) */
    const pointer = isScroll
      ? {
          x: (indexTip.x + middleTip.x) / 2,
          y: (indexTip.y + middleTip.y) / 2,
        }
      : indexTip;

    const mappedX = (1 - pointer.x) * stageRect.width;
    const mappedY = pointer.y * stageRect.height;
    targetCursorPos.current = { x: mappedX, y: mappedY };

    /* ── CLICK handling (pinch release = click) ──────────────── */
    if (currentGesture === "pinch") {
      pinchState.current.holding = true;
    } else if (pinchState.current.holding) {
      /* released */
      pinchState.current.holding = false;
      const now = Date.now();
      if (now - pinchState.current.lastClickAt > 300) {
        pinchState.current.lastClickAt = now;
        fireClick(cursorPos.current.x, cursorPos.current.y, stageRect);
        setClickCount((c) => c + 1);
      }
    }

    /* ── SCROLL handling (peace sign + vertical movement) ────── */
    if (currentGesture === "scroll") {
      const handY = pointer.y; // 0 (top) → 1 (bottom)
      if (scrollState.current.anchorY === null) {
        scrollState.current.anchorY = handY;
      } else {
        const delta = handY - scrollState.current.anchorY;
        /* dead zone so tiny movements don't scroll */
        if (Math.abs(delta) > 0.05) {
          const scrollAmount = delta * 40; // tune sensitivity
          scrollTargetUnder(cursorPos.current.x, cursorPos.current.y, scrollAmount);
        }
      }
    } else {
      scrollState.current.anchorY = null;
    }

    /* ── DRAW SKELETON on camera canvas ───────────────────────── */
    drawSkeleton(ctx, landmarks, canvas.width, canvas.height, currentGesture);
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  CLICK — dispatch real click on the element under cursor       */
  /* ────────────────────────────────────────────────────────────── */
  const fireClick = (
    xInStage: number,
    yInStage: number,
    stageRect: DOMRect
  ) => {
    const pageX = stageRect.left + xInStage;
    const pageY = stageRect.top + yInStage;

    const target = document.elementFromPoint(pageX, pageY) as HTMLElement | null;
    if (!target) return;

    /* don't click the cursor itself or the skeleton canvas */
    if (
      target === cursorRef.current ||
      target.closest("[data-virtual-cursor]") ||
      target.tagName === "CANVAS"
    ) {
      return;
    }

    /* click ripple effect at cursor */
    createRipple(xInStage, yInStage);

    /* fire a real click event */
    target.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: pageX,
        clientY: pageY,
      })
    );
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  SCROLL — find scrollable ancestor under cursor and scroll it  */
  /* ────────────────────────────────────────────────────────────── */
  const scrollTargetUnder = (
    xInStage: number,
    yInStage: number,
    amount: number
  ) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const pageX = stageRect.left + xInStage;
    const pageY = stageRect.top + yInStage;

    let el = document.elementFromPoint(pageX, pageY) as HTMLElement | null;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        el.scrollBy({ top: amount, behavior: "auto" });
        return;
      }
      el = el.parentElement;
    }
    /* fall back to window */
    window.scrollBy({ top: amount, behavior: "auto" });
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  RIPPLE — visual feedback on click                             */
  /* ────────────────────────────────────────────────────────────── */
  const createRipple = (x: number, y: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const ripple = document.createElement("div");
    ripple.className =
      "absolute pointer-events-none rounded-full border-2 border-accent";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.transform = "translate(-50%, -50%) scale(0.4)";
    ripple.style.opacity = "1";
    ripple.style.transition =
      "transform 500ms cubic-bezier(0.22,1,0.36,1), opacity 500ms";
    ripple.style.zIndex = "100";
    stage.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "translate(-50%, -50%) scale(3)";
      ripple.style.opacity = "0";
    });
    setTimeout(() => ripple.remove(), 520);
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  SKELETON DRAW                                                 */
  /* ────────────────────────────────────────────────────────────── */
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    w: number,
    h: number,
    g: Gesture
  ) => {
    /* connections between landmarks for a hand skeleton */
    const CONNECTIONS = [
      // thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // middle
      [5, 9], [9, 10], [10, 11], [11, 12],
      // ring
      [9, 13], [13, 14], [14, 15], [15, 16],
      // pinky
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ];

    const color =
      g === "pinch"
        ? readAccent()
        : g === "scroll"
        ? readPrimary()
        : "rgba(255,255,255,0.85)";

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    /* bones */
    ctx.beginPath();
    for (const [a, b] of CONNECTIONS) {
      const pa = landmarks[a];
      const pb = landmarks[b];
      ctx.moveTo(pa.x * w, pa.y * h);
      ctx.lineTo(pb.x * w, pb.y * h);
    }
    ctx.stroke();

    /* joints */
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    /* highlight the index fingertip (the pointer) */
    const tip = landmarks[8];
    ctx.beginPath();
    ctx.arc(tip.x * w, tip.y * h, 10, 0, Math.PI * 2);
    ctx.strokeStyle = readAccent();
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  THEME COLOR HELPERS                                           */
  /* ────────────────────────────────────────────────────────────── */
  const readAccent = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim() || "#ff4d14";
  const readPrimary = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim() || "#d2ff00";

  /* ────────────────────────────────────────────────────────────── */
  /*  TERMINATE                                                     */
  /* ────────────────────────────────────────────────────────────── */
  const terminate = () => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    handsRef.current?.close();
    setIsActive(false);
    setGesture("idle");
    setPinchStrength(0);
    if (canvasRef.current) {
      canvasRef.current
        .getContext("2d")
        ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  useEffect(() => () => terminate(), []);

  /* ══════════════════════════════════════════════════════════════ */
  /*  RENDER                                                        */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="relative w-full" style={{ minHeight: "700px" }}>
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* ══ STAGE — where the virtual cursor lives ══════════════ */}
        <div
          ref={stageRef}
          className="relative bg-card border-2 border-foreground overflow-hidden"
          style={{ minHeight: "600px" }}
        >
          {/* start / loading / error screens */}
          {!isActive && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 bg-background/90 backdrop-blur-sm p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-3xl opacity-30 animate-pulse" />
                <Hand size={56} strokeWidth={1.5} className="relative z-10" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="font-serif italic text-4xl md:text-5xl tracking-tight">
                  Hand mouse.
                </h2>
                <p className="text-sm text-foreground/70 font-serif max-w-md">
                  Use your right hand as a pointer. Pinch to click, peace sign to
                  scroll.
                </p>
              </div>
              <button
                type="button"
                onClick={initHands}
                disabled={isModelLoading}
                className="group relative border-2 border-foreground bg-foreground text-background px-8 py-4 hover:bg-primary hover:text-foreground transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {isModelLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading model…
                  </>
                ) : (
                  <>
                    <Power size={16} strokeWidth={2.5} />
                    Enable camera
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-40 bg-card flex flex-col items-center justify-center gap-3 text-center p-8">
              <AlertCircle size={40} className="text-destructive" />
              <p className="text-sm text-foreground max-w-xs">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  initHands();
                }}
                className="mt-2 border-2 border-foreground px-5 py-2 text-sm font-semibold hover:bg-primary transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── CLICKABLE TARGETS (demo surface) ─────────────────── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 select-none">
            <h3 className="font-serif italic text-2xl md:text-3xl text-foreground/80 pointer-events-none">
              Try clicking these.
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TargetButton key={i} index={i} />
              ))}
            </div>

            <div className="mt-4 text-center text-sm text-foreground/60 font-serif italic">
              Clicks so far:{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {clickCount}
              </span>
            </div>

            {/* scrollable box */}
            <div
              className="w-full max-w-md h-32 overflow-y-auto border-2 border-foreground bg-card p-4 text-sm leading-relaxed"
              style={{ scrollbarWidth: "thin" }}
            >
              <p className="font-serif">
                Hold a peace sign (index + middle up) and move your hand up or
                down to scroll this box. It works on any scrollable element the
                virtual cursor is hovering over. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>

          {/* ── VIRTUAL CURSOR ────────────────────────────────────── */}
          {isActive && (
            <div
              ref={cursorRef}
              data-virtual-cursor
              className="absolute top-0 left-0 pointer-events-none z-50"
              style={{ willChange: "transform" }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                {/* outer ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 transition-all duration-200"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderColor:
                      gesture === "pinch"
                        ? "var(--color-accent)"
                        : gesture === "scroll"
                        ? "var(--color-primary)"
                        : "var(--color-foreground)",
                    transform: `scale(${gesture === "pinch" ? 0.7 : 1})`,
                    left: "-22px",
                    top: "-22px",
                    backgroundColor:
                      gesture === "pinch"
                        ? "color-mix(in oklab, var(--color-accent) 30%, transparent)"
                        : "transparent",
                  }}
                />
                {/* pinch-strength dot inside */}
                <div
                  className="absolute rounded-full bg-accent transition-all duration-75"
                  style={{
                    width: `${8 + pinchStrength * 12}px`,
                    height: `${8 + pinchStrength * 12}px`,
                    left: `${-(8 + pinchStrength * 12) / 2}px`,
                    top: `${-(8 + pinchStrength * 12) / 2}px`,
                    opacity: gesture === "pinch" ? 1 : 0.5,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ══ SIDE PANEL — camera preview + status ════════════════ */}
        <div className="flex flex-col gap-4">
          {/* camera preview */}
          <div className="relative w-full aspect-video border-2 border-foreground bg-[#050505] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover grayscale scale-x-[-1] transition-opacity ${
                isActive ? "opacity-40" : "opacity-0"
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1] ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <MousePointer2
                  size={32}
                  strokeWidth={1.5}
                  className="text-foreground/30"
                />
              </div>
            )}
          </div>

          {/* status panel */}
          <div className="border-2 border-foreground bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Gesture</span>
              <span
                className={`text-sm font-semibold ${
                  gesture === "pinch"
                    ? "text-accent"
                    : gesture === "scroll"
                    ? "text-foreground"
                    : "text-foreground/70"
                }`}
              >
                {GESTURE_LABEL[gesture]}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Pinch</span>
              <div className="w-24 h-1.5 bg-foreground/15 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-100"
                  style={{ width: `${pinchStrength * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Clicks</span>
              <span className="text-sm font-semibold tabular-nums">
                {clickCount}
              </span>
            </div>

            {isActive && (
              <button
                type="button"
                onClick={terminate}
                className="mt-2 border-2 border-foreground bg-card hover:bg-destructive hover:text-background hover:border-destructive transition-colors py-2 text-xs font-semibold"
              >
                Stop camera
              </button>
            )}
          </div>

          {/* gesture legend */}
          <div className="border-2 border-foreground/30 bg-card/60 p-4 flex flex-col gap-3 text-xs">
            <Legend symbol="☝︎" label="Point" description="Index finger up" />
            <Legend
              symbol="✌︎"
              label="Scroll"
              description="Peace sign + move hand vertically"
            />
            <Legend
              symbol="🤏"
              label="Click"
              description="Pinch thumb + index, then release"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  TARGET BUTTON — demo click target, counts its own hits            */
/* ══════════════════════════════════════════════════════════════════ */
function TargetButton({ index }: { index: number }) {
  const [hits, setHits] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setHits((h) => h + 1)}
      className="w-24 h-24 md:w-28 md:h-28 border-2 border-foreground bg-card hover:bg-primary focus:bg-primary active:bg-accent transition-colors flex flex-col items-center justify-center gap-1 font-serif"
    >
      <span className="text-3xl font-semibold tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-foreground/60">
        {hits === 0 ? "click me" : `${hits} hit${hits > 1 ? "s" : ""}`}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  LEGEND ROW                                                        */
/* ══════════════════════════════════════════════════════════════════ */
function Legend({
  symbol,
  label,
  description,
}: {
  symbol: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg leading-none shrink-0">{symbol}</span>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold">{label}</span>
        <span className="text-foreground/60 text-[11px]">{description}</span>
      </div>
    </div>
  );
}
