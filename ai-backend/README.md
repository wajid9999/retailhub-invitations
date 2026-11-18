# Inviteora / HisaabPro AI Backend

Separate TypeScript + Mastra backend for the two existing products. This directory is
isolated from the current Shopify theme, invitation site, Supabase Edge Functions, and
HisaabPro Android application.

## Selected model provider

OpenAI API is the selected provider for both agents.

- Model route: `openai/gpt-4.1-mini`
- Required server-side environment variable: `OPENAI_API_KEY`
- The key is never committed, returned by the backend, or placed in Shopify/browser/Android code.
- Model selection can be changed later by updating `MASTRA_MODEL` after evaluating cost,
  latency, quality, and availability.

## Current scope

- Two separate agents: Inviteora and HisaabPro.
- Mem0 adapter with namespaced memory scopes.
- Composio and Langfuse are planned but are not yet connected to live accounts or production
  workflows.
- No production API route, OAuth connection, database write tool, Shopify mutation,
  GitHub mutation, or financial write action is enabled in this bootstrap.

## Requirements

- Node.js 22.22.3 or newer (Node.js 24 LTS recommended).
- An OpenAI API key for the configured model.

## Local setup

From this directory:

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY` in the private `.env` file.
3. Keep the key server-side; do not paste it into source files or commit it.
4. Run `npm install`, then `npm run dev`.

Mastra Studio uses local port 4111.

## Gateway security contract

See [docs/gateway-contract.md](./docs/gateway-contract.md) for the authentication, tenant isolation, app-specific data boundaries, and implementation gates. See [docs/supabase-discovery.md](./docs/supabase-discovery.md) for the verified project inventory and current RLS/security findings. This is a design baseline only; no public AI route is enabled.

## Integration sequence

1. Add a Supabase-authenticated API gateway and verify user/business roles.
2. Add read-only Inviteora tools for published templates and order status.
3. Add read-only HisaabPro tools backed by its existing authorized data layer.
4. Enable Mem0 with app + tenant + subject scoped IDs; store preferences only.
5. Configure Composio OAuth auth configs and narrow tool allowlists per app.
6. Enable Langfuse tracing with sensitive-field masking and separate project tags.
7. Add Promptfoo evaluations and security tests to pull-request CI.
8. Add write tools only after explicit owner approval, audit logging, and tests.

## Non-negotiable boundaries

- Shopify remains the source of truth for Inviteora products and orders.
- GitHub remains the source of truth for published invitation templates.
- Existing Supabase order, payment-proof, preview-expiry, and admin flows remain intact.
- HisaabPro's database remains the source of truth for all accounting values.
- HisaabPro business/device permissions must be checked server-side for every request.
- AI memory is not an accounting ledger and must never be used to reconstruct balances.
- Cross-application and cross-tenant memory, logs, credentials, and tool sessions are isolated.

## Status

Bootstrap branch only. CI type-check and Mastra build passed. No production deployment or
live-store changes have been made. API key setup and a live model smoke test are still
required before enabling runtime requests.
