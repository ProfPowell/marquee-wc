/**
 * <marquee-wc> — a modern, accessible, themeable replacement for the
 * deprecated <marquee> element. Light DOM, constant-velocity, and Vanilla
 * Breeze design-token aware.
 */

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';
export type MarqueeBehavior = 'loop' | 'slide' | 'alternate';
export type MarqueePlayState = 'running' | 'paused';
export type MarqueeReducedMotion = 'respect' | 'ignore';
export type MarqueeAxis = 'x' | 'y';

/**
 * Visual/motion preset. Surface themes style the container; letter modes
 * (`bounce`, `wave`, `march`, `pulse`, `ransom`) animate each character.
 */
export type MarqueeMode =
  | ''
  | 'ticker'
  | 'breaking-news'
  | 'code-block'
  | 'screen-saver'
  | 'credits'
  | 'dot-matrix'
  | 'bounce'
  | 'wave'
  | 'march'
  | 'pulse'
  | 'ransom'
  | 'pop'
  | 'spin'
  | 'rainbow'
  | 'flip'
  | 'glitch';

export interface MarqueeWcEventMap {
  'marquee-start': CustomEvent<void>;
  'marquee-pause': CustomEvent<void>;
  'marquee-cycle': CustomEvent<void>;
}

export declare class MarqueeWc extends HTMLElement {
  static get observedAttributes(): string[];

  /** Scroll direction. Attribute: `direction`. Default `left`. */
  get direction(): MarqueeDirection;
  /** Pixels per second. Attribute: `speed`. Default `50`. */
  get speed(): number;
  /** Animation behavior. Attribute: `behavior`. Default `loop`. */
  get behavior(): MarqueeBehavior;
  /** CSS length between repeats. Attribute: `gap`. Default `2rem`. */
  get gap(): string;
  /** Playback state. Attribute: `play-state`. Default `running`. */
  get playState(): MarqueePlayState;
  /** Whether short content auto-clones to fill the viewport. Attribute: `autofill`. Default `true`. */
  get autofill(): boolean;
  /** Computed scroll axis derived from `direction`. */
  get axis(): MarqueeAxis;
  /** Whether the resolved direction runs in reverse (`right` or `down`). */
  get isReverse(): boolean;
  /** Active visual/motion preset. Attribute: `mode`. Default `''` (none). */
  get mode(): MarqueeMode;

  /** Start the marquee (sets `play-state="running"`). */
  start(): void;
  /** Stop the marquee (sets `play-state="paused"`). */
  stop(): void;
  /** Toggle between running and paused. */
  toggle(): void;
  /** Recompute clones, distance, and duration (call after dynamic content changes). */
  refresh(): void;

  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;

  addEventListener<K extends keyof MarqueeWcEventMap>(
    type: K,
    listener: (this: MarqueeWc, ev: MarqueeWcEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'marquee-wc': MarqueeWc;
  }
}
