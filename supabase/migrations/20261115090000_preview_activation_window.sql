alter table public.invitation_previews
  add column if not exists activated_at timestamptz;

create index if not exists invitation_previews_expires_at_idx
  on public.invitation_previews (expires_at);

comment on column public.invitation_previews.activated_at is
  'Set once on first successful preview verification; the five-minute preview TTL begins at activation.';
