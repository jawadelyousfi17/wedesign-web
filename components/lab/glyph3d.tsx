"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════════
 *  KINETIC GLYPHS — a 3D field of instanced typography that reacts
 *  to the cursor as a magnetic force. Glyphs near the mouse rise
 *  toward the camera and glow in the accent color; glyphs far away
 *  stay dim and flat.
 * ══════════════════════════════════════════════════════════════════ */

const GRID_X = 32;
const GRID_Y = 18;
const SPACING = 1.1;
const GLYPHS = ["/", "\\", "-", "|", "+", "*", ".", "0", "1", "✷", "#", ";"];

/* build a canvas atlas: each glyph rendered into a cell of a square atlas */
function buildGlyphAtlas(
  glyphs: string[],
  cellSize = 128,
  color = "#ffffff"
): { texture: THREE.Texture; cols: number } {
  const cols = Math.ceil(Math.sqrt(glyphs.length));
  const size = cols * cellSize;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(cellSize * 0.75)}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  glyphs.forEach((g, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellSize + cellSize / 2;
    const cy = row * cellSize + cellSize / 2;
    ctx.fillText(g, cx, cy);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return { texture, cols };
}

/* read a CSS variable, falling back to a default */
function readCssColor(varName: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return new THREE.Color(fallback);
  try {
    return new THREE.Color(raw);
  } catch {
    return new THREE.Color(fallback);
  }
}

export default function KineticGlyphs({
  height = "80vh",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ────────────────────────────────────────────────────────── */
    /*  SCENE / CAMERA / RENDERER                                 */
    /* ────────────────────────────────────────────────────────── */
    const accent = readCssColor("--color-accent", "#ff4d14");
    const foreground = readCssColor("--color-foreground", "#0a0a0a");

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* ────────────────────────────────────────────────────────── */
    /*  GLYPH ATLAS → SHARED TEXTURE                              */
    /* ────────────────────────────────────────────────────────── */
    const { texture: atlas, cols: atlasCols } = buildGlyphAtlas(GLYPHS);

    /* ────────────────────────────────────────────────────────── */
    /*  INSTANCED PLANE — one tiny quad per grid cell             */
    /* ────────────────────────────────────────────────────────── */
    const COUNT = GRID_X * GRID_Y;
    const geometry = new THREE.PlaneGeometry(0.8, 0.8);

    /* per-instance attributes */
    const offsets = new Float32Array(COUNT * 3);
    const uvOffsets = new Float32Array(COUNT * 2);
    const wobble = new Float32Array(COUNT); // random phase so motion isn't synced

    for (let y = 0; y < GRID_Y; y++) {
      for (let x = 0; x < GRID_X; x++) {
        const i = y * GRID_X + x;
        offsets[i * 3 + 0] = (x - (GRID_X - 1) / 2) * SPACING;
        offsets[i * 3 + 1] = (y - (GRID_Y - 1) / 2) * SPACING;
        offsets[i * 3 + 2] = 0;

        const glyphIndex = (x + y) % GLYPHS.length;
        const gCol = glyphIndex % atlasCols;
        const gRow = Math.floor(glyphIndex / atlasCols);
        uvOffsets[i * 2 + 0] = gCol / atlasCols;
        uvOffsets[i * 2 + 1] = 1 - (gRow + 1) / atlasCols;

        wobble[i] = Math.random() * Math.PI * 2;
      }
    }

    const instanced = new THREE.InstancedBufferGeometry().copy(
      geometry as any
    ) as THREE.InstancedBufferGeometry;
    instanced.instanceCount = COUNT;
    instanced.setAttribute(
      "iOffset",
      new THREE.InstancedBufferAttribute(offsets, 3)
    );
    instanced.setAttribute(
      "iUV",
      new THREE.InstancedBufferAttribute(uvOffsets, 2)
    );
    instanced.setAttribute(
      "iWobble",
      new THREE.InstancedBufferAttribute(wobble, 1)
    );

    /* shader material — displaces instances by mouse influence + time */
    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseInside: { value: 0 },
      uAtlas: { value: atlas },
      uAtlasCols: { value: atlasCols },
      uAccent: { value: new THREE.Color(accent) },
      uBase: { value: new THREE.Color(foreground) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMouseInside;

        attribute vec3 iOffset;
        attribute vec2 iUV;
        attribute float iWobble;

        varying vec2 vUv;
        varying vec2 vAtlasBase;
        varying float vDistance;
        varying float vDepth;

        void main() {
          vUv = uv;
          vAtlasBase = iUV;

          // distance from this instance's grid position to the mouse
          vec2 p2d = iOffset.xy;
          float dist = length(p2d - uMouse);
          vDistance = dist;

          // falloff — closer = stronger push
          float influence = smoothstep(8.0, 0.0, dist) * uMouseInside;

          // gentle ambient wobble so the field breathes
          float breath = sin(uTime * 0.8 + iWobble) * 0.15;

          // z-offset: instances near cursor rise toward camera
          vec3 pos = iOffset;
          pos.z += influence * 3.5 + breath;

          // subtle horizontal nudge — pushed outward from cursor, like magnets
          vec2 push = normalize(p2d - uMouse + 0.0001) * influence * 0.6;
          pos.xy += push;

          vDepth = pos.z;

          vec3 transformed = position + pos;
          gl_Position = projectionMatrix * viewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uAtlas;
        uniform float uAtlasCols;
        uniform vec3 uAccent;
        uniform vec3 uBase;

        varying vec2 vUv;
        varying vec2 vAtlasBase;
        varying float vDistance;
        varying float vDepth;

        void main() {
          // sample this instance's glyph from the atlas
          vec2 atlasUv = vAtlasBase + vUv / uAtlasCols;
          vec4 glyph = texture2D(uAtlas, atlasUv);

          // base opacity derived from distance — far = dim, near = bright
          float proximity = smoothstep(8.0, 0.0, vDistance);
          float depthGlow = smoothstep(0.0, 3.0, vDepth);

          // colour mix: base foreground → accent as it rises
          vec3 col = mix(uBase, uAccent, depthGlow);

          // alpha: the glyph's own alpha × distance falloff
          float alpha = glyph.a * (0.18 + proximity * 0.82);

          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(instanced, material);
    scene.add(mesh);

    /* ────────────────────────────────────────────────────────── */
    /*  MOUSE → PLANE PROJECTION                                  */
    /*  convert pointer to world-space on the z=0 plane so the    */
    /*  shader can compute real distance from the cursor          */
    /* ────────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3();
    const mouseWorld = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();

    let mouseInside = 0;
    let targetMouseInside = 0;

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(targetPlane, hitPoint);
      targetMouse.set(hitPoint.x, hitPoint.y);
      targetMouseInside = 1;
    };
    const onLeave = () => {
      targetMouseInside = 0;
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerenter", onMove);
    container.addEventListener("pointerleave", onLeave);

    /* ────────────────────────────────────────────────────────── */
    /*  RESIZE                                                    */
    /* ────────────────────────────────────────────────────────── */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    /* ────────────────────────────────────────────────────────── */
    /*  ANIMATION LOOP                                            */
    /* ────────────────────────────────────────────────────────── */
    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const t = clock.getElapsedTime();

      // ease mouse + inside-flag toward targets
      mouseWorld.x += (targetMouse.x - mouseWorld.x) * 0.12;
      mouseWorld.y += (targetMouse.y - mouseWorld.y) * 0.12;
      mouseInside += (targetMouseInside - mouseInside) * 0.08;

      uniforms.uTime.value = t;
      uniforms.uMouse.value.copy(mouseWorld);
      uniforms.uMouseInside.value = mouseInside;

      // slow overall rotation — keeps the field alive even without mouse
      mesh.rotation.y = Math.sin(t * 0.15) * 0.08;
      mesh.rotation.x = Math.cos(t * 0.12) * 0.05;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    /* ────────────────────────────────────────────────────────── */
    /*  CLEANUP                                                   */
    /* ────────────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerenter", onMove);
      container.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      atlas.dispose();
      instanced.dispose();
      material.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full border-2 border-foreground bg-card overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* offset ink shadow (sits behind the canvas via the parent's ::before if you want; kept internal for portability) */}
      {/* overlay text — sits above the canvas */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10 z-10">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs uppercase tracking-[0.3em] text-foreground/60">
            Move your cursor
          </span>
          <span className="text-xs font-serif italic text-foreground/60">
            a kinetic field
          </span>
        </div>

        <h2
          className="font-serif font-semibold tracking-tighter leading-[0.85] text-foreground"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
        >
          we move{" "}
          <span className="italic text-accent">things</span>.
        </h2>
      </div>
    </div>
  );
}