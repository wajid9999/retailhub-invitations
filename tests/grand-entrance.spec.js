import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';
const payload = {
  final: false,
  C: {
    groom: 'Inviteora Test Groom 8472',
    bride: 'Inviteora Test Bride 5931',
    sample: true,
    scratch: true,
    faq: [],
    hosts: ['Test Host | Family'],
    events: [{
      name: 'Test Mehndi 8472',
      hosts: 'Hosted by the family',
      date: '2028-08-19',
      time: '18:45',
      timeText: '6:45 PM',
      venue: 'Test Venue 8472',
      address: 'Test Address 5931',
      dress: 'Festive formal',
      map: 'Test Venue 8472 Test Address 5931'
    }]
  }
};
const encode = value => Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

test('Grand Entrance consumes Inviteora payload, keeps SAMPLE preview and removes pencil editor', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(`${base}/templates/012-grand-entrance.html#${encode(payload)}`, {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  expect(response?.ok()).toBeTruthy();
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
  await expect(page.locator('#intro')).toContainText('Inviteora Test Groom 8472');
  await expect(page.locator('#scr')).toContainText('Test Mehndi 8472');
  await expect(page.locator('#scr')).toContainText('Test Venue 8472');
  await expect(page.locator('#scr')).toContainText('Test Address 5931');
  await expect(page.locator('#wm')).toBeVisible();
  await expect(page.locator('#edb')).toHaveCount(0);
  await expect(page.locator('#ed')).toHaveCount(0);
  await expect(page.locator('#vid source')).toHaveAttribute('src', /012-grand-entrance\/media\/asset-\d+\.mp4$/);
  expect(errors).toEqual([]);
});

test('Grand Entrance final invitation removes SAMPLE watermark', async ({ page }) => {
  const finalPayload = { ...payload, final: true, C: { ...payload.C, sample: false } };
  const response = await page.goto(`${base}/templates/012-grand-entrance.html#${encode(finalPayload)}`, {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  expect(response?.ok()).toBeTruthy();
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
  await expect(page.locator('#wm')).toHaveCount(0);
});

test('Grand Entrance is registered with Inviteora editor and premium event pricing tier', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/index.html#studio=012-grand-entrance`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.locator('#stu')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#gal')).toBeHidden();
  await expect(page.locator('#tt')).toContainText('012 Grand Entrance');
  await expect(page.locator('#f input').first()).toBeVisible();
  await expect(page.locator('#edit')).toBeVisible();
  expect(errors).toEqual([]);
});
