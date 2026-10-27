# V591 – Verification (26.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v591` – **10 neue Testgruppen**, inklusive **15.000 deterministischer TS-/Node-Kompositionsvergleiche**, sichere lokale Pfade, fehlerhafte / widersprüchliche Cue-Daten, Clipanzahl für 2–4 echte GLB-Rigs, mögliches Lyrics-Overlap, Screenshot-/HTML-Wiring, HTML-Escaping. Fehlende GLB-Argumente führen reproduzierbar zu **Exitcode ≠ 0**, `report.json: {"status":"blocked"}` und keiner Erfolgs-HTML.
- `npm run test:v591:types` – isolierte reine TypeScript-V591-/V590-Protokollprüfung erfolgreich; **kein vollständiger Next.js-Typcheck der TSX-/React-Stage**.
- `npm run test:smoke:v591` – erfolgreich: V591, V590 (14 Gruppen / 15.000 NDC-Proben), V589 (25 Gruppen / 10.000 GLB-/Timeline-Proben), V534-GLB-Inspector, Architekturprüfung (**402 existierende Codepfad-Referenzen**).
- `npm run verify:v591` – komplett erfolgreich: vorherige Smoke-Suite, V590 TypeScript, V588-Langzeit-Choreografie (16 Gruppen / 20.000 Takte), V580-Integration (79 Checks / 12.000 zeitbasierte Proben), V572-Deutschrap-Lippendynamik (69 Checks / 16.000 Wortzeitproben) und `npm run check:syntax` (**817 TS-/TSX-Dateien**).
- `scripts/v591-integrated-concert-visual-benchmark.cjs` und `scripts/v591-concert-visual-report.cjs` auf Node-Syntax geprüft. README/`ARCHITECTURE.md`/`package.json` auf V591 aktualisiert.

## Nicht ausgeführt / Grenzen

- **Kein vollständiger `next build` / Projekt-`tsc`**: Ausgangsarchiv enthält keine installierten `node_modules` und keine zuverlässige Lockfile-Installation in dieser Umgebung. Isolierter Protokoll-Typcheck und Source-Syntaxprüfung ersetzen das nicht.
- **Kein realer Chromium-Multi-GLB-Screenshotlauf:** Im bereitgestellten Projekt stehen keine eigenen GLB-/Song-Audio-Dateien zur Verfügung. Die Offline-Tests prüfen die Browserprotokolle einschließlich zeitabhängiger Cue-Wechsel, den tatsächlichen WebGL-Pfad im Code und den korrekten Blockadezustand. Es gibt **keine gemessenen V591-FPS, keine V591-PNGs und keinen tatsächlichen visuellen Qualitätsnachweis**.
- **Kein Raspberry-Pi-10-Zoll-Test**, kein GPU-/Thermik- oder echter Audio-/Lip-Sync-Check.
- **Eigenständige Review-Fixture:** Die Benchmark-Szene mit zwei bis vier echten GLBs, DOM-Text und einfachen, vom Nutzer geskripteten Licht-/Kamera-Cues ist keine identische Ausführung der regulären Spotify-`VisualizerStage`-/V555-/V585-Module. Die Browser-Ergebnisse sind für die konkrete Fixture aussagekräftig, nicht als Freigabe der Produktivshow. Cue-Lyrics sind standardmäßig DEMO, ein hochgeladenes eigenes Cue-Skript ist keine automatische Künstleridentifikation.
- **Qualitätsregeln sind heuristisch:** Avatar-Bounds ↔ Lyrics-Textfeld, Frameintervall-Perzentile und Pixeländerung bedeuten *nicht* automatisch korrektes Framing, gute Bewegungen oder Lippen-Synchronität. Der Bericht darf nur `measured-needs-human-review` heißen.

## Lokaler End-to-End-Folgeschritt

1. Eigenes echtes, animiertes GLB unter `public/benchmark/performer-a.glb` und `performer-b.glb` bereitstellen.
2. Lokal mit npm-Installation den Produktionsbuild prüfen und Next.js über `npm run dev -- --hostname 127.0.0.1` starten.
3. `npm run benchmark:v591:concert -- --models=/benchmark/performer-a.glb,/benchmark/performer-b.glb --clips=0,0 --script=/benchmark/v591-cues-example.json --seconds=15 --headed` ausführen; nur bei erfolgreichem Lauf `artifacts/v591/concert/report.html` und `report.json` visuell kontrollieren.
4. Auf Raspberry Pi mit echtem Display unter Last wiederholen und mindestens Footwork, Sänger-Lip-Sync, Übergänge, Textlesbarkeit, Kamera-Framing und thermische Langzeitstabilität manuell abnehmen.

`V591-INTEGRATED-CONCERT-VISUAL-QUALITY-3.md` enthält das Protokoll, Cues und die Bedienung.
