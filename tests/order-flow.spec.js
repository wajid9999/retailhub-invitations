import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';
const api = '**/functions/v1/invitations-api';

test('order form uses configured prices for all packages and event counts', async ({ page }) => {
  await page.route(api, async route => {
    const body = route.request().postDataJSON();
    if (body.action === 'verify-preview') {
      return route.fulfill({ json: {
        valid: true,
        template_id: 'velvet-curtain',
        invitation: { C: { events: [
          { name: 'Mehndi', date: '2027-03-06' },
          { name: 'Nikah', date: '2027-03-07' },
          { name: 'Walima', date: '2027-03-09' }
        ] } },
        expires_at: new Date(Date.now() + 300000).toISOString()
      } });
    }
    if (body.action === 'public-settings') {
      return route.fulfill({ json: { settings: {
        simple_price: 600, premium_price: 1200, high_price: 3500,
        jazzcash_details: 'Test payment details',
        easypaisa_details: '', bank_details: '', raast_details: ''
      } } });
    }
    return route.fulfill({ status: 400, json: { error: 'Unexpected API action' } });
  });

  await page.goto(`${base}/index.html?preview=test-preview-token-12345678901234567890`, {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await expect(page.locator('#order-panel')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#package-price')).toContainText('Rs. 1,800');
  await page.locator('#package-tier').selectOption('premium');
  await expect(page.locator('#package-price')).toContainText('Rs. 3,600');
  await page.locator('#package-tier').selectOption('high');
  await expect(page.locator('#package-price')).toContainText('Rs. 5,900');
});

test('order submission sends a preview token and handles an expired preview safely', async ({ page }) => {
  let submittedBody;
  await page.route(api, async route => {
    const body = route.request().postDataJSON();
    if (body.action === 'verify-preview') {
      return route.fulfill({ json: {
        valid: true, template_id: 'velvet-curtain',
        invitation: { C: { events: [{ name: 'Nikah', date: '2027-03-07' }] } },
        expires_at: new Date(Date.now() + 300000).toISOString()
      } });
    }
    if (body.action === 'public-settings') {
      return route.fulfill({ json: { settings: {
        simple_price: 600, premium_price: 1200, high_price: 3500,
        jazzcash_details: '', easypaisa_details: '', bank_details: '', raast_details: ''
      } } });
    }
    if (body.action === 'submit-order') {
      submittedBody = body;
      return route.fulfill({ status: 410, json: { error: 'Preview link expired. Please create a new preview.' } });
    }
    return route.fulfill({ status: 400, json: { error: 'Unexpected API action' } });
  });

  await page.goto(`${base}/index.html?preview=valid-preview-token-12345678901234567890`, {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await expect(page.locator('#order-panel')).toBeVisible({ timeout: 30000 });
  await page.locator('#customer-name').fill('Test Customer');
  await page.locator('#customer-phone').fill('03001234567');
  await page.locator('#place-order').click();

  await expect.poll(() => submittedBody).toBeTruthy();
  expect(submittedBody.preview_token).toBe('valid-preview-token-12345678901234567890');
  expect(submittedBody).not.toHaveProperty('preview_payload');
  await expect(page.locator('#order-status')).toContainText('Preview link expired');
  await expect(page.locator('#place-order')).toBeEnabled();
});
