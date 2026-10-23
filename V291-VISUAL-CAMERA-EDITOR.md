# Sonic Display V291 – Visual Camera Editor

- Lazily loaded React Three Fiber preview under Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director.
- Drag to orbit, mouse wheel to zoom, right mouse drag to pan; use the neutral mannequin/grid for framing.
- Live preview updates position, target height and FOV; **Save perspective** commits to the selected V290 preset; discard reverts.
- The running music scene is never edited through the preview; V290 track/section assignments and automatic fallback remain intact.
- One preview WebGL canvas only when opened; closed by default. No extra renders during normal music display.
- Offline tests: `npm run verify:offline`; production build: `npm run build`.
