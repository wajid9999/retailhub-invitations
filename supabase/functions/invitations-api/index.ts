import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
async function sha256(v:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");}
async function kickNotifications(){
 const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!secret)return;
 try{await fetch(Deno.env.get("SUPABASE_URL")!+"/functions/v1/notification-dispatch",{method:"POST",headers:{"Content-Type":"application/json","x-inviteora-dispatch-secret":secret},body:"{}"});}
 catch(e){console.warn("Notification dispatcher kick failed",e);}
}
function eventEndDate(payload:unknown):string|null{const found:string[]=[];const walk=(v:unknown,k="")=>{if(Array.isArray(v)){for(const x of v)walk(x,k);return;}if(v&&typeof v==="object"){for(const [key,val] of Object.entries(v as Record<string,unknown>))walk(val,key);return;}if((k==="d"||k==="date")&&typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)){const d=new Date(v+"T00:00:00Z");if(!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v)found.push(v);}};walk(payload);return found.length?found.sort().at(-1)!:null;}
async function requireAdmin(req:Request){const jwt=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");if(!jwt)throw new Error("Admin sign-in required");const {data,error}=await db.auth.getUser(jwt);if(error||!data.user)throw new Error("Invalid admin session");const {data:admin}=await db.from("invitation_admins").select("user_id").eq("user_id",data.user.id).maybeSingle();if(!admin)throw new Error("Not authorized as admin");return data.user;}
Deno.serve(async(req:Request)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});if(req.method!=="POST")return json({error:"POST required"},405);
try{const body=await req.json(),action=String(body.action||"");
if(action==="create-preview"){
 const payload=body.preview_payload,template_id=String(body.template_id||"").trim().slice(0,80);
 if(!payload||typeof payload!=="object"||!template_id)return json({error:"Template and invitation details are required"},400);
 const token=crypto.randomUUID()+crypto.randomUUID(),expiresAt=new Date(Date.now()+5*60*1000).toISOString(),tokenHash=await sha256(token);
 const {error}=await db.from("invitation_previews").insert({token_hash:tokenHash,template_id,preview_payload:payload,expires_at:expiresAt});if(error)throw error;
 return json({preview_token:token,expires_at:expiresAt,valid_for_seconds:300},201);
}
if(action==="verify-preview"){
 const token=String(body.token||"");if(token.length<24||token.length>200)return json({valid:false},400);
 const {data,error}=await db.from("invitation_previews").select("template_id,preview_payload,expires_at").eq("token_hash",await sha256(token)).gt("expires_at",new Date().toISOString()).maybeSingle();if(error)throw error;
 return json(data?{valid:true,template_id:data.template_id,invitation:data.preview_payload,expires_at:data.expires_at}:{valid:false,reason:"expired_or_invalid"},data?200:404);
}
if(action==="public-settings"){const {data,error}=await db.from("invitation_settings").select("simple_price,premium_price,high_price,jazzcash_details,easypaisa_details,bank_details,raast_details").eq("id",true).single();if(error)throw error;return json({settings:data});}
if(action==="submit-order"){
 const customer_name=String(body.customer_name||"").trim().slice(0,100),customer_phone=String(body.customer_phone||"").replace(/[^0-9+]/g,"").slice(0,20),template_name=String(body.template_name||"").trim().slice(0,120),tier=String(body.package_tier||""),previewToken=String(body.preview_token||"");
 if(!customer_name||customer_phone.replace(/\D/g,"").length<10||!template_name||previewToken.length<24||previewToken.length>200)return json({error:"Required order details are missing or the preview has expired"},400);
 if(!["simple","premium","high"].includes(tier))return json({error:"Invalid package"},400);
 const {data:preview,error:pe}=await db.from("invitation_previews").select("template_id,preview_payload,expires_at").eq("token_hash",await sha256(previewToken)).gt("expires_at",new Date().toISOString()).maybeSingle();if(pe)throw pe;
 if(!preview)return json({error:"Preview link expired. Please create a new preview."},410);
 const template_id=String(preview.template_id||"").slice(0,80),payload=preview.preview_payload;
 if(!template_id||!payload||typeof payload!=="object")return json({error:"Preview details are invalid"},400);
 if(!eventEndDate(payload))return json({error:"Add a valid event date before ordering"},400);
 const {data:settings,error:se}=await db.from("invitation_settings").select("simple_price,premium_price,high_price").eq("id",true).single();if(se)throw se;
 const eventList=
   (payload as Record<string,any>).C&&Array.isArray((payload as Record<string,any>).C.events)?(payload as Record<string,any>).C.events:
   (payload as Record<string,any>).d&&Array.isArray((payload as Record<string,any>).d.ev)?(payload as Record<string,any>).d.ev:
   Array.isArray((payload as Record<string,any>).EV)?(payload as Record<string,any>).EV:
   Array.isArray((payload as Record<string,any>).ev)?(payload as Record<string,any>).ev:[];
 const eventCount=Math.max(1,Math.min(30,eventList.length));
 const simple=Math.max(0,Number(settings.simple_price)||0),premium=Math.max(0,Number(settings.premium_price)||0),high=Math.max(0,Number(settings.high_price)||0);
 const price=tier==="high"?high+premium*(eventCount-1):tier==="premium"?premium*eventCount:simple*eventCount;
 const {data,error}=await db.from("invitation_orders").insert({customer_name,customer_phone,template_id,template_name,package_tier:tier,amount_pkr:price,event_count:eventCount,preview_payload:payload,status:"pending_payment"}).select("id,order_number,amount_pkr,status,created_at").single();if(error)throw error;
 const ownerRecipient=(Deno.env.get("INVITEORA_OWNER_WHATSAPP")||"").replace(/\D/g,"")||null;
 const notice={order_number:data.order_number,customer_name,customer_phone,template_name,package_tier:tier,amount_pkr:price,event_count:eventCount};
 await db.from("invitation_notification_outbox").upsert([
  {order_id:data.id,event_type:"order_created",channel:"whatsapp_owner",recipient:ownerRecipient,payload:notice},
  {order_id:data.id,event_type:"order_created",channel:"web_push",payload:notice}
 ],{onConflict:"order_id,event_type,channel",ignoreDuplicates:true});
 await kickNotifications();
 return json({order:data,message:"Order created. Send payment proof to WhatsApp for manual approval."},201);
}
if(action==="submit-payment-proof"){
 const orderId=String(body.order_id||"").trim(),phone=String(body.customer_phone||"").replace(/\D/g,""),mime=String(body.mime_type||""),encoded=String(body.file_base64||"");
 if(!/^[0-9a-f-]{36}$/i.test(orderId)||phone.length<10)return json({error:"Order details are invalid"},400);
 const ext=mime==="image/jpeg"?"jpg":mime==="image/png"?"png":mime==="image/webp"?"webp":"";
 if(!ext||!encoded||encoded.length>7_000_000)return json({error:"Upload a JPG, PNG or WEBP image up to 5MB"},400);
 const {data:order,error:oe}=await db.from("invitation_orders").select("id,customer_phone,status").eq("id",orderId).maybeSingle();if(oe)throw oe;
 if(!order||!["pending_payment","pending_approval"].includes(order.status))return json({error:"Order not found or already processed"},404);
 const storedPhone=String(order.customer_phone||"").replace(/\D/g,"");
 if(storedPhone.slice(-10)!==phone.slice(-10))return json({error:"The WhatsApp number does not match this order"},403);
 const raw=atob(encoded),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 if(bytes.length>5*1024*1024)return json({error:"Image must be 5MB or smaller"},400);
 const sig=Array.from(bytes.slice(0,12));
 const valid=mime==="image/jpeg"?sig[0]===255&&sig[1]===216&&sig[2]===255:
   mime==="image/png"?sig.slice(0,8).join(",")==="137,80,78,71,13,10,26,10":
   mime==="image/webp"?String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP":false;
 if(!valid)return json({error:"The selected file is not a valid image"},400);
 const path=orderId+"/"+crypto.randomUUID()+"."+ext;
 const {error:uploadError}=await db.storage.from("payment-proofs").upload(path,bytes,{contentType:mime,upsert:false});
 if(uploadError)throw uploadError;
 const {error:updateError}=await db.from("invitation_orders").update({payment_proof_path:path,payment_submitted_at:new Date().toISOString(),status:"pending_approval"}).eq("id",orderId);
 if(updateError){await db.storage.from("payment-proofs").remove([path]);throw updateError;}
 const ownerRecipient=(Deno.env.get("INVITEORA_OWNER_WHATSAPP")||"").replace(/\D/g,"")||null;
 const notice={order_id:order.id,customer_phone:order.customer_phone,payment_proof_uploaded:true};
 await db.from("invitation_notification_outbox").upsert([
  {order_id:order.id,event_type:"payment_proof_uploaded",channel:"whatsapp_owner",recipient:ownerRecipient,payload:notice},
  {order_id:order.id,event_type:"payment_proof_uploaded",channel:"web_push",payload:notice}
 ],{onConflict:"order_id,event_type,channel",ignoreDuplicates:true});
 await kickNotifications();
 return json({received:true,message:"Payment screenshot uploaded for verification."},201);
}
if(action==="verify-original"){
 const token=String(body.token||"");if(token.length<24||token.length>200)return json({valid:false},400);
 const {data,error}=await db.from("invitation_orders").select("id,template_id,preview_payload,expires_at,status").eq("original_token_hash",await sha256(token)).eq("status","approved").gt("expires_at",new Date().toISOString()).maybeSingle();if(error)throw error;
 if(!data)return json({valid:false,reason:"expired_or_invalid"},404);
 const invitation=structuredClone(data.preview_payload) as Record<string,unknown>;
 invitation.final=true;
 if(invitation.C&&typeof invitation.C==="object")(invitation.C as Record<string,unknown>).sample=false;
 return json({valid:true,invitation,template_id:data.template_id,expires_at:data.expires_at},200);
}
if(action==="admin-bootstrap"){
 const jwt=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!jwt)return json({error:"Sign in first"},401);
 const {data,error}=await db.auth.getUser(jwt);
 if(error||!data.user)return json({error:"Invalid session"},401);
 if(String(data.user.email||"").toLowerCase()!=="wajid9999@gmail.com"||!data.user.email_confirmed_at)return json({error:"Only the verified owner email can be made admin"},403);
 const {error:insertError}=await db.from("invitation_admins").upsert({user_id:data.user.id},{onConflict:"user_id"});
 if(insertError)throw insertError;
 return json({admin:true,email:data.user.email});
}
if(["admin-list","admin-approve","admin-settings-save","admin-save-push-subscription","admin-notification-status"].includes(action)){
 await requireAdmin(req);
 if(action==="admin-save-push-subscription"){
  const sub=body.subscription||{},endpoint=String(sub.endpoint||"");
  const p256dh=String(sub.keys?.p256dh||""),auth=String(sub.keys?.auth||"");
  if(!endpoint.startsWith("https://")||endpoint.length>3000||p256dh.length<20||auth.length<10)return json({error:"Invalid push subscription"},400);
  const {error}=await db.from("invitation_push_subscriptions").upsert({endpoint,p256dh,auth,user_agent:String(body.user_agent||"").slice(0,500),enabled:true,updated_at:new Date().toISOString()},{onConflict:"endpoint"});
  if(error)throw error;
  return json({saved:true});
 }
 if(action==="admin-notification-status"){
  const {data,error}=await db.from("invitation_notification_outbox").select("event_type,channel,status,created_at").order("created_at",{ascending:false}).limit(50);
  if(error)throw error;
  const {count,error:pe}=await db.from("invitation_push_subscriptions").select("id",{count:"exact",head:true}).eq("enabled",true);
  if(pe)throw pe;
  return json({notifications:data||[],active_push_subscriptions:count||0});
 }
 if(action==="admin-list"){const {data,error}=await db.from("invitation_orders").select("id,order_number,customer_name,customer_phone,template_id,template_name,package_tier,amount_pkr,event_count,status,created_at,approved_at,expires_at,payment_proof_path,payment_submitted_at").order("created_at",{ascending:false}).limit(100);if(error)throw error;const orders=await Promise.all((data||[]).map(async(o)=>{if(!o.payment_proof_path)return {...o,payment_proof_url:null};const {data:signed}=await db.storage.from("payment-proofs").createSignedUrl(o.payment_proof_path,3600);return {...o,payment_proof_url:signed?.signedUrl||null};}));return json({orders});}
 if(action==="admin-approve"){
  const orderId=String(body.order_id||"");const {data:existing,error:lookupErr}=await db.from("invitation_orders").select("preview_payload,payment_proof_path").eq("id",orderId).in("status",["pending_payment","pending_approval"]).maybeSingle();if(lookupErr)throw lookupErr;if(!existing)return json({error:"Order not found or already approved"},409);if(!existing.payment_proof_path)return json({error:"Payment screenshot has not been uploaded yet"},400);
  const endDate=eventEndDate(existing.preview_payload);if(!endDate)return json({error:"Order has no valid event date"},400);
  const expiresAt=new Date(endDate+"T18:59:59.999Z").toISOString();if(new Date(expiresAt).getTime()<=Date.now())return json({error:"Event date has already passed"},400);
  const token=crypto.randomUUID()+crypto.randomUUID(),tokenHash=await sha256(token);
  const {data,error}=await db.from("invitation_orders").update({status:"approved",original_token_hash:tokenHash,approved_at:new Date().toISOString(),expires_at:expiresAt}).eq("id",orderId).in("status",["pending_payment","pending_approval"]).select("id,order_number,customer_phone,template_name,expires_at").maybeSingle();if(error)throw error;if(!data)return json({error:"Order not found or already approved"},409);
  const originalUrl="https://wajid9999.github.io/retailhub-invitations/?original="+encodeURIComponent(token);
  const notice={order_number:data.order_number,customer_phone:data.customer_phone,template_name:data.template_name,original_url:originalUrl,expires_at:data.expires_at};
  await db.from("invitation_notification_outbox").upsert([
   {order_id:data.id,event_type:"order_approved",channel:"whatsapp_customer",recipient:String(data.customer_phone||"").replace(/\D/g,""),payload:notice},
   {order_id:data.id,event_type:"order_approved",channel:"web_push",payload:notice}
  ],{onConflict:"order_id,event_type,channel",ignoreDuplicates:true});
 await kickNotifications();
  return json({order:data,original_token:token,original_url:originalUrl});
 }
 const s=body.settings||{},allowed={simple_price:Math.max(0,Math.min(10000000,Number(s.simple_price)||0)),premium_price:Math.max(0,Math.min(10000000,Number(s.premium_price)||0)),high_price:Math.max(0,Math.min(10000000,Number(s.high_price)||0)),jazzcash_details:String(s.jazzcash_details||"").slice(0,300),easypaisa_details:String(s.easypaisa_details||"").slice(0,300),bank_details:String(s.bank_details||"").slice(0,500),raast_details:String(s.raast_details||"").slice(0,300),updated_at:new Date().toISOString()};
 const {error}=await db.from("invitation_settings").update(allowed).eq("id",true);if(error)throw error;return json({saved:true});
}
return json({error:"Unknown action"},400);
}catch(e){const m=e instanceof Error?e.message:"Request failed";return json({error:m},/Admin sign-in|Invalid admin|Not authorized/.test(m)?401:500);}
});