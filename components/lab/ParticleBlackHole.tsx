"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 70_000;

const vertexShader = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aY;
  attribute float aPhase;

  uniform float uTime;
  uniform vec3  uMouse3D;

  varying float vProgress;

  void main() {
    // progress: 0 = outer edge, 1 = event horizon, then resets
    float progress = fract(uTime * aSpeed * 0.022 + aPhase);
    vProgress = progress;

    // Ease-in: particles accelerate as they fall inward
    float ep = progress * progress * (3.0 - 2.0 * progress);

    float r     = aRadius * (1.0 - ep * 0.90);
    float angle = aAngle + uTime * aSpeed * (1.0 + ep * 2.5);

    float x = cos(angle) * r;
    float z = sin(angle) * r;
    float y = aY * (1.0 - ep * 0.96);

    vec3 pos = vec3(x, y, z);

    // Mouse attraction — pulls particles toward cursor on XZ plane
    vec3 toMouse = uMouse3D - pos;
    float md = length(toMouse);
    if (md < 6.0 && md > 0.05) {
      pos += normalize(toMouse) * (0.7 / (md + 0.4));
    }

    vec4 mvPos    = modelViewMatrix * vec4(pos, 1.0);
    gl_Position   = projectionMatrix * mvPos;
    gl_PointSize  = mix(3.2, 0.3, ep) * (300.0 / -mvPos.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vProgress;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float alpha = pow(1.0 - d * 2.0, 1.8);

    // cold blue → warm orange → hot white as particles approach center
    vec3 cold = vec3(0.12, 0.30, 0.95);
    vec3 warm = vec3(1.00, 0.38, 0.04);
    vec3 hot  = vec3(1.00, 0.92, 0.78);

    vec3 color = vProgress < 0.5
      ? mix(cold, warm, vProgress * 2.0)
      : mix(warm, hot,  (vProgress - 0.5) * 2.0);

    float brightness = 0.45 + vProgress * 0.55;
    gl_FragColor = vec4(color * brightness, alpha * (0.45 + vProgress * 0.55));
  }
`;

export default function ParticleBlackHole() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010008, 0.018);

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.01,
      500
    );

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x010008, 1);
    mount.appendChild(renderer.domElement);

    // ── Particle buffer attributes ────────────────────────────
    const geo     = new THREE.BufferGeometry();
    const posDummy = new Float32Array(PARTICLE_COUNT * 3); // placeholder — positions computed in VS
    const aRadius  = new Float32Array(PARTICLE_COUNT);
    const aAngle   = new Float32Array(PARTICLE_COUNT);
    const aSpeed   = new Float32Array(PARTICLE_COUNT);
    const aY       = new Float32Array(PARTICLE_COUNT);
    const aPhase   = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const roll = Math.random();
      if (roll < 0.86) {
        // Main accretion disk — power distribution so inner disk is denser
        aRadius[i] = 1.1 + Math.pow(Math.random(), 0.38) * 10.5;
        aY[i]      = (Math.random() - 0.5) * aRadius[i] * 0.11;
      } else if (roll < 0.93) {
        // North relativistic jet
        aRadius[i] = 0.05 + Math.random() * 0.9;
        aY[i]      = 1.8 + Math.random() * 7.5;
      } else {
        // South relativistic jet
        aRadius[i] = 0.05 + Math.random() * 0.9;
        aY[i]      = -(1.8 + Math.random() * 7.5);
      }
      aAngle[i] = Math.random() * Math.PI * 2;
      aSpeed[i] = 0.12 + Math.random() * 0.88;
      aPhase[i] = Math.random(); // stagger spiral phase [0, 1]
    }

    geo.setAttribute("position", new THREE.BufferAttribute(posDummy, 3));
    geo.setAttribute("aRadius",  new THREE.BufferAttribute(aRadius,  1));
    geo.setAttribute("aAngle",   new THREE.BufferAttribute(aAngle,   1));
    geo.setAttribute("aSpeed",   new THREE.BufferAttribute(aSpeed,   1));
    geo.setAttribute("aY",       new THREE.BufferAttribute(aY,       1));
    geo.setAttribute("aPhase",   new THREE.BufferAttribute(aPhase,   1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:    { value: 0 },
        uMouse3D: { value: new THREE.Vector3(999, 0, 999) },
      },
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    scene.add(new THREE.Points(geo, mat));

    // ── Black hole ────────────────────────────────────────────
    const bhGeo = new THREE.SphereGeometry(0.52, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    scene.add(new THREE.Mesh(bhGeo, bhMat));

    // ── Event horizon glow (radial gradient sprite) ───────────
    const gc = Object.assign(document.createElement("canvas"), { width: 256, height: 256 })
      .getContext("2d")!;
    const grd = gc.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0.00, "rgba(255,140,40,1.0)");
    grd.addColorStop(0.18, "rgba(255,60,0,0.55)");
    grd.addColorStop(0.45, "rgba(100,20,180,0.15)");
    grd.addColorStop(1.00, "rgba(0,0,0,0)");
    gc.fillStyle = grd;
    gc.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(gc.canvas);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMat);
    glowSprite.scale.set(4.5, 4.5, 1);
    scene.add(glowSprite);

    // ── Camera orbit ──────────────────────────────────────────
    let camTheta  = 0;
    const camPhi    = Math.PI / 3.1;
    const camRadius = 16;

    // ── Mouse → XZ world plane ────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const ndcMouse  = new THREE.Vector2();
    const diskPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const m3d       = new THREE.Vector3();

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      ndcMouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      ndcMouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(ndcMouse, camera);
      if (raycaster.ray.intersectPlane(diskPlane, m3d)) {
        mat.uniforms.uMouse3D.value.copy(m3d);
      }
    };
    const onMouseLeave = () => mat.uniforms.uMouse3D.value.set(999, 0, 999);

    mount.addEventListener("mousemove", onMouseMove);
    mount.addEventListener("mouseleave", onMouseLeave);

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Render loop ───────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId = 0;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      mat.uniforms.uTime.value = t;

      camTheta += 0.0005;
      camera.position.set(
        camRadius * Math.sin(camTheta) * Math.sin(camPhi),
        camRadius * Math.cos(camPhi),
        camRadius * Math.cos(camTheta) * Math.sin(camPhi)
      );
      camera.lookAt(0, 0, 0);

      glowMat.opacity = 0.72 + Math.sin(t * 1.6) * 0.18;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("mouseleave", onMouseLeave);
      geo.dispose();
      mat.dispose();
      bhGeo.dispose();
      bhMat.dispose();
      glowTex.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/20 pointer-events-none select-none">
        move cursor to attract
      </p>
    </div>
  );
}
