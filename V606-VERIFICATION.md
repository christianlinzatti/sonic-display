# Sonic Display V606 – Verifikation

**Release:** `0.1.0-v606` · **Datum:** 26.10.2026 · **Basis:** V605.

## Tatsächlich ausgeführte Prüfungen

- `npm run test:v606`: **44 bestandene Testgruppen**, **792 simulierte R3F-Kamerarahmen**, davon **792 bewilligte konservative Kameraverfeinerungen** bei den gewählten sicheren synthetischen Beispielen. Belegt sind z. B. strikte Liedzeitfenster, Hook-Quellennachweis, explizit bestätigte Sänger-/Duettrollen, fehlende Wortzeitstempel, Pausen/Seek/Reduced Motion, manuelle Kamera, Low-Tier sowie unveränderte Bildrahmengrenzen nach V540 und V550.
- `npm run test:v606:types`: isolierter TypeScript-Core ohne Fehler.
- `npm run test:smoke:v606`: erfolgreich; enthält V605-Kamera, V598-/V549-Lyrics, V550-/V540-Kamerabildkontrolle und Architektur.
- `npm run verify:v606`: erfolgreich ausgeführt; enthält zusätzlich V597-Deutschrap-Lip-Sync (40), V596-Fußarbeit (47), V595-Bildregression (34), V572-Munddynamik (69), V589-GLB-/Langsong-Qualität (25) und Syntax-/Importscan. Nach einer abschließenden zusätzlichen Reduced-Motion-Schutzprüfung wurde `test:v606`, `test:v606:types` und `check:syntax` erneut erfolgreich durchgeführt; die vollständige Verifikation wurde ebenfalls final erneut ausgeführt.
- `npm run check:syntax`: **830** TS-/TSX-Quellcodedateien erfolgreich geprüft.
- `npm run check:architecture`: **451** gültige referenzierte Codepfade, 10 Architekturabschnitte, korrekte V606-Dokumentationsversion.

Die veränderten älteren V528/V540/V550-/V605-Strukturassertions berücksichtigen ausschließlich die neue letzte automatische V606-Kamerastufe vor V351 und prüfen weiterhin, dass die vorherigen Kamera- und Sicherheitsstufen richtig geordnet bleiben. Alte mathematische Prüfungen wurden nicht entfernt.

## Nicht nachgewiesen

- **Kein vollständiger Next.js-Produktionsbuild:** Das Quellcode-ZIP enthält keine installierten `node_modules`/`next`-Abhängigkeiten. Die isolierten TypeScript- und Syntaxchecks sind kein Ersatz für `npm run build`.
- **Keine realen WebGL-/Spotify-Screenshots**, keine Sichtabnahme mit echten Sänger-GLBs, keine echte Occlusion-/Karaoke-Lesbarkeitsmessung.
- **Keine Raspberry-Pi-Hardwaremessung** (FPS, GPU, Thermik oder mehrstündige Stabilität).
- V540/V550 messen konservative projizierte Körper-/Bildrahmen, nicht tatsächliche Glanzlichter, GLB-Morphs oder Text-Gesichtsüberlagerung Pixel für Pixel. 792 zugelassene synthetische Beispiele beweisen keine bessere künstlerische Show.

## Reproduzieren

```bash
npm run test:v606
npm run test:v606:types
npm run test:smoke:v606
npm run verify:v606
npm install
npm run build
```

Der vollständige Next.js-Build erfordert lokal installierte Pakete. Für eine visuelle Freigabe sind vollständige live aufgezeichnete Show-Abschnitte und ein Abgleich mit V603 sinnvoll.
