# V227 – Intelligent Scene Performance Optimizer

V227 extends V226 with a second, targeted before/after benchmark for scene effects actually present in the WebGL stage. Options include disabling pulsing floor glow, hiding floor rings, and turning down auxiliary stage lighting and beam sweeping. No shadow or particles benchmarking is claimed: the stage currently has no such shadow-map or particle pipeline.

- Two actual, time-separated render-diagnostics measurements with a 1.5-second warm-up and at least two samples per stage.
- Automatic rollback after completion, cancellation, stale metrics or component unmount.
- Applying the tested setting requires an explicit user click, remains session-scoped, and can be undone with 'Volle Szene wiederherstellen'.
- Beat timing and avatar pose/IK code remain untouched.
- Measurements are indicative, not causal proof. Keep avatar count, music passage and camera consistent and repeat the test.

Run `npm run test:v227` or `npm run verify:offline` for the static regression suite. Full Next.js compilation requires local dependencies.
