const g = [
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
  "invert",
  "decode"
];
class y extends HTMLElement {
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
    var t, s, e;
    (t = this._resizeObserver) == null || t.disconnect(), (s = this._intersectionObserver) == null || s.disconnect(), (e = this._track) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopScramble();
  }
  attributeChangedCallback(t, s, e) {
    s === e || !this._built || ((t === "mode" || t === "unit") && this._renderContent(), this._update(), t === "play-state" && this._dispatch(e === "paused" ? "marquee-pause" : "marquee-start"));
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
    const s = document.createElement("div");
    s.className = "marquee-viewport";
    const e = document.createElement("div");
    e.className = "marquee-track";
    const i = document.createElement("div");
    i.className = "marquee-item", t.forEach((n) => i.appendChild(n)), e.appendChild(i), s.appendChild(e), this.appendChild(s), this._original = i, this._track = e, this._viewport = s, this._sourceHTML = i.innerHTML, this._renderContent();
  }
  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    this._sourceHTML != null && (this._original.innerHTML = this._sourceHTML, g.includes(this.mode) && this._splitLetters());
  }
  // Wrap each character in a <span class="marquee-char"> with a stagger index,
  // so CSS can animate letters individually (bounce, wave, march, pulse, ransom).
  _splitLetters() {
    const t = document.createTreeWalker(this._original, NodeFilter.SHOW_TEXT), s = [];
    for (; t.nextNode(); ) s.push(t.currentNode);
    const e = this.unit === "word", i = this.mode === "ransom", n = this.mode === "pop", a = this.mode === "leet", m = this.mode === "blink", f = this.mode === "decode", l = (c) => c.trim() === "";
    let _ = 0;
    for (const c of s) {
      const d = document.createDocumentFragment(), b = e ? this._tokenizeWords(c.textContent) : [...c.textContent];
      for (const u of b) {
        if (u === "") continue;
        const o = l(u), r = document.createElement("span");
        r.className = "marquee-char", r.style.setProperty("--i", _++), n && r.style.setProperty("--delay", `${(Math.random() * 2.6).toFixed(2)}s`), m && (r.style.setProperty("--blink-rate", `${(0.4 + Math.random() * 1.5).toFixed(2)}s`), r.style.setProperty("--blink-delay", `${Math.random().toFixed(2)}s`)), o ? (r.classList.add("marquee-space"), r.textContent = " ") : (r.textContent = u, i && this._ransomize(r), a && this._leetify(r), f && (r.dataset.ch = u)), d.appendChild(r);
      }
      c.replaceWith(d);
    }
    this._original.style.setProperty("--n", _);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const s = [];
    let e = "", i = null;
    for (const n of t) {
      const a = n.trim() === "";
      e !== "" && a !== i && (s.push(e), e = ""), e += n, i = a;
    }
    return e !== "" && s.push(e), s;
  }
  // Give a single ransom-note letter a random font, tilt, scale, and chip color.
  _ransomize(t) {
    const s = [
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
    ], i = (n) => n[Math.floor(Math.random() * n.length)];
    t.style.fontFamily = i(s), t.style.setProperty("--rot", `${(Math.random() * 16 - 8).toFixed(1)}deg`), t.style.setProperty("--scale", (0.85 + Math.random() * 0.55).toFixed(2)), t.style.setProperty("--chip", i(e));
  }
  // Substitute a letter with its l33t equivalent and, at random, mirror it or
  // flip it upside-down — for that glitchy h4x0r chaos.
  _leetify(t) {
    const s = { a: "4", b: "8", e: "3", g: "9", i: "1", l: "1", o: "0", s: "5", t: "7", z: "2" };
    t.textContent = [...t.textContent].map((i) => s[i.toLowerCase()] || i).join("");
    const e = Math.random();
    e < 0.16 ? t.style.setProperty("--flip", "scaleX(-1)") : e < 0.27 ? t.style.setProperty("--flip", "scaleY(-1)") : e < 0.35 && t.style.setProperty("--flip", "rotate(180deg)");
  }
  // Whether playback is currently paused (state, off-screen, tab-hidden, or hover).
  _isPaused() {
    return this.hasAttribute("pause-on-hover") && this.matches(":hover, :focus-within") ? !0 : this.playState === "paused" || this.dataset.visible === "false" || this.dataset.tabVisible === "false";
  }
  _stopScramble() {
    this._scrambleRAF && cancelAnimationFrame(this._scrambleRAF), this._scrambleRAF = null;
  }
  // decode mode: each unit cycles random glyphs, then locks onto its real text
  // (stored in data-ch), staggered by --i, then re-scrambles on a loop.
  _syncScramble() {
    if (this._stopScramble(), this.mode !== "decode") return;
    const t = [...this.querySelectorAll(".marquee-char")].filter(
      (o) => !o.classList.contains("marquee-space") && o.dataset.ch != null
    );
    if (t.length === 0) return;
    if (this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const o of t) o.textContent = o.dataset.ch;
      return;
    }
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|", i = (o) => {
      let r = "";
      for (let h = 0; h < o; h++) r += e[Math.random() * e.length | 0];
      return r;
    }, n = 650, a = 45, m = 1800, f = 55;
    let l = 0;
    const _ = t.map((o) => {
      const r = Number(o.style.getPropertyValue("--i")) || 0, h = n + r * a;
      return h > l && (l = h), { s: o, settleAt: h, target: o.dataset.ch };
    });
    let c = 0, d = null, b = 0;
    const u = (o) => {
      this._scrambleRAF = requestAnimationFrame(u), d == null && (d = o);
      const r = o - d;
      if (d = o, this._isPaused()) return;
      c += r;
      const h = c - b >= f;
      h && (b = c);
      for (const p of _)
        c >= p.settleAt ? p.s.textContent !== p.target && (p.s.textContent = p.target) : h && (p.s.textContent = i(p.target.length));
      c > l + m && (c = 0, b = 0);
    };
    this._scrambleRAF = requestAnimationFrame(u);
  }
  _observe() {
    this._resizeObserver = new ResizeObserver(() => this._update()), this._resizeObserver.observe(this), this._resizeObserver.observe(this._original), this._intersectionObserver = new IntersectionObserver(
      (t) => t.forEach((s) => {
        this.dataset.visible = String(s.isIntersecting);
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
    return t.setAttribute("aria-hidden", "true"), t.dataset.clone = "", t.querySelectorAll("[id]").forEach((s) => s.removeAttribute("id")), t.setAttribute("inert", ""), t;
  }
  _update() {
    if (!this._built && !this._original) return;
    this.dataset.axis = this.axis, this.dataset.direction = this.isReverse ? "reverse" : "forward", this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this._clearClones();
    const t = this.axis === "x", s = t ? this._viewport.offsetWidth : this._viewport.offsetHeight, e = t ? this._original.offsetWidth : this._original.offsetHeight;
    if (e === 0 || s === 0) return;
    const i = this._resolveGapPx();
    let n = 0;
    if (this.behavior === "loop" && this.autofill) {
      const l = e + i;
      n = Math.max(1, Math.ceil(s * 2 / l));
    } else this.behavior === "loop" && (n = 1);
    for (let l = 0; l < n; l++)
      this._track.appendChild(this._makeClone());
    let a, m = 0;
    if (this.behavior === "loop")
      a = e + i;
    else if (this.behavior === "alternate") {
      const l = e - s;
      a = Math.abs(l), m = -l;
    } else
      a = e;
    const f = a > 0 ? a / this.speed : 0;
    this.style.setProperty("--marquee-duration", `${f}s`), this.style.setProperty("--marquee-gap", this.gap), this.style.setProperty("--marquee-item-size", `${e}px`), this.style.setProperty("--marquee-cycle-distance", `${a}px`), this.style.setProperty("--marquee-alternate-distance", `${m}px`), this.style.setProperty("--marquee-viewport-size", `${s}px`), this._syncScramble();
  }
  _resolveGapPx() {
    const t = getComputedStyle(this._track), s = this.axis === "x" ? t.columnGap : t.rowGap, e = parseFloat(s);
    return Number.isFinite(e) ? e : 0;
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("marquee-wc", y);
export {
  y as MarqueeWc
};
//# sourceMappingURL=marquee-wc.js.map
