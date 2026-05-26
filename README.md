# &lt;marquee-wc&gt;

The `<marquee>` tag reborn for 2026. A modern, accessible, themeable web
component for scrolling content — from a stock ticker to a dot-matrix readout,
a vertical credit roll, or (yes) an annoying retro web effect.

**[Live demo &amp; docs →](https://profpowell.github.io/marquee-wc/)** — open the theme
picker and watch the themed marquees re-skin with Vanilla Breeze in real time.

## Features

- Zero dependencies — pure vanilla JavaScript, light DOM
- Constant velocity regardless of content length (`speed` is px/second)
- Four directions (`left`, `right`, `up`, `down`) and three behaviors (`loop`, `slide`, `alternate`)
- Autofill: short content auto-clones to seamlessly fill the viewport
- Pauses when offscreen (IntersectionObserver) and when the tab is hidden (Page Visibility)
- Respects `prefers-reduced-motion`
- Accessible clones — `aria-hidden`, `inert`, and id-stripped, so screen readers and tab order are unaffected
- Legacy-compatible API: `start()`, `stop()`, `toggle()`
- Custom events: `marquee-start`, `marquee-pause`, `marquee-cycle`
- Built-in themes and full CSS custom property theming
- Vanilla Breeze design-token aware
- TypeScript definitions included

## Installation

```bash
npm install @profpowell/marquee-wc
```

Or use via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@profpowell/marquee-wc/dist/marquee-wc.css" />
<script type="module" src="https://unpkg.com/@profpowell/marquee-wc/dist/marquee-wc.js"></script>
```

The component renders in the light DOM, so its stylesheet must be present on the
page (link the CSS, or `import '@profpowell/marquee-wc/style.css'` in a bundler).

## Usage

```html
<link rel="stylesheet" href="dist/marquee-wc.css" />
<script type="module" src="dist/marquee-wc.js"></script>

<marquee-wc speed="60" pause-on-hover> This text scrolls smoothly, forever. </marquee-wc>
```

## Attributes

| Attribute        | Type    | Default   | Description                                                                |
| ---------------- | ------- | --------- | -------------------------------------------------------------------------- |
| `direction`      | string  | `left`    | `left` \| `right` \| `up` \| `down`                                        |
| `speed`          | number  | `50`      | Pixels per second                                                          |
| `behavior`       | string  | `loop`    | `loop` \| `slide` \| `alternate`                                           |
| `gap`            | length  | `2rem`    | CSS length between repeats                                                 |
| `pause-on-hover` | boolean | —         | Also pauses on `:focus-within`                                             |
| `play-state`     | string  | `running` | `running` \| `paused`                                                      |
| `autofill`       | boolean | `true`    | Clone short content to fill the viewport (`false` to opt out)              |
| `fade`           | boolean | —         | Apply an edge fade mask                                                    |
| `reduced-motion` | string  | `respect` | `respect` \| `ignore`                                                      |
| `theme`          | string  | —         | `ticker` \| `breaking-news` \| `code-block` \| `screen-saver` \| `credits` |

## Themes

| Theme           | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `ticker`        | Compact monospace stock-ticker with dot separators and fade edges  |
| `breaking-news` | Bold colored bar with a label set via `--marquee-label`            |
| `code-block`    | Monospace surface for long lines of code, logs, or terminal output |
| `screen-saver`  | Big glowing text — pair with `behavior="alternate"`                |
| `credits`       | Vertical movie-credit roll — pair with `direction="up"`            |

## API

```javascript
const el = document.querySelector('marquee-wc');

el.start(); // play-state="running"
el.stop(); // play-state="paused"
el.toggle(); // flip between the two
el.refresh(); // recompute clones/distance/duration after dynamic content changes

el.direction; // 'left' | 'right' | 'up' | 'down'  (readonly)
el.speed; // number  (readonly)
el.behavior; // 'loop' | 'slide' | 'alternate'  (readonly)
el.playState; // 'running' | 'paused'  (readonly)
el.axis; // 'x' | 'y'  (readonly, derived)
```

Set attributes to change configuration (`el.setAttribute('speed', '120')`); the
component reacts to attribute changes and recomputes automatically.

## Events

```javascript
el.addEventListener('marquee-start', () => console.log('running'));
el.addEventListener('marquee-pause', () => console.log('paused'));
el.addEventListener('marquee-cycle', () => console.log('one loop completed'));
```

All events bubble.

## CSS Custom Properties

```css
marquee-wc {
  --marquee-gap: 2rem; /* space between repeats */
  --marquee-fade-size: 3rem; /* edge fade mask size (with [fade]) */
  --marquee-bg: …; /* themed-variant background */
  --marquee-fg: …; /* themed-variant foreground */
  --marquee-label: 'BREAKING'; /* breaking-news label text */
}
```

`--marquee-duration` and `--marquee-cycle-distance` are computed and set by the
component — don't set them yourself.

## Using with Vanilla Breeze

`<marquee-wc>` reads Vanilla Breeze design tokens (`--color-surface`,
`--color-text`, `--color-error`, `--color-accent`, `--font-mono`, `--font-serif`,
`--radius-m`, …) through layered `var()` fallbacks. A `--marquee-*` override
always wins; absent that, a VB token is used; absent that, a built-in default
applies. Apply a VB theme to the page and the themed marquee variants inherit it
automatically:

```html
<html data-theme="…">
  <marquee-wc theme="ticker">Reads --color-surface, --color-text, --font-mono</marquee-wc>
</html>
```

No configuration is required, and pages without Vanilla Breeze render identically
to before via the built-in fallbacks.

## Accessibility

- The original content stays in the accessible tree; only id-stripped, `inert`,
  `aria-hidden` clones are added for seamless looping.
- `prefers-reduced-motion: reduce` halts all animation unless you explicitly set
  `reduced-motion="ignore"`.
- `pause-on-hover` also pauses on keyboard focus (`:focus-within`).

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (open /demo.html or /test/test-page.html)
npm run build        # Build dist/ (ES module + CSS)
npm run test         # Run Playwright tests
npm run lint         # Lint src/
npm run format       # Format with Prettier
npm run analyze      # Regenerate custom-elements.json
```

The documentation site lives in `docs/` (served via GitHub Pages). It loads
Vanilla Breeze and its `<theme-picker>` from a CDN to demonstrate the theme
integration live. `npm run build` refreshes the component copy in `docs/`.

## License

MIT
