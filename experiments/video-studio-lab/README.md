# Inviteora Video Lab — Test 01

This is an isolated draft experiment on the `video-studio-lab` branch. It does not modify the live invitation templates or the VIP project.

## Test
- Format: vertical 9:16 (720 × 1280)
- Style: simple cinematic product promo (coffee concept; not a wedding invitation)
- Motion: slow camera push-in on a designed HTML/CSS frame
- Audio: not included
- Output: an 8-second MP4 prototype was rendered and checked locally

## Rendering status
The first HTML page is saved at `test-01/index.html`. A local MP4 prototype was produced using an HTML-to-PDF fallback renderer (WeasyPrint) and FFmpeg. This confirms the visual can be exported as a playable vertical MP4, but it does **not** yet validate the upstream `nexu-io/html-video` / Hyperframes Chromium rendering pipeline. The current execution environment blocked browser navigation, so the official renderer still needs a separate environment test.

## Next checks
1. Run the official html-video install (Node.js 20+, pnpm 9+, Chromium and FFmpeg) in a suitable local/cloud development environment.
2. Compare its MP4 output and timing with this fallback prototype.
3. Add audio only after confirming the visual pipeline.
4. Try other visual families (cinematic, 3D, motion graphics, luxury wedding) as separate drafts.

## Safety / publishing
Keep this branch as a draft. Do not merge it into `main` or add it to the live gallery until reviewed.
