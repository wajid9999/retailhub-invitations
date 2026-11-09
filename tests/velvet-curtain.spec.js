const { test, expect } = require('@playwright/test');

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';

test('Velvet Curtain starts on one real user tap', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') pageErrors.push(message.text());
  });

  await page.goto(`${base}/templates/velvet-curtain/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  const intro = page.locator('#intro');
  await expect(intro).toBeVisible({ timeout: 30000 });

  const video = page.locator('video').first();
  await expect(video).toHaveCount(1);

  // This click is a trusted browser input and therefore tests mobile-style
  // user-gesture playback rules more accurately than calling play() in JS.
  await intro.click();
  await expect.poll(async () => page.locator('#app').evaluate(el => el.classList.contains('started')), {
    timeout: 5000,
    message: 'The #app element did not enter its started state after the tap'
  }).toBe(true);

  await expect.poll(async () => video.evaluate(el => ({
    paused: el.paused,
    currentTime: el.currentTime,
    readyState: el.readyState
  })), {
    timeout: 10000,
    message: 'Video did not begin advancing after the tap'
  }).toMatchObject({ paused: false });

  await expect.poll(async () => video.evaluate(el => el.currentTime), {
    timeout: 10000,
    message: 'Video currentTime did not advance'
  }).toBeGreaterThan(0.25);

  expect(pageErrors, `Browser errors detected: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('Velvet Curtain starts with a real touch on a mobile viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') pageErrors.push(message.text());
  });

  await page.goto(`${base}/templates/velvet-curtain/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  const intro = page.locator('#intro');
  await expect(intro).toBeVisible({ timeout: 30000 });
  await intro.tap();
  await expect.poll(async () => page.locator('#app').evaluate(el => el.classList.contains('started')), {
    timeout: 5000,
    message: 'The mobile tap did not start the invitation'
  }).toBe(true);

  const video = page.locator('video').first();
  await expect.poll(async () => video.evaluate(el => ({
    paused: el.paused,
    currentTime: el.currentTime
  })), { timeout: 10000 }).toMatchObject({ paused: false });
  await expect.poll(async () => video.evaluate(el => el.currentTime), {
    timeout: 10000,
    message: 'Video did not advance after a mobile touch'
  }).toBeGreaterThan(0.25);

  expect(pageErrors, `Browser errors detected: ${pageErrors.join(' | ')}`).toEqual([]);
  await context.close();
});

