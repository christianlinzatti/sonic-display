# Sonic Display V252 — Intelligent Avatar Workload Balancing

On the V251 CPU profiler, a conservative per-avatar CPU budget is applied to **secondary, cached choreography computations** when more than one active avatar is sampled. Animation mixing, beat transport, pose updates and IK continue at frame cadence. Pressure thresholds: 12 ms aggregate mean callback time or 10 ms P95 for any sampled avatar; 30 samples per avatar minimum; 1-second evaluation, 4-second quality recovery delay. Heavy performers receive a one-step reduction (high → balanced, balanced → low), lighter dancers remain unaffected. No user configuration required. The algorithm does not modify original avatar assets or animation data.

Limitation: CPU samples represent only the primary measured `useFrame` callback and do not account for GPU bottlenecks. Full Next.js production build must be verified in an npm-installed environment.
