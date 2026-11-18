# Inviteora / HisaabPro AI Backend

Separate TypeScript + Mastra backend for the two existing products. This directory is
isolated from the current Shopify theme, invitation site, Supabase Edge Functions, and
HisaabPro Android application.

## Current scope

- Two separate agents: Inviteora and HisaabPro.
- Mem0 adapter with namespaced memory scopes.
- Composio, Langfuse, and Promptfoo are planned but are not yet connected to live accounts
  or production workflows.
- No production API route, OAuth connection, database write tool, Shopify mutation,
  GitHub mutation, or financial write action is enabled in this bootstrap.

## Requirements

- Node.js 22.22.3 or newer (Node.js 24 LTS recommended).
- An OpenAI API key for the configured model.
- Optional service credentials are added only when their integrations are enabled.

## Local setup

From this directory, copy .env.example to .env, add the required model key, then run
npm install followed by npm run dev. Mastra Studio uses local port 4111.

Keep .env private. Never place service secrets in the browser, Shopify theme, static site,
or Android application.

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

Bootstrap branch only. No deployment or live-store changes have been made. Dependency
versions and SDK integration APIs must be installed and type-checked before production use.
