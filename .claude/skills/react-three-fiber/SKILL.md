---
name: react-three-fiber
description: "React Three Fiber (R3F v9, React 19) — declarative Three.js in React. Canvas setup, useFrame/useThree/useLoader hooks, drei helpers (OrbitControls, Environment, Text, ScrollControls, Html), events/raycasting, performance patterns, @react-three/postprocessing. Use for any React + 3D work: .tsx/.jsx files containing <Canvas>, @react-three/fiber, @react-three/drei imports, 3D hero sections, product configurators, scroll-driven 3D. Triggers: R3F, react-three-fiber, drei, Canvas, useFrame, 3D React component."
license: MIT (react-three-fiber library)
metadata:
  source: https://github.com/pmndrs/react-three-fiber
  version-basis: "@react-three/fiber 9.6.x (requires React 19); drei 10.x"
---

# React Three Fiber (R3F)

Declarative Three.js renderer for React. **v9 requires React 19** (v8 pairs with React 18). Everything in the `threejs` skill applies underneath — R3F is not a wrapper library, it renders real Three.js objects.

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

## Core model

- JSX elements = Three.js classes in camelCase: `<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>`, `<directionalLight>`.
- Constructor args via `args`: `<boxGeometry args={[1, 2, 3]} />` — **changing `args` reconstructs the object**.
- Nested-property shortcuts: `position={[x,y,z]}`, `rotation-x={0.5}`, `material-color="hotpink"`.
- `attach` wires non-scene objects: geometries/materials auto-attach; special cases like `<bufferAttribute attach="attributes-position" ... />`.

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Spinner(props) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => { ref.current.rotation.y += delta; });
  return (
    <mesh ref={ref} {...props}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }} shadows dpr={[1, 2]}>
      <Environment preset="city" />
      <directionalLight position={[3, 3, 3]} castShadow />
      <Spinner castShadow />
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}
```

`<Canvas>` fills its parent — the parent needs explicit width/height (e.g. `h-screen`). Good defaults are built in: sRGB output, ACES tone mapping, antialias, `dpr=[1,2]`.

## Hooks (only inside `<Canvas>` children)

- `useFrame((state, delta) => ...)` — per-frame logic. **Never `setState` in it**; mutate refs. `state` has `clock`, `camera`, `pointer`, `viewport`.
- `useThree()` — access `{ scene, camera, gl (renderer), size, viewport }`. Selector form avoids re-renders: `useThree(s => s.camera)`.
- `useLoader(GLTFLoader, url)` — suspends; wrap consumer in `<Suspense fallback={...}>`. Prefer drei's `useGLTF(url)` (includes Draco). Preload: `useGLTF.preload(url)`.

## Events

Pointer events directly on meshes (raycasting is built in):

```tsx
<mesh
  onClick={(e) => { e.stopPropagation(); ... }}
  onPointerOver={() => setHover(true)}
  onPointerOut={() => setHover(false)}
/>
```

Set `document.body.style.cursor` in hover handlers for affordance. `e.stopPropagation()` prevents hitting objects behind.

## drei — reach for these before writing your own

| Helper | Purpose |
|---|---|
| `OrbitControls` / `CameraControls` | Camera control (`makeDefault` so other helpers respect it) |
| `Environment` | HDRI lighting: `preset="city"` etc., or `files="x.hdr"`; `background` prop |
| `useGLTF`, `Gltf` | GLTF loading + Draco; `npx gltfjsx model.glb` generates a typed component |
| `Text`, `Text3D` | SDF text (crisp at any zoom) / extruded text |
| `Html` | DOM elements anchored to 3D positions (labels, tooltips) |
| `ScrollControls` + `useScroll` | Scroll-driven 3D storytelling (read `scroll.offset` in `useFrame`) |
| `Float`, `Sparkles`, `Stars`, `Cloud` | Ambient motion/atmosphere |
| `ContactShadows`, `AccumulativeShadows` | Cheap beautiful ground shadows |
| `MeshTransmissionMaterial` | Better-looking glass than vanilla physical material |
| `Center`, `Bounds`, `Resize` | Auto-fit/center models |
| `PerspectiveCamera makeDefault` | Declarative camera |
| `AdaptiveDpr`, `PerformanceMonitor`, `Preload all` | Perf tooling |
| `Stats`, `useHelper` | Debugging |

## Performance rules (R3F-specific)

1. **Never create objects in render or useFrame**: hoist `new THREE.Vector3()` etc. to module scope or `useMemo`.
2. **Mutate, don't re-render**: animation via refs in `useFrame`, not React state. For state that changes every frame, use zustand with `getState()` inside `useFrame` (transient reads).
3. `<Canvas frameloop="demand">` for static scenes — renders only on interaction/`invalidate()`.
4. `<instancedMesh>` or drei `<Instances>/<Instance>` for many repeated meshes.
5. `dpr={[1, 2]}` (default) caps device pixel ratio; add drei `<AdaptiveDpr pixelated />` to degrade under load.
6. Reuse geometries/materials across components (share via module constants or `useMemo`).
7. R3F auto-disposes objects on unmount — set `dispose={null}` on cached/shared GLTF scenes so unmount doesn't destroy them.

## Postprocessing

```bash
npm i @react-three/postprocessing
```

```tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
<EffectComposer>
  <Bloom intensity={0.6} luminanceThreshold={0.9} mipmapBlur />
  <Vignette darkness={0.5} />
</EffectComposer>
```

## Ecosystem (pmndrs)

- `@react-three/rapier` — physics (rigid bodies, colliders).
- `@react-three/xr` — VR/AR.
- `zustand` — state that plays well with useFrame transient reads.
- `maath` — math easing/damping helpers (`maath/easing`'s `damp3` is great for smooth camera follows).

## Common pitfalls

- **Hooks outside Canvas**: `useFrame`/`useThree` throw "R3F hooks can only be used within the Canvas component" — split scene content into a child component.
- Canvas invisible: parent has zero height.
- HMR duplicating objects / stale scenes: keep side-effectful Three.js code inside components, not module top-level.
- `useLoader` with no `<Suspense>` boundary = blank screen.
- Next.js: R3F components need `"use client"`; dynamic-import the Canvas wrapper with `ssr: false` if `window` access errors appear.
- Re-render storms: passing new object/array literals as props each render reconstructs (if in `args`) — memoize.
- Events not firing after adding custom camera: add `makeDefault` to the camera/controls.
