"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  PerformanceMonitor,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Wrench } from "lucide-react";
import { liteMode } from "@/lib/perf";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const MODEL_URL = "/models/gaming-pc.glb";

function PCModel() {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(MODEL_URL);

  // Normalize any export scale to a ~2.4 unit tall scene
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    return 2.4 / (size.y || 1);
  }, [scene]);

  useFrame((state) => {
    // gentle ±6° showcase rotation — small and slow so the close
    // wide-angle camera doesn't read it as zooming
    if (!prefersReducedMotion) {
      group.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.28) * 0.105;
    }
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

function ModelLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="three-body">
          <div className="three-body__dot" />
          <div className="three-body__dot" />
          <div className="three-body__dot" />
        </div>
        <span className="font-mono text-[10px] tracking-[0.35em] text-white/50 whitespace-nowrap">
          LOADING MODEL
        </span>
      </div>
    </Html>
  );
}

export default function GlbShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  // Mount the canvas once on first approach, then keep it alive and only
  // pause the frameloop — repeatedly creating/destroying WebGL contexts
  // while scrolling causes hitches and leaks GPU memory on weak hardware
  const [everInView, setEverInView] = useState(false);
  // Lite machines (see lib/perf) start degraded; PerformanceMonitor still
  // catches weak GPUs the static heuristic misses
  const [dpr, setDpr] = useState(liteMode ? 1 : 1.5);
  const [degraded, setDegraded] = useState(liteMode);

  // Only render (and only download the model) once the section approaches
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rig"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Close wide-angle camera — the immersive "big rig" look.
          The sway is kept small/slow so it doesn't read as zooming. */}
      {everInView && (
        <Canvas
          camera={{ position: [3.1, 0.7, 3.1], fov: 30 }}
          dpr={dpr}
          frameloop={inView ? "always" : "never"}
          gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
          className="!absolute inset-0"
          onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
        >
          {/* step down render cost whenever the GPU can't hold ~60fps */}
          <PerformanceMonitor
            onDecline={() => {
              setDpr(1);
              setDegraded(true);
            }}
          />
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 4]} intensity={1.4} />

          <Suspense fallback={<ModelLoader />}>
            <PCModel />

            {/* studio HDR lighting from area lights — no network fetch */}
            <Environment resolution={256}>
              <Lightformer
                intensity={3}
                position={[0, 4, 0]}
                rotation-x={Math.PI / 2}
                scale={[8, 8, 1]}
              />
              <Lightformer
                intensity={2}
                color="#ffffff"
                position={[3, 1, 4]}
                scale={[3, 2, 1]}
              />
              <Lightformer
                intensity={1.8}
                color="#ff2244"
                position={[-4, 0.5, -2]}
                rotation-y={Math.PI / 2}
                scale={[4, 2, 1]}
              />
            </Environment>

            {/* frames={1} bakes the shadow once instead of re-rendering the
                whole scene from the shadow camera every frame — the ±6° sway
                is too small to notice in a soft blob shadow */}
            <ContactShadows
              position={[0, -1.25, 0]}
              opacity={0.55}
              scale={8}
              blur={2.4}
              far={2.5}
              frames={1}
            />
          </Suspense>

          {!degraded && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.7} luminanceThreshold={0.8} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      )}

      {/* edge grade so copy reads over the render */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      {/* COPY + CTA — left anchored, red system */}
      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="w-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <div id="hero-copy" className="max-w-xl text-center md:text-left">
            <p className="text-xs tracking-[0.35em] text-red-400 font-mono mb-5">
              YOUR DREAM RIG AWAITS
            </p>

            <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              READY TO
              <br />
              <span className="text-red-500">DOMINATE?</span>
            </h2>

            <p className="text-gray-300 mt-6 max-w-md mx-auto md:mx-0">
              Pick a battle-proven rig or spec every component yourself. Hand
              built, stress tested, and shipped ready to boot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start pointer-events-auto">
              <a
                href="#/builds"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition"
              >
                <Wrench className="size-4" />
                Start Your Build
                <ArrowUpRight className="size-4" />
              </a>

              <a
                href="mailto:builds@pixelpulsetech.pk"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-white/25 text-white rounded-xl hover:bg-white/10 transition"
              >
                Talk to a Builder
              </a>
            </div>

            <p className="mt-10 font-mono text-[10px] tracking-[0.35em] text-white/40">
              PIXELPULSETECH · WWW.PIXELPULSETECH.PK
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 text-xs tracking-[0.3em] font-mono">
        SCROLL
      </div>
    </section>
  );
}
