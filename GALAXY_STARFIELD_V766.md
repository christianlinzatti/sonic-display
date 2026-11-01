# V766 – Galaxy-Starfield: one draw call and controlled GPU lifetime

## What changed

- Live `GalaxyStage` now uses one `Points` object and one `BufferGeometry`, rather than
  75 or 210 `Mesh` objects with individual sphere geometry and material allocations.
- Preserve the same deterministic star locations, three colors, two apparent sizes,
  and the former quality budgets: `low` 75; `balanced` / `high` 210.
- A tiny shader draws soft circular particles with perspective-correct point sizes;
  no external texture or animation timer is used.
- The geometry is built with `useMemo` only when the active tier changes, and is
  explicitly disposed by `useEffect` cleanup when replaced or unmounted. The JSX
  shader material is owned by React Three Fiber and is disposed with the scene.
- Use `useAdaptivePerformance` so a tier change can actually update the count.
- Avoid allocations in the per-frame callback; the existing responsive parent
  rotation/scale remains unchanged.

## Draw-call estimate (star field only)

| Quality | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Low | 75 | 1 | 74 (98.7%) |
| Balanced/high | 210 | 1 | 209 (99.5%) |

These are source-derived star-field draw-call counts, not measured total
application render calls. The stage floor, the nebula sphere, dancers, lighting
and any other effects are unchanged.

## Regression checks

- `npm run test:v766`: counts, finite vertex attributes, both sizes, color
  attributes, single point cloud, explicit dispose source guard.
- `npm run check:lockfile:v752` (release and CI gate consistency).
- `npm run test:v765`, `npm run test:v764`, `npm run test:v763`,
  `npm run test:v762`, `npm run test:v760`, `npm run test:stage-themes`.
- On machines with project dependencies: `npm ci`, `npm run typecheck`,
  `npm run build`, plus a browser/WebGL preview and a full-song stress test.

## Memory-leak assessment and next measurement

Static inspection cannot prove that the full application is leak-free. The
existing preview GLTF cache is owner-aware and bounded (12 idle entries), and
the stage theme gallery normally mounts only one hover WebGL canvas plus the
optional modal. Nonetheless, decoded GLTFs and textures may still cause high
VRAM consumption even without a leak. Future priorities: benchmark idle GLTF
cache capacity on low-end devices; track `renderer.info.memory.geometries`,
`renderer.info.memory.textures`, draw calls and JS heap before/after 30 repeated
stage switches; and profile resource lifetimes across avatar/preview changes.

**Validation environment:** the updated `.tsx` and `.ts` sources passed offline
TypeScript transpilation/syntax validation, and the listed source regressions
passed. The package repository was unavailable (npm returned EAI_AGAIN), so the
complete project typecheck and Next.js build could not be verified in this
container. The V766 geometry test used a lightweight Three.js attribute stub
in this environment; it uses real Three.js when npm dependencies exist.
