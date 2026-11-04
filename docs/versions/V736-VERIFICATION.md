# Sonic Display V736 – Build & Motion Validation

**Basis:** V735 aus `sonic-display-v735-hip-dance.zip`  
**Release:** `0.1.0-v736`  
**Umgebung der hier ausgefuehrten Checks:** Linux, Node.js 22.16.0, npm 10.9.2.  
**Wichtig:** V736 ist eine implementierte Validierungs- und Haertungsstufe, aber **kein vollstaendig produktionsverifizierter Next.js-Build**.

## Implementiert

- Neuer deterministischer V736-Bewegungsqualitaetstest fuer `Hip_Sway`, `Hip_Circle` und `Hip_Bounce` mit **61.582 synthetischen Bewegungs-Samples** und 10 Testgruppen, ohne Browser/GPU.
- Testmatrix: 7 BPM-Werte, 3 Genres, 5 Songabschnitte, 4 Fusskontaktmasken, 3 Bewegungsarten; Zusatzszenarien mit reduzierter Bewegung, pausierter Wiedergabe, manueller Choreografie, deaktivierter und unvollstaendiger Foot-IK, Extremzeiten und fehlenden/ungueltigen BPM.
- Test von anatomischen Pitch-/Roll-/Translationsgrenzen, rein abwaerts gerichtetem Bounce, unveraenderten Kontaktankeln, Blend-Puritaet, und Simulationspruefung gegen Overlay-Drift durch authored GLB-Mixer-Resets.
- `hipDanceV735.ts`: Schutz vor NaN/Infinity bei ungueltigen BPM und sehr grossen endlichen Zeitwerten, ohne Modus-/Einstellungs-API zu aendern.
- Isolierter `tsc`-Typcheck der Hueft- und Rig-Module, mit strikt nur lokal verwendeten Test-Stubs. Die produktiven Typen und GLB-Dateien wurden nicht ueberschrieben.
- Neue Skripte `test:v736`, `test:v736:types`, `verify:v736`; ersteres und die isolierte Typpruefung sind im `test:quick` des Produktionsbuild-Preflights enthalten.

## Hier tatsaechlich ausgefuehrte Tests

| Pruefung | Ergebnis | Aussage |
| --- | --- | --- |
| `test:v736` | **PASS** | 10 Gruppen, 61.582 deterministische Samples |
| `test:v736:types` | **PASS** | Isolierter Typcheck des Hip-/Rig-Cores |
| `test:v735` | **PASS** | Vorversion Huftbewegungen / IK-Reihenfolge / Avatar Preview |
| `test:v665` | **PASS** | 41 Gruppen, 15.000 Grounding-Samples |
| `test:v666` | **PASS** | 48 Gruppen, 15.000 Genre-Dance-Frames |
| `check:syntax` | **PASS** | 1.037 TS-/TSX-Quelldateien |
| `check:architecture` | **PASS** | Dokumentation V736, 721 Quellpfad-Referenzen |
| `test:module-case` | **PASS** | 1.750 Quellpfade, keine case-insensitiven Kollisionen |
| `npm ci --offline` | **BLOCKIERT** | npm-Cache enthaelt nicht alle benoetigten Pakete (`ENOTCACHED`, u.a. `zustand`) |
| `npm run typecheck` | **NICHT BESTANDEN** | Teilweise installierte/fehlende npm-Typdefinitionen (`TS2688`), kein aussagekraeftiger Full-Check |
| `npm run build` | **BLOCKIERT** | Der bestehende Dependency-Preflight meldet 18/18 fehlende Projektpakete; `next build` konnte nicht gestartet werden |

**Keine Entwarnung fuer produktiven Build**: Der isolierte V736-Typcheck ist ein zusaetzlicher Modulvertrag, kein Ersatz fuer den vollstaendigen `tsc --noEmit` und das reale `next build`.

## Noch offen / fuer V737

1. **Windows oder Linux mit vollstaendiger npm-Installation:** `npm ci`, danach `npm run verify:v736`. Erst wenn `npm run typecheck` und `npm run build` erfolgreich beendet werden, kann der Produktionsbuild als bestanden markiert werden.
2. **Echte GLB/GPU-Sichtpruefung:** Beiden Fusskontakt anzeigen, Hip-Sway/Circle/Bounce in mindestens zwei GLB-Rigs bei verschiedenen BPM, Song-Seeks und pausierter Wiedergabe pruefen. Die Testmatrix simuliert Mathe/Kontakte, sie misst kein echtes Foot-Sliding.
3. **V737 Foot Lock 2.0:** Plantar-Anker und Foot-Sliding-Metriken im echten Three.js-Rig integrieren. V736 veraendert die vorhandene Foot-IK selbst nicht.

## Reproduzieren

```bash
npm ci
npm run test:v736
npm run test:v736:types
npm run verify:v736
```

`verify:v736` startet die oben genannten Kernregressionen und anschliessend die echte Gesamt-Typpruefung und den Next.js-Produktionsbuild. Der komplette historische Testlauf ist weiterhin separat; V736 behauptet nicht, alle historisch gesammelten 1.300+ npm-Skripte durchlaufen zu haben.
