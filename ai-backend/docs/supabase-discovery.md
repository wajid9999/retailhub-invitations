# Supabase Discovery Notes — 18 November 2026

Read-only inspection only. No database schema, data, Auth settings, Edge Function, secret, or deployment was changed during this inspection.

## Projects found in the connected Supabase account

### 1. `retailhub-digital-invitations`
- Project ref: `pvunxonsskcczghqivpl`
- Region: `ap-south-1`
- Status: `ACTIVE_HEALTHY`
- PostgreSQL: 17.11
- This project matches the repository's current Inviteora migration set and the `invitation_*` tables.
- Active Edge Functions found: `invitations-api` (version 14), `notification-dispatch` (version 4), and `whatsapp-webhook` (version 1).

### 2. `retailhub-invitation-studio`
- Project ref: `duyeposczonoczwkcvnq`
- Region: `ap-northeast-1`
- Status: `ACTIVE_HEALTHY`
- PostgreSQL: 17.11
- This is a separate schema with `profiles`, `designs`, `orders`, `payments`, `order_assets`, and related workflow tables.
- No Edge Functions were listed for this project.

Do not treat these projects as interchangeable. The current repository migration files and deployed Inviteora functions align with `retailhub-digital-invitations`; the separate `retailhub-invitation-studio` project must not be modified by the AI bootstrap without a deliberate project-selection decision.

## RLS and security inspection

The Supabase Security Advisor reported `rls_enabled_no_policy`:
- 6 public tables in `retailhub-digital-invitations`.
- 11 public tables in `retailhub-invitation-studio`.

A read-only query of `pg_policies` returned no public-schema policies in either project. RLS is enabled, so direct access through the Data API as `anon` or `authenticated` is denied unless a policy is deliberately added. This may be intentional for a service-role-only backend, but it means we must not assume that an ordinary signed-in client can read these tables.

Additional Security Advisor warning in both projects: leaked-password protection is disabled.

## Safe AI integration decision

1. Do not add broad RLS policies to existing business tables as a quick fix. That could expose customer orders, payment proofs, private previews, or staff data.
2. Do not reuse or replace the existing `invitations-api` or `notification-dispatch` functions for AI.
3. Keep AI data access disabled until the identity model and least-privilege server-side adapter are explicitly implemented and tested.
4. For the first Inviteora data-connected pilot, restrict it to authenticated, allowlisted admin users and read-only order/template metadata. Exclude payment proof files, payment secrets, private preview payloads, and customer data not needed for the request.
5. The other project has a distinct staff role model (`owner`, `admin`, `staff`) but no policies or Edge Functions were found. Do not assume its role table is sufficient authorization without validating active membership, permissions, and ownership in the server.
6. HisaabPro remains blocked on its own authenticated cloud-sync layer. No HisaabPro ledger data should be routed through either Inviteora Supabase project.

## Follow-up security work (not applied)

- Review and enable leaked-password protection in Supabase Auth after checking current sign-up/login behavior.
- Decide whether the two Supabase projects are both still active and which is canonical for the newer Inviteora workflow.
- Design an app-specific authorization table/claims model and test it against real user roles before enabling any AI data tools.
- Re-run Security Advisor after any approved policy changes.
