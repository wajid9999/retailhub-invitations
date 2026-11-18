# Adding the next invitation template

The gallery build now supports a self-contained template package. For each new design, add one folder:

`site/new-templates/<unique-id>/`

It must contain:

- `template.json`
- `template.html`
- One thumbnail named `thumbnail.svg`, `thumbnail.png`, `thumbnail.jpg`, or `thumbnail.webp`

Example `template.json`:

```json
{
  "id": "your-unique-id",
  "name": "Your Template Display Name",
  "tag": "Short gallery description",
  "tier": "premium",
  "occasion": "wedding",
  "ad": "std",
  "fam": false
}
```

Use only an unused ID. The build copies the HTML and thumbnail into the public site, creates their paths in `templates.json`, checks duplicate IDs and paths, and makes the template appear in the gallery. No edits to the gallery page, main ZIP, or deployment workflow are needed for each new template.

The HTML must follow the invitation editor payload contract used by the existing templates and support its required preview/final modes. The thumbnail should be a finished gallery preview image, not a placeholder.

Current template tier labels are preserved as source metadata until the owner reviews and assigns final categories.


## Media and editor checklist for every new template

- Do not add a second customer editor or a floating pencil/edit icon inside a card. The Inviteora gallery owns the customer editor; a template only renders the payload it receives.
- Use the URL-fragment payload contract in `TEMPLATE-CONTRACT.md`. Never read customer data from `localStorage` or ship a customer's names, dates, venues, or event list as defaults.
- Keep the first HTML paint hidden until the UTF-8 payload is decoded, validated, and rendered. Set `document.documentElement.dataset.inviteoraPayload = "loaded"` only after all event details are ready.
- Video and poster data may be supplied as data URIs in the source package; the Pages build extracts them into separate cacheable media files. Prefer optimized mobile MP4 (H.264/AAC) and compressed poster images.
- Add a Playwright test covering the gallery editor route, preview payload, final watermark removal, all event fields, and absence of a second pencil editor.
- For the High Premier tier, price is Rs. 3,000 for the first event plus Rs. 1,000 for each additional event. Do not change this formula in a template.
