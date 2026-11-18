#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
ZIP_PATH="$ROOT/retailhub-invitations.zip"
test -f "$ZIP_PATH"
rm -rf "$ROOT/extracted" "$ROOT/public"
mkdir -p "$ROOT/extracted" "$ROOT/public"
unzip -q "$ZIP_PATH" -d "$ROOT/extracted"
test -f "$ROOT/extracted/site/index.html"
cp -R "$ROOT/extracted/site/." "$ROOT/public/"
if [ -f "$ROOT/site/index.html" ]; then cp "$ROOT/site/index.html" "$ROOT/public/index.html"; fi
if [ -f "$ROOT/site/admin.html" ]; then cp "$ROOT/site/admin.html" "$ROOT/public/admin.html"; fi
if [ -f "$ROOT/site/templates/velvet-curtain/index.html" ]; then
  mkdir -p "$ROOT/public/templates/velvet-curtain"
  cp "$ROOT/site/templates/velvet-curtain/index.html" "$ROOT/public/templates/velvet-curtain/index.html"
fi
python3 - <<'PY'
import base64, json, re, shutil
from pathlib import Path

source = Path("site/new-templates")
public = Path("public")
registry = public / "templates.json"
if not registry.is_file():
    raise SystemExit("Base invitation package is missing public/templates.json")
data = json.loads(registry.read_text(encoding="utf-8"))
items = data.setdefault("templates", [])
known = {str(x.get("id")) for x in items}

if source.exists():
    for folder in sorted(p for p in source.iterdir() if p.is_dir()):
        meta_path, html_path = folder / "template.json", folder / "template.html"
        if not meta_path.is_file() or not html_path.is_file():
            raise SystemExit(f"Incomplete template package: {folder}")
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        template_id = str(meta.get("id", "")).strip()
        if not template_id or template_id in known:
            raise SystemExit(f"Missing or duplicate template id: {template_id}")
        thumbs = [folder / ("thumbnail" + ext) for ext in (".svg", ".png", ".jpg", ".webp")]
        thumb_src = next((p for p in thumbs if p.is_file()), None)
        if thumb_src is None:
            raise SystemExit(f"Missing thumbnail in {folder}")
        html_rel = f"templates/{template_id}.html"
        thumb_rel = f"thumbs/{template_id}{thumb_src.suffix.lower()}"
        (public / "templates").mkdir(parents=True, exist_ok=True)
        (public / "thumbs").mkdir(parents=True, exist_ok=True)
        html_text = html_path.read_text(encoding="utf-8")
        asset_dir = public / "templates" / template_id / "media"
        asset_dir.mkdir(parents=True, exist_ok=True)
        counts = {}
        def externalize(match):
            mime, encoded = match.group(1), match.group(2)
            ext = "mp4" if mime == "video/mp4" else ("png" if mime == "image/png" else "jpg")
            counts[ext] = counts.get(ext, 0) + 1
            filename = f"asset-{counts[ext]:02d}.{ext}"
            (asset_dir / filename).write_bytes(base64.b64decode(encoded))
            return f"{template_id}/media/{filename}"
        html_text = re.sub(r"data:(image/jpeg|image/png|video/mp4);base64,([A-Za-z0-9+/=]+)", externalize, html_text)
        supplied = folder / "media"
        if supplied.is_dir():
            shutil.copytree(supplied, asset_dir, dirs_exist_ok=True)
        (public / html_rel).write_text(html_text, encoding="utf-8")
        shutil.copy2(thumb_src, public / thumb_rel)
        record = dict(meta)
        record["file"], record["thumb"] = html_rel, thumb_rel
        items.append(record)
        known.add(template_id)

velvet = {
    "id":"velvet-curtain",
    "name":"Velvet Curtain — High Premium Video Invitation",
    "tag":"Animated velvet curtains and cinematic wedding reveal",
    "tier":"high","occasion":"wedding","ad":"velvet","fam":True,
    "file":"templates/velvet-curtain/index.html",
    "thumb":"https://cdn.shopify.com/s/files/1/1021/1550/8503/files/velvet-curtain-thumbnail.jpg?v=1794508817"
}
existing = next((x for x in items if x.get("id") == "velvet-curtain"), None)
if existing is None: items.append(velvet)
else: existing.update(velvet)

registry.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Vercel static build registered:", [x.get("id") for x in items])
PY
test -f "$ROOT/public/templates.json"
