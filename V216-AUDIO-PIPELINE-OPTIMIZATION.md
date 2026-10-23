# V216 – Audio Pipeline Optimization

Built on V215 without removing existing Spotify, lyrics, dance, multi-avatar or motion-installation features.

- The existing `AudioAnalysisProvider` remains the single microphone source for all consumers, including multiple avatars. No extra microphone streams or parallel analyzers are created.
- Six fixed frequency-band ranges are calculated once per AudioContext capture session instead of recalculating FFT bin boundaries in every requestAnimationFrame tick.
- At most one rhythm-worker snapshot can be outstanding at any time.
- If the worker fails to respond for 1.5 seconds, the capture loop terminates it, clears its pending state and stale advanced features, and continues with the existing local beat/rhythm fallback. Worker onerror uses the same cleanup semantics.
- Added regression coverage (`npm run test:audio-pipeline-v216`).

This change reduces repeated work and addresses indefinitely stalled workers; real-world FPS and latency gains are **not benchmarked**. For full verification with dependencies installed: `npm install && npm run verify`.
