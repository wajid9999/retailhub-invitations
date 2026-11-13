import { test, expect } from '@playwright/test';
test('Royal Navy Gold video template is registered and editor-compatible', async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL+'/');
 const response=await page.request.get(process.env.BASE_URL+'/templates.json');
 expect(response.ok()).toBeTruthy();
 const data=await response.json();const list=data.templates;
 expect(list.some(t=>t.id==='royal-navy-gold-video')).toBeTruthy();
 expect(list.find(t=>t.id==='royal-navy-gold-video').tier).toBe('high');
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
 await page.goto(process.env.BASE_URL+'/templates/royal-navy-gold-video.html');
 const video=page.locator('#vid');
 await expect(video).toHaveCount(1);
 const videoSource=await video.locator('source').getAttribute('src');
 expect(videoSource).toContain('data:video/mp4;base64,');
 await expect(page.locator('#intro')).toBeVisible();
 await page.locator('#intro').click();
 await expect.poll(()=>video.evaluate(v=>v.paused),{timeout:10000}).toBeFalsy();
 expect(errors).toEqual([]);
});

test('Royal Navy Gold receives editor payload for names and final watermark', async ({page})=>{
 const payload={final:false,C:{groom:'Test Groom',bride:'Test Bride',sample:true,faq:[],events:[{name:'Nikah',hosts:'Family',date:'2027-04-11',time:'16:00',timeText:'4:00 PM',venue:'Test Hall',address:'Test City',dress:'Formal',map:'Test Hall Test City'}]}};
 const encoded=Buffer.from(JSON.stringify(payload),'utf8').toString('base64');
 await page.goto(process.env.BASE_URL+'/templates/royal-navy-gold-video.html#'+encoded);
 await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload','loaded');
 await expect(page.locator('#introGroom')).toHaveText('Test Groom');
 await expect(page.locator('#introBride')).toHaveText('Test Bride');
 await expect(page.locator('#wm')).toBeVisible();
 payload.final=true;
 const finalEncoded=Buffer.from(JSON.stringify(payload),'utf8').toString('base64');
 await page.goto(process.env.BASE_URL+'/templates/royal-navy-gold-video.html#'+finalEncoded);
 await expect(page.locator('html')).toHaveAttribute('data-inviteora-payload','loaded');
 await expect(page.locator('#wm')).toHaveCount(0);
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
