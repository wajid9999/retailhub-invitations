---
name: shopify-store-operations
description: Plan and safely execute Shopify store content workflows involving products, collections, navigation, theme assets, store settings, and order-related configuration. Use for coordinated store maintenance and repeatable operational tasks.
---

# Shopify Store Operations

## Scope and authorization
- Distinguish theme code changes from Admin data changes and store configuration changes.
- Confirm the target store and the exact requested operation before mutations.
- Treat product publishing, price changes, inventory changes, order actions, payment/shipping settings, and theme publication as consequential actions requiring explicit confirmation.
- Use the least-privilege connected Shopify tools and request only the data needed.
- Never expose customer personal data or credentials in code, commits, screenshots, or reports.

## Safe workflow
1. Inspect current state and identify affected records/settings.
2. Summarize the proposed changes and any irreversible effects.
3. Create a backup/export or duplicate theme when practical.
4. Apply a small, reversible batch first.
5. Verify the result in Shopify Admin and storefront.
6. Record IDs, handles, settings, and any failures for rollback.

## Content consistency
- Keep product titles, descriptions, images, prices, variants, collections, navigation, and SEO metadata consistent.
- Preserve product handles and collection URLs unless redirects are planned.
- Do not fabricate product specifications, stock, ratings, delivery promises, return policies, or warranty terms.
- Keep store currency, price display, and payment claims consistent with actual configuration.
- For Retail Hub-Store, use PKR / "Rs." display, COD-only messaging, and the established Mobile Accessories taxonomy unless the owner explicitly changes them.

## Release and rollback
- Theme preview, theme upload, and theme publication are separate steps.
- Never publish a theme or alter payment/shipping configuration without explicit approval.
- After a change, report what changed, how it was verified, and how to revert it.
