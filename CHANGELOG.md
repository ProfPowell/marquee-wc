# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
