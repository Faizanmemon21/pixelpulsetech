---
name: gsap
description: "GSAP 3.13+ animation platform — now 100% FREE including all formerly-paid plugins (SplitText, MorphSVG, DrawSVG, ScrollSmoother, etc.) after the Webflow acquisition. Tweens, timelines, ScrollTrigger scroll-driven animation, pinning, scrubbing, SplitText text reveals, Flip, @gsap/react useGSAP hook, animating Three.js objects. Use for scroll-driven storytelling, pinned sections, complex sequenced timelines, text animation, and animating Three.js/R3F object properties. Triggers: gsap, ScrollTrigger, scrub, pin, timeline, SplitText, text reveal, scroll animation, parallax."
license: "Standard 'no charge' GSAP license (free for all use incl. commercial)"
metadata:
  source: https://github.com/greensock/GSAP
  version-basis: "gsap 3.15.0"
---

# GSAP + ScrollTrigger

Since v3.13 (2025, post-Webflow acquisition) **GSAP and ALL plugins are free**, including previously Club-only SplitText, MorphSVG, DrawSVG, ScrollSmoother, Inertia. Everything ships in the `gsap` npm package.

```bash
npm i gsap @gsap/react   # @gsap/react only for React projects
```

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, SplitText);   // always register plugins
```

## Tweens

```js
gsap.to('.box', { x: 200, rotation: 360, duration: 1, ease: 'power2.out' });
gsap.from('.hero-title', { y: 60, opacity: 0, duration: 0.8 });
gsap.fromTo(el, { scale: 0 }, { scale: 1, ease: 'back.out(1.7)' });
gsap.set(el, { opacity: 0 });                    // instant, no animation
gsap.to('.card', { y: 0, stagger: 0.1 });        // stagger any target list
```

- Eases: `power1–4.in/out/inOut`, `back`, `elastic`, `bounce`, `expo`, `sine`, custom `steps(n)`. Default is `power1.out`.
- GSAP animates any numeric property of any object — CSS, SVG attributes, canvas, **Three.js objects** (see below).

## Timelines (sequencing)

```js
const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power3.out' } });
tl.from('.hero-title', { y: 60, opacity: 0 })
  .from('.hero-sub',   { y: 40, opacity: 0 }, '-=0.3')   // overlap 0.3s
  .from('.hero-cta',   { scale: 0.8, opacity: 0 }, '<')  // '<' = with previous
  .from('.hero-img',   { x: 100, opacity: 0 }, 0.2);     // absolute time
```

Position parameter: `'-=0.3'` overlap, `'+=0.5'` gap, `'<'` align with previous start, `'>'` after previous end, number = absolute.

## ScrollTrigger — the centerpiece

```js
// Reveal on enter
gsap.from('.feature', {
  y: 80, opacity: 0,
  scrollTrigger: { trigger: '.feature', start: 'top 80%', toggleActions: 'play none none reverse' },
});

// Scrubbed + pinned storytelling section
gsap.timeline({
  scrollTrigger: {
    trigger: '.story', start: 'top top', end: '+=2000',
    scrub: 1,          // smooth-lag scrub (seconds); true = hard-linked
    pin: true,         // pin .story while the timeline plays
    // markers: true,  // debug
  },
})
  .to('.story-model', { rotation: 360 })
  .to('.story-text-1', { opacity: 0 }, '<')
  .from('.story-text-2', { opacity: 0 });
```

- `start: 'top 80%'` = trigger's top hits 80% down the viewport. `end: '+=2000'` = 2000px of scroll.
- `toggleActions: 'onEnter onLeave onEnterBack onLeaveBack'` (play/pause/resume/reverse/restart/reset/complete/none).
- After images/fonts load or layout changes: `ScrollTrigger.refresh()`.
- Batch reveals: `ScrollTrigger.batch('.card', { onEnter: els => gsap.from(els, { y: 60, opacity: 0, stagger: 0.1 }) })`.

## SplitText (now free) — text reveals

```js
const split = SplitText.create('.hero-title', { type: 'lines, words, chars' });
gsap.from(split.chars, { y: 40, opacity: 0, stagger: 0.02, ease: 'power3.out' });
// split.revert() when done (restores original DOM)
```

## React: useGSAP

```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(useGSAP, ScrollTrigger);

function Hero() {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    // selectors scoped to container; everything auto-cleaned on unmount
    gsap.from('.hero-title', { y: 60, opacity: 0 });
  }, { scope: container });

  // event-driven animations must be wrapped for cleanup:
  const { contextSafe } = useGSAP({ scope: container });
  const onHover = contextSafe(() => gsap.to('.logo', { rotation: '+=360' }));

  return <div ref={container}>...</div>;
}
```

`useGSAP` replaces `useEffect` + manual `gsap.context()`; it reverts all animations/ScrollTriggers created inside it on unmount — essential in React 18+ strict mode.

## GSAP + Three.js / R3F

GSAP tweens any object, so Three.js properties work directly:

```js
gsap.to(mesh.rotation, { y: Math.PI * 2, duration: 2, ease: 'power2.inOut' });
gsap.to(camera.position, { x: 0, y: 2, z: 6, duration: 1.5, onUpdate: () => camera.lookAt(0, 0, 0) });
gsap.to(material, { opacity: 0, duration: 1 });                 // needs material.transparent = true
gsap.to(material.color, { r: 1, g: 0.2, b: 0.6 });              // colors animate per-channel

// Scroll-driven 3D (vanilla three.js page):
gsap.to(model.rotation, {
  y: Math.PI, scrollTrigger: { trigger: '#section2', start: 'top bottom', end: 'top top', scrub: 1 },
});
```

In R3F, run these inside `useGSAP`/`useEffect` with refs (`gsap.to(ref.current.position, ...)`). Division of labor that works well: **GSAP/ScrollTrigger for scroll choreography and 3D object tweens, Motion for DOM UI micro-interactions** — avoid two libraries fighting over the same element.

## Other notable (now free) plugins

- `Flip` — FLIP layout transitions between DOM states.
- `DrawSVGPlugin` — SVG stroke draw-on.
- `MorphSVGPlugin` — morph between SVG paths.
- `ScrollSmoother` — smooth scrolling built on ScrollTrigger (`#smooth-wrapper` / `#smooth-content` structure). If using a third-party smooth scroller (Lenis) instead, wire it: `lenis.on('scroll', ScrollTrigger.update)`.
- `ScrollToPlugin` — animated scroll-to.
- `Observer` — normalized wheel/touch/pointer input (fullpage-style sections).

## Common pitfalls

- Forgot `gsap.registerPlugin(...)` → plugin silently no-ops in production builds.
- ScrollTrigger start positions wrong → content above loaded late; call `ScrollTrigger.refresh()` after load, or set explicit media dimensions.
- Pinning inside `transform`/`overflow` parents breaks — pin containers must not have transformed ancestors (or use `pinType: 'transform'`).
- React double-invoke duplicating animations → always `useGSAP` (or `gsap.context` + revert).
- SSR (Next.js): gsap code must run client-side (`"use client"`, inside `useGSAP`).
- Animating the same properties from two systems (GSAP + Motion/CSS transitions) causes fighting — one owner per property.
