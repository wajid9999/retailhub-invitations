import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const route = '/templates/vip-royal-mughal-palace.html';
const payload = {
  final: false,
  C: {
    groom: 'VIP Test Groom',
    bride: 'VIP Test Bride',
    groomParents: 'Test Groom Family',
    brideParents: 'Test Bride Family',
    sample: true,
    hosts: ['Test Host | Family'],
    message: 'A royal invitation sample',
    closing: 'We look forward to celebrating with you',
    dressCode: 'Formal',
    rsvp: { phone: '03001234567', message: 'Please RSVP' },
    events: [
      { name: 'Mehndi', date: '2027-06-03', time: '19:30', venue: 'Mehndi Venue', address: 'Lahore' },
      { name: 'Baraat', date: '2027-06-04', time: '19:00', venue: 'Baraat Venue', address: 'Lahore' },
      { name: 'Walima', date: '2027-06-06', time: '20:00', venue: 'Walima Venue', address: 'Lahore' }
    ]
  }
};
const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

test('Royal Mughal Palace VIP maps editor data and serves all four video scenes', async ({ page, request }) => {
  const registryResponse = await request.get(base + '/templates.json');
  expect(registryResponse.ok()).toBeTruthy();
  const registry = await registryResponse.json();
  const item = (registry.templates || []).find(x => x.id === 'vip-royal-mughal-palace');
  test.skip(!item, 'The preview-only VIP package has not been uploaded to this preview build yet.');

  expect(item.file).toBe('templates/vip-royal-mughal-palace.html');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + route + '#' + encoded, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload', 'loaded');
  await expect(page.locator('.sample-pill')).toContainText('Sample');
  await expect(page.locator('.film .layer')).toHaveCount(4);
  await expect(page.locator('li[data-event="mehndi"]')).toContainText('Mehndi Venue');
  await expect(page.locator('li[data-event="baraat"]')).toContainText('Baraat Venue');
  await expect(page.locator('li[data-event="walima"]')).toContainText('Walima Venue');
  await expect(page.locator('#finaleInner')).toContainText('Walima Venue');
  await expect(page.locator('#finaleInner li[data-event]')).toHaveCount(3);

  const sources = await page.locator('video[data-src]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-src')));
  expect(sources).toHaveLength(4);
  for (const source of sources) {
    const assetPath = new URL(source, page.url()).pathname;
    const response = await request.head(base + assetPath);
    expect(response.ok(), assetPath).toBeTruthy();
    expect(response.headers()['content-type'] || '').toContain('video/mp4');
  }
  expect(errors).toEqual([]);
});

test('VIP editor exposes couple, family, RSVP and event-specific fields', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-t="vip-royal-mughal-palace"]').click();
  await expect(page.locator('[data-s="groom"]')).toBeVisible();
  await expect(page.locator('[data-s="bride"]')).toBeVisible();
  await expect(page.locator('[data-s="gf"]')).toBeVisible();
  await expect(page.locator('[data-s="bf"]')).toBeVisible();
  await expect(page.locator('[data-s="message"]')).toBeVisible();
  await expect(page.locator('[data-s="dressCode"]')).toBeVisible();
  await expect(page.locator('[data-s="whatsapp"]')).toBeVisible();
  await expect(page.locator('[data-s="rsvpMessage"]')).toBeVisible();
  await expect(page.locator('[data-e="tagline"]').first()).toBeVisible();
  await expect(page.locator('[data-e="endTime"]').first()).toBeVisible();
  await expect(page.locator('[data-e="dress"]').first()).toBeVisible();
  await expect(page.locator('[data-e="map"]').first()).toBeVisible();
});
