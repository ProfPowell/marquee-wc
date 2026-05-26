const b = [
  "bounce",
  "wave",
  "march",
  "pulse",
  "ransom",
  "pop",
  "spin",
  "rainbow",
  "flip",
  "glitch",
  "leet",
  "blink",
  "chase",
  "invert"
];
class _ extends HTMLElement {
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
      "mode",
      "unit"
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
  get unit() {
    return this.getAttribute("unit") === "word" ? "word" : "letter";
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
    var t, i, e;
    (t = this._resizeObserver) == null || t.disconnect(), (i = this._intersectionObserver) == null || i.disconnect(), (e = this._track) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility);
  }
  attributeChangedCallback(t, i, e) {
    i === e || !this._built || ((t === "mode" || t === "unit") && this._renderContent(), this._update(), t === "play-state" && this._dispatch(e === "paused" ? "marquee-pause" : "marquee-start"));
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
    const i = document.createElement("div");
    i.className = "marquee-viewport";
    const e = document.createElement("div");
    e.className = "marquee-track";
    const s = document.createElement("div");
    s.className = "marquee-item", t.forEach((r) => s.appendChild(r)), e.appendChild(s), i.appendChild(e), this.appendChild(i), this._original = s, this._track = e, this._viewport = i, this._sourceHTML = s.innerHTML, this._renderContent();
  }
  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    this._sourceHTML != null && (this._original.innerHTML = this._sourceHTML, b.includes(this.mode) && this._splitLetters());
  }
  // Wrap each character in a <span class="marquee-char"> with a stagger index,
  // so CSS can animate letters individually (bounce, wave, march, pulse, ransom).
  _splitLetters() {
    const t = document.createTreeWalker(this._original, NodeFilter.SHOW_TEXT), i = [];
    for (; t.nextNode(); ) i.push(t.currentNode);
    const e = this.unit === "word", s = this.mode === "ransom", r = this.mode === "pop", o = this.mode === "leet", h = this.mode === "blink", c = (l) => l.trim() === "";
    let a = 0;
    for (const l of i) {
      const u = document.createDocumentFragment(), p = e ? this._tokenizeWords(l.textContent) : [...l.textContent];
      for (const d of p) {
        if (d === "") continue;
        const m = c(d), n = document.createElement("span");
        n.className = "marquee-char", n.style.setProperty("--i", a++), r && n.style.setProperty("--delay", `${(Math.random() * 2.6).toFixed(2)}s`), h && (n.style.setProperty("--blink-rate", `${(0.4 + Math.random() * 1.5).toFixed(2)}s`), n.style.setProperty("--blink-delay", `${Math.random().toFixed(2)}s`)), m ? (n.classList.add("marquee-space"), n.textContent = " ") : (n.textContent = d, s && this._ransomize(n), o && this._leetify(n)), u.appendChild(n);
      }
      l.replaceWith(u);
    }
    this._original.style.setProperty("--n", a);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const i = [];
    let e = "", s = null;
    for (const r of t) {
      const o = r.trim() === "";
      e !== "" && o !== s && (i.push(e), e = ""), e += r, s = o;
    }
    return e !== "" && i.push(e), i;
  }
  // Give a single ransom-note letter a random font, tilt, scale, and chip color.
  _ransomize(t) {
    const i = [
      "var(--font-serif, Georgia, serif)",
      "var(--font-mono, ui-monospace, monospace)",
      "var(--font-sans, system-ui, sans-serif)",
      '"Comic Sans MS", "Marker Felt", cursive'
    ], e = [
      "var(--color-accent, oklch(55% 0.18 250))",
      "var(--color-primary, oklch(55% 0.18 250))",
      "var(--color-error, oklch(60% 0.2 25))",
      "var(--color-warning, oklch(75% 0.15 80))",
      "var(--color-success, oklch(65% 0.18 145))"
    ], s = (r) => r[Math.floor(Math.random() * r.length)];
    t.style.fontFamily = s(i), t.style.setProperty("--rot", `${(Math.random() * 16 - 8).toFixed(1)}deg`), t.style.setProperty("--scale", (0.85 + Math.random() * 0.55).toFixed(2)), t.style.setProperty("--chip", s(e));
  }
  // Substitute a letter with its l33t equivalent and, at random, mirror it or
  // flip it upside-down — for that glitchy h4x0r chaos.
  _leetify(t) {
    const i = { a: "4", b: "8", e: "3", g: "9", i: "1", l: "1", o: "0", s: "5", t: "7", z: "2" };
    t.textContent = [...t.textContent].map((s) => i[s.toLowerCase()] || s).join("");
    const e = Math.random();
    e < 0.16 ? t.style.setProperty("--flip", "scaleX(-1)") : e < 0.27 ? t.style.setProperty("--flip", "scaleY(-1)") : e < 0.35 && t.style.setProperty("--flip", "rotate(180deg)");
  }
  _observe() {
    this._resizeObserver = new ResizeObserver(() => this._update()), this._resizeObserver.observe(this), this._resizeObserver.observe(this._original), this._intersectionObserver = new IntersectionObserver(
      (t) => t.forEach((i) => {
        this.dataset.visible = String(i.isIntersecting);
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
    return t.setAttribute("aria-hidden", "true"), t.dataset.clone = "", t.querySelectorAll("[id]").forEach((i) => i.removeAttribute("id")), t.setAttribute("inert", ""), t;
  }
  _update() {
    if (!this._built && !this._original) return;
    this.dataset.axis = this.axis, this.dataset.direction = this.isReverse ? "reverse" : "forward", this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this._clearClones();
    const t = this.axis === "x", i = t ? this._viewport.offsetWidth : this._viewport.offsetHeight, e = t ? this._original.offsetWidth : this._original.offsetHeight;
    if (e === 0 || i === 0) return;
    const s = this._resolveGapPx();
    let r = 0;
    if (this.behavior === "loop" && this.autofill) {
      const a = e + s;
      r = Math.max(1, Math.ceil(i * 2 / a));
    } else this.behavior === "loop" && (r = 1);
    for (let a = 0; a < r; a++)
      this._track.appendChild(this._makeClone());
    let o, h = 0;
    if (this.behavior === "loop")
      o = e + s;
    else if (this.behavior === "alternate") {
      const a = e - i;
      o = Math.abs(a), h = -a;
    } else
      o = e;
    const c = o > 0 ? o / this.speed : 0;
    this.style.setProperty("--marquee-duration", `${c}s`), this.style.setProperty("--marquee-gap", this.gap), this.style.setProperty("--marquee-item-size", `${e}px`), this.style.setProperty("--marquee-cycle-distance", `${o}px`), this.style.setProperty("--marquee-alternate-distance", `${h}px`), this.style.setProperty("--marquee-viewport-size", `${i}px`);
  }
  _resolveGapPx() {
    const t = getComputedStyle(this._track), i = this.axis === "x" ? t.columnGap : t.rowGap, e = parseFloat(i);
    return Number.isFinite(e) ? e : 0;
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("marquee-wc", _);
export {
  _ as MarqueeWc
};
//# sourceMappingURL=marquee-wc.js.map
