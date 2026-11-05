# V121 – Adaptive Dance Performance Controller

Existing V120 controller already adapts DPR and expensive animation evaluation cadence. V121 moves the performance-tier switching policy into a deterministic, unit-tested module. It uses 3 slow one-second windows to downgrade, 12 good windows to upgrade, and an 8-second cooldown. Clock elapsed is used rather than number of windows; invalid samples are ignored.

Run `npm run test:performance`, `npm run check:syntax` and `npm run verify` (full verification requires installed packages). No claim of increased Raspberry Pi FPS without a hardware benchmark.
