import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

function params(values: unknown[]) {
  return [{ type: "body", parameters: values.map(value => ({ type: "text", text: String(value ?? "") })) }];
}

async function sendTemplate(to: string, name: string, values: unknown[]) {
  const token = Deno.env.get("META_WHATSAPP_ACCESS_TOKEN");
  const phoneId = Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID");
  const version = Deno.env.get("META_GRAPH_API_VERSION");
  if (!token || !phoneId || !version) throw new Error("WhatsApp Cloud API secrets are not configured");
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: { name, language: { code: "en" }, components: params(values) }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Meta API ${response.status}: ${JSON.stringify(result).slice(0, 900)}`);
  return String(result?.messages?.[0]?.id ?? "");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  const expected = SERVICE_KEY;
  if (!expected || req.headers.get("x-inviteora-dispatch-secret") !== expected) return json({ error: "Unauthorized dispatcher" }, 401);

  const { data: jobs, error } = await db.from("invitation_notification_outbox")
    .select("id,order_id,event_type,channel,recipient,payload,attempts")
    .eq("status", "queued")
    .in("channel", ["whatsapp_owner", "whatsapp_customer"])
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) return json({ error: error.message }, 500);
  

  const ownerNumber = digits(Deno.env.get("INVITEORA_OWNER_WHATSAPP"));
  const ownerTemplate = Deno.env.get("INVITEORA_ORDER_TEMPLATE_NAME") || "order_notification";
  const customerTemplate = Deno.env.get("INVITEORA_CUSTOMER_TEMPLATE_NAME");
  let sent = 0, failed = 0, waiting = 0, pushSent = 0, pushFailed = 0, pushWaiting = 0;

  for (const job of (jobs || [])) {
    try {
      const { data: order, error: orderError } = await db.from("invitation_orders")
        .select("order_number,customer_name,customer_phone,template_name,package_tier,amount_pkr")
        .eq("id", job.order_id).maybeSingle();
      if (orderError) throw orderError;
      if (!order) throw new Error("Related order no longer exists");

      let to = digits(job.recipient);
      let template = "";
      let values: unknown[] = [];
      if (job.channel === "whatsapp_owner") {
        to = ownerNumber || to;
        template = ownerTemplate;
        values = [order.order_number, order.customer_name, order.customer_phone, order.template_name, order.package_tier, order.amount_pkr];
      } else {
        template = customerTemplate || "";
        values = [order.order_number, order.template_name, job.payload?.original_url || ""];
      }
      if (!to || !template) { waiting++; continue; }

      const messageId = await sendTemplate(to, template, values);
      const { error: updateError } = await db.from("invitation_notification_outbox").update({
        status: "sent", attempts: Number(job.attempts || 0) + 1, sent_at: new Date().toISOString(),
        provider_message_id: messageId, last_error: null
      }).eq("id", job.id);
      if (updateError) throw updateError;
      sent++;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Notification failed";
      await db.from("invitation_notification_outbox").update({
        status: "failed", attempts: Number(job.attempts || 0) + 1, last_error: message.slice(0, 1000)
      }).eq("id", job.id);
      failed++;
    }
  }
  const { data: pushJobs, error: pushError } = await db.from("invitation_notification_outbox")
    .select("id,order_id,event_type,payload,attempts").eq("status","queued").eq("channel","web_push")
    .order("created_at",{ascending:true}).limit(20);
  if(pushError)throw pushError;
  const vapidPublic=Deno.env.get("VAPID_PUBLIC_KEY"),vapidPrivate=Deno.env.get("VAPID_PRIVATE_KEY"),vapidSubject=Deno.env.get("VAPID_SUBJECT");
  const {data:subscriptions, error:subError}=await db.from("invitation_push_subscriptions").select("id,endpoint,p256dh,auth").eq("enabled",true);
  if(subError)throw subError;
  if(pushJobs?.length){
    if(!vapidPublic||!vapidPrivate||!vapidSubject||!subscriptions?.length)pushWaiting=pushJobs.length;
    else{
      webpush.setVapidDetails(vapidSubject,vapidPublic,vapidPrivate);
      for(const job of pushJobs){
        const title=job.event_type==="order_created"?"Inviteora: New order":job.event_type==="payment_proof_uploaded"?"Inviteora: Payment proof uploaded":"Inviteora: Order approved";
        const body=job.event_type==="order_created"
          ? "Order #"+String(job.payload?.order_number||"")+" · "+String(job.payload?.customer_name||"")+" · Rs. "+String(job.payload?.amount_pkr||"")
          : job.event_type==="payment_proof_uploaded"
          ? "A payment screenshot was uploaded. Open Admin to verify funds."
          : "Order #"+String(job.payload?.order_number||"")+" has been approved.";
        let ok=0,errors=0;
        for(const sub of subscriptions){
          try{
            await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title,body,url:"/retailhub-invitations/admin.html",tag:"inviteora-"+job.id}));
            ok++;
          }catch(e){
            errors++;
            const status=Number((e as {statusCode?:number})?.statusCode||0);
            if(status===404||status===410)await db.from("invitation_push_subscriptions").update({enabled:false,updated_at:new Date().toISOString()}).eq("id",sub.id);
          }
        }
        if(ok>0){
          await db.from("invitation_notification_outbox").update({status:"sent",attempts:Number(job.attempts||0)+1,sent_at:new Date().toISOString(),last_error:errors?errors+" push endpoint(s) failed":null}).eq("id",job.id);
          pushSent++;
        }else{
          await db.from("invitation_notification_outbox").update({status:"failed",attempts:Number(job.attempts||0)+1,last_error:"Push delivery failed for all registered devices"}).eq("id",job.id);
          pushFailed++;
        }
      }
    }
  }
  return json({ processed: jobs.length, sent, failed, waiting, push_processed: pushJobs?.length||0, push_sent:pushSent, push_failed:pushFailed, push_waiting:pushWaiting });
});
