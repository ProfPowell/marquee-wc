# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-26

### Added

- Initial standardized release of `<super-marquee>`.
- **Vanilla Breeze theme awareness.** Themed variants (`ticker`, `breaking-news`, `code-block`, `screen-saver`, `credits`) read VB design tokens (`--color-surface`, `--color-text`, `--color-error`, `--color-accent`, `--font-mono`, `--font-serif`, `--radius-m`, …) through layered `var()` fallbacks. A `--marquee-*` override always wins; pages without VB render identically via built-in defaults.
- **Project tooling** matching the sibling vanilla web components: Vite build (ES module output), ESLint, Prettier, Playwright tests, and a Custom Elements Manifest.
- **TypeScript declarations** (`super-marquee.d.ts`) for attributes, getters, methods, and the custom event map.
- `theme` added to `observedAttributes` so a theme change recomputes scroll distance and duration.

### Notes

- Component renders in the light DOM; its stylesheet (`dist/super-marquee.css`) must be present on the page.
