---
name: shaders
description: "GLSL shader writing (Book of Shaders methodology) — fragment/vertex shaders, uniforms/varyings, shaping functions (smoothstep, step, mix), colors, shapes/SDFs, matrices, random/noise (value, gradient/Perlin, simplex, fbm), patterns. Plus Three.js integration: ShaderMaterial, custom uniforms (u_time, u_resolution, u_mouse), onBeforeCompile, and R3F shaderMaterial from drei. Use when writing or debugging any GLSL, custom materials, procedural textures, animated gradients, distortion/displacement effects, particle shaders, post-processing effects. Triggers: shader, GLSL, fragment shader, vertex shader, noise, fbm, SDF, uniform, ShaderMaterial, displacement."
license: "Book of Shaders content by Patricio Gonzalez Vivo & Jen Lowe (reference)"
metadata:
  source: https://github.com/patriciogonzalezvivo/thebookofshaders
  reference: https://thebookofshaders.com
---

# Shaders (Book of Shaders + Three.js practice)

GLSL fundamentals per *The Book of Shaders* (thebookofshaders.com), adapted for Three.js/R3F work in this project.

## Mental model

- The fragment shader runs **once per pixel, in parallel, stateless** — no loops over the image, no reading other pixels' results. You compute each pixel's color from its coordinates + uniforms.
- `gl_FragCoord.xy / u_resolution` → normalized `st` in [0,1]. Aspect-correct: `st.x *= u_resolution.x / u_resolution.y;`
- Think in **fields and thresholds**: build a scalar field (distance, noise, gradient), then shape it into color with `step`/`smoothstep`/`mix`.

## Canonical fragment shader skeleton

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(st.x, st.y, abs(sin(u_time)));
    gl_FragColor = vec4(color, 1.0);
}
```

GLSL gotchas: floats need decimals (`1.0` not `1`); no implicit int→float casts; swizzles (`.xy`, `.rgb`, `.rga` any order); `mediump` on mobile can band — use `highp` for coordinates when precision artifacts appear.

## The shaping-function toolbox (Chapter 5 — the core skill)

```glsl
step(edge, x)                 // hard threshold: 0 or 1
smoothstep(a, b, x)           // smooth 0→1 ramp between a and b — THE workhorse
mix(colA, colB, t)            // linear interpolate anything
clamp(x, 0.0, 1.0)
fract(x)                      // repetition: sawtooth 0..1
pow, abs, sign, mod, min, max
sin(x * freq + u_time * speed) * amp   // all animation starts here
```

- Plot lines: `float y = smoothstep(0.48, 0.5, st.y) - smoothstep(0.5, 0.52, st.y);`
- Anti-aliased edges: always `smoothstep(edge - fwidth, edge + fwidth, d)` rather than `step`.

## Shapes & SDFs (Chapter 7)

```glsl
// Circle
float circle(vec2 st, vec2 center, float r) {
    return 1.0 - smoothstep(r - 0.01, r + 0.01, distance(st, center));
}
// Rectangle via borders: multiply smoothsteps of each edge
// Polar shapes: angle-modulated radius
vec2 toCenter = st - 0.5;
float angle = atan(toCenter.y, toCenter.x);
float radius = length(toCenter) * 2.0;
float f = cos(angle * 5.0) * 0.3 + 0.5;      // 5-petal flower
color = vec3(1.0 - smoothstep(f, f + 0.02, radius));
```

For complex 2D SDFs (rounded boxes, stars, blobs + boolean ops `min`/`max`), Inigo Quilez's 2D distance functions are the standard reference.

## Random & noise (Chapters 10–13) — memorize these

```glsl
// Hash "random" (value in [0,1))
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Value noise: interpolate random at grid corners
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);        // cubic Hermite (smoothstep curve)
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// fbm: stack octaves of noise → natural texture (clouds, terrain, marble)
float fbm(vec2 st) {
    float value = 0.0, amp = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amp * noise(st);
        st *= 2.0;                            // lacunarity
        amp *= 0.5;                           // gain
    }
    return value;
}
```

- Domain warping (organic, smoky visuals): `fbm(st + fbm(st + fbm(st)))`.
- For quality gradient noise use a simplex implementation (e.g. `glsl-noise` / Ashima `snoise`) instead of value noise.
- Patterns: scale then tile — `st *= 10.0; vec2 cell = fract(st); vec2 id = floor(st);` per-cell randomness via `random(id)`.

## Three.js integration

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
    u_mouse: { value: new THREE.Vector2() },
    u_color: { value: new THREE.Color('#8b5cf6') },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    uniform float u_time;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 4.0 + u_time) * 0.1;   // vertex displacement
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float u_time; uniform vec3 u_color;
    void main() { gl_FragColor = vec4(u_color * vUv.y, 1.0); }`,
});
// per frame: material.uniforms.u_time.value = clock.getElapsedTime();
```

- Three.js injects `projectionMatrix`, `modelViewMatrix`, `position`, `uv`, `normal` automatically in `ShaderMaterial` (use `RawShaderMaterial` to opt out).
- On a mesh (not full-screen), use `vUv` varying instead of `gl_FragCoord/u_resolution`.
- Extend built-in materials (keep lights/shadows): `material.onBeforeCompile = (shader) => { ...string-patch shader.vertexShader... }` or use `three-custom-shader-material` (CSM) — much cleaner.
- Displaced vertices need recomputed normals for lighting (analytic derivative or neighbour sampling), else shading looks flat.

## R3F integration (drei shaderMaterial)

```tsx
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#8b5cf6') },
  vertexShader, fragmentShader,
);
extend({ WaveMaterial });

function Blob() {
  const ref = useRef<any>(null);
  useFrame((_, delta) => (ref.current.uTime += delta));
  return (
    <mesh>
      <icosahedronGeometry args={[1, 64]} />
      {/* @ts-ignore */}
      <waveMaterial ref={ref} key={WaveMaterial.key} />
    </mesh>
  );
}
```

Uniforms become props/ref fields automatically. `key={WaveMaterial.key}` enables hot reload of shader code.

## Debugging shaders

- No console — **visualize values as color**: `gl_FragColor = vec4(vec3(myValue), 1.0);` and read the grayscale.
- Black screen: compile error (check console for `THREE.WebGLProgram` logs), int/float type mismatch is the usual suspect.
- Banding: raise precision, add tiny dithered noise, or use more octaves.
- Test full-screen frags fast at editor.thebookofshaders.com or Shadertoy (note Shadertoy's `mainImage(out vec4 fragColor, in vec2 fragCoord)` needs adapting: `iTime→u_time`, `iResolution→u_resolution`).

## Performance

- Branching (`if`) is fine when coherent, but prefer `step`/`mix` arithmetic for per-pixel decisions.
- `for` loops must have compile-time constant bounds in WebGL1; keep octave counts ≤ 5–6.
- Noise is expensive — compute at lowest frequency needed; consider baking static noise to a texture.
- Full-screen shaders cost scales with resolution × DPR — cap `setPixelRatio`.
