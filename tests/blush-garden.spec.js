import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'https://wajid9999.github.io/retailhub-invitations';
const payload = { final:false, C:{ groom:'Inviteora Blush Groom 8472', bride:'Inviteora Blush Bride 5931', hostsTitle:'With best compliments', hosts:['Test Family | Parents'], scratch:true, events:[
{ name:'Mehndi Payload', hosts:'Bride family', date:'2028-08-19', time:'18:45', timeText:'6:45 PM', venue:'Blush Venue One', address:'Blush Address One', dress:'Festive', map:'Blush Venue One' },
{ name:'Walima Payload', hosts:'Groom family', date:'2028-08-21', time:'19:30', timeText:'7:30 PM', venue:'Blush Venue Two', address:'Blush Address Two', dress:'Formal', map:'Blush Venue Two' }
]}};
const encode = value => Buffer.from(JSON.stringify(value),'utf8').toString('base64');
test('Blush Garden renders editor fields and SAMPLE watermark',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const response=await page.goto(`${base}/templates/blush-garden.html#${encode(payload)}`,{waitUntil:'domcontentloaded',timeout:60000});
expect(response?.ok()).toBeTruthy();
await expect.poll(()=>page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
await expect(page.locator('#ht')).toContainText('Inviteora Blush Groom 8472');
await expect(page.locator('#ht')).toContainText('Inviteora Blush Bride 5931');
await expect(page.locator('#scr')).toContainText('Mehndi Payload');
await expect(page.locator('#scr')).toContainText('Walima Payload');
await expect(page.locator('#scr')).toContainText('Blush Venue One');
await expect(page.locator('#scr')).toContainText('Blush Address Two');
await expect(page.locator('#scr .evb')).toHaveCount(2);
await expect(page.locator('#wm')).toBeVisible();expect(errors).toEqual([]);
});
test('Blush Garden final invitation removes SAMPLE watermark',async({page})=>{
const response=await page.goto(`${base}/templates/blush-garden.html#${encode({...payload,final:true})}`,{waitUntil:'domcontentloaded',timeout:60000});
expect(response?.ok()).toBeTruthy();await expect.poll(()=>page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');await expect(page.locator('#wm')).toHaveCount(0);
});
test('Blush Garden rejects missing payload without sample customer data',async({page})=>{
await page.goto(`${base}/templates/blush-garden.html`,{waitUntil:'domcontentloaded',timeout:60000});
await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload','error');
await expect(page.locator('body')).toContainText('Invitation payload is missing or incomplete');
await expect(page.locator('body')).not.toContainText('Hamza');await expect(page.locator('body')).not.toContainText('Areeba');
});
test('Blush Garden opens from the central Inviteora editor',async({page})=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`${base}/index.html#studio=blush-garden`,{waitUntil:'domcontentloaded',timeout:60000});
await expect(page.locator('#stu')).toBeVisible({timeout:30000});await expect(page.locator('#gal')).toBeHidden();
await expect(page.locator('#tt')).toContainText('Blush Garden');await expect(page.locator('#f input').first()).toBeVisible();expect(errors).toEqual([]);
});

test('Blush Garden fits a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto(`${base}/templates/blush-garden.html#${encode(payload)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  expect(response?.ok()).toBeTruthy();
  await expect.poll(() => page.locator('html').getAttribute('data-inviteora-payload')).toBe('loaded');
  const appWidth = await page.locator('#app').evaluate(el => el.getBoundingClientRect().width);
  const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
  expect(appWidth).toBeLessThanOrEqual(390);
  expect(bodyWidth).toBeLessThanOrEqual(390);
  await expect(page.locator('#ht')).toContainText('Inviteora Blush Groom 8472');
  await expect(page.locator('#scr .evb')).toHaveCount(2);
});
