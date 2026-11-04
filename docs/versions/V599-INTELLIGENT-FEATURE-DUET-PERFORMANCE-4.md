# V599 – Intelligent Feature & Duet Performance 4.0

**Base:** V598, 26.10.2026. **Status:** implemented, isolated tests; visual approval with genuine GLB rigs still required.

## Scope

`components/visualizer/featureDuetPerformanceV599.ts` adds a *bounded, deterministic upper-body refinement* to the already deployed `V500 → V575 → V584 → V585` feature/duet stage planner. The final chain is `V500 → V575 → V584 → V585 → V599`. The V500 planner is called by **both** the existing two-performer `DanceFormationActorsV492.tsx` and the 3/4-performer `GroupDancersV326SceneV492.tsx`.

- **Explicit handoffs:** outgoing rapper briefly acknowledges the new assigned lead; the incoming rapper receives a slightly different arm/shoulder accent. V416's in-line call-and-response is placed at the *known 62% editorial response threshold*, not at the beginning of that lyric line. For V496 authored timestamp segments the recorded segment boundary is used directly.
- **Duet:** a pair of explicitly assigned singers uses alternating restrained accents and lightly increases an **already existing** directional glance. If there is no existing partner look, no new glance is synthesized. Other performers react with smaller staggered accents.
- **Hook:** where a valid author-assigned full-cast hook is active, performers share an audience-facing moment with subtly varied arm asymmetry. No face is turned away from the audience and no simultaneous vocal assignment is invented.
- **Solo:** support avatars can make sparse, subtle acknowledgment gestures. The singer retains the same audience-facing look and assigned role.

## Safety and ownership

- **Track isolation:** `trackId === cueTrackId` and valid active cue boundaries are required. The V416/V496 editor/casting is the sole owner of singing slots, line timing, and handoff decisions. Neither lyrics text nor raw audio is used to infer a singer.
- **Manual overrides:** `manualPriority`, authored show formations and manual choreography already gate V500 and therefore V599. Reduced motion, paused playback, zero strength or `low` tier return unchanged.
- **Rig/animation:** the only changed fields are an existing `LookAtCue.weight` and the existing `PartnerGestureCue` `leftLift`, `rightLift`, `shoulder`, and `intensity`. Never rewrite vocal roles, facial morphs, mouth controls, GLB actions, bone transforms, stage-root positions, IK/foot locks, camera poses, or the saved animation library. Limits remain V452/V500-compatible (`look.weight ≤ 0.46`, `gesture.intensity ≤ 0.28`, `arms ≤ 0.13`, `shoulder ≤ 0.065`).
- **Performance:** pure time-indexed evaluation, no React hook, new render loop, WebGL object, timer, fetch, local storage, microphone, AI provider, or new dependency. Distances use already calculated stage positions; avatars must be at least 0.85m and no more than 6m apart for close partner accents.
- **Diagnostics:** `featureDuetEvidenceV599` exposes an explainable *read-only* `active / protected / invalid` decision and the **authored** participating slots. No audio speaker-recognition claim.

## Verification

```sh
npm run test:v599
npm run test:v599:types
npm run test:smoke:v599
npm run verify:v599
```

`tests/v599-feature-duet-performance-regression.cjs` exercises authored solo/reply/duet/hook casts, V416 reply threshold, V496 timestamp segment, 2/3/4 avatars, per-slot alternation, invalid/malformed/foreign track and manual priorities, amplitude bounds, pure replay/seek determinism, and 100,000 deterministic song-time samples.

**Not verified in this execution environment:** a full dependency-backed Next.js build, browser screenshot review with real user's GLB rigs, live synchronized Spotify track, or Raspberry Pi frame times. Offline test passes do **not** establish natural-looking real-time motion or truly recognize feature vocalists.
