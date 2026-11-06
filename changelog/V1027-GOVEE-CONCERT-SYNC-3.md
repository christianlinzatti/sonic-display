# V1027 – Govee Concert Sync 3.0

- Opt-in four-zone role mapping (wall/rhythm/neon/ambient) to up to four selected private-LAN devices; no duplicate IP assignments.
- Live Govee role-sync overlay in **existing** `GoveeMusicSyncV909` dispatch, never a separate network/UDP timer, never power commands or RGBIC segment writes.
- **Only verified V318 section labels** drive the new overlay; no inferred drops or beats; V921 verified stage camera may reduce neon saturation for close-ups.
- Slow capped color/brightness changes; output never exceeds V915 group caps, V909 master brightness, or V961 final governor.
- V927 visual offset and optional V1027 manually measured offset use the **maximum** capped at 350 ms, never add up; status roundtrip is not optical latency.
- Strict default disabled; requires existing Govee enabled + autoSync + V911 director; selected devices and valid mapping. Saved shows, authored stages, lyrics, voice, reduced motion, recovery and hidden/pause disable overlay.
- Manual pause button disables the entire V909 autoSync until the user turns it back on. Explicit Govee manual commands retain the existing manual priority.
- Regression and strict isolated TypeScript guards, preflight, Vercel and GitHub production gates.

The four-zone UI may show simulated sections in future, but V1027 does not introduce a simulation path to hardware. No optical latency can be inferred from UDP/HTTP status. Runtime requires user-set LAN bridge/token and supported, reachable devices.
