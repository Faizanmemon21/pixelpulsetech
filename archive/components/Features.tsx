"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef, type MutableRefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =========================
   SHADER CORE
   (from Shader/Features components — glsl macro replaced with plain strings)
========================= */

const AAAShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uScroll: 0,
    uMouse: new THREE.Vector2(),
  },

  /* glsl */ `
    varying vec2 vUv;

    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,

  /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;

    void main(){
      vec2 uv = vUv;

      float dist = distance(uv, uMouse);

      float wave = sin(uv.x * 8.0 + uTime + uScroll * 3.0) * 0.6;

      float glow = 0.2 / (dist + 0.1);

      vec3 cyan = vec3(0.0,1.0,1.0);
      vec3 purple = vec3(0.6,0.2,1.0);

      float mixVal = uv.y + wave + glow;

      vec3 color = mix(cyan, purple, mixVal);

      // Black canvas treatment: light pools at the bottom and around the
      // cursor instead of washing the whole field
      float rise = smoothstep(1.2, -0.2, uv.y);
      color *= 0.1 + 0.45 * rise + glow * 0.35;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ AAAShaderMaterial });

function Background({ scrollState }: { scrollState: MutableRefObject<{ v: number }> }) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.uTime = state.clock.getElapsedTime();
    ref.current.uScroll = scrollState.current.v;
    ref.current.uMouse.set(
      (state.pointer.x + 1) / 2,
      (state.pointer.y + 1) / 2
    );
  });

  return (
    <mesh scale={[7, 4, 1]}>
      <planeGeometry args={[1, 1, 128, 128]} />
      {/* @ts-ignore */}
      <aAAShaderMaterial ref={ref} />
    </mesh>
  );
}

/* =========================
   TECH DATA — what's inside a PixelPulse rig
========================= */

const features = [
  {
    title: "RTX 50 SERIES POWER",
    desc: "Next-gen GPU architecture with DLSS 4 frame generation for cinematic frame rates.",
  },
  {
    title: "SUB-ZERO THERMALS",
    desc: "Custom liquid cooling loops keep boost clocks pinned even under marathon sessions.",
  },
  {
    title: "DDR5 + GEN5 NVMe",
    desc: "Load into the lobby first — blistering memory bandwidth and storage throughput.",
  },
  {
    title: "TUNED & BENCHMARKED",
    desc: "Every rig is stress-tested and benchmark-matched to its target resolution before shipping.",
  },
];

/* =========================
   CAPABILITIES SECTION
========================= */

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollState = useRef({ v: 0 });

  useGSAP(
    () => {
      // Scroll-linked shader intensity across the whole section
      gsap.to(scrollState.current, {
        v: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Reveal animations are skipped for reduced-motion users so content
      // is never hidden behind an opacity tween
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".feature-slide").forEach((el) => {
          gsap.fromTo(
            el,
            {
              opacity: 0,
              y: 120,
              scale: 0.96,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
              },
            }
          );
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="tech"
      ref={sectionRef}
      className="relative w-full bg-black text-white overflow-hidden"
    >
      {/* WEBGL BACKGROUND — sticky so it stays in view while slides scroll */}
      <div className="sticky top-0 h-screen w-full">
        <Canvas
          dpr={[1, 2]}
          frameloop={
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "demand"
              : "always"
          }
        >
          <Background scrollState={scrollState} />
          <EffectComposer>
            <Bloom intensity={1.6} luminanceThreshold={0.25} mipmapBlur />
          </EffectComposer>
        </Canvas>
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      <div className="relative z-10 -mt-[100vh]">
        {/* SECTION INTRO */}
        <div className="h-screen flex flex-col items-center justify-center text-center px-6">
          <p className="text-xs tracking-[0.35em] text-cyan-300 font-mono mb-4">
            UNDER THE HOOD
          </p>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            NEXT GEN <span className="text-cyan-400">FEATURES</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg">
            AAA hardware inside every PixelPulse rig — engineered for frames,
            tuned for silence.
          </p>
        </div>

        {/* SPECS */}
        {features.map((f, i) => (
          <div
            key={i}
            className="feature-slide relative h-screen flex flex-col items-center justify-center text-center px-6"
          >
            <span
              aria-hidden="true"
              className="absolute font-mono font-bold text-[28vw] leading-none text-white/[0.045] select-none pointer-events-none"
            >
              0{i + 1}
            </span>

            <p className="relative font-mono text-xs tracking-[0.35em] text-cyan-300/80 mb-5">
              SPEC 0{i + 1} / 0{features.length}
            </p>

            <h2 className="relative text-4xl md:text-6xl font-bold text-cyan-300 tracking-tight">
              {f.title}
            </h2>

            <p className="relative text-gray-300 mt-6 max-w-md text-lg">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
