class h extends HTMLElement {
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
      "theme"
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
    e === i || !this._built || (this._update(), t === "play-state" && this._dispatch(i === "paused" ? "marquee-pause" : "marquee-start"));
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
    const s = document.createElement("div");
    s.className = "marquee-item", t.forEach((a) => s.appendChild(a)), i.appendChild(s), e.appendChild(i), this.appendChild(e), this._original = s, this._track = i, this._viewport = e;
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
    const s = this._resolveGapPx();
    let a = 0;
    if (this.behavior === "loop" && this.autofill) {
      const n = i + s;
      a = Math.max(1, Math.ceil(e * 2 / n));
    } else this.behavior === "loop" && (a = 1);
    for (let n = 0; n < a; n++)
      this._track.appendChild(this._makeClone());
    let r;
    this.behavior === "loop" ? r = i + s : this.behavior === "alternate" ? r = Math.max(0, i - e) : r = i;
    const o = r > 0 ? r / this.speed : 0;
    this.style.setProperty("--marquee-duration", `${o}s`), this.style.setProperty("--marquee-gap", this.gap), this.style.setProperty("--marquee-item-size", `${i}px`), this.style.setProperty("--marquee-cycle-distance", `${r}px`), this.style.setProperty("--marquee-viewport-size", `${e}px`);
  }
  _resolveGapPx() {
    const t = getComputedStyle(this._track), e = this.axis === "x" ? t.columnGap : t.rowGap, i = parseFloat(e);
    return Number.isFinite(i) ? i : 0;
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("marquee-wc", h);
export {
  h as MarqueeWc
};
//# sourceMappingURL=marquee-wc.js.map
