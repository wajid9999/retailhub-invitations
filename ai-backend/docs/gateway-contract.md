# AI Gateway Contract (Design Baseline)

Status: design only. This document does not deploy routes, change Supabase, or grant data access.

## Why a separate gateway

The Mastra agents are not public client endpoints. Shopify theme code and the HisaabPro Android app must call a trusted server gateway. The gateway validates the caller, resolves the app and business scope, checks permissions, applies rate limits, and only then invokes the matching agent.

Do not reuse the existing `supabase/functions/invitations-api` as an AI proxy. That function currently owns invitation preview/order/payment-proof workflows and must remain isolated from AI chat.

## Request contract

`POST /v1/ai/chat`

Headers:
- `Authorization: Bearer <Supabase access token>`
- `Content-Type: application/json`
- Optional `Idempotency-Key` for retry-safe request handling

Body:
```json
{
  "app": "inviteora",
  "message": "Help me find a wedding invitation template",
  "conversation_id": "optional-client-generated-id",
  "locale": "ur"
}
```

Allowed `app` values: `inviteora`, `hisaabpro`.

The server selects the agent from the validated app value. The client must never submit an agent name, arbitrary tool name, tenant ID, user ID, role, or permission list as trusted authorization data.

Response envelope:
```json
{
  "request_id": "server-generated-id",
  "app": "inviteora",
  "conversation_id": "opaque-id",
  "answer": "Assistant response",
  "sources": [],
  "requires_owner_approval": false
}
```

Do not return provider credentials, raw database rows, internal prompts, tool credentials, stack traces, or another tenant's identifiers.

## Authentication and authorization

1. Require a valid Supabase access token and validate it server-side with Supabase Auth `getUser(token)`. Do not trust a decoded JWT alone.
2. Resolve the user's active membership and business/tenant from server-side database records. Ignore client-supplied tenant IDs for authorization.
3. Do not use user-editable `user_metadata` for roles or permissions. Use trusted server-side membership/role records (or carefully managed `app_metadata` as a secondary claim, accounting for token staleness).
4. Check app access, tenant membership, device status, and each requested capability on every request.
5. Deny by default. Unknown app, missing membership, revoked device, expired token, or missing permission means no agent/tool execution.
6. Keep Inviteora and HisaabPro sessions, memory namespaces, logs, and tool allowlists separate.

## App-specific data boundaries

### Inviteora
- Shopify remains authoritative for products, prices, and orders.
- GitHub template registry remains authoritative for published templates.
- Existing Supabase invitation order, preview expiry, payment-proof, and notification flows are not modified by this gateway.
- Initial tools are read-only: published template lookup and authorized order-status lookup only.
- Do not mark payments paid, change orders, publish templates, or message customers through the AI gateway.

### HisaabPro
- The existing Room database remains authoritative for accounting values until an explicit, tested cloud-sync design exists.
- Current repository inspection found no existing Retrofit, Firebase, or Supabase sync layer. Therefore, the AI gateway must not claim it can read live HisaabPro ledger data yet.
- Before enabling accounting queries, implement authenticated sync/API access with business isolation, device registration, conflict handling, audit history, and server-side authorization.
- Each read must enforce the granular Owner-configured permission for that action and business. Daily sales/accounting summaries remain Owner-only unless the Owner explicitly grants a narrower approved permission.
- AI memory is never a ledger and must not store or reconstruct balances, sales totals, stock quantities, or payment status.
- All financial writes remain disabled. Any future write requires a separate explicit Owner approval flow and immutable audit event.

## Memory isolation

Use a server-generated namespace derived from validated values:
`app:<app>:tenant:<tenant-id>:subject:<user-id>`.

Never accept a complete memory namespace from the client. Do not place accounting facts, payment credentials, access tokens, or sensitive customer data in long-term memory. Conversation history is not authorization evidence.

## Operational controls

- Keep `OPENAI_API_KEY` in server-side environment variables or a secret manager only.
- Apply per-user, per-tenant, and per-app rate limits and request-size limits.
- Add request IDs, redacted audit events, timeout handling, and safe error responses.
- Mask phone numbers, customer details, and financial data in telemetry.
- Configure separate staging and production secrets and budgets.
- Add tests for cross-tenant access, revoked devices, role changes, owner-only totals, prompt injection in retrieved data, and denied write attempts.

## Implementation gates

Do not expose the route until all of these are complete:
- A confirmed hosting target and private server-side OpenAI key configuration.
- Verified Supabase project/auth configuration and membership schema.
- Inviteora read-only data adapters with tests.
- HisaabPro cloud-sync and authorization design, before any live ledger tool is enabled.
- Security tests and a successful live model smoke test.

