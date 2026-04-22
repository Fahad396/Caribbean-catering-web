# AOC Website — Developer Guide
## Video Autoplay & Frame Animation Reference

> **Files:** `index.html` · `style.css` · `main.js`
> **Version:** 2.0 — Caribbean Catering Redesign

---

## Table of Contents

1. [Project File Structure](#1-project-file-structure)
2. [How Video Autoplay Works](#2-how-video-autoplay-works)
3. [Adding Video to Any Section — Step-by-Step](#3-adding-video-to-any-section)
   - Menu Section (background video)
   - About Section (split video + text)
   - Packages Section (already done — reference)
   - Hero Section (full-screen background video)
4. [Animation Types Reference](#4-animation-types-reference)
   - CSS Keyframe Animations
   - Scroll-Triggered Animations
   - Intersection Observer Animations
   - Canvas Particle Animations
5. [Menu Item Glow — How It Works](#5-menu-item-glow)
6. [Adding Glow to Any Element](#6-adding-glow-to-any-element)
7. [Common Mistakes & Fixes](#7-common-mistakes--fixes)
8. [Quick-Copy Templates](#8-quick-copy-templates)

---

## 1. Project File Structure

```
aoc/
├── index.html   — All HTML structure and section comments
├── style.css    — All visual styles, animations, keyframes
└── main.js      — All interactivity: scroll, video, canvas, cursor
```

**How they connect:**
- `index.html` links to `style.css` via `<link rel="stylesheet" href="style.css">` in `<head>`
- `index.html` links to `main.js` via `<script src="main.js"></script>` at the **bottom of `<body>`**
- Loading JS at the bottom of body means the HTML is fully parsed before JS runs (no `DOMContentLoaded` wrapper needed)

---

## 2. How Video Autoplay Works

### The Golden Rule
> Browsers block autoplay **unless the video is muted.**

This is a browser policy introduced around 2017 to stop auto-playing ads with sound. The rule is:

| Attribute combo         | Autoplay allowed? |
|-------------------------|-------------------|
| `autoplay` alone        | ❌ Blocked         |
| `autoplay muted`        | ✅ Allowed         |
| `autoplay muted loop`   | ✅ Allowed (loops) |
| `autoplay playsinline`  | ❌ Blocked (muted missing) |
| `autoplay muted playsinline loop` | ✅ Best practice |

### Required HTML Attributes

```html
<video autoplay muted playsinline loop preload="metadata" poster="thumbnail.jpg">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4"  type="video/mp4">
</video>
```

| Attribute      | What it does |
|----------------|--------------|
| `autoplay`     | Starts playing immediately when loaded |
| `muted`        | **Required** for autoplay to work in all browsers |
| `playsinline`  | **Required on iOS** — prevents iPhone going fullscreen |
| `loop`         | Restarts from beginning when it ends |
| `preload="metadata"` | Loads only duration/dimensions, not the full video (faster page load) |
| `poster="…"`   | Image shown before video loads (prevents blank flash) |

### Video File Formats

Always provide two formats so every browser is covered:

```html
<source src="video.webm" type="video/webm">  <!-- Chrome, Firefox, Edge -->
<source src="video.mp4"  type="video/mp4">   <!-- Safari, iOS, all others -->
```

**Recommended video specs:**
- Resolution: 1280×720 (HD) or 1920×1080 (Full HD)
- File size: Under 8MB for good performance (compress with HandBrake or FFmpeg)
- Duration: 15–60 seconds for loops
- Frame rate: 24fps or 30fps

**FFmpeg command to compress a video:**
```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset fast -an output.mp4
# -crf 28  = quality (18=best, 28=good balance, 35=small file)
# -an      = remove audio (makes file smaller; video is muted anyway)
```

---

## 3. Adding Video to Any Section

### A. Menu Section — Background Video

Place a video behind the menu cards with a dark overlay so cards remain readable.

**In `index.html` — replace the opening `<section class="menu-section">` tag:**

```html
<!-- MENU SECTION with background video -->
<section class="menu-section" id="menu" style="position:relative; overflow:hidden;">

  <!-- Background video layer — sits behind everything -->
  <video
    id="menu-video"
    autoplay muted playsinline loop preload="metadata"
    style="
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.15;       /* low opacity so cards are still readable */
      z-index: 0;
      pointer-events: none;
    "
  >
    <source src="your-food-video.webm" type="video/webm">
    <source src="your-food-video.mp4"  type="video/mp4">
  </video>

  <!-- All existing menu content goes here, unchanged -->
  <div class="menu-header" style="position:relative; z-index:1;">
    <!-- ... -->
  </div>
  <div class="menu-grid" style="position:relative; z-index:1;">
    <!-- ... -->
  </div>

</section>
```

**In `main.js` — add this JS to enable pause-on-scroll:**

```javascript
// Pause menu background video when not in view (saves performance)
const menuVideo = document.getElementById('menu-video');
if (menuVideo) {
  new IntersectionObserver(entries => {
    entries[0].isIntersecting ? menuVideo.play() : menuVideo.pause();
  }, { threshold: 0.1 }).observe(menuVideo);
}
```

---

### B. About Section — Split Video + Text

Replace the left decorative panel with a video while keeping the right text column.

**In `index.html` — replace `.about-image` div:**

```html
<section class="about" id="about">

  <!-- LEFT: video instead of the dark image panel -->
  <div class="about-image" style="position:relative; overflow:hidden;">

    <!-- Video fills the left column -->
    <video
      id="about-video"
      autoplay muted playsinline loop preload="metadata"
      poster="about-poster.jpg"
      style="
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
      "
    >
      <source src="about-kitchen.webm" type="video/webm">
      <source src="about-kitchen.mp4"  type="video/mp4">
    </video>

    <!-- Dark overlay so stats on top are readable -->
    <div style="
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(27,58,42,.85) 0%, rgba(27,58,42,.3) 100%);
      z-index: 1;
    "></div>

    <!-- Stats still sit above the video -->
    <div class="about-stats" style="z-index:2; position:relative;">
      <!-- ... same stat elements ... -->
    </div>

  </div>

  <!-- RIGHT: text panel — unchanged -->
  <div class="about-text reveal from-right">
    <!-- ... same content ... -->
  </div>

</section>
```

**In `main.js`:**
```javascript
const aboutVideo = document.getElementById('about-video');
if (aboutVideo) {
  new IntersectionObserver(entries => {
    entries[0].isIntersecting ? aboutVideo.play() : aboutVideo.pause();
  }, { threshold: 0.2 }).observe(aboutVideo);
}
```

---

### C. Packages Section — Already Implemented

The packages section already has a full-width video hero. Key reference:

```html
<div class="pkg-video-wrap">
  <div class="pkg-video-glow"></div>    <!-- animated gold border ring -->
  <video id="pkg-video" class="pkg-video"
    autoplay muted playsinline loop preload="metadata"
    poster="food-poster.jpg">
    <source src="food.webm" type="video/webm">
    <source src="food.mp4"  type="video/mp4">
  </video>
  <div class="pkg-video-overlay"></div>  <!-- dark gradient tint -->
  <div class="pkg-video-content">        <!-- text on top -->
    <h2>...</h2>
  </div>
  <button class="pkg-video-btn" id="pkg-video-btn">⏸</button>
</div>
```

**To change the video:** just replace the `src` attributes in the `<source>` tags.
**To change the height:** edit `.pkg-video-wrap { height: 520px; }` in `style.css`.
**To change the overlay darkness:** edit the `rgba` opacity in `.pkg-video-overlay` in `style.css`.

---

### D. Hero Section — Full-Screen Background Video

Replace the canvas particles with a real video background.

**Step 1 — In `index.html`, replace the `<canvas>` inside `.hero`:**

```html
<section class="hero">
  <div class="hero-bg-pattern" aria-hidden="true"></div>
  <div class="hero-grid-lines"  aria-hidden="true"></div>

  <!-- REPLACE <canvas id="hero-canvas"> with this: -->
  <video
    id="hero-video"
    autoplay muted playsinline loop preload="metadata"
    poster="hero-poster.jpg"
    style="
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      z-index: 1;
      opacity: 0.4;   /* blend with the green background colour */
    "
  >
    <source src="hero-caribbean.webm" type="video/webm">
    <source src="hero-caribbean.mp4"  type="video/mp4">
  </video>

  <!-- Orbs and content remain unchanged -->
  <div class="hero-orb hero-orb-1" aria-hidden="true"></div>
  ...
</section>
```

**Step 2 — In `main.js`, remove the canvas animation code** (the `animateFoodParticles` function and everything related to `heroCanvas`), since the video replaces it.

**Step 3 — Add video pause-on-scroll:**
```javascript
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  new IntersectionObserver(entries => {
    entries[0].isIntersecting ? heroVideo.play() : heroVideo.pause();
  }, { threshold: 0.1 }).observe(heroVideo);
}
```

---

## 4. Animation Types Reference

### A. CSS Keyframe Animations

**What:** Animations defined in CSS that run automatically, no JS needed.
**When to use:** Looping effects, entrance animations, continuous motion.

**How to define:**
```css
/* Step 1: Define the animation in style.css */
@keyframes myAnimation {
  0%   { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Step 2: Apply it to an element */
.my-element {
  animation: myAnimation 0.8s ease-out forwards;
  /*         name        duration  easing   fill-mode */
}
```

**Animation shorthand breakdown:**
```css
animation: name  duration  timing-function  delay  iteration  direction  fill-mode;
animation: pulse  2s        ease-in-out      0.5s   infinite   alternate  both;
```

**Key `animation-fill-mode` values:**
- `forwards` — element stays at final keyframe after animation ends
- `backwards` — element starts at first keyframe even during delay
- `both` — combines both forwards and backwards

**All keyframes used in this project:**

| Keyframe name     | What it does                        | Used on                    |
|-------------------|-------------------------------------|----------------------------|
| `fadeUp`          | Fades in while sliding up           | Hero content, loader       |
| `fadeIn`          | Simple opacity fade                 | Loader subtitle            |
| `marquee`         | Scrolls element left 50%            | Marquee strip              |
| `scrollLine`      | Pulses scale of scroll indicator    | Hero scroll prompt         |
| `orb1` / `orb2`  | Organic position drift              | Hero orbs                  |
| `badgePulse`      | Expanding ring glow                 | Hero badge                 |
| `shimmer`         | Moving gradient sweep               | "Caribbean" word           |
| `floatY`          | Gentle vertical bob                 | About section stats        |
| `rotateSlow`      | 360° spin                           | Service icons on hover     |
| `borderGlow`      | Oscillating border opacity          | Testimonial cards          |
| `lineGrow`        | Horizontal scale from 0 to 1        | Loader progress bar        |
| `lovePulse`       | Scale bounce (heartbeat)            | Hearts, stars              |
| `foodPop`         | Scale + rotate pop-in               | Loader emoji, card emoji   |
| `steamRise`       | Rise and shrink upward              | Steam wisps                |
| `foodWobble`      | Compound float + rotate             | Story panel food emoji     |
| `heartFly`        | Fly outward with CSS custom props   | Burst particles            |
| `confettiFall`    | Fall from top with spin             | Testimonials confetti      |
| `videoGlowPulse`  | Box-shadow pulse on video border    | Packages video frame       |
| `menuCardGlow`    | Box-shadow pulse on menu cards      | Menu cards                 |
| `glowRotate`      | Conic gradient border rotation      | Menu card wrapper          |
| `hotBadgeGlow`    | Small glow on spice badge           | Hot/Extra Hot badges       |

---

### B. Scroll-Triggered Animations (.reveal class)

**What:** Elements start hidden (opacity 0, shifted) and reveal when scrolled into view.
**How:** JS adds `.visible` class via `IntersectionObserver`; CSS transition does the motion.

**To add a reveal to any element — 3 steps:**

```html
<!-- Step 1: Add .reveal to element in index.html -->
<div class="your-element reveal">content</div>

<!-- Optional direction variants (combine with reveal): -->
<div class="reveal from-left">slides in from left</div>
<div class="reveal from-right">slides in from right</div>
<div class="reveal scale-in">scales up from slightly smaller</div>
```

```css
/* Step 2: style.css already defines .reveal — nothing to add */
/* But to customise, override duration/easing: */
.your-element.reveal {
  transition-duration: 1.2s;           /* slower entrance */
  transition-timing-function: ease;    /* different curve */
}
```

```javascript
/* Step 3: main.js automatically watches all .reveal elements */
/* The scrollObserver IntersectionObserver handles it — nothing to add */
```

**Stagger siblings automatically:**
The JS checks `siblings.indexOf(el) * 90ms` — so sibling `.reveal` elements within the same parent automatically stagger. Put multiple cards inside one container:

```html
<div class="card-row">
  <div class="card reveal">Card 1 — appears first</div>
  <div class="card reveal">Card 2 — appears 90ms later</div>
  <div class="card reveal">Card 3 — appears 180ms later</div>
</div>
```

---

### C. Intersection Observer — Custom Triggers

**What:** `IntersectionObserver` fires a callback when an element enters/exits the viewport.
**When to use:** One-shot effects (confetti), lazy-load media, play/pause video, counter animations.

**Template — fire once when element enters view:**

```javascript
// In main.js — add this pattern for any one-shot effect

const myElement = document.getElementById('my-element');

const myObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    // ← put your effect here
    myElement.classList.add('animate');

    myObserver.disconnect(); // remove observer after first trigger
  }
}, {
  threshold: 0.3 // trigger when 30% of element is visible (0.0–1.0)
});

if (myElement) myObserver.observe(myElement);
```

**Template — continuous play/pause (for video or canvas):**

```javascript
const myVideo = document.getElementById('my-video');

new IntersectionObserver(entries => {
  // fires every time visibility changes (enters AND exits)
  if (entries[0].isIntersecting) {
    myVideo.play().catch(() => {}); // .catch prevents console error if blocked
  } else {
    myVideo.pause();
  }
}, { threshold: 0.2 }).observe(myVideo);
```

**Threshold values explained:**

| Threshold | Meaning |
|-----------|---------|
| `0`       | Fires as soon as 1 pixel enters the viewport |
| `0.1`     | Fires when 10% of element is visible |
| `0.5`     | Fires when element is half-visible |
| `1.0`     | Fires only when element is 100% visible |

---

### D. Canvas Particle Animations

**What:** HTML5 `<canvas>` element draws emoji/shapes in a `requestAnimationFrame` loop.
**When to use:** Large numbers of animated items (particles, confetti, snow, bubbles) — much faster than animating individual DOM elements.

**The hero canvas setup:**

```html
<!-- index.html: canvas element inside the section -->
<canvas id="my-canvas" aria-hidden="true"
  style="position:absolute; inset:0; pointer-events:none; z-index:1;">
</canvas>
```

```javascript
// main.js: get context, resize, build particles, animate

const canvas = document.getElementById('my-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

// Always resize canvas to match its container
function resize() {
  W = canvas.width  = canvas.parentElement.offsetWidth;
  H = canvas.height = canvas.parentElement.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

// Create particle objects
const particles = Array.from({ length: 30 }, () => ({
  x:    Math.random() * 1200,
  y:    Math.random() * 800,
  vx:   (Math.random() - 0.5) * 0.5,  // horizontal speed
  vy:   -(Math.random() * 0.5 + 0.2),  // upward speed
  rot:  Math.random() * 360,            // starting rotation
  vrot: (Math.random() - 0.5) * 1.5,   // spin speed
  size: Math.random() * 16 + 14,        // font size in px
  text: '🍗',                           // what to draw
  alpha: Math.random() * 0.5 + 0.25,   // opacity
}));

// Animation loop
function animate() {
  ctx.clearRect(0, 0, W, H); // wipe canvas each frame

  particles.forEach(p => {
    // Update physics
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.vrot;

    // Wrap around edges (left/right, top/bottom)
    if (p.x < -50) p.x = W + 50;
    if (p.x > W + 50) p.x = -50;
    if (p.y < -50) { p.y = H + 50; p.x = Math.random() * W; }

    // Draw
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.font = p.size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
  });

  requestAnimationFrame(animate); // keeps looping
}
animate();
```

**To add a canvas to a new section:**
1. Add `<canvas id="section-canvas">` inside the section in `index.html`
2. Copy the JS block above into `main.js`, changing the ID and particle properties
3. The canvas must have `position: absolute` inside a `position: relative` parent

---

## 5. Menu Item Glow

The menu cards have three layers of glow effect:

### Layer 1 — Ambient pulse (CSS `animation`)
Every card has a `menuCardGlow` animation that slowly pulses a faint gold box-shadow in and out. Each card has a different `animation-delay` so they don't all pulse together:

```css
/* style.css */
.menu-card { animation: menuCardGlow 3.5s ease-in-out infinite; }
.menu-card:nth-child(2) { animation-delay: .4s; }
/* ... etc */

@keyframes menuCardGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(196,154,60,0); }
  50%       { box-shadow: 0 0 0 1px rgba(196,154,60,.25), 0 0 18px 4px rgba(196,154,60,.12); }
}
```

### Layer 2 — Hover intensify (CSS `:hover`)
On hover, the box-shadow grows much brighter (three layers: tight ring, medium glow, wide orange):

```css
.menu-card:hover {
  box-shadow:
    0 0 0  2px rgba(196,154,60,.5),    /* tight gold border */
    0 0 30px 6px rgba(196,154,60,.2),  /* medium gold glow */
    0 0 60px 10px rgba(217,112,58,.1); /* wide orange haze */
}
```

### Layer 3 — Shine sweep (`::after` pseudo element)
A diagonal white highlight sweeps across the card on hover (like a light reflection):

```css
.menu-card::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg,
    transparent 35%, rgba(255,255,255,.08) 50%, transparent 65%);
  background-size: 200% 100%;
  background-position: 100% 0;  /* off-screen right at rest */
  transition: background-position .6s ease;
}
.menu-card:hover::after {
  background-position: -100% 0; /* sweeps to off-screen left on hover */
}
```

---

## 6. Adding Glow to Any Element

### Simple constant glow (always on):

```css
/* style.css */
.my-glowing-element {
  box-shadow:
    0 0 12px 3px rgba(196,154,60,.3),   /* gold inner glow */
    0 0 30px 8px rgba(196,154,60,.1);   /* gold outer haze */
}
```

### Pulsing glow (breathes in and out):

```css
/* Step 1: define the keyframe */
@keyframes myGlow {
  0%, 100% { box-shadow: 0 0 0   0 rgba(196,154,60,0); }
  50%       { box-shadow: 0 0 20px 6px rgba(196,154,60,.4); }
}

/* Step 2: apply to element */
.my-element {
  animation: myGlow 2.5s ease-in-out infinite;
}
```

### Rotating rainbow border (conic gradient):

```css
/* Requires @property for smooth angle animation */
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@keyframes spin-border { to { --angle: 360deg; } }

.my-element {
  padding: 2px; /* space for the border */
  background: conic-gradient(
    from var(--angle),
    rgba(196,154,60,0)   0deg,
    rgba(196,154,60,.8) 80deg,
    rgba(217,112,58,.6) 160deg,
    rgba(196,154,60,0) 240deg
  );
  animation: spin-border 3s linear infinite;
  border-radius: 6px;
}
.my-element > * {
  background: var(--green); /* inner background covers the padding */
  border-radius: 4px;
}
```

### Text glow:

```css
.glowing-text {
  color: var(--gold);
  text-shadow:
    0 0  8px rgba(196,154,60,.8),
    0 0 20px rgba(196,154,60,.4),
    0 0 40px rgba(196,154,60,.2);
}
```

---

## 7. Common Mistakes & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Video won't autoplay | `muted` attribute missing | Add `muted` to `<video>` |
| Video goes fullscreen on iPhone | `playsinline` missing | Add `playsinline` |
| Video plays in tab but not on mobile after navigation | iOS requires user gesture | Add JS retry on first `touchstart` (see main.js section) |
| Canvas is blank / wrong size | Canvas not resized to match container | Call `resize()` function and attach to `window.resize` |
| Glow animation causes layout shift | `box-shadow` changes layout flow | Use `box-shadow` not `border` — box-shadow doesn't affect layout |
| `@property` conic gradient not working | Browser support gap | Add `@supports` check or use fallback static border |
| `.reveal` elements not animating | Element not observed by IntersectionObserver | Ensure element has `.reveal` class before JS runs (not added dynamically) |
| Scroll handler fires too often | No rAF throttling | Wrap in `if (!ticking) { requestAnimationFrame(fn); ticking=true; }` |
| Video causes page jank | Large uncompressed video | Compress video; use `preload="metadata"` not `preload="auto"` |
| `@keyframes` animation not running | `animation-fill-mode` conflict | Check no conflicting `opacity: 0` or `transform: none` inline style |

---

## 8. Quick-Copy Templates

### Video Autoplay Block (paste anywhere in index.html):

```html
<div style="position:relative; width:100%; height:400px; overflow:hidden; border-radius:8px;">
  <video
    autoplay muted playsinline loop preload="metadata"
    poster="YOUR-POSTER.jpg"
    style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
  >
    <source src="YOUR-VIDEO.webm" type="video/webm">
    <source src="YOUR-VIDEO.mp4"  type="video/mp4">
  </video>
  <!-- Dark overlay -->
  <div style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:1;"></div>
  <!-- Text on top -->
  <div style="position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;">
    <h2 style="color:#fff;">Your Text Here</h2>
  </div>
</div>
```

---

### Pause-on-Scroll JS (paste into main.js for any video):

```javascript
(function() {
  const vid = document.getElementById('YOUR-VIDEO-ID');
  if (!vid) return;
  new IntersectionObserver(e => {
    e[0].isIntersecting ? vid.play().catch(()=>{}) : vid.pause();
  }, { threshold: 0.2 }).observe(vid);
})();
```

---

### Pulsing Glow CSS (paste into style.css):

```css
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(196,154,60,0); }
  50%       { box-shadow: 0 0 20px 5px rgba(196,154,60,.35); }
}
.glow-element {
  animation: glowPulse 3s ease-in-out infinite;
}
```

---

### Scroll-Triggered Reveal (add class to any element):

```html
<!-- in index.html -->
<div class="any-element reveal">Content reveals on scroll</div>
<div class="any-element reveal from-left">Slides from left</div>
<div class="any-element reveal from-right">Slides from right</div>
```

*(No JS change needed — existing IntersectionObserver in main.js handles it)*

---

### One-Shot Effect on Scroll (paste into main.js):

```javascript
const myEl = document.getElementById('my-el');
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    myEl.classList.add('my-active-class');
    // fire your effect here:
    // myEl.style.animation = 'myAnim 1s forwards';
    entries[0].target._io.disconnect(); // cleanup
  }
}, { threshold: 0.3 }).observe(myEl);
```

---

*End of Documentation*
*Avenues of the Caribbean — AOC · Washington DC*
