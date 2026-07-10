---
name: motion
description: "Motion v12 (formerly Framer Motion) — React & vanilla JS animation library. motion components, animate/exit/whileHover/whileInView props, variants with stagger, layout animations, AnimatePresence, gestures/drag, useScroll + scroll-linked animation, useSpring, useTransform, useMotionValue. Use for UI animation in React apps: page transitions, hero reveals, scroll progress, hover micro-interactions, animated presence/removal, layout shifts. Triggers: framer-motion, motion/react, animate, AnimatePresence, whileInView, spring animation, page transition, stagger."
license: MIT (motion library)
metadata:
  source: https://github.com/motiondivision/motion
  version-basis: "motion 12.x"
---

# Motion (Framer Motion successor)

The library is now the **`motion`** package. React import is **`motion/react`** (the old `framer-motion` package still re-exports but new code should use `motion`). There's also a tiny vanilla API `import { animate, scroll } from 'motion'` for non-React code.

```bash
npm i motion
```

```tsx
import { motion, AnimatePresence } from 'motion/react';
```

## Core: the `motion` component

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```

- Animates on mount (`initial` → `animate`) and whenever `animate` values change.
- Transforms (`x`, `y`, `scale`, `rotate`) and `opacity` are hardware-accelerated — prefer them over `top/left/width`.
- `transition` per-value overrides: `transition={{ duration: 0.4, scale: { type: 'spring', stiffness: 300 } }}`.
- Springs: `type: 'spring', stiffness, damping, mass` or the newer perceptual `type: 'spring', visualDuration: 0.4, bounce: 0.3`.

## Gestures

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ boxShadow: '0 0 0 3px rgba(139,92,246,.5)' }}
/>
```

Drag: `drag`, `dragConstraints={ref | {left,right,top,bottom}}`, `dragElastic`, `whileDrag`.

## Scroll-triggered reveal (the workhorse for landing pages)

```tsx
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // once:true = don't re-animate
  transition={{ duration: 0.6 }}
/>
```

## Variants + stagger (orchestrating children)

```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

<motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
  {items.map(i => <motion.li key={i} variants={item}>{i}</motion.li>)}
</motion.ul>
```

Variant names propagate to children automatically — children only need `variants`.

## AnimatePresence (exit animations)

```tsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div key="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

- Children need stable `key`s. `mode="wait"` finishes exit before enter (page transitions); `mode="popLayout"` pops exiting elements out of layout.

## Layout animations

- `layout` prop animates position/size changes caused by layout shifts: `<motion.div layout />`.
- `layoutId` creates shared-element transitions (e.g. active tab underline, card → detail view):

```tsx
{active === tab && <motion.div layoutId="underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-violet-500" />}
```

## MotionValues + scroll-linked animation

```tsx
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';

// Page scroll progress bar
const { scrollYProgress } = useScroll();
<motion.div style={{ scaleX: scrollYProgress }} className="fixed top-0 inset-x-0 h-1 origin-left bg-violet-500" />

// Parallax on an element
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);
<motion.div ref={ref} style={{ y }} />
```

- MotionValues bypass React re-renders — this is the performant way to do scroll effects.
- `useSpring(value, { stiffness, damping })` smooths any MotionValue.
- `useMotionValueEvent(value, 'change', cb)` for side effects.

## Motion + 3D (pairs with this project)

MotionValues drive R3F nicely: read them in `useFrame` (`mv.get()`), or map `useScroll().scrollYProgress` to camera position / mesh rotation. For animating Three.js object properties directly, GSAP or plain `useFrame` lerping is often simpler — use Motion for DOM/UI, and either for the canvas.

## Performance & a11y

- Prefer transforms/opacity; avoid animating `width/height/top` (layout thrash) — use `layout` prop instead.
- Many elements animating: `will-change` is handled for you; keep simultaneous animating nodes reasonable (~hundreds max).
- Reduced motion: `useReducedMotion()` hook or wrap app in `<MotionConfig reducedMotion="user">`.
- `LazyMotion` + `m` components shrink bundle (~5kb core): `<LazyMotion features={domAnimation}><m.div .../></LazyMotion>`.

## Common pitfalls

- Exit animation not firing: element unmounted outside `<AnimatePresence>`, or missing/unstable `key`.
- `whileInView` firing too early/late: tune `viewport={{ amount }}` (fraction visible) and `margin`.
- Server components (Next.js App Router): files using motion need `"use client"`.
- Animating display/visibility: use `AnimatePresence` + conditional render instead of `display: none` (not animatable).
- `layout` animations distorting text/border-radius: put `layout` on a wrapper, or use `layout="position"`.
