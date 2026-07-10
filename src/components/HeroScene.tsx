"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Grid,
  PerformanceMonitor,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { liteMode } from "@/lib/perf";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================
   RGB FAN — glowing ring that spins and cycles hue
========================= */

function RgbFan({ position, index }: { position: [number, number, number]; index: number }) {
  const ring = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ring.current.rotation.z = t * (1.2 + index * 0.3) * (hovered ? 2.5 : 1);
    mat.current.emissive.setHSL((t * 0.06 + index * 0.18) % 1, 1, 0.55);
    // hovered fan flares up, spins faster, and eases back down
    mat.current.emissiveIntensity = THREE.MathUtils.lerp(
      mat.current.emissiveIntensity,
      hovered ? 6 : 2.6,
      0.12
    );
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh ref={ring}>
        <torusGeometry args={[0.26, 0.045, 10, 36]} />
        <meshStandardMaterial
          ref={mat}
          color="#050508"
          emissive="#00ffff"
          emissiveIntensity={2.6}
          toneMapped={false}
        />
      </mesh>
      {/* hub */}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* =========================
   THE RIG — stylized PC tower built from primitives
========================= */

function Rig() {
  const group = useRef<THREE.Group>(null!);
  const gpuMat = useRef<THREE.MeshStandardMaterial>(null!);
  const caseMat = useRef<THREE.MeshStandardMaterial>(null!);
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const spin = useRef(0);
  const mouseTurn = useRef(0);
  // starts turned away and settles into place during the intro reveal
  const introOffset = useRef(prefersReducedMotion ? 0 : -1.1);
  const [caseHovered, setCaseHovered] = useState(false);
  const [gpuHovered, setGpuHovered] = useState(false);
  const [glassHovered, setGlassHovered] = useState(false);

  useFrame((state, delta) => {
    // Slow idle showcase spin + mouse-driven turn: sweeping the cursor
    // across the screen rotates the rig a full 360°
    if (!prefersReducedMotion) {
      spin.current += delta * 0.15;
    }
    mouseTurn.current += (state.pointer.x * Math.PI - mouseTurn.current) * 0.06;
    introOffset.current = THREE.MathUtils.lerp(introOffset.current, 0, 0.035);
    group.current.rotation.y = spin.current + mouseTurn.current + introOffset.current;

    const targetX = state.pointer.y * 0.08;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;

    const pulse =
      (gpuHovered ? 3.6 : 1.8) + Math.sin(state.clock.getElapsedTime() * 2.2) * 0.5;
    gpuMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      gpuMat.current.emissiveIntensity,
      pulse,
      0.15
    );

    // hovered parts glow up and ease back down
    caseMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      caseMat.current.emissiveIntensity,
      caseHovered ? 0.4 : 0,
      0.1
    );
    glassMat.current.opacity = THREE.MathUtils.lerp(
      glassMat.current.opacity,
      glassHovered ? 0.42 : 0.22,
      0.1
    );
  });

  const hoverProps = (set: (v: boolean) => void) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      set(true);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      set(false);
      document.body.style.cursor = "auto";
    },
  });

  return (
    <group ref={group}>
      {/* chassis — glows softly wherever the cursor rests on it */}
      <RoundedBox
        args={[1.15, 2.3, 1.0]}
        radius={0.05}
        smoothness={4}
        {...hoverProps(setCaseHovered)}
      >
        <meshStandardMaterial
          ref={caseMat}
          color="#1a1a2a"
          metalness={0.9}
          roughness={0.25}
          emissive="#4dd0ff"
          emissiveIntensity={0}
        />
      </RoundedBox>

      {/* front accent strip */}
      <mesh position={[-0.52, 0, 0.51]}>
        <boxGeometry args={[0.03, 2.1, 0.015]} />
        <meshStandardMaterial
          color="#000"
          emissive="#f43f5e"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* RGB intake fans on the front face */}
      <RgbFan position={[0.08, 0.7, 0.53]} index={0} />
      <RgbFan position={[0.08, 0, 0.53]} index={1} />
      <RgbFan position={[0.08, -0.7, 0.53]} index={2} />

      {/* tempered glass side panel — glossy clearcoat so studio
          lights streak across it as the rig rotates; clears up on hover */}
      <mesh
        position={[0.585, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        {...hoverProps(setGlassHovered)}
      >
        <planeGeometry args={[0.96, 2.26]} />
        <meshPhysicalMaterial
          ref={glassMat}
          color="#88ccff"
          transparent
          opacity={0.22}
          roughness={0.04}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* slim glass frame so the panel edge catches light */}
      {[1.145, -1.145].map((y) => (
        <mesh key={y} position={[0.59, y, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.0, 0.03, 0.02]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* GPU glowing through the glass — flares brighter on hover */}
      <mesh
        position={[0.25, -0.25, 0]}
        rotation={[0, Math.PI / 2, 0]}
        {...hoverProps(setGpuHovered)}
      >
        <boxGeometry args={[0.75, 0.14, 0.42]} />
        <meshStandardMaterial
          ref={gpuMat}
          color="#0a0a12"
          emissive="#7c3aed"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* RAM sticks */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0.28, 0.45, -0.12 + i * 0.12]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.04, 0.5, 0.02]} />
          <meshStandardMaterial
            color="#000"
            emissive="#00ffff"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* power LED */}
      <mesh position={[0.45, 1.05, 0.51]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ff88"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// One-time cinematic push-in as the intro panels slide away
function IntroCamera() {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const tween = gsap.to(camera.position, {
      z: 5.2,
      duration: 1.7,
      delay: 0.9,
      ease: "power4.inOut",
    });
    return () => {
      tween.kill();
      camera.position.z = 5.2;
    };
  }, [camera]);

  return null;
}

function Scene({ degraded }: { degraded: boolean }) {
  return (
    <>
      <IntroCamera />
      <fog attach="fog" args={["#000000", 6, 16]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[3, 3, 4]} intensity={30} color="#00ffff" />
      <pointLight position={[-4, 2, -2]} intensity={25} color="#7c3aed" />
      <pointLight position={[0, -1, 3]} intensity={8} color="#f43f5e" />
      {/* rim light so the tower silhouette separates from the black sky */}
      <pointLight position={[4, 2, -3]} intensity={40} color="#4dd0ff" />

      {/* the rig, floating gently, offset right of the headline on desktop */}
      <group position={[1.9, 0.15, 0]}>
        <Float
          speed={prefersReducedMotion ? 0 : 1.6}
          rotationIntensity={0.15}
          floatIntensity={0.4}
        >
          <Rig />
        </Float>
      </group>

      {/* synthwave floor */}
      <Grid
        position={[0, -1.45, 0]}
        infiniteGrid
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#0e2233"
        sectionSize={3}
        sectionThickness={1.2}
        sectionColor="#00b3b3"
        fadeDistance={22}
        fadeStrength={1.5}
      />

      <Sparkles count={45} scale={[14, 6, 8]} size={2.2} speed={prefersReducedMotion ? 0 : 0.35} color="#00ffff" opacity={0.5} />

      {!degraded && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.25} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

/* =========================
   CANVAS — lazy-loaded chunk; pauses rendering when the hero
   is scrolled out of view (`active` comes from Hero3D's observer)
========================= */

export default function HeroScene({ active }: { active: boolean }) {
  // Lite machines (see lib/perf) start degraded; PerformanceMonitor still
  // catches weak GPUs the static heuristic misses
  const [dpr, setDpr] = useState(liteMode ? 1 : 1.5);
  const [degraded, setDegraded] = useState(liteMode);

  return (
    <Canvas
      camera={{ position: [0, 0.4, prefersReducedMotion ? 5.2 : 6.6], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      frameloop={prefersReducedMotion ? "demand" : active ? "always" : "never"}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setDegraded(true);
        }}
      />
      <Scene degraded={degraded} />
    </Canvas>
  );
}
