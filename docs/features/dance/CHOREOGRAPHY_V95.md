# V95 Choreography Editor

In Settings → Avatar & Tanz → Dance Studio → Animation Timeline select existing V94 loops, add them to a sequence, reorder with ↑/↓, choose a crossfade and optional approximate BPM beat-aligned transition. Save a choreography, select it and click **Live abspielen**. Choreographies are browser-local under `sonic-display-choreographies-v95`, scoped to one avatar and its animation source. The original GLB is not modified.

Transitions are handled by Three.js AnimationAction fadeIn/fadeOut, with approximate beat alignment based on the currently available BPM. It does not detect a musical bar or actual transient. At the end, either repeat the whole sequence or hold the final pose. The preview timeline continues to preview a single clip; full sequence playback is on the live avatar stage. Imported clips still require compatible bone tracks / retargeting. No Vercel Blob synchronization is enabled.
