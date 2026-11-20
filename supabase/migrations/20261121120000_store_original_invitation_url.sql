alter table public.invitation_orders
  add column if not exists original_url text;

comment on column public.invitation_orders.original_url is
  'Full original invitation URL retained for owner/admin manual sharing after approval.';
