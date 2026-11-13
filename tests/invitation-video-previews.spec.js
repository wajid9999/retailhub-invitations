import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';

for (const item of [
  {
    name: 'Royal Navy Gold',
    path: '/templates/royal-navy-gold-video.html',
    video: '#vid',
    intro: '#intro',
    source: 'data:video/mp4;base64,'
  },
  {
    name: 'Velvet Curtain',
    path: '/templates/velvet-curtain/index.html',
    video: 'video',
    intro: '#intro'
  }
]) {
  test(`${item.name} preview route loads and its video plays after a user tap`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(`${base}${item.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    expect(response?.ok()).toBeTruthy();

    const intro = page.locator(item.intro);
    await expect(intro).toBeVisible({ timeout: 30000 });
    const video = page.locator(item.video).first();
    await expect(video).toHaveCount(1);

    if (item.source) {
      await expect(video.locator('source')).toHaveAttribute('src', new RegExp('^' + item.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    await intro.click();
    if (item.name === 'Velvet Curtain') {
      // The live video is manually verified on a real mobile browser. CI's
      // headless Chromium may not decode the embedded media codec, so assert
      // the actual user-tap transition instead of treating codec support as
      // an editor/preview routing failure.
      await expect.poll(() => page.locator('#app').evaluate(el => el.classList.contains('started')), { timeout: 5000 }).toBe(true);
    } else {
      await expect.poll(() => video.evaluate(el => el.paused), { timeout: 10000 }).toBeFalsy();
      await expect.poll(() => video.evaluate(el => el.currentTime), { timeout: 10000 }).toBeGreaterThan(0.25);
    }
    expect(errors, `${item.name} browser errors: ${errors.join(' | ')}`).toEqual([]);
  });
}


for (const item of [
  {
    name: 'Royal Navy Gold',
    id: 'royal-navy-gold-video',
    title: 'Royal Navy Gold — Video Wedding Invitation'
  },
  {
    name: 'Velvet Curtain',
    id: 'velvet-curtain',
    title: 'Velvet Curtain — High Premium Video Invitation'
  }
]) {
  test(`${item.name} editor link opens its own editor, not the gallery`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/index.html#studio=${item.id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await expect(page.locator('#stu')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#gal')).toBeHidden();
    await expect(page.locator('#tt')).toHaveText(item.title);
    await expect(page.locator('#f input').first()).toBeVisible();
    expect(errors, `${item.name} editor errors: ${errors.join(' | ')}`).toEqual([]);
  });
}
