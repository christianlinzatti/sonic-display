# V191 – Seamless Motion Transitions & Smart Dance Integration

- Up to 24 installed motion GLBs per selected character preloaded asynchronously into the **same mounted avatar rig**.
- Retarget loaded GLB clips to cloned rig and expose each clip as a named action on existing mixer.
- Existing `planDanceTransition` crossfades library clips, rather than mounting a new avatar component on each change.
- Automatic picks use genre, BPM and kick energy (drop/verse). Update events refresh cached library.
- Failure isolation using `Promise.allSettled`; corrupt GLBs do not prevent other motions loading.
- Manual animation fallback and old character/motion installers remain present.

## Limits

The motion engine still uses rule-based, not beat-perfect musical classification. Only first clip of each installed GLB is automatically chosen. Preloading is limited to 24 motions per actor, and requires GPU/memory budget on mobile/Raspberry Pi. Automatic switching depends on song/audio updates and crossfade rules. Crossfade and retarget results still require interactive runtime verification.
