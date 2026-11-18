import { test, expect } from '@playwright/test';

const invitation = (final = false) => ({
  final,
  C: {
    groom: 'Sapphire Payload Groom',
    bride: 'Pearl Payload Bride',
    groomParents: 'Groom Family',
    brideParents: 'Bride Family',
    sample: !final,
    hostsTitle: 'With best compliments',
    hosts: ['Host One | Uncle', 'Host Two | Aunt'],
    events: [
      { name: 'Mehndi Payload', date: '2028-11-14', time: '18:30', timeText: '6:30 PM', venue: 'Pearl Marquee', address: 'Gulshan, Karachi, Pakistan', map: 'Pearl Marquee, Gulshan, Karachi, Pakistan' },
      { name: 'Nikah Payload', date: '2028-11-15', time: '16:00', timeText: '4:00 PM', venue: 'Grand Hall', address: 'Clifton, Karachi, Pakistan', map: 'Grand Hall, Clifton, Karachi, Pakistan' },
      { name: 'Walima Payload', date: '2028-11-16', time: '19:30', timeText: '7:30 PM', venue: 'Pearl Marquee', address: 'Gulshan, Karachi, Pakistan', map: 'Pearl Marquee, Gulshan, Karachi, Pakistan' }
    ]
  }
});

async function openInvitation(page, data) {
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/templates/burgundy-pearl-mehndi.html#${encoded}`, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
  return errors;
}

test('Burgundy Pearl renders all current editor data and all event cards', async ({ page }) => {
  const errors = await openInvitation(page, invitation(false));
  await expect(page.locator('#groom')).toHaveText('Sapphire Payload Groom');
  await expect(page.locator('#bride')).toHaveText('Pearl Payload Bride');
  await expect(page.locator('#event-details .detail')).toHaveCount(3);
  await expect(page.locator('#event-details')).toContainText('Mehndi Payload');
  await expect(page.locator('#event-details')).toContainText('Nikah Payload');
  await expect(page.locator('#event-details')).toContainText('Walima Payload');
  await expect(page.locator('#event-details a')).toHaveCount(3);
  await expect(page.locator('#watermark')).toBeVisible();
  await expect(page.locator('#invite')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Burgundy Pearl navigation, Urdu switch and play/pause work', async ({ page }) => {
  const errors = await openInvitation(page, invitation(false));
  await page.locator('#next').click();
  await expect(page.locator('#slideCount')).toHaveText('2 / 5');
  await page.locator('#language').click();
  await expect(page.locator('#language')).toHaveText('English');
  await expect(page.locator('#heading')).toHaveText('دعوتِ شادی');
  await page.locator('#play').click();
  await expect(page.locator('#play')).toContainText('Pause');
  await page.locator('#play').click();
  await expect(page.locator('#play')).toContainText('Play');
  expect(errors).toEqual([]);
});

test('Burgundy Pearl final link removes SAMPLE watermark', async ({ page }) => {
  const errors = await openInvitation(page, invitation(true));
  await expect(page.locator('#watermark')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Burgundy Pearl requires an editor payload and does not show hardcoded customer data', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/templates/burgundy-pearl-mehndi.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.error')).toContainText('Invitation payload is missing');
  await expect(page.locator('body')).not.toContainText('Ahmed');
  await expect(page.locator('body')).not.toContainText('Ayesha');
  expect(errors).toEqual([]);
});

test('Burgundy Pearl is available in the central editor with editable couple and event fields', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/index.html#studio=burgundy-pearl-mehndi`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#stu')).toBeVisible();
  await expect(page.locator('#gal')).toBeHidden();
  await expect(page.locator('#tt')).toContainText('Burgundy Pearl Mehndi');
  await expect(page.locator('#f')).toContainText('Groom');
  await expect(page.locator('#f')).toContainText('Bride');
  await expect(page.locator('#f')).toContainText('Groom’s parents');
  await expect(page.locator('#f')).toContainText('Bride’s parents');
  await expect(page.locator('#f input[data-e="k"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="d"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="v"]').first()).toBeVisible();
  await expect(page.locator('#f input[data-e="a"]').first()).toBeVisible();
  await page.locator('#f input[data-s="groom"]').fill('Test Groom');
  await page.locator('#f input[data-s="bride"]').fill('Test Bride');
  await page.locator('#f input[data-e="k"]').first().fill('Mehndi');
  await expect(page.locator('#f input[data-s="groom"]')).toHaveValue('Test Groom');
  await expect(page.locator('#f input[data-s="bride"]')).toHaveValue('Test Bride');
  expect(errors).toEqual([]);
});
