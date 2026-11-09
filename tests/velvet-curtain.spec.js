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

test('Shopify gallery opens Velvet Curtain through the nested preview iframe', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  // Stub only the preview API so this regression test creates no real order
  // or preview record in the merchant database.
  await page.route('**/functions/v1/invitations-api', async route => {
    const request = route.request();
    const body = request.postDataJSON() || {};
    if (body.action === 'create-preview') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ preview_token: 'playwright-shopify-e2e-token' })
      });
      return;
    }
    if (body.action === 'verify-preview') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          template_id: 'velvet-curtain',
          invitation: {
            final: false,
            C: {
              groom: 'Test Groom',
              bride: 'Test Bride',
              sample: true,
              events: [{
                name: 'Mehndi', date: '2027-03-06', time: '19:30',
                timeText: '7:30 PM', venue: 'Test Venue', address: 'Test Address'
              }]
            }
          },
          expires_at: new Date(Date.now() + 300000).toISOString()
        })
      });
      return;
    }
    await route.continue();
  });

  await page.goto('https://retailhub-store.myshopify.com/pages/digital-invitations', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  const gallery = page.frameLocator('iframe[title="Retail Hub Digital Invitation Gallery"]');
  const templateButton = gallery.locator('[data-t="velvet-curtain"]');
  await expect(templateButton).toBeVisible({ timeout: 45000 });
  await templateButton.tap();

  await expect(gallery.getByRole('heading', { name: 'Velvet Curtain' })).toBeVisible({ timeout: 15000 });
  await gallery.getByRole('button', { name: 'Show my card' }).tap();

  const previewFrame = gallery.frameLocator('#ifr');
  const intro = previewFrame.locator('#intro');
  await expect(intro).toBeVisible({ timeout: 45000 });
  await intro.tap();

  const app = previewFrame.locator('#app');
  await expect.poll(async () => app.evaluate(el => el.classList.contains('started')), {
    timeout: 10000,
    message: 'The invitation did not start from the Shopify nested iframe'
  }).toBe(true);

  const video = previewFrame.locator('video').first();
  await expect.poll(async () => video.evaluate(el => ({
    paused: el.paused,
    currentTime: el.currentTime
  })), { timeout: 15000 }).toMatchObject({ paused: false });
  await expect.poll(async () => video.evaluate(el => el.currentTime), {
    timeout: 15000,
    message: 'Video did not advance in Shopify nested preview'
  }).toBeGreaterThan(0.25);

  expect(errors, `Shopify page errors: ${errors.join(' | ')}`).toEqual([]);
  await context.close();
});

