# V787 – Verifizierungsbericht

## Bestandene Prüfungen

- `npm run test:v787`: Distanz/Hysterese/Haltezeit, fehlende LOD-Varianten, Rig-/Animations-/Morph-Mismatch, kaputte GLBs, Offline CLI (ready/blocked), Hash-Pfade und UI-Integration
- `npm run test:v787:types`: strenger isolierter TypeScript-Check der reinen LOD-Policy
- `npm run test:v786` und gezielte alte Regressionen `V760` bis `V785` (inkl. V776-V785, Motion/Lyrics/Camera, Batching und GPU-Ressourcen), `V552`, `V569`: PASS
- `npm run check:syntax`: PASS, 1.129 TypeScript-/TSX-Quelldateien
- `npm run check:architecture`: PASS, 812 aktuelle Code-Referenzen
- `npm run check:lockfile:v752`: PASS, Lockfile und 18 direkte Paketdeklarationen
- `npm run test:module-case`: PASS, 1.917 Quelldateipfade ohne case-insensitive Konflikte

## Nicht verifiziert

- **Projektweiter TypeScript-Check** wurde angestoßen, schlug durch fehlende npm-Abhängigkeiten fehl (`0/18` installiert, u.a. `next`, `react`, `three`). Diese Umgebungsfehler erlauben keine seriöse Aussage zum gesamten Projekt-Typecheck.
- Next.js-Produktionsbuild wurde ohne installierte Abhängigkeiten nicht als erfolgreich ausgeführt.
- 3D-LOD-Vorschau wurde nicht mit einem aktiven Browser/GPU verifiziert; es wurden weder FPS-Werte noch sichtbare Qualität behauptet.
- Die GLB-Kompatibilitätsprüfung kann Hautgewichte, inkompatible Bind-Posen, Gesichtsverformung oder tatsächliche Perfomance-Unterschiede nicht beweisen.
- Die produktive Live-LOD/Show wurde **bewusst nicht umgeschaltet**. Vor der Freigabe: echte LOD1/LOD2-GLBs validieren, visuelle Vorschau prüfen, danach Browser-/GPU-Vergleich durchführen.

## Lokale Freigabe

```bash
npm ci --no-audit --no-fund
npm run test:v787
npm run test:v787:types
npm run typecheck
npm run build
```

Danach unter `/diagnostics/avatar-lod` den zuvor mit `npm run avatar:lod:v787 -- --lod0=... --lod1=... --lod2=...` erstellten `artifacts/v787/lod-review.json` importieren und die LOD-Wechsel bei unterschiedlichen Kameraabständen visuell überprüfen.
