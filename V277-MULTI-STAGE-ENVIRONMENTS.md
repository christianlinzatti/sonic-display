# V277 – Multi-Stage Environments

Built on the complete V275 source archive (V276 was not available as an archive).

Stage selection: Settings → Dynamic Stage → Bühnenstil. Existing stages Classic, Neon, Festival and Minimal are preserved; five new R3F environments are Cyberpunk Club, Vaporwave Sunset, Cosmic Galaxy, White Showroom and Rock Arena. All environment components are registered in `components/visualizer/stages/index.tsx` and are rendered as siblings of the dancer rather than replacing/remounting the Canvas. Multi-avatar, lyrics and Dance FX remain in place. Audio energy scales environment groups subtly; reduced-motion disables motion. Galaxy particle budget responds to the performance tier.

The environments use lightweight primitives; physically accurate wet-road reflections, volumetric smoke and millions of particles are not included (important for Raspberry Pi and mobile GPUs). Existing stage lighting and cue sequencing remain active.

Note: Auto genre matching helper `recommendedStage` is available for a future optional automatic mode; stage selection is currently manual and persisted via the existing UI preferences.
