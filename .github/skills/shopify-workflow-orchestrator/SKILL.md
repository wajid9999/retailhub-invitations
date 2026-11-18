---
name: shopify-workflow-orchestrator
description: Coordinate complete Shopify storefront improvement workflows by routing work to theme development, design, catalog optimization, performance/SEO/accessibility, QA, and safe store operations skills. Use for multi-step Shopify projects or full theme/store improvement requests.
---

# Shopify Workflow Orchestrator

## Route the task
- Liquid, JSON templates, sections, snippets, theme settings, CSS/JS: `shopify-theme-development`.
- Visual hierarchy, mobile layout, navigation, product/collection/cart UX: `shopify-storefront-design`.
- Product records, variants, collections, filters, product content: `shopify-product-collection-optimization`.
- Speed, Core Web Vitals, SEO, structured data, accessibility: `shopify-performance-seo-accessibility`.
- Browser regression and screenshots: `shopify-storefront-qa`.
- Store Admin operations and coordinated content changes: `shopify-store-operations`.

## End-to-end workflow
1. Clarify the business outcome and exact store/theme; inspect the existing implementation before proposing changes.
2. Separate the request into design, theme code, catalog/admin data, settings, and release tasks.
3. Establish baseline screenshots, relevant URLs, theme status, and current behavior.
4. Propose the smallest coherent implementation. Preserve existing features and URLs.
5. Work on a duplicate/unpublished theme or isolated branch.
6. Implement in small steps; validate Liquid, JSON, schemas, links, assets, and responsive behavior.
7. Run browser QA across home, collection, product, search, cart, and changed journeys.
8. Review performance, accessibility, SEO, and mobile behavior for affected pages.
9. Present a change summary, test evidence, known limitations, and rollback plan.
10. Obtain explicit approval before publishing the theme or changing live store settings.

## Project-specific guardrails
- For Retail Hub-Store, preserve navy-blue/gold styling, mobile-first behavior, PKR "Rs." formatting, COD-only messaging, and Mobile Accessories taxonomy unless changed by the owner.
- Do not apply Retail Hub-Store settings to Inviteora, which is a separate invitation brand/workflow.
- Do not make unrelated edits to invitation templates or GitHub Pages assets while working on Shopify theme tasks.
- Never claim installation, upload, test, or deployment success without tool-confirmed evidence.
