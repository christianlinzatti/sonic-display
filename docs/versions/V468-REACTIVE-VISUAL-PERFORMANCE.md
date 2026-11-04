# Sonic Display V468 – Reactive Visual Performance

Basis: V467 Intelligent Show Quality Advisor. Bestehende Features, V466 Inspector, Lip-Sync,
Bühnen-/Kamera-/Foot-IK-/GLB- und Mehr-Avatar-Pipeline bleiben erhalten.

## Neu

1. `DancePostProcessingV468.tsx`: Three.js `EffectComposer` mit `RenderPass`,
   eigenem Glow-/Chromatic-/Glitch-Shader, `AfterimagePass` (kurzer temporaler
   Nachzieheffekt statt Motion-Vector-Blur) und `OutputPass`.
   Die Effektintensität stammt aus gemessenen Kick/Beat-Impulsen, wird
   zeitlich begrenzt, gebremst, gekappt und bei einem Drop leicht verstärkt.
   `kickAnticipation` ist nur eine Vorhersage des *nächsten Beats*; daraus wird
   **keine** sichere Vorhersage des nächsten musikalischen Song-Drops abgeleitet.
   Keine Stroboskop-/White-Flash-Funktion.
2. `ProceduralShaderEnvironmentV468.tsx`: ein texturefreier Shader-Backdrop
   (Tunnel/Galaxy/Waves) mit 1 Draw-Call und Audio-Metriken bass/mids/highs.
   Auto-Stil: cyberpunk/festival/neon→Tunnel, galaxy→Galaxie,
   vaporwave→Wellen, andere→aus. Kein externes GLB nötig.
   Frequenzen werden als normalisierte CPU-Uniforms an die GPU übergeben;
   **kein** direkter GPU-Audio-Stream.
3. `avatarWardrobeV468.ts`: selektiver Outfit-Material-Clone pro GLTF-Instanz,
   Farbe aus Spotify-/Bühnenpalette oder Hex-Colorpicker, Emission und einfache
   prozedurale Texturmuster (Original, Neon-Raster, Streifen).
   Gesicht/Haut/Haar bleiben geschützt, Material- und Textur-Ressourcen werden
   bei Avatar-Wechsel bzw. Unmount aufgeräumt. Unbenannte Kleidung wird nicht
   automatisch eingefärbt; das Outfit muss entsprechend benannte Meshes oder
   Materialien besitzen.
4. `hooks/useAudioMotionEngine.ts`: ergänzt GLB-Mixer-Posen nach dem Mixer
   in einem unabhängigen R3F-Frame-Layer um subtile, gedämpfte Rotationen.
   Unterstützt Mixamo-ähnliche Namen und versucht, vorherige Akzente bei
   unveränderter Pose zurückzunehmen; keine clip/GLB Änderungen.
   Foot IK schützt Hüfte/Beine; Gesichts-/Lip-Sync-Knochen werden ignoriert.
5. V468-Regler im bestehenden `SettingsPanel`: Post-FX, Shader-Stage,
   Wardrobe-Farbschema, Texturmuster, Emission, Audio-Motion-Overlay/-Intensität.
   Persistenz über bereits vorhandene UiPreferences, standardmäßig automatische
   Audio-Overlay-/Wardrobe-Einstellungen, schwere FX nur mit Dance FX aktiv.

## Laufzeit-Schutz

- `reducedMotion`: keine Post-FX-Pulse oder Motion-Overlays, Shader nicht animiert.
- `low` tier: kein Post-FX-Puffer und kein Shader-Backdrop. `balanced`: keine
  zeitlichen Motion-Trails und begrenzte Bloom-/Glitch-Power.
- Nur ein Composer pro aktivierter Canvas-Szene, Ausgabe hat Render-Priorität 2
  über dem bestehenden R3F-Animations-/LOD-Layer.
- Sänger-/Lyric-Readability bleibt vorrangig: bestehende FX-Gain-/Stabilitäts-
  Limits steuern, ob der neue Post-Prozess aktiviert werden kann.

## Verifikation in dieser Umgebung

Bestanden:
- `node tests/v468-dancefx-wardrobe-motion-regression.cjs`
- `node tests/v467-intelligent-show-quality-advisor-regression.cjs`
- `node tests/v466-real-concert-quality-regression.cjs`
- `node tests/v465-visual-show-quality-regression.cjs`
- `node tests/v464-automatic-concert-experience-regression.cjs`
- `node tests/v463-pi-session-stability-regression.cjs`
- `node tests/v462-concert-lighting-regression.cjs`
- `node tests/v461-cinematic-lyrics-regression.cjs`
- `node tests/check-source-syntax.cjs` (643 TS/TSX-Dateien)

**Nicht vollständig verifiziert**: `npm run typecheck`, `npm run build` und
GPU-/Browser-Rendering, weil die ZIP kein `node_modules` enthält und npm in
 dieser Arbeitsumgebung keine Pakete herunterladen konnte. Nach dem Entpacken
auf dem Entwicklungsrechner `npm install`, `npm run typecheck`, `npm run build`
und einen echten Browser-/Raspberry-Pi-Test durchführen.

Zusätzlich bestanden: `npm run test:imports` (2.269 Importverweise),
`npm run test:module-case` (keine Groß-/Kleinschreibungs-Konflikte).
`npm run test:runtime` meldet einen bereits in V467 vorhandenen, nicht von
V468 veränderten Client-Directive-Befund in `StageCameraDirectorV289.tsx`.
`node scripts/build-preflight.cjs` bestätigt die fehlenden npm-Abhängigkeiten.
