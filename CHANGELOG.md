# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] — 2026-05-26

### Added

- **`decode` mode** — each unit flickers through random glyphs (Matrix-style) and then locks onto its real character, staggered left-to-right, then re-scrambles on a loop. Driven by a small `requestAnimationFrame` loop that freezes when paused/off-screen/tab-hidden and shows the plain text under `prefers-reduced-motion`. Works per letter or per word (`unit="word"`).

## [1.5.0] — 2026-05-26

### Fixed

- **Pause never actually paused the animation.** The per-behavior `animation` shorthand was more specific than the pause rules, so its implicit `running` always won — `pause-on-hover`, `stop()`/`play-state="paused"`, off-screen/tab-hidden pausing, and `prefers-reduced-motion` were all effectively no-ops on the moving track. The state/reduced-motion overrides are now `!important` so they win regardless of specificity.
- **`mode="blink"` did nothing.** The `animation` shorthand contained `steps(1, jump-none)`, which is invalid (jump-none needs ≥2 steps); an invalid value voids the whole shorthand, so the letters never animated. Now uses `step-end`. (`march`'s timing was likewise corrected.)

### Added

- **`unit` attribute** (`letter` | `word`, default `letter`) — any letter-motion mode can now animate **whole words** instead of individual letters.
- **`invert` mode** — reverse-video chips (text in the page colour on a coloured block) whose hue shifts and ripples across the units; great per word.

## [1.4.0] — 2026-05-26

### Added

- **Three more letter-motion modes:**
  - `leet` — l33t-speak substitution (`e`→`3`, `o`→`0`, …) with randomly mirrored / upside-down letters and a flickering green-glow terminal vibe.
  - `blink` — each letter blinks on its own clock (randomized rate and delay), glowing while lit.
  - `chase` — a stadium-wave / theater-marquee light that sweeps letter-to-letter and loops around (timed via `--i` / `--n`).
- Demos for each.

## [1.3.0] — 2026-05-26

### Fixed

- **`behavior="alternate"` now works for content narrower than the viewport.** Previously the scroll distance clamped to zero (no motion), so `mode="screen-saver"` + `behavior="alternate"` sat still. It now bounces the content edge-to-edge across the viewport; long content still slides to reveal its end. (Implemented via a signed `--marquee-alternate-distance`.)

### Added

- **Four more letter-motion modes:** `spin` (cartwheeling letters), `rainbow` (a flowing spectrum that ripples across the text), `flip` (split-flap board), and `glitch` (chromatic jitter).
- Demos for each, plus a fixed/clarified `screen-saver` + `alternate` demo.

## [1.2.0] — 2026-05-26

### Added

- **`pop` mode** — letters balloon and burst at random intervals, like little explosions (per-letter, randomized delays).
- **`dot-matrix` mode** — a glowing monospace LED board over a dot grid; the LED color follows `--color-accent`.
- The docs site now renders its code samples with the sibling `<code-block>` component.

### Fixed

- Silenced the docs-site console 404s: added a favicon, and a small `fetch` shim that rewrites the theme-picker's hardcoded `/cdn/*` requests (e.g. `themes/manifest.json`) onto the Vanilla Breeze CDN.

## [1.1.0] — 2026-05-26

### Changed

- **Renamed the `theme` attribute to `mode`** to avoid clashing with Vanilla Breeze page themes. The values (`ticker`, `breaking-news`, `code-block`, `screen-saver`, `credits`) are unchanged — only the attribute name changed (`theme="ticker"` → `mode="ticker"`).

### Added

- **Five letter-motion modes:** `bounce`, `wave` (roller-coaster), `march`, `pulse` (size change), and `ransom` (cut-out magazine letters). These split the text into per-character spans and animate each letter with a staggered delay; they compose with scrolling and honor `prefers-reduced-motion`.
- `mode` getter and the `MarqueeMode` type in the TypeScript declarations.
- Demos and API docs for all modes; a Playwright test for letter splitting.

## [1.0.0] — 2026-05-26

### Added

- Initial standardized release of `<marquee-wc>`.
- **Custom element renamed** from `<super-marquee>` to `<marquee-wc>` (class `MarqueeWc`) to match the repository and the sibling-component naming convention.
- **GitHub Pages documentation site** under `docs/` (home, demos, API). It loads Vanilla Breeze and its `<theme-picker>` from a CDN so visitors can switch themes and watch every themed marquee re-skin live.
- **Vanilla Breeze theme awareness.** Themed variants (`ticker`, `breaking-news`, `code-block`, `screen-saver`, `credits`) read VB design tokens (`--color-surface`, `--color-text`, `--color-error`, `--color-accent`, `--font-mono`, `--font-serif`, `--radius-m`, …) through layered `var()` fallbacks. A `--marquee-*` override always wins; pages without VB render identically via built-in defaults.
- **Project tooling** matching the sibling vanilla web components: Vite build (ES module output), ESLint, Prettier, Playwright tests, and a Custom Elements Manifest.
- **TypeScript declarations** (`marquee-wc.d.ts`) for attributes, getters, methods, and the custom event map.
- `theme` added to `observedAttributes` so a theme change recomputes scroll distance and duration.

### Notes

- Component renders in the light DOM; its stylesheet (`dist/marquee-wc.css`) must be present on the page.
