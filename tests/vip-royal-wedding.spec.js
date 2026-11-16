import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';
const route = '/templates/vip-royal-wedding.html';
const event = (name, date, time, timeText, venue, address) => ({
  name, hosts: 'Test Family', date, time, timeText, venue, address,
  dress: 'Festive formal', map: `${venue} ${address}`
});
const payload = (final = false, events) => ({
  final,
  C: {
    groom: 'Payload Groom 4821', bride: 'Payload Bride 7390', sample: !final, faq: [],
    hostsTitle: 'With best compliments', hosts: ['Mr. Host One | Father of the groom'],
    events: events || [
      event('Nikah', '2028-08-19', '16:00', '4:00 PM', 'Payload Venue A', 'Payload Address A'),
      event('Baraat', '2028-08-19', '19:30', '7:30 PM', 'Payload Venue B', 'Payload Address B'),
      event('Walima', '2028-08-20', '20:00', '8:00 PM', 'Payload Venue C', 'Payload Address C')
    ]
  }
});
const enc = p => Buffer.from(JSON.stringify(p), 'utf8').toString('base64');
const open = async (page, p, query = '') => {
  await page.goto(`${base}${route}${query}#${enc(p)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload', 'loaded', { timeout: 30000 });
};

test('VIP Royal Wedding renders the editor payload, preview watermark, no demo data', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await open(page, payload(false));
  await expect(page.locator('#introGroom')).toHaveText('Payload Groom 4821');
  await expect(page.locator('#introBride')).toHaveText('Payload Bride 7390');
  await expect(page.locator('#wm')).toHaveCount(1);
  const text = await page.locator('body').textContent();
  for (const s of ['Payload Venue A', 'Payload Address B', 'Payload Venue C', 'Mr. Host One', 'Father of the groom']) expect(text).toContain(s);
  expect(text).toMatch(/19\\s+August\\s+2028/);
  expect(text).toMatch(/20\\s+August\\s+2028/);
  expect(text).toContain('4:00 PM');
  expect(errors).toEqual([]);
});

test('VIP Royal Wedding final invitation has no SAMPLE watermark', async ({ page }) => {
  await open(page, payload(true), '?mode=final');
  await expect(page.locator('#wm')).toHaveCount(0);
});

test('VIP Royal Wedding follows event add/remove from the editor', async ({ page }) => {
  await open(page, payload(false));
  const pages = () => page.locator('#pages .pg').count();
  const before = await pages();
  const five = Array.from({ length: 5 }, (_, i) => event(`Event ${i + 1}`, `2028-09-0${i + 1}`, '18:00', '6:00 PM', `V${i + 1}`, `A${i + 1}`));
  await page.evaluate(h => { location.hash = h; }, enc(payload(false, five)));
  await expect.poll(pages).toBe(before + 2);
  expect(await page.locator('body').textContent()).toContain('Event 5');
});

test('VIP Royal Wedding video is the background and plays after a tap', async ({ page }) => {
  await open(page, payload(false));
  const video = page.locator('#vid');
  await expect(video.locator('source')).toHaveAttribute('src', 'vip-royal-wedding/media/vip-wedding.mp4');
  await expect(page.locator('#intro')).toBeVisible();
  await page.locator('#intro').click();
  await expect.poll(() => video.evaluate(v => !v.paused && v.currentTime > 0.3), { timeout: 15000 }).toBeTruthy();
  expect(await video.evaluate(v => v.muted)).toBe(false);
});

test('VIP Royal Wedding escapes customer text and shows an error without a payload', async ({ page }) => {
  const p = payload(false); p.C.groom = '<img src=x onerror=window.__x=1>';
  await open(page, p);
  expect(await page.evaluate(() => !window.__x && !document.querySelector('#pages img'))).toBeTruthy();
  await page.goto(`${base}${route}`);
  await expect(page.locator('#err')).toBeVisible();
});
