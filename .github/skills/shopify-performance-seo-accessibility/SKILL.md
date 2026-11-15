---
name: shopify-performance-seo-accessibility
description: Audit and improve Shopify theme speed, Core Web Vitals, technical SEO, metadata, structured data, accessibility, image delivery, and mobile usability. Use before releases or when storefront performance/search/accessibility is in scope.
---

# Shopify Performance, SEO, and Accessibility

## Performance
- Measure the current state before optimizing; separate lab metrics from field data.
- Prioritize LCP, INP, CLS, image payload, render-blocking assets, third-party scripts, and excessive app embeds.
- Use Shopify image_url/image_tag responsive image patterns and appropriate widths/sizes.
- Lazy-load below-the-fold media; do not lazy-load the primary above-the-fold hero/LCP image.
- Defer non-critical JavaScript, avoid duplicate libraries, and minimize layout shifts.
- Do not remove apps, pixels, analytics, or tracking without approval; identify their impact and ask first.

## Technical SEO
- Verify unique page titles and meta descriptions for important templates.
- Preserve canonical URLs, handle redirects carefully, and avoid accidental noindex directives.
- Use semantic headings and descriptive internal links.
- Validate product, organization, breadcrumb, and other structured data against actual page content; do not invent price, availability, ratings, or reviews.
- Check sitemap, robots directives, pagination, faceted navigation, duplicate content, and image alt text.
- Keep product handles stable unless a redirect is explicitly planned.

## Accessibility
- Use semantic HTML, accessible names, keyboard-operable controls, visible focus, and logical focus order.
- Check color contrast, form labels/errors, heading hierarchy, alt text, dialogs, menus, and cart announcements.
- Support reduced motion and avoid conveying state by color alone.
- Test keyboard-only navigation and screen-reader-relevant landmarks where tooling permits.

## Validation
- Compare before/after measurements under comparable conditions.
- Run Theme Check and automated audits when available, then perform manual checks.
- Report measurable results and tool limitations; never claim a Lighthouse score or ranking improvement without a real measurement.
