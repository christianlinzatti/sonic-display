# Sonic Display V821 – LED Wall Experience 2.0

## Implementierte Neuerungen

- Reale, bereits gemessene Bass-/Mitten-/Höhenanteile steuern den bestehenden LED-Backwall-Shader.
- Verse: 24 schmale Equalizer-Bänder, verteilt über drei Frequenzanteile.
- Hooks: animierte geometrische Leuchtringe/Polygone.
- Intro, Break und Build: langsam wandernde, musikreaktive Lichtwellen.
- Drops und Finale: geometrischer Tunnel mit kontrolliertem Bassakzent.
- Genre-Variation für Deutschrap, Hardtekk, Hardstyle, Deutschrock/NDH und Pop.
- Concert FX Studio: automatischer oder fester Look, Einzelschalter, Intensität und schematische Vorschau.
- Rückwärtskompatible Speicherung über vorhandene `concertFxV810`-Einstellungen.
- Performance-, Balanced- und Ultra-Qualität, zusätzlich bestehende Gerätebudgets.
- Kein zusätzliches LED-Mesh, keine Textur und kein Renderpass; bestehende LED-Wand wird erweitert.
- Kein Aktivieren ohne bestätigten Songabschnitt: Pause, Blackout, manuelle Beleuchtung,
  Reduced Motion und Low-Tier haben Vorrang. Lyrics-/Gesichtsschutz senkt die Helligkeit.

## Ausgeführte Prüfungen

- `npm run test:v821` – PASS: 18 neue Testgruppen.
- `npm run test:v821:types` – PASS: strikter isolierter TypeScript-Check.
- `node tests/v800-...` bis `v820-...` – PASS: alle 21 Versions-Regressionstests,
  V800–V808 nur mit erweiterter Paketversions-Erkennung, V812 nur mit Prüfung der
  erwarteten Shader-Weiterverwendung; keine fachliche Testbedingung entfernt.
- `npm run check:syntax` – PASS: 1183 TS-/TSX-Quelldateien.
- `npm run check:architecture` – PASS.
- `npm run test:module-case` – PASS: 2006 Quelldateien, keine TS/TSX-Kollisionen.
- Generierter Shader aus TypeScript-Loader: PASS, 9 neue Uniforms,
  genau ein `main`, Alpha-Cap 0,15.

## Noch offen / keine Produktivfreigabe

- Vollständiger `npm run typecheck`: nicht abgeschlossen (Zeitlimit 26 s erreicht).
- `npm run build`: Vorgeschaltete sehr umfangreiche Testkette nicht vollständig abgeschlossen,
  Next.js-Kompilierung nicht erreicht. In dieser Umgebung fehlen `node_modules`.
- Echter Browser-/WebGL-Test mit kompletten GLB-Avataren, Lyrics und GPU-Benchmark offen.
- Die Performance-Grenzen sind konfiguriert, aber **nicht** auf echter Zielhardware gemessen.

## Lokale Freigabe

```powershell
npm ci
npm run test:v821
npm run test:v821:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Danach einen vollständigen Song in Deutschrap und einen Hardtekk-Song mit echten,
verifizierten Abschnittsdaten, GLB-Performer, Lyrics, manuellen Timelines,
Laser und Schaumkanone visuell abnehmen. Zusätzlich FPS, GPU-Speicher und
Lesbarkeit insbesondere beim Wechsel Verse → Hook → Drop prüfen.
