const l = [
  "bounce",
  "wave",
  "march",
  "pulse",
  "ransom",
  "pop",
  "spin",
  "rainbow",
  "flip",
  "glitch"
];
class c extends HTMLElement {
  static get observedAttributes() {
    return [
      "direction",
      "speed",
      "behavior",
      "gap",
      "play-state",
      "pause-on-hover",
      "fade",
      "autofill",
      "reduced-motion",
      "mode"
    ];
  }
  // ── Functional core: pure getters ──────────────────────────────────────
  get direction() {
    return this.getAttribute("direction") || "left";
  }
  get speed() {
    return Number(this.getAttribute("speed")) || 50;
  }
  get behavior() {
    return this.getAttribute("behavior") || "loop";
  }
  get gap() {
    return this.getAttribute("gap") || "2rem";
  }
  get playState() {
    return this.getAttribute("play-state") || "running";
  }
  get autofill() {
    return this.getAttribute("autofill") !== "false";
  }
  get mode() {
    return this.getAttribute("mode") || "";
  }
  get axis() {
    return ["up", "down"].includes(this.direction) ? "y" : "x";
  }
  get isReverse() {
    return ["right", "down"].includes(this.direction);
  }
  // ── Imperative shell ───────────────────────────────────────────────────
  connectedCallback() {
    this._built || (this._build(), this._observe(), this._update(), this._built = !0, this._dispatch("marquee-start"));
  }
  disconnectedCallback() {
    var t, e, i;
    (t = this._resizeObserver) == null || t.disconnect(), (e = this._intersectionObserver) == null || e.disconnect(), (i = this._track) == null || i.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility);
  }
  attributeChangedCallback(t, e, i) {
    e === i || !this._built || (t === "mode" && this._renderContent(), this._update(), t === "play-state" && this._dispatch(i === "paused" ? "marquee-pause" : "marquee-start"));
  }
  // ── Public API (legacy <marquee> compat) ───────────────────────────────
  start() {
    this.setAttribute("play-state", "running");
  }
  stop() {
    this.setAttribute("play-state", "paused");
  }
  toggle() {
    this.playState === "paused" ? this.start() : this.stop();
  }
  refresh() {
    this._update();
  }
  // ── Private ────────────────────────────────────────────────────────────
  _build() {
    const t = [...this.childNodes];
    this.textContent = "";
    const e = document.createElement("div");
    e.className = "marquee-viewport";
    const i = document.createElement("div");
    i.className = "marquee-track";
    const r = document.createElement("div");
    r.className = "marquee-item", t.forEach((o) => r.appendChild(o)), i.appendChild(r), e.appendChild(i), this.appendChild(e), this._original = r, this._track = i, this._viewport = e, this._sourceHTML = r.innerHTML, this._renderContent();
  }
  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    this._sourceHTML != null && (this._original.innerHTML = this._sourceHTML, l.includes(this.mode) && this._splitLetters());
  }
  // Wrap each character in a <span class="marquee-char"> with a stagger index,
  // so CSS can animate letters individually (bounce, wave, march, pulse, ransom).
  _splitLetters() {
    const t = document.createTreeWalker(this._original, NodeFilter.SHOW_TEXT), e = [];
    for (; t.nextNode(); ) e.push(t.currentNode);
    const i = this.mode === "ransom", r = this.mode === "pop";
    let o = 0;
    for (const a of e) {
      const h = document.createDocumentFragment();
      for (const n of a.textContent) {
        const s = document.createElement("span");
        s.className = "marquee-char", s.style.setProperty("--i", o++), r && s.style.setProperty("--delay", `${(Math.random() * 2.6).toFixed(2)}s`), n === " " || n === `
` || n === "	" ? (s.classList.add("marquee-space"), s.textContent = " ") : (s.textContent = n, i && this._ransomize(s)), h.appendChild(s);
      }
      a.replaceWith(h);
    }
    this._original.style.setProperty("--n", o);
  }
  // Give a single ransom-note letter a random font, tilt, scale, and chip color.
  _ransomize(t) {
    const e = [
      "var(--font-serif, Georgia, serif)",
      "var(--font-mono, ui-monospace, monospace)",
      "var(--font-sans, system-ui, sans-serif)",
      '"Comic Sans MS", "Marker Felt", cursive'
    ], i = [
      "var(--color-accent, oklch(55% 0.18 250))",
      "var(--color-primary, oklch(55% 0.18 250))",
      "var(--color-error, oklch(60% 0.2 25))",
      "var(--color-warning, oklch(75% 0.15 80))",
      "var(--color-success, oklch(65% 0.18 145))"
    ], r = (o) => o[Math.floor(Math.random() * o.length)];
    t.style.fontFamily = r(e), t.style.setProperty("--rot", `${(Math.random() * 16 - 8).toFixed(1)}deg`), t.style.setProperty("--scale", (0.85 + Math.random() * 0.55).toFixed(2)), t.style.setProperty("--chip", r(i));
  }
  _observe() {
    this._resizeObserver = new ResizeObserver(() => this._update()), this._resizeObserver.observe(this), this._resizeObserver.observe(this._original), this._intersectionObserver = new IntersectionObserver(
      (t) => t.forEach((e) => {
        this.dataset.visible = String(e.isIntersecting);
      }),
      { rootMargin: "100px" }
    ), this._intersectionObserver.observe(this), this._onVisibility = () => {
      this.dataset.tabVisible = String(!document.hidden);
    }, document.addEventListener("visibilitychange", this._onVisibility), this.dataset.tabVisible = String(!document.hidden), this._onIteration = () => this._dispatch("marquee-cycle"), this._track.addEventListener("animationiteration", this._onIteration);
  }
  _clearClones() {
    for (; this._track.children.length > 1; )
      this._track.lastChild.remove();
  }
  _makeClone() {
    const t = this._original.cloneNode(!0);
    return t.setAttribute("aria-hidden", "true"), t.dataset.clone = "", t.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id")), t.setAttribute("inert", ""), t;
  }
  _update() {
    if (!this._built && !this._original) return;
    this.dataset.axis = this.axis, this.dataset.direction = this.isReverse ? "reverse" : "forward", this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this._clearClones();
    const t = this.axis === "x", e = t ? this._viewport.offsetWidth : this._viewport.offsetHeight, i = t ? this._original.offsetWidth : this._original.offsetHeight;
    if (i === 0 || e === 0) return;
    const r = this._resolveGapPx();
    let o = 0;
    if (this.behavior === "loop" && this.autofill) {
      const s = i + r;
      o = Math.max(1, Math.ceil(e * 2 / s));
    } else this.behavior === "loop" && (o = 1);
    for (let s = 0; s < o; s++)
      this._track.appendChild(this._makeClone());
    let a, h = 0;
    if (this.behavior === "loop")
      a = i + r;
    else if (this.behavior === "alternate") {
      const s = i - e;
      a = Math.abs(s), h = -s;
    } else
      a = i;
    const n = a > 0 ? a / this.speed : 0;
    this.style.setProperty("--marquee-duration", `${n}s`), this.style.setProperty("--marquee-gap", this.gap), this.style.setProperty("--marquee-item-size", `${i}px`), this.style.setProperty("--marquee-cycle-distance", `${a}px`), this.style.setProperty("--marquee-alternate-distance", `${h}px`), this.style.setProperty("--marquee-viewport-size", `${e}px`);
  }
  _resolveGapPx() {
    const t = getComputedStyle(this._track), e = this.axis === "x" ? t.columnGap : t.rowGap, i = parseFloat(e);
    return Number.isFinite(i) ? i : 0;
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("marquee-wc", c);
export {
  c as MarqueeWc
};
//# sourceMappingURL=marquee-wc.js.map
