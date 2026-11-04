# V161 — Audio Worker & Render Stability

- Worker handles expensive onset tempo estimation, phase, kick-pattern and rhythm learning.
- Microphone AudioContext and spectrum sampling stay on the main thread; messages are bounded to one pending snapshot plus onset events.
- Feature switch: localStorage `sonic-display:audio-worker` = `off` disables workers; unsupported browsers automatically use V160 synchronous flow.
- IK runs in existing React Three Fiber useFrame after rig motion, partner interaction and before rendering; no second RAF loop.
- WebGL context loss triggers an overlay and listens for restoration; component errors trigger a 2D placeholder with retry.
- A true 2D lyric renderer and automatic GPU quality downgrade are future work.
- `npm run verify:offline` checks source structure and syntax; `npm run build` requires installed dependencies.
