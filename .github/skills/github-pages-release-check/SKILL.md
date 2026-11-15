---
name: github-pages-release-check
description: Safely prepare and verify changes to Inviteora's GitHub Pages site, repository assets, template catalog, and media links before release.
---

# GitHub Pages Release Check

## Before changing files
1. Confirm the repository and target branch.
2. Inspect the current directory structure, gallery loader, template catalog, and any existing automation.
3. Check whether the requested path already exists. Fetch the current content before any update.
4. Prefer a new file or isolated folder for a new template. Do not modify production files unnecessarily.

## Media checks
- Confirm the media file exists in the repository and note its exact path and case.
- Use the raw.githubusercontent.com URL for HTML media sources; verify that the URL resolves to the actual media, not an HTML page.
- Check file size and supported encoding. For video, prefer MP4/H.264 and a reasonable mobile-friendly size.
- Do not claim a binary upload happened when only a text file or folder placeholder was committed.

## Site and catalog checks
- Validate JSON syntax and ensure IDs are unique.
- Confirm all referenced HTML, thumbnail, video, and preview paths exist.
- Check relative paths from the actual deployed page location.
- Preserve existing IDs and URLs unless a change was explicitly requested.
- Verify GitHub Pages deployment status before claiming the site is live.

## Test checklist
- HTML parses without structural errors.
- JavaScript parses and interactive controls work.
- Mobile and desktop viewport behavior is checked.
- Video loads and plays with controls.
- Internal links, map links, and calendar downloads are checked.
- No unrelated production files changed.

## Reporting
Give the commit or changed-file links, distinguish committed from deployed, and clearly list tests not performed. Never invent successful checks or deployment status.
