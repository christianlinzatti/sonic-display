# Sonic Display V375 – Adaptive Performance Director

Based on V374. No previous features intentionally removed.

## What's new

- **Off by default** to preserve existing formations; opt in under Settings > Avatar & Tanz > V375. Optional per-song stage casting for existing 2–4 dancers: solo (one visible), duo (two), group (all).
- Music section mapping: **verse** alternates between solo and duo across stable four-line lyric phrases (8-beat fallback), **hook/drop** highlights the group, **build** uses a duo, and **break** uses a solo.
- Phrases rotate the visual lead among loaded dancers; no voice isolation, singer attribution, or phoneme recognition is claimed.
- Dancer stage **group** roots smoothly scale in/out and re-center present performers. Existing clips/IK stay mounted; no animation mixer replacement.
- The **duo** lane also crossfades the available dancers in and out, without reloading models.
- Respects reduced motion, disabled mode, manual duo timelines, authored duo choreography, show formations, and per-song V326 group scripts.
- Settings > Avatar & Tanz: V375 mode (Off / Balanced / Dynamic) and strength. V373 Sync Inspector: V375 formation preview with adjustable section and dancer count.

## Limitations

- With only one loaded dancer, the cast stays solo. You must configure duo/group mode to see multiple performers; V375 never invents or downloads models.
- For V326 group mode, a nonempty per-song `trackId` indicates an authored stage score and suppresses V375's automatic re-blocking. Groups with a global cue set (`trackId` empty) may use V375 **only after explicitly enabling it**, which allows V375 to re-block that global formation.
- Section labels come from the preexisting stage music director. Lyrics phrase transitions require synchronized timestamps; with no line timestamps, a tempo-based 8-beat grid is used solely for blocking (not for lip-sync).
- Song sections and stage roles are heuristics, not measurements of actual human performers.
- Stage-root scaling avoids GLB remounts. It is not animation retargeting, physics-based collision avoidance, or audio-source analysis.

## Verification

Run `npm install` then `npm run test:v375` and `npm run verify` on a development machine. Offline syntax/regression tests are possible without npm dependencies when TypeScript is available globally, but a complete Next.js build remains unverified without dependencies.

## Checks completed in release workspace

- V375 functional and wiring regression test passed.
- Syntax parsing passed for 499 TypeScript/TSX files.
- 95 selected regression tests passed covering V287–V375 and duo/stage tests.
- Production `next build` not executed successfully in this container: no `package-lock.json` and 16/17 npm dependencies missing.
