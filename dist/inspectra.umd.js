(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Inspectra = {}));
})(this, (function (exports) {
  'use strict';

/*!
 * Inspectra v1.0.0
 * AI element inspection visual effect
 * https://github.com/livrasand/Inspectra
 * MIT License
 */

const STYLES = `
.inspectra-wrapper {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
}

.inspectra-wrapper.inspectra-block {
  display: block;
}

/* Outer glow ring — breathes softly */
.inspectra-glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 9997;
  box-shadow:
    0 0 0 1px rgba(120, 140, 255, 0.18),
    0 0 18px 2px rgba(100, 120, 255, 0.12),
    0 0 40px 4px rgba(80, 100, 220, 0.07);
  animation: inspectra-breathe var(--inspectra-breathe-duration, 3.5s) ease-in-out infinite;
}

/* Rotating gradient border via conic-gradient on pseudo */
.inspectra-ring {
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 9998;
  background: conic-gradient(
    from var(--inspectra-angle, 0deg),
    transparent 0deg,
    rgba(140, 160, 255, 0.0) 60deg,
    rgba(160, 180, 255, 0.55) 120deg,
    rgba(200, 210, 255, 0.85) 180deg,
    rgba(160, 180, 255, 0.55) 240deg,
    rgba(140, 160, 255, 0.0) 300deg,
    transparent 360deg
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1.5px;
  animation: inspectra-rotate var(--inspectra-ring-duration, 4s) linear infinite;
}

/* Canvas for floating particles — positioned outside element */
.inspectra-canvas {
  position: absolute;
  inset: -32px;
  pointer-events: none;
  z-index: 9999;
  border-radius: inherit;
}

/* Inner sweep — light band scrolling top to bottom */
.inspectra-sweep {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 9995;
  overflow: hidden;
}

.inspectra-sweep::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(
    to bottom,
    transparent                   0%,
    rgba(50, 70, 180, 0.13)       18%,
    rgba(80, 105, 220, 0.28)      38%,
    rgba(100, 130, 240, 0.18)     55%,
    rgba(50, 70, 180, 0.06)       72%,
    transparent                   100%
  );
  animation: inspectra-sweep var(--inspectra-sweep-duration, 3.2s) cubic-bezier(0.4, 0, 0.6, 1) infinite;
  top: 0;
}

@keyframes inspectra-sweep {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(220%); }
}

.inspectra-paused .inspectra-sweep::after {
  animation-play-state: paused;
}

/* Hole/vignette — edge glow pressing inward from all sides */
.inspectra-hole {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 9996;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%,   rgba(80, 100, 220, 0.38) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(60,  80, 200, 0.32) 0%, transparent 70%),
    radial-gradient(ellipse 50% 80% at 0%   50%, rgba(80, 100, 220, 0.28) 0%, transparent 70%),
    radial-gradient(ellipse 50% 80% at 100% 50%, rgba(80, 100, 220, 0.28) 0%, transparent 70%);
  animation: inspectra-hole-breathe var(--inspectra-hole-duration, 4s) ease-in-out infinite;
}

@keyframes inspectra-hole-breathe {
  0%, 100% { opacity: 0.85; }
  50%       { opacity: 1; }
}

.inspectra-paused .inspectra-hole {
  animation-play-state: paused;
}

/* Fade-in entrance */
.inspectra-wrapper .inspectra-glow,
.inspectra-wrapper .inspectra-ring,
.inspectra-wrapper .inspectra-canvas,
.inspectra-wrapper .inspectra-hole,
.inspectra-wrapper .inspectra-sweep {
  animation-fill-mode: both;
}

@property --inspectra-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes inspectra-rotate {
  to { --inspectra-angle: 360deg; }
}

@keyframes inspectra-breathe {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(120, 140, 255, 0.18),
      0 0 18px 2px rgba(100, 120, 255, 0.12),
      0 0 40px 4px rgba(80, 100, 220, 0.07);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(140, 165, 255, 0.28),
      0 0 28px 4px rgba(100, 120, 255, 0.2),
      0 0 60px 8px rgba(80, 100, 220, 0.12);
  }
}

/* Paused */
.inspectra-paused .inspectra-ring {
  animation-play-state: paused;
}
.inspectra-paused .inspectra-glow {
  animation-play-state: paused;
}
`;

let _stylesInjected = false;

function injectStyles() {
  if (_stylesInjected) return;
  const style = document.createElement('style');
  style.id = 'inspectra-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
  _stylesInjected = true;
}

/* ── Particle system ── */
function createParticleSystem(wrapper, opts) {
  const canvas = document.createElement('canvas');
  canvas.className = 'inspectra-canvas';
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const PAD = 32;
  const COUNT = opts.particles !== undefined ? opts.particles : 18;

  let raf = null;
  let alive = true;

  const color = opts.color || [130, 150, 255];
  const [r, g, b] = color;

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    canvas.width  = rect.width  + PAD * 2;
    canvas.height = rect.height + PAD * 2;
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(wrapper);

  // Each particle: position relative to canvas center, orbit radius, angle, speed, size, opacity phase
  const particles = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2;
    const w = canvas.width;
    const h = canvas.height;
    const rx = (w / 2 - PAD * 0.3) * (0.85 + Math.random() * 0.3);
    const ry = (h / 2 - PAD * 0.3) * (0.85 + Math.random() * 0.3);
    return {
      angle,
      rx,
      ry,
      speed: (0.0003 + Math.random() * 0.0004) * (Math.random() < 0.5 ? 1 : -1),
      size: 1.2 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.008 + Math.random() * 0.012,
      drift: (Math.random() - 0.5) * 0.0002,
    };
  });

  let t = 0;

  function draw() {
    if (!alive) return;
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (const p of particles) {
      p.angle += p.speed;
      p.phase += p.phaseSpeed;
      p.rx += p.drift;
      p.ry += p.drift;

      const x = cx + Math.cos(p.angle) * p.rx;
      const y = cy + Math.sin(p.angle) * p.ry;
      const alpha = 0.15 + 0.55 * ((Math.sin(p.phase) + 1) / 2);

      // Soft glow dot
      const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3.5);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.4})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(x, y, p.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  draw();

  return {
    pause() { if (raf) { cancelAnimationFrame(raf); raf = null; } },
    resume() { if (!raf && alive) draw(); },
    destroy() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
    }
  };
}

function buildOverlay(wrapper, opts) {
  if (opts.sweepDuration)   wrapper.style.setProperty('--inspectra-sweep-duration',   opts.sweepDuration);
  if (opts.ringDuration)    wrapper.style.setProperty('--inspectra-ring-duration',    opts.ringDuration);
  if (opts.breatheDuration) wrapper.style.setProperty('--inspectra-breathe-duration', opts.breatheDuration);
  if (opts.holeDuration)    wrapper.style.setProperty('--inspectra-hole-duration',    opts.holeDuration);
  if (opts.speed) {
    const s = opts.speed;
    wrapper.style.setProperty('--inspectra-sweep-duration',   `${3.2 / s}s`);
    wrapper.style.setProperty('--inspectra-ring-duration',    `${4   / s}s`);
    wrapper.style.setProperty('--inspectra-breathe-duration', `${3.5 / s}s`);
    wrapper.style.setProperty('--inspectra-hole-duration',    `${4   / s}s`);
  }

  const sweep = document.createElement('div');
  sweep.className = 'inspectra-sweep';

  const hole = document.createElement('div');
  hole.className = 'inspectra-hole';

  const glow = document.createElement('div');
  glow.className = 'inspectra-glow';

  const ring = document.createElement('div');
  ring.className = 'inspectra-ring';

  wrapper.appendChild(sweep);
  wrapper.appendChild(hole);
  wrapper.appendChild(glow);
  wrapper.appendChild(ring);

  const particles = createParticleSystem(wrapper, opts);

  return { sweep, hole, glow, ring, particles };
}

/**
 * Activate the Inspectra effect on an element.
 *
 * @param {HTMLElement|string} target  - Element or CSS selector
 * @param {object}             options - Configuration options
 * @param {boolean} [options.block=false]           - Force wrapper to display:block
 * @param {boolean} [options.paused=false]          - Start with animation paused
 * @param {number}  [options.particles=4]           - Number of floating particles
 * @param {number[]} [options.color=[130,150,255]]  - RGB color for particles/glow
 * @param {number}  [options.speed]                 - Global speed multiplier (e.g. 2 = 2x faster, 0.5 = half speed)
 * @param {string}  [options.sweepDuration]         - Duration of sweep pass (e.g. '2s'). Overrides speed.
 * @param {string}  [options.ringDuration]          - Duration of ring rotation (e.g. '2s'). Overrides speed.
 * @param {string}  [options.breatheDuration]       - Duration of glow breathe cycle (e.g. '2s'). Overrides speed.
 * @param {string}  [options.holeDuration]          - Duration of hole breathe cycle (e.g. '2s'). Overrides speed.
 * @returns {object} Control object — { pause, resume, destroy }
 */
function inspect(target, options = {}) {
  injectStyles();

  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error(`[Inspectra] Element not found: ${target}`);

  // If already inspected, destroy first
  if (el.__inspectra) el.__inspectra.destroy();

  const opts = Object.assign({ block: false, paused: false, particles: 4 }, options);

  // Wrap element
  const wrapper = document.createElement('div');
  wrapper.className = 'inspectra-wrapper' + (opts.block ? ' inspectra-block' : '');

  // Preserve computed styles that affect layout
  const computed = window.getComputedStyle(el);
  if (computed.borderRadius !== '0px') {
    wrapper.style.borderRadius = computed.borderRadius;
  }

  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);

  const { particles } = buildOverlay(wrapper, opts);

  if (opts.paused) {
    wrapper.classList.add('inspectra-paused');
    particles.pause();
  }

  const controls = {
    pause() {
      wrapper.classList.add('inspectra-paused');
      particles.pause();
    },
    resume() {
      wrapper.classList.remove('inspectra-paused');
      particles.resume();
    },
    destroy() {
      if (!wrapper.parentNode) return;
      particles.destroy();
      wrapper.parentNode.insertBefore(el, wrapper);
      wrapper.parentNode.removeChild(wrapper);
      delete el.__inspectra;
    }
  };

  el.__inspectra = controls;
  return controls;
}

/**
 * Remove the Inspectra effect from an element.
 *
 * @param {HTMLElement|string} target - Element or CSS selector
 */
function uninspect(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el && el.__inspectra) el.__inspectra.destroy();
}

/**
 * Apply Inspectra to all elements matching a CSS selector.
 *
 * @param {string} selector - CSS selector
 * @param {object} options  - Same options as inspect()
 * @returns {Array} Array of control objects
 */
function inspectAll(selector, options = {}) {
  return Array.from(document.querySelectorAll(selector)).map(el => inspect(el, options));
}

const Inspectra = { inspect, uninspect, inspectAll, version: '1.0.0' };





  exports.inspect = inspect;
  exports.uninspect = uninspect;
  exports.inspectAll = inspectAll;
  exports.default = Inspectra;
  exports.version = '1.0.0';

  Object.defineProperty(exports, '__esModule', { value: true });
}));
