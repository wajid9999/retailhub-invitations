import { test, expect } from '@playwright/test';
test('Green Velvet and Royal Navy Blue & Gold are High Premium', async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL+'/');
 const response=await page.request.get(process.env.BASE_URL+'/templates.json');
 expect(response.ok()).toBeTruthy();
 const data=await response.json();const list=data.templates;
 expect(list.some(t=>t.id==='royal-navy-blue-gold')).toBeTruthy();
 expect(list.find(t=>t.id==='royal-navy-blue-gold').tier).toBe('high');
 for (const id of ['mahad','ivory']) {
  const item=list.find(t=>t.id===id);
  if (item) expect(item.tier).toBe('premium');
 }
 expect(list.some(t=>t.id==='hamza-areeba')).toBeFalsy();

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
 const video=page.locator('#vid');
 await expect(video).toHaveCount(1);
 const videoSource=await video.locator('source').getAttribute('src');
 expect(videoSource).toContain('data:video/mp4;base64,');
 await expect(page.locator('#intro')).toBeVisible();
 await page.locator('#intro').click();
 await expect.poll(()=>video.evaluate(v=>v.paused),{timeout:10000}).toBeFalsy();
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
