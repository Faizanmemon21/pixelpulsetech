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
import { Suspense, useMemo, useRef, useState } from "react";
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

/* Close wide-angle camera — the immersive "big rig" look.
   The sway is kept small/slow so it doesn't read as zooming. */
export default function GlbScene({ active }: { active: boolean }) {
  // Lite machines (see lib/perf) start degraded; PerformanceMonitor still
  // catches weak GPUs the static heuristic misses
  const [dpr, setDpr] = useState(liteMode ? 1 : 1.5);
  const [degraded, setDegraded] = useState(liteMode);

  return (
    <Canvas
      camera={{ position: [3.1, 0.7, 3.1], fov: 30 }}
      dpr={dpr}
      frameloop={active ? "always" : "never"}
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
  );
}
