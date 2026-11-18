import { test, expect } from '@playwright/test';

test('Royal Journey renders the latest editor payload instead of demo dates', async ({ page }) => {
  const payload = {
    final: false,
    C: {
      groom: 'Inviteora Payload Groom 8472',
      bride: 'Inviteora Payload Bride 5931',
      sample: true,
      faq: [],
      hosts: [],
      events: [{
        name: 'Payload Mehndi 8472',
        hosts: 'Payload Host',
        date: '2028-08-19',
        time: '18:45',
        timeText: '6:45 PM',
        venue: 'Payload Venue 8472',
        address: 'Payload Address 5931',
        dress: 'Festive formal',
        map: 'Payload Venue 8472 Payload Address 5931'
      }]
    }
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.BASE_URL}/templates/royal-journey.html#${encoded}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await expect.poll(async () => page.locator('body').innerText(), { timeout: 45000 })
    .toContain('Inviteora Payload Groom 8472');
  const rendered = await page.locator('body').textContent();
  expect(rendered).toContain('Inviteora Payload Bride 5931');
  expect(rendered).toContain('Payload Mehndi 8472');
  expect(rendered).toContain('Payload Venue 8472');
  expect(rendered).toContain('Payload Address 5931');
  expect(rendered).toMatch(/19\s+(Aug|August)\s+2028/i);
  expect(errors).toEqual([]);
});
