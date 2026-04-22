/**
 * main.js — Avenues of the Caribbean
 *
 * Sections:
 *   1.  Page Loader
 *   2.  Custom Cursor
 *   3.  Navigation — Scroll-to-Green
 *   4.  Hero Particles (Canvas)
 *   5.  Hero Mouse Parallax
 *   6.  Hero Title Word Stagger
 *   7.  Intersection Observer (Reveals, Counters, Split-chars)
 *   8.  Counter Animation
 *   9.  Pinned Story Panel Data
 *  10.  Menu Card 3D Tilt
 *  11.  Magnetic Buttons
 *  12.  Heart & Food Burst on Menu Hover
 *  13.  Food Confetti on Testimonials
 *  14.  Scroll Handler (main rAF loop)
 *       — Progress Bar
 *       — Hero Exit Parallax
 *       — Grid Lines Drift
 *       — Kinetic Bands
 *       — Story Pin Scrub
 *       — Menu Card Parallax
 *       — Scrub Line
 *       — Clip-path Reveals
 *       — Split-char Reveals
 *       — Kinetic Word Lighting
 */

'use strict';


/* ─────────────────────────────────────────────────────────────
   MOBILE DETECTION
   A single boolean checked before every desktop-only feature.
   We use matchMedia('(pointer: coarse)') — the most reliable
   signal that the primary input is a finger, not a mouse.
   window.ontouchstart is a common fallback check.

   Effects disabled on mobile:
     • Custom cursor (no pointer on touchscreen)
     • 3D card tilt (mousemove doesn't fire on touch)
     • Magnetic buttons (same reason)
     • Hero mouse parallax (mousemove-based)
     • Marquee runs at half speed (set in CSS via animation-duration)
───────────────────────────────────────────────────────────── */
const isMobile = window.matchMedia('(pointer: coarse)').matches
              || 'ontouchstart' in window
              || navigator.maxTouchPoints > 0;


/* ─────────────────────────────────────────────────────────────
   1. PAGE LOADER
───────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 1200);
});


/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   Skipped entirely on mobile — isMobile guard means the rAF
   loop never starts, saving CPU on every frame.
   CSS also sets #cursor-dot / #cursor-ring to display:none
   inside the 900px media query as a belt-and-suspenders fix.
───────────────────────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (!isMobile && cursorDot && cursorRing) {
  // Target position (mouse) and current ring position (lerped)
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // rAF loop: snap dot, lerp ring toward mouse
  (function animateCursor() {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';

    // Ring interpolates at 14% per frame — creates the lag effect
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';

    requestAnimationFrame(animateCursor);
  })();

  // Scale cursor up on interactive elements
  document.querySelectorAll('a, button, .menu-card, .pkg-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width  = '16px';
      cursorDot.style.height = '16px';
      cursorRing.style.width  = '52px';
      cursorRing.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width  = '8px';
      cursorDot.style.height = '8px';
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   3. NAVIGATION — SCROLL-TO-GREEN
   Toggles .scrolled class on <nav> when the user scrolls past
   60px. CSS handles the background transition to dark green.
───────────────────────────────────────────────────────────── */
const mainNav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ─────────────────────────────────────────────────────────────
   4. HERO PARTICLES (Canvas)
   Draws floating food emoji on an HTML5 <canvas> that covers
   the hero section. Each particle moves upward (negative vy),
   drifts sideways, and rotates. Wraps around edges.
   Using canvas instead of DOM elements for performance.
───────────────────────────────────────────────────────────── */
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx    = heroCanvas.getContext('2d');

let canvasW, canvasH;

// Resize canvas to match hero section dimensions
function resizeCanvas() {
  canvasW = heroCanvas.width  = heroCanvas.parentElement.offsetWidth;
  canvasH = heroCanvas.height = heroCanvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// All possible food/love emoji that appear as particles
const FOOD_EMOJIS = ['🍗','🦐','🌶️','🍚','❤️','🧡','💛','🥘','🍋','🧅','🍌','🥗'];

// Build particle array — each with random starting position, speed, rotation
const foodParticles = Array.from({ length: 28 }, () => ({
  x:     Math.random() * 1400,
  y:     Math.random() * 900 + 100,
  vy:    -(Math.random() * 0.5 + 0.2), // float upward
  vx:    (Math.random() - 0.5) * 0.3,  // gentle sideways drift
  rot:   Math.random() * 360,
  vrot:  (Math.random() - 0.5) * 1.2,  // spin speed
  size:  Math.random() * 14 + 16,       // 16–30px
  emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
  alpha: Math.random() * 0.55 + 0.25,   // semi-transparent
}));

// Animation loop — clear, update, redraw every particle
function animateFoodParticles() {
  heroCtx.clearRect(0, 0, canvasW, canvasH);

  foodParticles.forEach(p => {
    // Update position and rotation
    p.y   += p.vy;
    p.x   += p.vx;
    p.rot += p.vrot;

    // Wrap around top edge — reset to bottom with new random x
    if (p.y < -40) { p.y = canvasH + 20; p.x = Math.random() * canvasW; }

    // Draw emoji with transform (translate + rotate)
    heroCtx.save();
    heroCtx.globalAlpha = p.alpha;
    heroCtx.translate(p.x, p.y);
    heroCtx.rotate(p.rot * Math.PI / 180);
    heroCtx.font = p.size + 'px serif';
    heroCtx.textAlign    = 'center';
    heroCtx.textBaseline = 'middle';
    heroCtx.fillText(p.emoji, 0, 0);
    heroCtx.restore();
  });

  requestAnimationFrame(animateFoodParticles);
}
animateFoodParticles();


/* ─────────────────────────────────────────────────────────────
   5. HERO MOUSE PARALLAX
   Skipped on mobile — mousemove doesn't fire on touchscreens.
   On mobile, content stays centred and static (better UX anyway).
───────────────────────────────────────────────────────────── */
const heroSection = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const heroOrbs    = document.querySelectorAll('.hero-orb');

if (!isMobile && heroSection) {
  heroSection.addEventListener('mousemove', e => {
    const { left, top, width, height } = heroSection.getBoundingClientRect();
    const px = (e.clientX - left) / width  - 0.5;
    const py = (e.clientY - top)  / height - 0.5;

    heroContent.style.transform = `translate(${px * 14}px, ${py * 10}px)`;

    heroOrbs.forEach((orb, i) => {
      const magnitude = (i + 1) * 22;
      orb.style.transform = `translate(${-px * magnitude}px, ${-py * magnitude}px)`;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    heroContent.style.transform = '';
    heroOrbs.forEach(orb => orb.style.transform = '');
  });
}


/* ─────────────────────────────────────────────────────────────
   6. HERO TITLE WORD STAGGER
   Each word in the hero title has class .word.
   CSS keeps them invisible with a 3D rotateX tilt.
   JS adds .show to each word on a staggered delay,
   triggering the CSS transition (flip-up entrance).
───────────────────────────────────────────────────────────── */
document.querySelectorAll('.hero-title .word').forEach((word, i) => {
  // 600ms initial delay, then 140ms per word
  setTimeout(() => word.classList.add('show'), 600 + i * 140);
});


/* ─────────────────────────────────────────────────────────────
   7. INTERSECTION OBSERVER
   A single IntersectionObserver watches three types of elements:
   a) .reveal elements — fade/slide in when they enter the viewport
   b) [data-count] elements — trigger counter animation
   c) .split-chars elements — trigger character cascade
   c) .heading-underline elements — trigger underline draw
   Each element is unobserved after it triggers (fires once).
───────────────────────────────────────────────────────────── */
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // a) Reveal: stagger siblings that appear together
    if (el.classList.contains('reveal')) {
      const siblings = [...el.parentElement.querySelectorAll('.reveal')];
      const delay    = siblings.indexOf(el) * 90; // 90ms between each sibling
      setTimeout(() => el.classList.add('visible'), delay);
    }

    // b) Counter: count up from 0 to data-count value
    if (el.dataset.count) {
      animateCounter(el);
    }

    // c) Split-chars: set per-character transition delays, then reveal
    if (el.classList.contains('split-chars')) {
      el.querySelectorAll('span').forEach((span, i) => {
        span.style.transitionDelay = (i * 28) + 'ms'; // cascade 28ms apart
      });
      el.classList.add('visible');
    }

    scrollObserver.unobserve(el); // fire once only
  });
}, { threshold: 0.13 });

// Observe all elements that need scroll-triggered behaviour
document.querySelectorAll('.reveal, [data-count], .split-chars').forEach(el => {
  scrollObserver.observe(el);
});

// JS splits heading characters and adds .split-chars class
document.querySelectorAll('.area-heading, .about-heading').forEach(el => {
  // Preserve em tags by only replacing bare text characters
  el.classList.add('split-chars');
  el.innerHTML = el.innerHTML.replace(/([A-Za-zÀ-ÿ.,!?''\-])/g, '<span>$1</span>');
});


/* ─────────────────────────────────────────────────────────────
   8. COUNTER ANIMATION
   Animates a number from 0 to its target using easing.
   target = data-count attribute (integer)
   suffix = data-suffix attribute (e.g. "h", "+", "★")
   Duration: 1400ms with cubic ease-out curve.
───────────────────────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / duration, 1); // 0 → 1
    const eased   = 1 - Math.pow(1 - t, 3);          // cubic ease-out

    el.textContent = Math.round(eased * target) + suffix;

    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ─────────────────────────────────────────────────────────────
   9. PINNED STORY PANEL DATA
   The story panel is 400vh tall. As the user scrolls through
   it, JS maps the scroll progress (0–1) to one of 4 dishes.
   When the dish index changes, the text elements transition out
   (slide + fade), content is swapped, then they transition back in.
───────────────────────────────────────────────────────────── */

// Dataset for the four featured dishes
const STORY_DISHES = [
  {
    name: 'Griot<br><em>Pork Nuggets</em>',
    desc: 'Marinated in a spicy citrus-infused blend, these tender pork shoulder nuggets absorb layers of flavor before being fried to golden, crunchy perfection. A Haitian staple — served with pikliz.',
    tag:  '🔥 Extra Hot · Feeds 10',
    num:  '01',
  },
  {
    name: 'Stewed<br><em>Oxtail</em>',
    desc: 'Succulent bone-in oxtail chunks and carrots slow-cooked in a delicious sweet and savory stew until impossibly tender. The richest bowl you will ever taste.',
    tag:  'Mains · Feeds 8–10',
    num:  '02',
  },
  {
    name: 'Black<br><em>Mushroom Rice</em>',
    desc: 'Riz djon-djon — a traditional Haitian rice dish fragrant with black mushroom and flavorsome to the last grain. It steals the show at every party, every time.',
    tag:  'Haitian Classic · Feeds 10',
    num:  '03',
  },
  {
    name: 'Curry<br><em>Shrimp</em>',
    desc: 'Scrumptious shrimp in a lightly spiced creamy coconut curry sauce — a delicate balance of heat and sweetness. Best served over white rice.',
    tag:  'Seafood · Feeds 10',
    num:  '04',
  },
];

// Cache DOM references for story panel elements (queried once for performance)
const storyName = document.getElementById('story-name');
const storyDesc = document.getElementById('story-desc');
const storyTag  = document.getElementById('story-tag');
const storyBigNum  = document.getElementById('story-big-num');
const storyFill    = document.getElementById('story-fill');
const storyCurrent = document.getElementById('story-cur');
const storyDots    = document.querySelectorAll('.story-dot');

let activeStoryIndex = 0; // track which dish is currently shown

/**
 * setStory — transitions from current dish to a new one.
 * @param {number} newIndex - index into STORY_DISHES array
 */
function setStory(newIndex) {
  if (newIndex === activeStoryIndex) return;

  // Choose exit direction: scroll up → exit up, scroll down → exit down
  const exitClass = newIndex < activeStoryIndex ? 'story-dish-out' : 'story-dish-in';
  const elements  = [storyName, storyDesc, storyTag];

  // Step 1: exit animation (remove active, add exit state)
  elements.forEach(el => {
    el.classList.remove('story-dish-active');
    el.classList.add(exitClass);
  });

  // Step 2: after exit animation, swap content and enter
  setTimeout(() => {
    const dish = STORY_DISHES[newIndex];
    storyName.innerHTML      = dish.name;
    storyDesc.textContent    = dish.desc;
    storyTag.textContent     = dish.tag;
    storyBigNum.textContent  = dish.num;
    storyCurrent.textContent = dish.num;

    // Update navigation dots
    storyDots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));

    // Switch to entering state, then to active on next frame
    elements.forEach(el => {
      el.classList.remove(exitClass);
      el.classList.add('story-dish-in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.remove('story-dish-in');
          el.classList.add('story-dish-active');
        });
      });
    });
  }, 240); // matches CSS transition duration (.45s / 2 ≈ 240ms)

  activeStoryIndex = newIndex;
}


/* ─────────────────────────────────────────────────────────────
   10. MENU CARD 3D TILT
   Desktop only — mousemove doesn't fire on touchscreens.
   On mobile we skip this entirely to avoid: (a) incorrect
   transforms from synthesised touch→mouse events, and
   (b) the residual transform left on the card if touchend
   fires but mouseleave doesn't.
───────────────────────────────────────────────────────────── */
if (!isMobile) {
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const px = (e.clientX - left) / width  - 0.5;
      const py = (e.clientY - top)  / height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .4s ease';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 400);
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   11. MAGNETIC BUTTONS
   Desktop only — same reason as 3D tilt. Magnetic pull relies
   on continuous mousemove tracking which touchscreens don't
   provide between touchstart and touchend.
───────────────────────────────────────────────────────────── */
if (!isMobile) {
  document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform .1s ease, background .2s';
    });
    btn.addEventListener('mousemove', e => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const dx = (e.clientX - left - width  / 2) * 0.22;
      const dy = (e.clientY - top  - height / 2) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .4s ease, background .2s';
      btn.style.transform  = '';
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   12. HEART & FOOD BURST ON MENU HOVER
   When the user hovers a menu card, multiple emoji particles
   are spawned at the card's top-centre. Each particle has a
   random direction, distance, scale, and rotation encoded as
   CSS custom properties (--hx, --hy, --hs, --hr) on the element.
   The heartFly CSS animation reads those values.
   Elements are removed from the DOM after the animation ends.
───────────────────────────────────────────────────────────── */
const BURST_EMOJIS = ['❤️','🧡','💛','💚','🍗','🦐','🌶️','🍚','✨','🎉'];

function spawnBurst(x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    const el    = document.createElement('div');
    el.className = 'heart-burst';

    // Random polar coordinates → cartesian offsets
    const angle    = Math.random() * 2 * Math.PI;
    const distance = 60 + Math.random() * 90;
    el.style.setProperty('--hx', `${Math.cos(angle) * distance}px`);
    el.style.setProperty('--hy', `${Math.sin(angle) * distance - 60}px`); // bias upward
    el.style.setProperty('--hs', `${Math.random() * 0.8 + 0.5}`);
    el.style.setProperty('--hr', `${(Math.random() - 0.5) * 60}deg`);

    el.style.left           = x + 'px';
    el.style.top            = y + 'px';
    el.style.animationDelay = (i * 60) + 'ms'; // stagger each piece
    el.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];

    document.body.appendChild(el);
    // Clean up after animation completes (1100ms + delay)
    setTimeout(() => el.remove(), 1300 + i * 60);
  }
}

// Attach burst to each menu card
document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const rect = card.getBoundingClientRect();
    spawnBurst(rect.left + rect.width / 2, rect.top + 30);
  });
});


/* ─────────────────────────────────────────────────────────────
   13. FOOD CONFETTI ON TESTIMONIALS
   When the testimonials section scrolls into view for the first
   time, 36 food/heart emoji rain from the top of the screen.
   An IntersectionObserver fires once and then disconnects.
   Each confetti piece is a positioned div with the confettiFall
   CSS animation, set to a random x position and duration.
───────────────────────────────────────────────────────────── */
const CONFETTI_EMOJIS = ['❤️','🧡','💛','🍗','🦐','🌶️','🍚','✨','🎉','💚','🥘','🍋'];
let confettiFired = false;

function fireConfetti() {
  if (confettiFired) return;
  confettiFired = true;

  for (let i = 0; i < 36; i++) {
    // Stagger spawn: one piece every ~80ms
    setTimeout(() => {
      const el        = document.createElement('div');
      el.className    = 'confetti-piece';
      el.textContent  = CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)];
      el.style.left              = (Math.random() * 100) + 'vw';
      el.style.animationDuration = (2.2 + Math.random() * 2.5) + 's';
      el.style.fontSize          = (1 + Math.random()) + 'rem';
      document.body.appendChild(el);

      // Remove element after animation finishes to keep DOM clean
      setTimeout(() => el.remove(), 5500);
    }, i * 80);
  }
}

// One-shot observer — fires confetti when testimonials enter view
const confettiSection  = document.getElementById('testimonials');
const confettiObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    fireConfetti();
    confettiObserver.disconnect(); // never fire again
  }
}, { threshold: 0.3 });
if (confettiSection) confettiObserver.observe(confettiSection);


/* ─────────────────────────────────────────────────────────────
   VIDEO AUTOPLAY — PACKAGES SECTION
   Three behaviours managed here:

   A) Pause when off-screen (IntersectionObserver)
      — saves CPU and battery when user isn't looking at it
      — browser also requires this for some autoplay policies

   B) Play/Pause toggle button
      — clicking the ⏸/▶ button toggles playback manually

   C) Retry play on user interaction
      — some browsers (Safari iOS) block autoplay entirely until
        the user touches the page; we listen for that first touch
        and attempt video.play() again
───────────────────────────────────────────────────────────── */
const pkgVideo   = document.getElementById('pkg-video');
const pkgVidBtn  = document.getElementById('pkg-video-btn');
const pkgVidIcon = document.getElementById('pkg-video-icon');

if (pkgVideo) {

  /* A) Pause when video scrolls out of view, resume when back */
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pkgVideo.play().catch(() => {}); // .catch avoids unhandled promise on block
      } else {
        pkgVideo.pause();
      }
    });
  }, { threshold: 0.2 }); // trigger when 20% of video is visible

  videoObserver.observe(pkgVideo);

  /* B) Manual play/pause toggle button */
  if (pkgVidBtn) {
    pkgVidBtn.addEventListener('click', () => {
      if (pkgVideo.paused) {
        pkgVideo.play();
        pkgVidIcon.textContent = '⏸';
        pkgVidBtn.setAttribute('aria-label', 'Pause video');
      } else {
        pkgVideo.pause();
        pkgVidIcon.textContent = '▶';
        pkgVidBtn.setAttribute('aria-label', 'Play video');
      }
    });

    /* Keep button icon in sync if video pauses for any other reason */
    pkgVideo.addEventListener('pause', () => { pkgVidIcon.textContent = '▶'; });
    pkgVideo.addEventListener('play',  () => { pkgVidIcon.textContent = '⏸'; });
  }

  /* C) Retry on first user interaction (Safari iOS autoplay workaround) */
  const retryPlay = () => {
    pkgVideo.play().catch(() => {});
    document.removeEventListener('touchstart', retryPlay); // fire once
    document.removeEventListener('click',      retryPlay);
  };
  document.addEventListener('touchstart', retryPlay, { once: true });
  document.addEventListener('click',      retryPlay, { once: true });
}


/* ─────────────────────────────────────────────────────────────
   A single scroll listener drives all scroll-position-dependent
   effects. Uses requestAnimationFrame + a ticking flag so the
   handler runs once per frame, not multiple times per scroll event.

   Effects handled here:
   ─ Scroll Progress Bar width
   ─ Hero content exit parallax (fades + lifts as you leave hero)
   ─ Hero grid lines drift
   ─ Kinetic text bands horizontal position
   ─ Story pin scrub (maps scroll to dish index)
   ─ Menu card vertical parallax
   ─ Gold scrub line scale
   ─ Clip-path reveals on headings
   ─ Kinetic word lighting (words near viewport centre turn gold)
───────────────────────────────────────────────────────────── */

// Cache references to avoid repeated querySelector calls on every scroll
const progressBar  = document.getElementById('scroll-progress');
const gridLines    = document.querySelector('.hero-grid-lines');
const kineticTrack1 = document.getElementById('kinetic-track1');
const kineticTrack2 = document.getElementById('kinetic-track2');
const storyPin      = document.getElementById('story-pin');
const menuCards     = document.querySelectorAll('.menu-card');
const scrubLine     = document.getElementById('scrub-line');
const scrubWrapper  = document.querySelector('.scrub-line-wrap');

// Add clip-reveal class to section headings that wipe in on scroll
document.querySelectorAll('.packages-heading, .services-heading, .testimonials-heading')
  .forEach(h => h.classList.add('clip-reveal'));

let ticking = false; // rAF gate — prevents multiple frames per scroll burst

function onScroll() {
  const scrollY  = window.scrollY;
  const docH     = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollY / docH; // 0 → 1 across full page

  /* ── Scroll progress bar ────────────────────────────────── */
  progressBar.style.width = (progress * 100) + '%';

  /* ── Hero exit parallax ─────────────────────────────────── */
  // Content lifts up and fades as user scrolls away from hero
  if (heroContent) {
    const heroHeight = heroSection.offsetHeight;
    const ratio      = Math.min(scrollY / heroHeight, 1); // 0 at top, 1 when past hero
    heroContent.style.transform = `translateY(${ratio * -80}px) scale(${1 - ratio * 0.05})`;
    heroContent.style.opacity   = String(1 - ratio * 1.4);
  }

  /* ── Grid lines parallax (slower than scroll = depth effect) */
  if (gridLines) gridLines.style.transform = `translateY(${scrollY * 0.18}px)`;

  /* ── Kinetic text bands ─────────────────────────────────── */
  // On mobile: halve the scroll multiplier (0.35→0.18, 0.28→0.14)
  // so the fast movement doesn't cause a layout-width flash on narrow screens.
  const kSpeed = isMobile ? 0.5 : 1;
  if (kineticTrack1) kineticTrack1.style.transform = `translateX(${-(scrollY * 0.35 * kSpeed)}px)`;
  if (kineticTrack2) kineticTrack2.style.transform = `translateX(${  scrollY * 0.28 * kSpeed }px)`;

  /* ── Kinetic word lighting ──────────────────────────────── */
  // Words near the horizontal centre of the screen get .lit (turn gold)
  document.querySelectorAll('.kinetic-item').forEach(item => {
    const rect   = item.getBoundingClientRect();
    const centre = rect.left + rect.width / 2;
    const near   = Math.abs(centre - window.innerWidth / 2) < 240;
    item.classList.toggle('lit', near);
  });

  /* ── Story pin scrub ────────────────────────────────────── */
  // Map scroll position within the 400vh story-pin to dish index 0–3
  if (storyPin && storyFill) {
    const pinTop    = storyPin.offsetTop;
    const pinHeight = storyPin.offsetHeight;
    const viewH     = window.innerHeight;
    const scrollIn  = scrollY - pinTop; // how far into the pin we've scrolled

    if (scrollIn >= 0 && scrollIn <= pinHeight - viewH) {
      const t   = scrollIn / (pinHeight - viewH); // 0 → 1 through pin
      storyFill.style.height = (t * 100) + '%';  // grow gold progress bar

      // Map t (0–1) to dish index (0–3), clamped
      const newIndex = Math.min(
        Math.floor(t * STORY_DISHES.length),
        STORY_DISHES.length - 1
      );
      setStory(newIndex);
    }
  }

  /* ── Menu card vertical parallax ───────────────────────── */
  // Cards in different columns drift at different speeds (0%, 6%, 12%)
  // This creates a staggered depth effect as you scroll through the grid
  menuCards.forEach((card, i) => {
    const rect  = card.getBoundingClientRect();
    const viewH = window.innerHeight;

    if (rect.top < viewH && rect.bottom > 0) {
      // Distance of card's centre from viewport centre
      const centreOffset = rect.top + rect.height / 2 - viewH / 2;
      const speed = (i % 3 === 0) ? 0 : (i % 3 === 1) ? 0.06 : 0.12;

      // Only apply if card isn't currently being 3D-tilted by mouse
      if (!card.style.transform.includes('perspective')) {
        card.style.transform = `translateY(${centreOffset * speed}px)`;
      }
    }
  });

  /* ── Gold scrub line ────────────────────────────────────── */
  // The gold horizontal line above packages grows left→right on scroll
  if (scrubLine && scrubWrapper) {
    const rect = scrubWrapper.getBoundingClientRect();
    // t = 0 when element is at bottom of viewport, 1 when at top
    const t = 1 - Math.max(0, Math.min(1, rect.top / window.innerHeight));
    scrubLine.style.transform = `scaleX(${t})`;
  }

  /* ── Clip-path heading reveals ──────────────────────────── */
  // Headings wipe in from top when they're near the bottom of the viewport
  document.querySelectorAll('.clip-reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) el.classList.add('visible');
  });

  ticking = false; // release gate for next scroll event
}

// Throttle scroll handler to one rAF per scroll burst
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true }); // passive: true = browser doesn't wait for preventDefault

// Run once immediately on page load so initial state is correct
onScroll();
