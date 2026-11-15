---
name: shopify-theme-development
description: Develop, customize, debug, and safely release Shopify Online Store 2.0 themes using Liquid, JSON templates, sections, blocks, snippets, CSS, JavaScript, and Shopify CLI. Use for theme edits, new sections, product/collection pages, navigation, cart, responsive layout, and theme editor settings.
---

# Shopify Theme Development

## First inspect
- Identify the exact store, theme, theme ID, unpublished/live status, theme version, and repository before editing.
- Pull or inspect the current theme files. Never assume a theme is Dawn or that a section/schema matches an example.
- Read existing conventions, assets, settings schema, JSON templates, locales, and app embeds.
- Preserve existing theme behavior and merchant customizations unless the user explicitly requests a change.

## Architecture
- Prefer Online Store 2.0 JSON templates and reusable sections/blocks.
- Keep Liquid presentation in sections/snippets; keep global settings in config/settings_schema.json.
- Make merchant-editable content configurable with schema settings, blocks, presets, and sensible defaults.
- Respect Shopify's section/block limits and schema validation.
- Use Shopify filters and objects correctly; escape merchant/customer text and avoid unsafe output.
- Avoid deprecated filters/APIs in new code; verify current Shopify docs when API behavior matters.

## Implementation
- Make the smallest coherent change. Avoid replacing entire theme files for a localized request.
- Scope CSS to the section/component to prevent regressions.
- Namespace JavaScript, avoid global pollution, support section re-rendering in the theme editor, and clean up event listeners.
- Prefer progressive enhancement and native browser features over unnecessary dependencies.
- Preserve app blocks and dynamic sources where relevant.
- Keep translations in locale files rather than hard-coding visible strings.

## Safety and release
- Work on a duplicate/unpublished development theme first.
- Never publish, overwrite the live theme, delete a theme, or change payment/checkout settings without explicit user approval.
- Back up or capture the original file before modifying high-impact files.
- Do not expose tokens, customer information, or private store data in commits or logs.
- Distinguish code committed, theme uploaded, preview tested, and theme published; these are separate states.

## Validation
- Run Shopify Theme Check when available.
- Validate Liquid syntax, JSON templates, schema, settings, translations, and asset references.
- Test home, collection, product, search, cart, navigation, and any changed page.
- Check mobile and desktop, keyboard navigation, console/network errors, and theme editor behavior.
- Report exact files changed, theme target, tests performed, failures, and untested items.
