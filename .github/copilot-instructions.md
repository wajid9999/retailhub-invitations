# Inviteora repository instructions

- Read and follow the relevant skill in `.github/skills/` before editing invitation templates or releasing site changes.
- New invitation designs must get a new unique folder and filename. Never overwrite or repurpose a live template unless explicitly asked.
- Inspect the gallery/catalog structure before adding a template; do not assume paths or JSON schemas.
- Use verified raw GitHub URLs for media embedded in HTML, not `/blob/` URLs.
- Preserve existing Shopify-facing URLs, preview/edit links, template IDs, and customer assets unless explicitly authorized to change them.
- Validate HTML, JavaScript, JSON, relative asset paths, and responsive behavior. Report exactly what was tested and what remains unverified.
- Do not state that a file was uploaded, committed, or deployed unless the GitHub action or deployment status confirms it.


## Shopify workflow instructions
- For Shopify-related requests, start with `.github/skills/shopify-workflow-orchestrator/SKILL.md` and read the specialist skills it routes to.
- Use the Shopify skills for theme development, storefront design, product/collection optimization, performance/SEO/accessibility, QA, and store operations.
- For Retail Hub-Store, preserve navy-blue/gold styling, mobile-first behavior, PKR "Rs." formatting, COD-only messaging, and Mobile Accessories taxonomy unless the owner explicitly changes them.
- Keep Retail Hub-Store separate from Inviteora branding and invitation workflows.
- Work on an unpublished/duplicate theme first. Never publish a live theme or change payment/shipping settings without explicit approval.
- Before bulk product/catalog changes, preview the proposed mapping, preserve rollback data, and verify a small batch.
