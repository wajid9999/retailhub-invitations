import { test, expect } from '@playwright/test';

const payload = (final) => ({
  final,
  C: {
    groom: 'Inviteora Groom Payload 8472',
    bride: 'Inviteora Bride Payload 5931',
    groomParents: 'Groom Parents Payload',
    brideParents: 'Bride Parents Payload',
    sample: !final,
    hostsTitle: 'With Compliments',
    hosts: ['Host One | Uncle', 'Host Two | Cousin'],
    events: [
      { name: 'Payload Mehndi 8472', date: '2028-08-19', time: '18:45', timeText: '6:45 PM', venue: 'Mehndi Venue 8472', address: 'Mehndi Address 5931', map: 'Mehndi Venue 8472 Mehndi Address 5931' },
      { name: 'Payload Baraat 8472', date: '2028-08-20', time: '19:30', timeText: '7:30 PM', venue: 'Baraat Venue 8472', address: 'Baraat Address 5931', map: 'Baraat Venue 8472 Baraat Address 5931' },
      { name: 'Payload Walima 8472', date: '2028-08-22', time: '20:00', timeText: '8:00 PM', venue: 'Walima Venue 8472', address: 'Walima Address 5931', map: 'Walima Venue 8472 Walima Address 5931' }
    ]
  }
});

async function openTemplate(page, data) {
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/templates/normal-wedding-emerald.html#${encoded}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload'), { timeout: 15000 }).toBe('loaded');
  return errors;
}

test('Emerald Normal template renders all editor data, hosts, venues and maps', async ({ page }) => {
  const errors = await openTemplate(page, payload(true));
  await expect.poll(() => page.locator('.backdrop').evaluate(img => img.naturalWidth), { timeout: 10000 }).toBeGreaterThan(0);
  await expect(page.locator('#groom-name')).toHaveText('Inviteora Groom Payload 8472');
  await expect(page.locator('#bride-name')).toHaveText('Inviteora Bride Payload 5931');
  await expect(page.locator('#groom-parents')).toHaveText('Groom Parents Payload');
  await expect(page.locator('#bride-parents')).toHaveText('Bride Parents Payload');
  await expect(page.locator('#event-list')).toContainText('Payload Mehndi 8472');
  await expect(page.locator('#event-list')).toContainText('Payload Baraat 8472');
  await expect(page.locator('#event-list')).toContainText('Payload Walima 8472');
  await expect(page.locator('#venue-list')).toContainText('Mehndi Venue 8472');
  await expect(page.locator('#venue-list')).toContainText('Baraat Address 5931');
  await expect(page.locator('#venue-list')).toContainText('Walima Venue 8472');
  await expect(page.locator('#venue-list a')).toHaveCount(3);
  await expect(page.locator('#host-list')).toContainText('Host One');
  await expect(page.locator('#host-list')).toContainText('Uncle');
  await expect(page.locator('#sample-watermark')).toBeHidden();
  await expect(page.locator('.invite')).toHaveAttribute('data-ready', 'true');
  expect(errors).toEqual([]);
});

test('Emerald Normal preview shows SAMPLE watermark and bilingual switch', async ({ page }) => {
  const errors = await openTemplate(page, payload(false));
  await expect(page.locator('#sample-watermark')).toBeVisible();
  await page.locator('#lang').click();
  await expect(page.locator('#lang')).toHaveText('English');
  await expect(page.locator('.eyebrow').first()).toContainText('اللہ');
  await page.locator('#lang').click();
  await expect(page.locator('#lang')).toHaveText('اردو');
  expect(errors).toEqual([]);
});

test('Emerald Normal final invitation removes SAMPLE watermark', async ({ page }) => {
  const errors = await openTemplate(page, payload(true));
  await expect(page.locator('#sample-watermark')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Emerald Normal template does not show demo customer data without a payload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/templates/normal-wedding-emerald.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload', 'error');
  await expect(page.locator('.slides')).toContainText('Invitation payload is missing');
  await expect(page.locator('.slides')).not.toContainText('Ayesha');
  await expect(page.locator('.slides')).not.toContainText('Ahmed');
  await page.waitForTimeout(7000);
  expect(errors).toEqual([]);
});

test('Emerald Normal opens in the existing central editor with parent and event fields', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/index.html#studio=normal-wedding-emerald`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await expect(page.locator('#stu')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#gal')).toBeHidden();
  await expect(page.locator('#tt')).toContainText('Emerald Mughal Wedding');
  await expect(page.locator('#f')).toContainText('Groom’s parents');
  await expect(page.locator('#f')).toContainText('Bride’s parents');
  await expect(page.locator('#f input[data-e="k"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="d"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="v"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="a"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});
