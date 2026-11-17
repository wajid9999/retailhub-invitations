import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';
const route = '/templates/vip-royal-wedding.html';
const payload = (final = false) => ({
  final,
  C: {
    groom: 'VIP Test Groom', bride: 'VIP Test Bride', sample: !final, faq: [],
    hostsTitle: 'With best compliments',
    hosts: ['VIP Host | Father of the groom'],
    events: [
      { name: 'Nikah', hosts: 'Test family', date: '2028-08-19', time: '16:00', timeText: '4:00 PM', venue: 'Test Venue One', address: 'Test Address One', dress: 'Formal', map: 'Test Venue One' },
      { name: 'Baraat', hosts: 'Test family', date: '2028-08-20', time: '19:30', timeText: '7:30 PM', venue: 'Test Venue Two', address: 'Test Address Two', dress: 'Festive', map: 'Test Venue Two' }
    ]
  }
});
const enc = p => Buffer.from(JSON.stringify(p), 'utf8').toString('base64');
const open = async (page, p) => {
  await page.goto(`${base}${route}#${enc(p)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload', 'loaded', { timeout: 30000 });
};

test('VIP Royal Wedding renders supplied details and SAMPLE watermark', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await open(page, payload(false));
  await expect(page.locator('#introGroom')).toHaveText('VIP Test Groom');
  await expect(page.locator('#introBride')).toHaveText('VIP Test Bride');
  await expect(page.locator('#wm')).toHaveCount(1);
  const text = await page.locator('body').textContent();
  for (const s of ['Test Venue One', 'Test Address Two', 'VIP Host', 'Father of the groom']) expect(text).toContain(s);
  expect(errors).toEqual([]);
});

test('VIP Royal Wedding final invitation removes SAMPLE watermark', async ({ page }) => {
  await open(page, payload(true));
  await expect(page.locator('#wm')).toHaveCount(0);
});

test('VIP Royal Wedding missing payload shows a clear error', async ({ page }) => {
  await page.goto(`${base}${route}`);
  await expect(page.locator('#err')).toBeVisible();
});
