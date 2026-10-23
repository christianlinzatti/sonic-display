# Sonic Display V256 – Performance Comparison Studio

Built on V255. The existing High/Balanced/Low real-frame benchmark now includes average P95 latency, FPS spread across sampling windows, and a per-tier 0–100 stability score. The comparison uses 40% normalized FPS, 40% normalized P95 latency and 20% percentage of frames not over 33 ms. This is a heuristic, not an actual GPU-time measurement.

Each tier runs for 6.5 seconds, including 2 seconds warmup. Scene content, temperature, background tabs and animations can bias results. The benchmark restores the previous quality mode on completion, cancellation and unmount. Existing exports and prior history remain compatible; old history entries may not include V256 metrics.
