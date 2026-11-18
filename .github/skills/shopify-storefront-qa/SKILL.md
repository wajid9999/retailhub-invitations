---
name: shopify-storefront-qa
description: Test Shopify storefront changes end-to-end across desktop and mobile, including navigation, product variants, filters, cart, checkout handoff, accessibility, media, and theme editor behavior. Use before accepting or releasing theme changes.
---

# Shopify Storefront QA

## Test environment
- Prefer an unpublished theme and test products; do not place real orders unless explicitly authorized.
- Confirm the preview URL and theme ID. Never treat a local preview as the live store.
- Use Playwright or another real browser when available; otherwise state that testing is manual/static only.

## Core regression checklist
- Home page loads without broken assets or console errors.
- Header, menu, search, footer, category links, and announcement bar work.
- Collection pages render products, sorting, filters, pagination, and empty states.
- Product pages handle image galleries, variants, unavailable variants, quantity, price updates, and add-to-cart.
- Cart drawer/page updates quantities, removes items, shows totals, and preserves state.
- Checkout handoff uses the store's configured payment/shipping setup; do not change checkout settings as part of theme QA.
- WhatsApp/native sharing links open the correct product URL and meaningful share text where present.
- All changed links, buttons, forms, video players, and interactive controls work.
- Mobile view has no horizontal overflow or clipped controls.

## Retail Hub-Store checks
When testing Retail Hub-Store:
- Prices display in PKR using "Rs." where theme formatting is custom; verify Shopify currency settings separately.
- COD-only messaging matches the actual store configuration.
- Mobile Accessories is present and Mobile Phones is not added as a category.
- Test product sharing and price/availability filters if those features are present.

## Evidence
- Capture screenshots at phone and desktop widths for meaningful visual changes.
- Record browser errors, failed network requests, broken images, and exact reproduction steps.
- Re-test affected flows after fixes.
- Do not report a test as passed unless it was actually executed.
- Do not publish the theme; request approval before any live release.
