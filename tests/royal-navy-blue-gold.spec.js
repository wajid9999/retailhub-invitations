import { test, expect } from '@playwright/test';
test('Royal Navy Blue & Gold is first and duplicate Velvet Curtain is absent', async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL+'/');
 const response=await page.request.get(process.env.BASE_URL+'/templates.json');
 expect(response.ok()).toBeTruthy();
 const data=await response.json();const list=data.templates;
 expect(list[0].id).toBe('royal-navy-blue-gold');
 expect(list.some(t=>t.id==='velvet-curtain')).toBeFalsy();
 expect(list.some(t=>t.id==='hamza-areeba')).toBeTruthy();
 expect(list.find(t=>t.id==='hamza-areeba').tier).toBe('high');
 expect(list.find(t=>t.id==='royal-navy-blue-gold').tier).toBe('premium');
 expect(list.find(t=>t.id==='ivory').tier).toBe('premium');

 const home=await page.request.get(process.env.BASE_URL+'/');
 const html=await home.text();
 expect(html).toContain('id="payment-proof"');
 expect(html).toContain('submit-payment-proof');
 expect(html).toContain('verify-original');
 const admin=await page.request.get(process.env.BASE_URL+'/admin.html');
 expect(admin.ok()).toBeTruthy();
 const adminHtml=await admin.text();
 expect(adminHtml).toContain('payment_proof_url');
 expect(adminHtml).toContain('Payment OK');
 await page.goto(process.env.BASE_URL+'/templates/royal-navy-blue-gold.html');
 await expect(page.locator('#customise')).toBeVisible();
 await page.locator('#customise').click();
 await page.locator('#groom').fill('Ali');
 await page.locator('#bride').fill('Sara');
 await page.locator('#apply').click();
 await expect(page.locator('#names')).toContainText('Ali');
 await expect(page.locator('#names')).toContainText('Sara');
 expect(errors).toEqual([]);
});
test('event-based package pricing is correct and page count is not used', async ({page})=>{
 await page.goto(process.env.BASE_URL+'/');
 const result=await page.evaluate(()=>{
  const payloads=[
   {C:{events:[{name:'Mehndi'},{name:'Nikah'},{name:'Walima'}]}},
   {d:{ev:[{k:'Birthday'}]}},
   {EV:[{k:'Mehndi'},{k:'Baraat'}]}
  ];
  return {
   high:[1,2,3].map(n=>calculateInvitationPrice('high',n)),
   premium:[1,2,3].map(n=>calculateInvitationPrice('premium',n)),
   simple:[1,2,3].map(n=>calculateInvitationPrice('simple',n)),
   counts:payloads.map(invitationEventCount)
  };
 });
 expect(result.high).toEqual([3000,4000,5000]);
 expect(result.premium).toEqual([1000,2000,3000]);
 expect(result.simple).toEqual([500,1000,1500]);
 expect(result.counts).toEqual([3,1,2]);
});
