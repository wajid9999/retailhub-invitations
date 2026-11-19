# Royal Mughal Palace VIP — staging source

This folder is intentionally outside `site/new-templates`, so it is not listed or deployed while the media package is incomplete.

- Four MP4 scenes: Palace Opening, Mehndi, Baraat Arrival, Walima.
- Source HTML: `template.html`; editor adapter: `vipRoyalPalace`.
- The template uses direct MP4 streaming. Paths such as `vip-royal-mughal-palace/media/Royal-Mehndi.mp4` resolve relative to `/templates/vip-royal-mughal-palace.html`; the gallery builder copies `media/` to `/templates/vip-royal-mughal-palace/media/`.
- The release ZIP must be extracted into `site/new-templates/vip-royal-mughal-palace/` before the template is added to the catalog.
- Preview-only; do not publish to production until mobile playback, editor mapping, SAMPLE watermark, and ordering flow pass.
