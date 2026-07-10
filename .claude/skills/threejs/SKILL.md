---
name: threejs
description: "Three.js (r185+) core 3D engine knowledge: scene/camera/renderer setup, geometries, materials, lights, shadows, textures, GLTF loading, animation loop, raycasting, postprocessing, WebGPU renderer, performance optimization. Use when writing or reviewing any Three.js code — vanilla or under React Three Fiber. Triggers: three.js, 3D scene, WebGL, WebGPU, mesh, geometry, material, PBR, GLTF/GLB, orbit controls, shadow, environment map, instancing, LOD, draw calls."
license: MIT (three.js library)
metadata:
  source: https://github.com/mrdoob/three.js
  version-basis: "three 0.185.0 (r185)"
---

# Three.js Core

Reference for building performant Three.js scenes. Current version basis: **r185** (`npm i three`). Import from `three`; addons from `three/addons/...` (the old `three/examples/jsm/...` path still works but prefer `three/addons`).

## Minimal correct setup

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // cap DPR — huge perf win
renderer.toneMapping = THREE.ACESFilmicToneMapping;    // r152+: outputColorSpace defaults to SRGB
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.setAnimationLoop((t) => {   // preferred over requestAnimationFrame; XR-safe
  controls.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
```

## Color management (modern defaults — don't fight them)

- `renderer.outputColorSpace = SRGBColorSpace` is the default. Color textures (albedo/map, emissive) must be `texture.colorSpace = THREE.SRGBColorSpace`; data textures (normal, roughness, AO) stay linear (default).
- `GLTFLoader` sets color spaces correctly for you — don't override.
- Pick a tone mapping: `ACESFilmicToneMapping` (cinematic) or `AgXToneMapping` (newer, handles saturated emissives better).

## Materials — choosing

| Material | Use for |
|---|---|
| `MeshStandardMaterial` | Default PBR choice (metalness/roughness) |
| `MeshPhysicalMaterial` | Glass (`transmission`), clearcoat, sheen, iridescence — most expensive |
| `MeshBasicMaterial` | Unlit: UI, skies, flat glows — cheapest |
| `MeshLambertMaterial` / `MeshPhongMaterial` | Cheap lit materials for low-end targets |
| `ShaderMaterial` / `RawShaderMaterial` | Custom GLSL (see the `shaders` skill) |
| `MeshNormalMaterial` | Debugging normals |

Glass: `MeshPhysicalMaterial` with `transmission: 1, roughness: 0–0.2, thickness, ior` — needs an environment map to look right.

## Lighting & environment

- **Best-looking cheap setup**: an HDRI environment map + one `DirectionalLight` for shadows.

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
new RGBELoader().load('studio.hdr', (tex) => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;          // lights all PBR materials
  // scene.background = tex;        // optional
});
```

- Shadows: only `DirectionalLight`, `SpotLight`, `PointLight` cast. Enable per-object: `mesh.castShadow / receiveShadow = true`. Tighten `light.shadow.camera` bounds and set `shadow.mapSize` (1024–2048) — the #1 fix for blurry/missing shadows.
- `AmbientLight`/`HemisphereLight` are fill only; environment maps usually replace them.

## Loading models

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader().setDRACOLoader(draco);
const gltf = await loader.loadAsync('model.glb');
scene.add(gltf.scene);

// Animations
const mixer = new THREE.AnimationMixer(gltf.scene);
mixer.clipAction(gltf.animations[0]).play();
// in loop: mixer.update(clockDelta)
```

- Prefer **GLB** (binary GLTF). Compress geometry with Draco or Meshopt, textures with KTX2 (`KTX2Loader`).

## Raycasting (mouse picking)

```js
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
// per frame:
raycaster.setFromCamera(pointer, camera);
const hits = raycaster.intersectObjects(scene.children, true);
```

## Performance checklist (in priority order)

1. **Cap pixel ratio**: `setPixelRatio(Math.min(devicePixelRatio, 2))`.
2. **Reduce draw calls**: merge static geometry (`BufferGeometryUtils.mergeGeometries`), use `InstancedMesh` for many copies of one mesh (grass, particles, crowds).
3. **Reuse** geometries and materials — never create them inside the render loop.
4. **Dispose** what you remove: `geometry.dispose()`, `material.dispose()`, `texture.dispose()` — Three.js does not garbage-collect GPU resources.
5. Texture sizes: power-of-two, ≤2048 for web; use KTX2/basis for big scenes.
6. Frustum culling is automatic per-object — don't merge everything into one giant mesh if it spans the whole world.
7. Shadows are expensive: one shadow-casting light, tight shadow camera, static scenes can render shadows once (`renderer.shadowMap.autoUpdate = false`).
8. `LOD` object for detail switching by distance.

## Postprocessing

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.4, 0.85));
// loop: composer.render() instead of renderer.render()
```

Under React Three Fiber, prefer `@react-three/postprocessing` (pmndrs) — it batches passes efficiently.

## WebGPU (optional, forward-looking)

r185 ships a stable-ish `WebGPURenderer` (`three/webgpu`) with the **TSL** (Three Shading Language) node system replacing GLSL strings; it falls back to WebGL2 automatically. Use for new experimental work; stick to `WebGLRenderer` for broad production compatibility.

## Common pitfalls

- Scene appears black: no lights with a PBR material, camera inside/behind object, or missing `scene.environment`.
- Model loads but invisible: scale (GLTF units are meters — a building at scale 1 may swallow the camera), or materials need lights.
- Washed-out or dark colors: double color-space conversion — check `texture.colorSpace` and don't set legacy `gammaFactor` stuff.
- Jerky animation: use a `THREE.Clock` delta, never fixed increments per frame.
- Memory leak on route change (SPAs): dispose renderer (`renderer.dispose()`), all geometries/materials/textures, and remove event listeners.
