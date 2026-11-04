# V140 – Multi-Avatar Dance Studio

Modes: solo, sync, mirror, duet. Independent GLB animation instances, selectable second avatar and second dance preset, scene camera framing. Existing single-avatar behavior remains default.

Run `npm run verify:offline`, `npm run typecheck`, `npm run build` after `npm install`.

Limitations: Both avatars share the same audio and global choreography stores; sync is based on common transport, not sample-accurate mixer phase locking. Duet uses different presets/variation but does not automatically alternate solo sections. Actual GLB appearance and WebGL performance need local verification.
