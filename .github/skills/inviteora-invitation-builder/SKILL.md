---
name: inviteora-invitation-builder
description: Build and maintain Inviteora's standalone wedding and event invitation templates, including responsive HTML/CSS/JS, media, event details, previews, and edit flows. Use when adding or changing an invitation template.
---

# Inviteora Invitation Builder

## Project context
- This repository hosts Inviteora invitation templates and a static website.
- Existing templates are production assets. Treat every existing template, preview URL, edit URL, JSON catalog entry, and thumbnail as in-use unless the user explicitly authorizes a change.
- Keep each new invitation independent: use a new descriptive folder and filename; do not overwrite another design or reuse its ID.
- Reuse the repository's existing folder/catalog conventions only after inspecting the relevant files on the target branch.

## Workflow
1. Inspect the target branch and the current gallery/catalog loader before editing.
2. Identify the exact template folder, HTML entry point, preview/edit integration, thumbnail convention, and any shared scripts/styles it depends on.
3. For a new design, create a new uniquely named folder and files. Do not edit an existing template as a shortcut.
4. Keep HTML, CSS, and JavaScript self-contained unless the repository already uses shared assets.
5. Use relative paths for local assets where possible. For hosted video, use the verified raw media URL, not a GitHub `/blob/` page URL.
6. Use semantic HTML, accessible labels, keyboard-operable controls, responsive layouts, and respect reduced-motion preferences.
7. Optimize video: MP4/H.264 with a poster, `preload="metadata"`, controls, `playsinline`, and no forced autoplay with sound.
8. Escape user-provided text before inserting it into HTML. Avoid unsafe `innerHTML` for names or event data.
9. Keep event dates, times, map URLs, calendar data, and displayed details consistent. Calendar exports must use valid UTC or explicit timezone handling and escaped ICS text.
10. Test mobile and desktop layouts, media loading, links, console errors, and every interactive control before reporting completion.

## Safety and change control
- Never delete, rename, or overwrite existing template files, catalog entries, or media without explicit instruction.
- Do not claim an upload, deployment, preview, or browser test succeeded unless the tool confirms it.
- Do not add third-party scripts, analytics, fonts, or trackers without a clear need.
- Keep customer/private event data out of committed examples; use clearly marked sample data.

## Completion report
Report the exact files changed, the new preview path, what was tested, what could not be tested, and any remaining manual step.
