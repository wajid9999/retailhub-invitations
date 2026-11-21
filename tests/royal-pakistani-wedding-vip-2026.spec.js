import { test, expect } from '@playwright/test';

const id = 'royal-pakistani-wedding-vip-2026';
const payload = {
  final: false,
  C: {
    groom: 'Sample Groom 8472',
    bride: 'Sample Bride 5931',
    groomParents: 'Sample Groom Family',
    brideParents: 'Sample Bride Family',
    sample: true,
    hostsTitle: 'With best compliments',
    hosts: ['Sample Family'],
    rsvp: { name: 'Test RSVP Contact', phone: '03000000000', deadline: '10 March 2027', button: 'Confirm attendance', message: 'Test RSVP message' },
    events: [
      { name: 'Mehndi', hosts: 'Bride family', date: '2027-03-06', time: '19:30', venue: 'Sample Venue', address: 'Lahore, Pakistan', dress: 'Traditional', map: '' },
      { name: 'Baraat', hosts: 'Both families', date: '2027-03-07', time: '18:00', venue: 'Sample Venue', address: 'Lahore, Pakistan', dress: 'Formal', map: '' },
      { name: 'Nikah', hosts: 'Family', date: '2027-03-08', time: '16:00', venue: 'Sample Masjid', address: 'Lahore, Pakistan', dress: 'Traditional', map: '' },
      { name: 'Walima', hosts: 'Groom family', date: '2027-03-09', time: '19:30', venue: 'Sample Hall', address: 'Lahore, Pakistan', dress: 'Formal', map: '' }
    ]
  }
};

test('Royal Pakistani Wedding VIP is registered in the central editor and renders all four scenes', async ({ page, request }) => {
  const base = process.env.BASE_URL;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${base}/#studio=${id}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#tt')).toContainText('Royal Pakistani Wedding VIP');
  await expect(page.locator('#f')).toContainText('Groom');
  await expect(page.locator('#f')).toContainText('Bride');
  await expect(page.locator('#f')).toContainText('Mehndi');
  for (const label of ['Invitation message', 'Dress code', 'RSVP contact name', 'WhatsApp RSVP number', 'RSVP deadline (optional)', 'WhatsApp button text', 'RSVP message']) {
    await expect(page.locator('#f')).toContainText(label);
  }
  await expect(page.locator('#f input[data-s="whatsapp"]')).toBeVisible();
  await expect(page.locator('#f input[data-s="rsvpName"]')).toBeVisible();

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  await page.goto(`${base}/templates/${id}.html#${encoded}`, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
  const rendered = await page.locator('body').innerText();
  await expect(page.locator('[data-f="rsvp.contact"]')).toContainText('Test RSVP Contact');
  await expect(page.locator('[data-f="rsvp.phoneText"]')).toContainText('03000000000');
  await expect(page.locator('#rsvpDeadlineRow')).toBeVisible();
  await expect(page.locator('[data-f="rsvp.deadline"]')).toContainText('10 March 2027');
  await expect(page.locator('#rsvpBtn')).toBeVisible();
  await expect(page.locator('#rsvpBtn [data-rsvp-button]')).toHaveText('Confirm attendance');
  await expect(page.locator('#rsvpBtn')).toHaveAttribute('href', /wa\\.me\\/03000000000/);
  await expect(page.locator('#rsvpBtn')).toHaveAttribute('href', /Test%20RSVP%20message/);

  for (const value of ['Sample Groom 8472', 'Sample Bride 5931', 'Mehndi', 'Baraat', 'Nikah', 'Walima']) {
    expect(rendered).toContain(value);
  }

  const templateResponse = await request.get(`${base}/templates/${id}.html`);
  expect(templateResponse.ok()).toBeTruthy();
  expect(await templateResponse.text()).toContain('VIP-Soundtrack.mp3');

  for (const file of ['VIP-Mehndi.mp4', 'VIP-Baraat.mp4', 'VIP-Nikah.mp4', 'VIP-Walima.mp4']) {
    const response = await request.get(`${base}/templates/${id}/media/media/${file}`);
    expect(response.ok(), file).toBeTruthy();
    expect(response.headers()['content-type']).toContain('video/mp4');
  }
  const soundtrack = await request.get(`${base}/templates/${id}/media/media/VIP-Soundtrack.mp3`);
  expect(soundtrack.ok(), 'Pakistani wedding soundtrack').toBeTruthy();
  expect(soundtrack.headers()['content-type']).toContain('audio/mpeg');
  expect(errors).toEqual([]);
});
