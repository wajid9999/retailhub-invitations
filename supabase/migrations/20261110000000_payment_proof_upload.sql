-- Store payment proof screenshots privately; only the service-role Edge Function can access them.
alter table public.invitation_orders
  add column if not exists payment_proof_path text,
  add column if not exists payment_submitted_at timestamptz;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];
