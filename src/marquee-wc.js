/**
 * @class MarqueeWc
 * @extends HTMLElement
 * @description Vanilla Breeze marquee component. Modern replacement for the
 *   deprecated <marquee> element. Light DOM, themeable, accessible,
 *   constant-velocity, and pauses when offscreen or tab-hidden.
 *
 * @attr direction - left | right | up | down  (default: left)
 * @attr speed - number, pixels per second  (default: 50)
 * @attr behavior - loop | slide | alternate  (default: loop)
 * @attr gap - CSS length between repeats  (default: 2rem)
 * @attr pause-on-hover - boolean; also pauses on focus-within
 * @attr play-state - running | paused
 * @attr autofill - boolean (default true)
 * @attr fade - boolean or length for edge mask
 * @attr reduced-motion - respect | ignore  (default: respect)
 * @attr mode - visual/motion preset. Surface themes: ticker | breaking-news |
 *   code-block | screen-saver | credits | dot-matrix. Per-unit motion:
 *   bounce | wave | march | pulse | ransom | pop | spin | rainbow | flip |
 *   glitch | leet | blink | chase | invert | decode.
 * @attr unit - letter | word  (default: letter) — granularity for the motion modes
 *
 * @fires marquee-start
 * @fires marquee-pause
 * @fires marquee-cycle - fires on each animation iteration
 */

// Modes that split text into per-unit spans for letter/word-level effects.
const LETTER_MODES = [
  'bounce',
  'wave',
  'march',
  'pulse',
  'ransom',
  'pop',
  'spin',
  'rainbow',
  'flip',
  'glitch',
  'leet',
  'blink',
  'chase',
  'invert',
  'decode',
];

class MarqueeWc extends HTMLElement {
  static get observedAttributes() {
    return [
      'direction',
      'speed',
      'behavior',
      'gap',
      'play-state',
      'pause-on-hover',
      'fade',
      'autofill',
      'reduced-motion',
      'mode',
      'unit',
    ];
  }

  // ── Functional core: pure getters ──────────────────────────────────────
  get direction() {
    return this.getAttribute('direction') || 'left';
  }
  get speed() {
    return Number(this.getAttribute('speed')) || 50;
  }
  get behavior() {
    return this.getAttribute('behavior') || 'loop';
  }
  get gap() {
    return this.getAttribute('gap') || '2rem';
  }
  get playState() {
    return this.getAttribute('play-state') || 'running';
  }
  get autofill() {
    return this.getAttribute('autofill') !== 'false';
  }
  get mode() {
    return this.getAttribute('mode') || '';
  }
  get unit() {
    return this.getAttribute('unit') === 'word' ? 'word' : 'letter';
  }
  get axis() {
    return ['up', 'down'].includes(this.direction) ? 'y' : 'x';
  }
  get isReverse() {
    return ['right', 'down'].includes(this.direction);
  }

  // ── Imperative shell ───────────────────────────────────────────────────
  connectedCallback() {
    if (this._built) return;
    this._build();
    this._observe();
    this._update();
    this._built = true;
    this._dispatch('marquee-start');
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._intersectionObserver?.disconnect();
    this._track?.removeEventListener('animationiteration', this._onIteration);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._stopScramble();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._built) return;
    if (name === 'mode' || name === 'unit') this._renderContent();
    this._update();
    if (name === 'play-state') {
      this._dispatch(newValue === 'paused' ? 'marquee-pause' : 'marquee-start');
    }
  }

  // ── Public API (legacy <marquee> compat) ───────────────────────────────
  start() {
    this.setAttribute('play-state', 'running');
  }
  stop() {
    this.setAttribute('play-state', 'paused');
  }
  toggle() {
    this.playState === 'paused' ? this.start() : this.stop();
  }
  refresh() {
    this._update();
  }

  // ── Private ────────────────────────────────────────────────────────────
  _build() {
    const items = [...this.childNodes];
    this.textContent = '';

    const viewport = document.createElement('div');
    viewport.className = 'marquee-viewport';

    const track = document.createElement('div');
    track.className = 'marquee-track';

    const original = document.createElement('div');
    original.className = 'marquee-item';
    items.forEach((n) => original.appendChild(n));

    track.appendChild(original);
    viewport.appendChild(track);
    this.appendChild(viewport);

    this._original = original;
    this._track = track;
    this._viewport = viewport;

    // Snapshot the authored markup so we can re-render when `mode` changes.
    this._sourceHTML = original.innerHTML;
    this._renderContent();
  }

  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    if (this._sourceHTML == null) return;
    this._original.innerHTML = this._sourceHTML;
    if (LETTER_MODES.includes(this.mode)) this._splitLetters();
  }

  // Wrap each character in a <span class="marquee-char"> with a stagger index,
  // so CSS can animate letters individually (bounce, wave, march, pulse, ransom).
  _splitLetters() {
    const walker = document.createTreeWalker(this._original, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const byWord = this.unit === 'word';
    const ransom = this.mode === 'ransom';
    const pop = this.mode === 'pop';
    const leet = this.mode === 'leet';
    const blink = this.mode === 'blink';
    const decode = this.mode === 'decode';
    const isWs = (c) => c.trim() === '';
    let i = 0;
    for (const node of textNodes) {
      const frag = document.createDocumentFragment();
      const tokens = byWord ? this._tokenizeWords(node.textContent) : [...node.textContent];
      for (const ch of tokens) {
        if (ch === '') continue;
        const space = isWs(ch);
        const span = document.createElement('span');
        span.className = 'marquee-char';
        span.style.setProperty('--i', i++);
        // pop fires letters at random times so the bursts scatter "here and there"
        if (pop) span.style.setProperty('--delay', `${(Math.random() * 2.6).toFixed(2)}s`);
        // blink: each letter blinks independently at its own rate
        if (blink) {
          span.style.setProperty('--blink-rate', `${(0.4 + Math.random() * 1.5).toFixed(2)}s`);
          span.style.setProperty('--blink-delay', `${Math.random().toFixed(2)}s`);
        }
        if (space) {
          span.classList.add('marquee-space');
          span.textContent = ' ';
        } else {
          span.textContent = ch;
          if (ransom) this._ransomize(span);
          if (leet) this._leetify(span);
          // decode: remember the real text so the scramble loop can settle on it
          if (decode) span.dataset.ch = ch;
        }
        frag.appendChild(span);
      }
      node.replaceWith(frag);
    }
    this._original.style.setProperty('--n', i);
  }

  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(text) {
    const tokens = [];
    let buf = '';
    let bufWs = null;
    for (const c of text) {
      const ws = c.trim() === '';
      if (buf !== '' && ws !== bufWs) {
        tokens.push(buf);
        buf = '';
      }
      buf += c;
      bufWs = ws;
    }
    if (buf !== '') tokens.push(buf);
    return tokens;
  }

  // Give a single ransom-note letter a random font, tilt, scale, and chip color.
  _ransomize(span) {
    const fonts = [
      'var(--font-serif, Georgia, serif)',
      'var(--font-mono, ui-monospace, monospace)',
      'var(--font-sans, system-ui, sans-serif)',
      '"Comic Sans MS", "Marker Felt", cursive',
    ];
    const chips = [
      'var(--color-accent, oklch(55% 0.18 250))',
      'var(--color-primary, oklch(55% 0.18 250))',
      'var(--color-error, oklch(60% 0.2 25))',
      'var(--color-warning, oklch(75% 0.15 80))',
      'var(--color-success, oklch(65% 0.18 145))',
    ];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    span.style.fontFamily = pick(fonts);
    span.style.setProperty('--rot', `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    span.style.setProperty('--scale', (0.85 + Math.random() * 0.55).toFixed(2));
    span.style.setProperty('--chip', pick(chips));
  }

  // Substitute a letter with its l33t equivalent and, at random, mirror it or
  // flip it upside-down — for that glitchy h4x0r chaos.
  _leetify(span) {
    const leet = { a: '4', b: '8', e: '3', g: '9', i: '1', l: '1', o: '0', s: '5', t: '7', z: '2' };
    span.textContent = [...span.textContent].map((c) => leet[c.toLowerCase()] || c).join('');
    const r = Math.random();
    if (r < 0.16)
      span.style.setProperty('--flip', 'scaleX(-1)'); // reversed
    else if (r < 0.27)
      span.style.setProperty('--flip', 'scaleY(-1)'); // upside-down
    else if (r < 0.35) span.style.setProperty('--flip', 'rotate(180deg)');
  }

  // Whether playback is currently paused (state, off-screen, tab-hidden, or hover).
  _isPaused() {
    if (this.hasAttribute('pause-on-hover') && this.matches(':hover, :focus-within')) return true;
    return (
      this.playState === 'paused' ||
      this.dataset.visible === 'false' ||
      this.dataset.tabVisible === 'false'
    );
  }

  _stopScramble() {
    if (this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF);
    this._scrambleRAF = null;
  }

  // decode mode: each unit cycles random glyphs, then locks onto its real text
  // (stored in data-ch), staggered by --i, then re-scrambles on a loop.
  _syncScramble() {
    this._stopScramble();
    if (this.mode !== 'decode') return;

    const units = [...this.querySelectorAll('.marquee-char')].filter(
      (s) => !s.classList.contains('marquee-space') && s.dataset.ch != null
    );
    if (units.length === 0) return;

    // Respect reduced motion: show the real text, no scrambling.
    const reduce =
      this.getAttribute('reduced-motion') !== 'ignore' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      for (const s of units) s.textContent = s.dataset.ch;
      return;
    }

    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|';
    const randStr = (n) => {
      let out = '';
      for (let k = 0; k < n; k++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      return out;
    };

    const SCRAMBLE_MS = 650;
    const STAGGER_MS = 45;
    const HOLD_MS = 1800;
    const FLIP_MS = 55;
    let maxSettle = 0;
    const items = units.map((s) => {
      const i = Number(s.style.getPropertyValue('--i')) || 0;
      const settleAt = SCRAMBLE_MS + i * STAGGER_MS;
      if (settleAt > maxSettle) maxSettle = settleAt;
      return { s, settleAt, target: s.dataset.ch };
    });

    let elapsed = 0;
    let lastT = null;
    let lastFlip = 0;
    const tick = (t) => {
      this._scrambleRAF = requestAnimationFrame(tick);
      if (lastT == null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (this._isPaused()) return; // freeze the timeline while paused
      elapsed += dt;
      const flip = elapsed - lastFlip >= FLIP_MS;
      if (flip) lastFlip = elapsed;
      for (const it of items) {
        if (elapsed >= it.settleAt) {
          if (it.s.textContent !== it.target) it.s.textContent = it.target;
        } else if (flip) {
          it.s.textContent = randStr(it.target.length);
        }
      }
      if (elapsed > maxSettle + HOLD_MS) {
        elapsed = 0;
        lastFlip = 0;
      }
    };
    this._scrambleRAF = requestAnimationFrame(tick);
  }

  _observe() {
    this._resizeObserver = new ResizeObserver(() => this._update());
    this._resizeObserver.observe(this);
    this._resizeObserver.observe(this._original);

    this._intersectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          this.dataset.visible = String(e.isIntersecting);
        }),
      { rootMargin: '100px' }
    );
    this._intersectionObserver.observe(this);

    this._onVisibility = () => {
      this.dataset.tabVisible = String(!document.hidden);
    };
    document.addEventListener('visibilitychange', this._onVisibility);
    this.dataset.tabVisible = String(!document.hidden);

    this._onIteration = () => this._dispatch('marquee-cycle');
    this._track.addEventListener('animationiteration', this._onIteration);
  }

  _clearClones() {
    while (this._track.children.length > 1) {
      this._track.lastChild.remove();
    }
  }

  _makeClone() {
    const clone = this._original.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.dataset.clone = '';
    // strip ids — they'd duplicate
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    // remove from tab order & semantic flow
    clone.setAttribute('inert', '');
    return clone;
  }

  _update() {
    if (!this._built && !this._original) return;

    // Reflect state to data-* hooks
    this.dataset.axis = this.axis;
    this.dataset.direction = this.isReverse ? 'reverse' : 'forward';
    this.dataset.behavior = this.behavior;
    this.dataset.state = this.playState;
    this.dataset.ready = '';

    this._clearClones();

    const isHorizontal = this.axis === 'x';
    const viewportSize = isHorizontal ? this._viewport.offsetWidth : this._viewport.offsetHeight;
    const itemSize = isHorizontal ? this._original.offsetWidth : this._original.offsetHeight;

    if (itemSize === 0 || viewportSize === 0) return;

    // Resolve gap to pixels using a temporary measurement
    const gapPx = this._resolveGapPx();

    // Decide how many clones we need
    let cloneCount = 0;
    if (this.behavior === 'loop' && this.autofill) {
      // Need total track >= 2x viewport for seamless loop
      const cycleSize = itemSize + gapPx;
      cloneCount = Math.max(1, Math.ceil((viewportSize * 2) / cycleSize));
    } else if (this.behavior === 'loop') {
      cloneCount = 1; // one clone for the seamless wrap
    }
    // slide & alternate need no clones

    for (let i = 0; i < cloneCount; i++) {
      this._track.appendChild(this._makeClone());
    }

    // Compute scroll distance and duration for constant velocity
    let scrollDistance;
    let alternateEnd = 0; // signed end-translation for the alternate bounce
    if (this.behavior === 'loop') {
      scrollDistance = itemSize + gapPx; // one cycle = one item
    } else if (this.behavior === 'alternate') {
      // Bounce edge-to-edge. Long content slides left to reveal its end;
      // short content travels right across the empty viewport. Either way the
      // distance is the size difference, and the end translation is signed.
      const overflow = itemSize - viewportSize;
      scrollDistance = Math.abs(overflow);
      alternateEnd = -overflow;
    } else {
      // slide
      scrollDistance = itemSize;
    }

    const duration = scrollDistance > 0 ? scrollDistance / this.speed : 0;

    this.style.setProperty('--marquee-duration', `${duration}s`);
    this.style.setProperty('--marquee-gap', this.gap);
    this.style.setProperty('--marquee-item-size', `${itemSize}px`);
    this.style.setProperty('--marquee-cycle-distance', `${scrollDistance}px`);
    this.style.setProperty('--marquee-alternate-distance', `${alternateEnd}px`);
    this.style.setProperty('--marquee-viewport-size', `${viewportSize}px`);

    this._syncScramble();
  }

  _resolveGapPx() {
    // Read computed gap from the track element (works for any CSS length unit)
    const cs = getComputedStyle(this._track);
    const gap = this.axis === 'x' ? cs.columnGap : cs.rowGap;
    const n = parseFloat(gap);
    return Number.isFinite(n) ? n : 0;
  }

  _dispatch(name) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  }
}

customElements.define('marquee-wc', MarqueeWc);

export { MarqueeWc };
