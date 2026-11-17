# Inviteora — New Template / Post: Start Here

Use this as the single operating procedure for every new invitation template. Do not restart discovery or ask the owner to repeat decisions already recorded here.

## Owner's one-line trigger
When the owner says **"Inviteora کی نئی پوسٹ اس طریقۂ کار کے مطابق لگائیں"** (or shares this file), start this workflow. Ask only for missing template files or genuinely blocking decisions.

## Fixed project settings
- Repository: `wajid9999/retailhub-invitations`
- Current working branch for the VIP preview work: `inviteora/vip-royal-wedding-integration`
- Branded preview domain: `https://inviteora-preview.vercel.app/`
- Public gallery: `https://inviteora-preview.vercel.app/`
- Customer-facing URLs must use the branded domain, never a Vercel deployment URL containing an account username.
- Brand: Inviteora; Royal Navy Blue + Gold; Pakistani wedding context.
- Currency display: PKR as `Rs.`.
- Do not publish to Production or change Shopify products/metafields unless the owner explicitly approves.

## Mandatory source-of-truth docs
Before changing template integration, read the current branch versions of:
1. `site/TEMPLATE-ADDING.md`
2. `site/TEMPLATE-CONTRACT.md`
3. `site/vercel.json`
4. `site/templates.json`
5. Relevant template source and existing tests.

These docs define the payload contract, folder structure, build behavior and current routing. If they conflict with this runbook or repository state, stop and report the conflict; do not guess.

## Standard new-template workflow
1. Inspect supplied HTML, media, thumbnail and metadata. Confirm unique ID and tier/occasion.
2. Follow `site/TEMPLATE-ADDING.md`: normally create `site/new-templates/<unique-id>/` containing `template.json`, `template.html`, and a finished `thumbnail.svg/png/jpg/webp`.
3. Follow `site/TEMPLATE-CONTRACT.md`: UTF-8 JSON base64 URL-fragment payload; render current editor values and every event; sample/final watermark behavior; no customer data defaults or localStorage; no separate editor/pencil.
4. Preserve the existing gallery catalog. Add the new template without deleting or replacing existing entries. Never replace `templates.json` with a one-template list except for an explicitly isolated test preview approved by the owner.
5. Check media paths, file sizes, mobile video format (prefer H.264/AAC MP4), poster/thumbnail and relative URLs.
6. Add/update Playwright tests for gallery editor route, preview payload, event add/remove/reorder, final watermark removal, media and no second editor where the project test setup supports them.
7. Deploy to Preview only. Confirm deployment READY, then verify branded-domain gallery, template route, thumbnail and media URLs. Test real browser rendering on mobile; a fetch/HTTP success alone is not proof of playback or visual correctness.
8. Give the owner the branded Preview URL and concise PASS / NOT VERIFIED list. Do not call an untested item PASS.
9. Only after owner review and explicit approval, update Shopify: find the existing product first (avoid duplicates), update the intended preview/editor metafields and product media/status/channel as required by the current Shopify setup. Never invent product IDs or metafield definitions.
10. Keep Production unchanged until explicit approval.

## Current VIP preview exception — do not mistake it for the standard pipeline
- The current VIP work is on `inviteora/vip-royal-wedding-integration`.
- Its isolated Vercel Preview uses `site/vercel.json` rewrites to serve `/templates/vip-royal-wedding.html` from `/new-templates/vip-royal-wedding/template.html`.
- The current `site/templates.json` on this branch is intentionally a one-template VIP-only test gallery. It is NOT the full catalog.
- Before merging or using this branch as the full gallery, reconcile the complete existing template catalog and confirm all legacy template routes/media exist. Do not blindly copy the isolated registry into the main branch.
- The branded alias `inviteora-preview.vercel.app` must remain assigned to the latest approved Preview deployment. Verify its target after each deployment.

## Required completion report
Always report:
- Branch and commit SHA
- Preview deployment state and branded URL
- Gallery/template/thumbnail/media checks
- Payload, sample watermark and final watermark checks
- Mobile/video/browser checks, explicitly marking anything not verified
- Whether Shopify/Production were changed (default: No)

## Efficiency rules
- Reuse the fixed settings and source docs; do not ask for them again.
- Inspect current repository state before editing; never assume old SHAs or paths remain valid.
- Make the smallest safe change, preserve unrelated files/catalog entries, and avoid duplicate commits/deployments.
- Do not re-run completed checks unless source code, deployment, or relevant configuration changed.
- If blocked by a tool/service limitation, state the exact blocked check and continue with independent work.
