# V62 – Interactive 3D avatar preview

Settings > Avatar & Tanz now includes a WebGL preview with drag-to-rotate, scroll/pinch-to-zoom, automatic rotation, reset view, demo dance toggle and tempo selector (0.5–2x). The preview uses the selected procedural or configured GLTF model, current scale, vertical offset, and animation intensity. GLTF animation clips are played if available; otherwise a procedural motion demo is shown. No microphone or Spotify connection is needed. Reduced motion disables dance playback.

The preview intentionally uses a lightweight demo rather than the complete live audio-driven choreography engine; for GLTF models it plays an embedded dance/idle clip if available.

No full TypeScript check or Next.js build was possible: npm dependency installation failed due to unavailable npm registry access (EAI_AGAIN).
