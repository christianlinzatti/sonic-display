# Sonic Display V819 — Cinematic Scene Transition FX

Basis: V818 `sonic-display-v818-spectral-music-visuals.zip`.
Version: `0.1.0-v819` in package.json und package-lock.json.

## Umsetzung

- **Wipes, Glitch und Lichtblenden**: `components/visualizer/CinematicSceneTransitionV819.tsx` rendert zwei seitliche Shader-Flaechen hinten an der Buehne. Kein Fullscreen-Fade, keine zusaetzlichen Lichtquellen, Schatten, Timer oder harten Kameraschnitte.
- `components/visualizer/cinematicTransitionPlannerV819.ts` aktiviert Effekte nur an den bereits aus dem verifizierten V790-Storyboard bestaetigten V791-Szenengrenzen UND mit gueltigem V810-Konzert-FX-Act. Kamera und Beleuchtung verwenden weiterhin allein die existierende V791-Easing-Regie; V819 gibt deren Raten unveraendert weiter.
- Automatische Looks: **Deutschrap** weiche Licht-Wipes, **Hardtekk/Hardstyle** begrenzte digitale Glitch-Streifen, **Deutschrock/Pop** diffuse Blenden. Es gibt auch manuelle Stilwahl und Einzelschalter fuer jeden Effekttyp.
- Die V810-Einstellungen enthalten neue Schalter, Uebergangsstaerke (0–100 %), Migration vorheriger Presets via Normalisierung und eine **simulierte** Uebergangsvorschau im Concert FX Studio.
- **Sicherheits- und Ressourcen-Grenzen**: Effektklasse nur in der bestehenden 3D-Buehne, zwei Material-/Mesh-Layer, Deckkraft hart auf <=0,24 begrenzt, kein Strobe. Pausen, Seek ausserhalb bestaetigter Szenengrenzen, unbestatigte Song-Acts, manuelle Kamera- oder Licht-Timelines, Blackout, Reduced Motion, Low-Performance und ungueltige Werte schalten den Effekt aus. Lyrics, Gesichter, Gruppenaufstellungen und V640-Performance-Budget reduzieren Intensitaet zusaetzlich. Performance/Balanced/Ultra werden beruecksichtigt.

## Bestanden (in dieser Ausfuehrungsumgebung)

- `npm run test:v819`: 16 Gruppen **PASS**.
- `npm run test:v819:types`: isolierte strikte TypeScript-Pruefung der V810-/V819-Planer **PASS**.
- `npm run test:v818`, `test:v817`, `test:v816`, `test:v815`: alle **PASS**.
- Regressionstests `tests/v800-*` bis `tests/v814-*`: alle **PASS**. Bei V800–V808 wurde lediglich die hartkodierte zulässige Versionsobergrenze auf V819 angehoben, ohne fachliche Assertions zu veraendern.
- `npm run check:syntax`: **PASS**, 1.179 TS-/TSX-Quelldateien.
- `npm run check:architecture`: **PASS**, 879 Code-Referenzen und 10 Abschnitte.
- Keine Windows-/Linux-Dateinamenkollisionen `.ts`/`.tsx` im `components`-Verzeichnis.
- Projekt- und Lockfile-Version stimmen ueberein. V819 ist an die schnelle, Release-, Prebuild- und Full-Prebuild-Pruefkette angeschlossen.

## Nicht abgeschlossen — **keine produktive Freigabe**

- **Gesamt-TypeScript-Check** (`npm run typecheck`): in der Arbeitsumgebung nicht abgeschlossen. Fehlende lokale Abhaengigkeiten und laenger laufende TypeScript-Pruefung; kein voller Typnachweis.
- **Next.js-Produktionsbuild** (`npm run build`): nicht erfolgreich bestaetigt. `node_modules/.bin/next` ist nicht vorhanden, daher kein lauffaehiger vollstaendiger Build in dieser Arbeitsumgebung.
- **Reale 3D-/WebGL-Abnahme**, vier GLB-Avatare, Lip-Sync, Kamera, Projektionen, schnell aufeinander folgende Szenen und GPU-Last: offen. Die Studio-Vorschau nutzt bewusst simulierte Daten, nicht echte Musikmessungen.

## Lokale Freigabe auf Windows

```powershell
npm ci
npm run test:v819
npm run test:v819:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Danach mindestens drei komplette Songs aus Deutschrap, Hardtekk und Deutschrock mit echten Song-Sections, Lyrics, bis zu vier Performern, Laser/LED/Schaum/Spektral und allen drei FX-Qualitaetsstufen visuell und anhand der FPS pruefen. Besonders auf Schnittpunkte/Seek und Vorrang manueller Timelines achten.
