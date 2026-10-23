# V83: 3D Render Diagnostics

Settings → Diagnose displays sampled FPS, average frame time, percent of slow frames (>33 ms), WebGL draw calls, triangles, geometry and texture counts, renderer name when allowed, and adaptive rendering quality.

Measurements are published at most once per second to avoid frame-by-frame React re-rendering. The WebGL scene must be active. GPU utilization percentages are intentionally not estimated. Browser / privacy settings may hide the GPU renderer name.

Existing V82 adaptive quality settings and lyrics remain intact.
