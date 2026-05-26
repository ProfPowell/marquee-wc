import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.waitForFunction(() => customElements.get('marquee-wc') !== undefined);
});

test.describe('Basic Functionality', () => {
  test('upgrades and is defined', async ({ page }) => {
    const defined = await page.evaluate(() => customElements.get('marquee-wc') !== undefined);
    expect(defined).toBe(true);
  });

  test('builds internal structure (viewport + track + item)', async ({ page }) => {
    const el = page.locator('#default');
    await expect(el.locator('.marquee-viewport')).toHaveCount(1);
    await expect(el.locator('.marquee-track')).toHaveCount(1);
    await expect(el.locator('.marquee-item').first()).toBeVisible();
  });

  test('marks itself ready via data-ready', async ({ page }) => {
    await expect(page.locator('#default')).toHaveAttribute('data-ready', '');
  });

  test('reflects defaults to data-* hooks', async ({ page }) => {
    const el = page.locator('#default');
    await expect(el).toHaveAttribute('data-axis', 'x');
    await expect(el).toHaveAttribute('data-direction', 'forward');
    await expect(el).toHaveAttribute('data-behavior', 'loop');
    await expect(el).toHaveAttribute('data-state', 'running');
  });
});

test.describe('Attributes and getters', () => {
  test('default getters return documented defaults', async ({ page }) => {
    const values = await page.evaluate(() => {
      const el = document.getElementById('default');
      return {
        direction: el.direction,
        speed: el.speed,
        behavior: el.behavior,
        gap: el.gap,
        playState: el.playState,
        autofill: el.autofill,
        axis: el.axis,
        isReverse: el.isReverse,
      };
    });
    expect(values).toEqual({
      direction: 'left',
      speed: 100,
      behavior: 'loop',
      gap: '2rem',
      playState: 'running',
      autofill: true,
      axis: 'x',
      isReverse: false,
    });
  });

  test('vertical direction resolves to y axis', async ({ page }) => {
    const el = page.locator('#vertical');
    await expect(el).toHaveAttribute('data-axis', 'y');
    const axis = await page.evaluate(() => document.getElementById('vertical').axis);
    expect(axis).toBe('y');
  });

  test('slide behavior is reflected', async ({ page }) => {
    await expect(page.locator('#slide')).toHaveAttribute('data-behavior', 'slide');
  });
});

test.describe('Programmatic API', () => {
  test('stop() pauses and start() resumes', async ({ page }) => {
    const el = page.locator('#ctrl');
    const playState = () =>
      page.evaluate(
        () => getComputedStyle(document.querySelector('#ctrl .marquee-track')).animationPlayState
      );
    await page.evaluate(() => document.getElementById('ctrl').stop());
    await expect(el).toHaveAttribute('data-state', 'paused');
    // The track animation must actually be paused, not just the attribute.
    expect(await playState()).toBe('paused');
    await page.evaluate(() => document.getElementById('ctrl').start());
    await expect(el).toHaveAttribute('data-state', 'running');
    expect(await playState()).toBe('running');
  });

  test('toggle() flips play state', async ({ page }) => {
    const el = page.locator('#ctrl');
    const before = await el.getAttribute('data-state');
    await page.evaluate(() => document.getElementById('ctrl').toggle());
    const after = await el.getAttribute('data-state');
    expect(after).not.toBe(before);
  });
});

test.describe('Events', () => {
  test('emits marquee-pause and marquee-start on state change', async ({ page }) => {
    const events = await page.evaluate(async () => {
      const el = document.getElementById('ctrl');
      const seen = [];
      el.addEventListener('marquee-pause', () => seen.push('pause'));
      el.addEventListener('marquee-start', () => seen.push('start'));
      el.stop();
      el.start();
      await new Promise((r) => requestAnimationFrame(r));
      return seen;
    });
    expect(events).toContain('pause');
    expect(events).toContain('start');
  });
});

test.describe('Autofill clones', () => {
  test('clones are inert, aria-hidden, and id-free', async ({ page }) => {
    const clone = page.locator('#ticker .marquee-item[data-clone]').first();
    await expect(clone).toHaveAttribute('aria-hidden', 'true');
    await expect(clone).toHaveAttribute('inert', '');
    const cloneIds = await page.evaluate(() => {
      const el = document.getElementById('ticker');
      const clones = el.querySelectorAll('[data-clone]');
      let withId = 0;
      clones.forEach((c) => {
        if (c.querySelector('[id]')) withId++;
      });
      return withId;
    });
    expect(cloneIds).toBe(0);
  });
});

test.describe('Letter modes', () => {
  test('mode="bounce" splits text into staggered .marquee-char spans', async ({ page }) => {
    const chars = page.locator('#bounce .marquee-item').first().locator('.marquee-char');
    await expect(chars.first()).toBeVisible();
    const count = await chars.count();
    expect(count).toBe('Bouncing letters'.length);

    // Each char carries a stagger index, and the animation actually runs.
    const info = await chars.first().evaluate((el) => ({
      i: getComputedStyle(el).getPropertyValue('--i').trim(),
      animation: getComputedStyle(el).animationName,
    }));
    expect(info.i).toBe('0');
    expect(info.animation).toBe('marquee-wc-bounce');
  });

  test('switching mode away from a letter mode removes the char spans', async ({ page }) => {
    await page.evaluate(() => document.getElementById('bounce').setAttribute('mode', 'ticker'));
    const count = await page
      .locator('#bounce .marquee-item')
      .first()
      .locator('.marquee-char')
      .count();
    expect(count).toBe(0);
  });
});

test.describe('Accessibility', () => {
  test('respects reduced motion preference (animation disabled)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/test/test-page.html');
    await page.waitForFunction(() => customElements.get('marquee-wc') !== undefined);
    const animationName = await page.evaluate(() => {
      const track = document.querySelector('#default .marquee-track');
      return getComputedStyle(track).animationName;
    });
    expect(animationName).toBe('none');
    await context.close();
  });
});
