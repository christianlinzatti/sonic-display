# Sonic Display V169 — Dynamic Stage Lighting & Music-Aware Visual Themes

V169 erweitert V168 ohne Austausch der vorhandenen Bühnen-Engine.

- Der bestehende **Musikfarben**-Schalter aktiviert zusätzlich die Übertragung der Albumcover-/Genrepalette auf die 3D-Bühnenlichter.
- Vier vorhandene Three.js-Lichter (Key, Fill, Floor, Spot) werden sanft über `Color.lerp` gefärbt. Kein zusätzliches Postprocessing, Schatten oder neue Lichtquellen.
- Bestehende Beat-, Kick- und Genre-Cues steuern weiter die Intensität; Low/Balance/High bleibt aktiv.
- Bei ausgeschalteten Musikfarben wird das gewählte Bühnen-Theme verwendet.
- Reduced Motion übernimmt Zielfarben ohne Übergangsanimation.
- Die vorhandene Genre-Erkennung liefert derzeit Techno als Profil für Hardtekk-nahe Musik. Zusätzliche Subgenre-Erkennung wäre ein separates Feature.

## Prüfen

```bash
npm install
npm run test:stage-themes
npm run verify:offline
npm run typecheck
npm run build
```

Ein echter Rendering-/FPS-Nachweis benötigt einen unterstützten Browser und GPU.
