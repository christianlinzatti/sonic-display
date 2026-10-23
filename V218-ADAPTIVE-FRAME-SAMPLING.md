# V218 – Adaptive Frame Sampling & GPU Quality Stability

Built from the complete V217 project. Adaptive DPR, existing tier hysteresis and graphics detail policies remain enabled.

- One shared 1-second sample window for both render diagnostics and the adaptive quality policy.
- Removes the duplicate per-frame duration array and duplicate percentile sort.
- Filters invalid/paused-tab delta values (>= 250ms), protecting quality decisions from suspended frames.
- Keeps manual high/balanced/low modes and existing GPU DPR limits unchanged.
- No claim of benchmarked FPS improvement or additional GPU draw-call reduction.

Run `npm run verify:offline` and, once dependencies are installed, `npm run verify`.
