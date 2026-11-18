create table if not exists public.invitation_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.invitation_orders(id) on delete cascade,
  event_type text not null check (event_type in ('order_created','payment_proof_uploaded','order_approved')),
  channel text not null check (channel in ('whatsapp_owner','whatsapp_customer','web_push')),
  recipient text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invitation_notification_outbox_status_created_idx
  on public.invitation_notification_outbox(status, created_at);
create index if not exists invitation_notification_outbox_order_idx
  on public.invitation_notification_outbox(order_id, created_at desc);
create unique index if not exists invitation_notification_outbox_event_channel_unique
  on public.invitation_notification_outbox(order_id, event_type, channel)
  where order_id is not null;

create table if not exists public.invitation_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitation_notification_outbox enable row level security;
alter table public.invitation_push_subscriptions enable row level security;
revoke all on public.invitation_notification_outbox from anon, authenticated;
revoke all on public.invitation_push_subscriptions from anon, authenticated;
