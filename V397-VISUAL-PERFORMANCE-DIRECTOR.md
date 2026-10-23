# Sonic Display V397 – Visual Performance Director

Opt-in visual camera editor for the **existing** React Three Fiber canvas. No extra canvas, shadows, GPU passes, or downloaded models.

## Features

- `VisualPerformanceDirectorV397` chooses **lead close-up** only with real time-aligned lyrics, **two-shot** only with timed and explicitly modeled hand-off (V376/V385), and **group shot** after a stable hook/drop section.
- V385 manual, per-track stage casting gets priority for the depicted stage role; this is not human voice separation or speaker recognition.
- V377's visible stage slot anchors and established camera composer are reused. Unknown or hidden characters never receive fabricated close-ups. A single procedural/GLB avatar may use the main stage root as a fallback visual anchor.
- A 280-ms section debounce, 450–1,150-ms shot holds, and resets for a new song/seek avoid erratic cutting.
- User-defined camera editing, named presets, authored formations, show timelines, selected V377 duet shots, reduced motion and pause suppress the extra shot.
- Camera easing, lyrics safe zones, and downstream V387/V394 festival effects retain their existing precedence. No direct changes to avatar bones, foot IK, lip sync, stage formation, or timing.
- Two intensity modes and a strength slider, default `off`. Lower hardware performance tiers reduce the extra camera movement.

## Activation

Settings → Avatar tuning → **V397 · Visual Performance Director**. Select *Dezent* or *Musikvideo* and set strength. Keep synced lyrics enabled for verse close-ups. For dialogue shots use the existing manual vocal assignments or duet interactions.

## Verification / limitations

Dedicated `npm run test:v397` covers lyric timing, hold behavior, song/seek resets, manual priority, explicit casting, bounded strength, missing anchors, and lyric protection. Offline syntax/regression suite: `npm run verify:offline`.

A full TypeScript check, Next.js production build and real screen frame rate verification depend on installing npm dependencies on a machine with network access: `npm install` then `npm run verify`.
