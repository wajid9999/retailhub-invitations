# Inviteora template integration contract

Every template added under `site/new-templates/<template-id>/` is built into
`/templates/<template-id>.html` and registered in `templates.json` by the
GitHub Pages workflow. Keep this contract for every new template.

## Invitation payload

The editor's wedding adapter sends:

- `final`: boolean; false for a sample preview, true for a paid original.
- `C.groom` and `C.bride`: current values from the editor.
- `C.events`: the current event list in editor order.
- Each event has `name`, `hosts`, `date` (ISO `YYYY-MM-DD`), `time`,
  `timeText`, `venue`, `address`, `dress`, and `map`.
- `C.sample`: true for preview, false for final.
- `C.hosts` and `C.hostsTitle`: optional hosts block.

Templates must render values from the decoded payload, not demo/example dates,
names, venue strings, or a previous customer's data. Render every event from
`C.events`; do not assume there are exactly three events. Treat missing optional
fields as empty strings and escape user-provided text before inserting HTML.

## URL and rendering requirements

- Read the payload from the URL fragment after `#`. The fragment is base64 of
  UTF-8 JSON; decode UTF-8 correctly (not plain ASCII-only `atob`).
- Support both sample preview (`final:false`, `C.sample:true`) and final
  invitation (`final:true`, `C.sample:false`).
- Apply the payload before showing the invitation; do not briefly show static
  sample dates while the real payload is being parsed.
- Expose `document.documentElement.dataset.inviteoraPayload = "loaded"`
  only after names, all event dates/times, venue and address have been rendered.
  This is the browser-test readiness signal.
- The same template must work from the editor iframe, the standalone preview
  URL, and the final original-invitation URL.
- Never persist one customer's invitation payload inside the template file.

## Performance and media

- Keep the HTML shell small. Avoid embedding large video/image base64 strings in
  the HTML; use optimized media assets with dimensions, compression, and
  mobile-friendly formats.
- Add `preload` only for the first visible critical asset. Lazy-load later
  images/video and avoid autoplaying large media before a user gesture.
- Avoid loading duplicate fonts, scripts, or libraries. Test on a mid-range
  Android phone and a slower mobile connection.
- Report the template HTML and media sizes in the pull request. Investigate
  templates above 2 MB before adding them to the live gallery.

## Required review before publishing

1. Change the editor's sample dates and confirm the preview shows those exact
   dates, names, times and venues (not the template's demo values).
2. Add, remove and reorder events; verify the rendered card follows the editor.
3. Check the sample watermark is visible only in preview, never in final.
4. Open the standalone preview and final link, then verify expiry/validity.
5. Check mobile loading, console errors, and video/image behavior.
