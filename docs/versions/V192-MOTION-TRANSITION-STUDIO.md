# V192 – Motion Transition Studio

In **Settings → Avatar → Character & Motion Library**, select a character with two installed GLB motions and use the new **Motion Transition Studio**.

- Select Motion A and B from that character's installed library.
- Preview both animations on one cloned character rig, retargeted to the same mixer.
- Test a true `AnimationAction.crossFadeTo` over a configured duration (0.1–4s).
- Optionally defer the preview action to the next simulated bar boundary using BPM, beats/bar and offset.
- Save a per-avatar local browser transition profile.
- Errors when loading either GLB do not take the full UI down; one clip will remain available.

**Limits:** Beat synchronization is a standalone local clock simulation, not real detected music beat timestamps. Saved transition settings currently only affect the studio preview, not Live Stage behavior. The source motions must expose retargetable animation tracks. Settings reside in localStorage, not a backend database. This is not a production-tested build.

Checks: `npm run test:motion-transition-studio`, `npm run check:syntax`, `npm run build:preflight`, `npm run typecheck` and `npm run build` when dependencies are installed.
