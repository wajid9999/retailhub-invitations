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
