# Inspectra

AI-style visual inspection effect for any HTML element. Applies a floating particle system, rotating glowing border, light sweep, and edge vignette — designed for "AI is analyzing this element" moments.

## Install

```bash
npm install inspectra
```

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/inspectra/dist/inspectra.umd.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/inspectra/dist/inspectra.umd.min.js"></script>
```

After loading via CDN, the global object `Inspectra` is available:

```js
const { inspect, uninspect, inspectAll } = Inspectra;
```

## NPM / ESM

```js
import Inspectra from 'inspectra';
// or named imports
import { inspect, uninspect, inspectAll } from 'inspectra';
```

## Basic usage

```js
// By CSS selector
const ctrl = Inspectra.inspect('#my-element');

// By DOM reference
const el = document.querySelector('.card');
const ctrl = Inspectra.inspect(el);

// Remove effect
Inspectra.uninspect('#my-element');

// Apply to all matching elements
const ctrls = Inspectra.inspectAll('.ai-target');
```

## Control object

`inspect()` returns a control object:

```js
ctrl.pause();   // freeze all animations (CSS + canvas particles)
ctrl.resume();  // resume from where they stopped
ctrl.destroy(); // remove effect and restore original DOM
```

## Options

All options are optional.

```js
Inspectra.inspect('#el', {

  // Layout
  block: false,           // Force wrapper to display:block (useful for <img>, <video>, full-width cards)
                          // Default: false (inline-block)

  paused: false,          // Start with animations paused. Call ctrl.resume() to start.

  // Particles
  particles: 4,           // Number of floating light dots orbiting the element. Range: 0–40.

  color: [130, 150, 255], // RGB color for particles, ring glow and sweep tint.
                          // Default: [130, 150, 255] (blue-violet)
                          // Example: [80, 220, 180] for teal, [255, 120, 80] for orange

  // Global speed
  speed: 1,               // Multiplier applied to ALL animation durations at once.
                          // 1   = default
                          // 2   = 2× faster (urgent / intense feel)
                          // 0.5 = half speed (ambient / calm)
                          // Individual duration options below override speed.

  // Per-animation durations (override speed)
  sweepDuration:   '3.2s', // Light band scrolling top→bottom inside the element. Default: '3.2s'
  ringDuration:    '4s',   // Rotating arc of light around the border. Default: '4s'
  breatheDuration: '3.5s', // Outer glow pulse rhythm. Default: '3.5s'
  holeDuration:    '4s',   // Edge vignette opacity cycle. Default: '4s'

});
```

## Recipes

```js
// Urgent / fast AI analysis feel
Inspectra.inspect('#el', { speed: 2.5, particles: 12 });

// Calm ambient highlight
Inspectra.inspect('#el', { speed: 0.4, particles: 3, color: [100, 180, 255] });

// Hover-to-inspect
el.addEventListener('mouseenter', () => Inspectra.inspect(el));
el.addEventListener('mouseleave', () => Inspectra.uninspect(el));

// Auto-remove after 3 seconds
const ctrl = Inspectra.inspect('#el');
setTimeout(() => ctrl.destroy(), 3000);

// Block element (image, card, full-width div)
Inspectra.inspect('#hero-image', { block: true, particles: 8 });

// Custom teal color, slow sweep, fast ring
Inspectra.inspect('#el', {
  color:         [60, 220, 180],
  sweepDuration: '6s',
  ringDuration:  '1.5s',
});

// Apply to multiple, then remove all
const ctrls = Inspectra.inspectAll('.ai-target', { speed: 1.5 });
ctrls.forEach(c => c.destroy());
```

## Visual layers

The effect is composed of 5 independent layers:

| Layer | Description |
|---|---|
| **Sweep** | Semi-transparent light band that scrolls top→bottom inside the element |
| **Hole** | Radial vignette pressing inward from all 4 edges |
| **Glow** | Soft outer box-shadow that breathes (pulses) |
| **Ring** | Conic-gradient arc rotating around the border |
| **Particles** | Canvas-based floating light dots orbiting the element |

## Browser support

Works in all modern browsers that support:
- CSS `conic-gradient`
- CSS `@property`
- `ResizeObserver`
- `requestAnimationFrame`

## License

MIT
