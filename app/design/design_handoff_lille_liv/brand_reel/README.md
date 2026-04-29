# Lille Liv — Mobile Hero Reel

A 16-second 9:16 HyperFrames composition that walks through the Lille Liv user journey on mobile: morning greeting → discover feed → venue detail → journal capture → timeline → grandma's reaction → CTA.

Drafted in Claude Design. Render and refine locally.

## Requirements

- **Node.js 22+** — [nodejs.org](https://nodejs.org/)
- **FFmpeg** — `brew install ffmpeg` (macOS) or `sudo apt install ffmpeg` (Debian/Ubuntu) or [ffmpeg.org/download](https://ffmpeg.org/download.html) (Windows)

Verify: `npx hyperframes doctor`

## Preview

```bash
npx hyperframes preview
```

Opens the HyperFrames Studio at `http://localhost:3002` with frame-accurate scrubbing.

## Refine with Claude Code

```bash
npx skills add heygen-com/hyperframes   # install HyperFrames skills (one-time)
npx hyperframes lint                     # verify structure (should pass clean)
npx hyperframes preview                  # open the studio for live feedback
```

Open the project in Claude Code and try prompts like:

- "Tighten scene 2 — the venue cards feel slow"
- "Add a confetti or sparkle on the saved-toast in scene 4"
- "Make the timeline node pulse stronger in scene 5"
- "Try a `cross-warp-morph` instead of `light-leak` for the CTA transition"
- "Scene 6's notification could bounce in more — back.out(1.8)?"

## Render

```bash
npx hyperframes render index.html -o lille-liv-reel.mp4
```

1080x1920 / 30fps. Use `--fps 60` for smoother motion or `--resolution 1080x1920 --bitrate 8M` for a higher-quality export.

## Composition

| Scene | Time      | Beat                                        | Notes |
| ----- | --------- | ------------------------------------------- | ----- |
| 1     | 0–2.0s    | App opens · "God morgen, Maja"              | Logo float, italic accent on name |
| 2     | 2.0–4.5s  | Discover feed reveals · weather + venues    | Counter on temp, sun pulse, card stagger, tap ripple |
| 3     | 4.5–7.0s  | Plantebørnehaven detail                     | Ken Burns on hero photo, save-button pulse |
| 4     | 7.0–9.5s  | Journal capture · "Første smil til en blomst" | Photo zoom, saved-toast bounce |
| 5     | 9.5–11.5s | Astas timeline · the new moment slots in   | Timeline draws, node pulses on the new entry |
| 6     | 11.5–13.5s| Mormor sender et hjerte                     | Notification drops in + reaction stagger |
| 7     | 13.5–16.0s| CTA — "Find steder. Gem øjeblikkene. Sammen." | **Shader: `light-leak`** at 13.25s |

One shader transition at the CTA reveal; all other cuts are hard cuts (the professional default).
