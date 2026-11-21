import { test, expect } from '@playwright/test';

test('Modern Pakistani Wedding VIP standalone preview loads all four scenes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/modern-pakistani-wedding-vip/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await expect(page).toHaveTitle(/Modern Pakistani Wedding VIP|Hamza.*Ayesha/);
  await expect(page.locator('.watermark')).toBeVisible();
  await expect(page.locator('#cover')).toBeVisible();

  const videoSources = await page.locator('video[data-src]').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute('data-src'))
  );
  expect(videoSources).toEqual([
    'assets/videos/VIP-Mehndi.mp4',
    'assets/videos/VIP-Baraat.mp4',
    'assets/videos/VIP-Nikah.mp4',
    'assets/videos/VIP-Walima.mp4'
  ]);

  for (const source of videoSources) {
    const response = await page.request.head(`${process.env.BASE_URL}/modern-pakistani-wedding-vip/${source}`);
    expect(response.ok(), `Expected media to load: ${source}`).toBeTruthy();
  }

  await page.locator('#langBtn').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  expect(errors).toEqual([]);
});
