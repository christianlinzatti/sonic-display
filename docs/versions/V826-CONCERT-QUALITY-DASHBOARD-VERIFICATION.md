# V826 – Concert Quality Dashboard 2.0: Prüfbericht

**Stand:** Sonic Display V826 auf Basis V825. **Keine Produktionsfreigabe**.

## Implementiert

- `concertQualityTelemetryV826.ts`: reine Mess- und Diagnosefunktionen, Messfenster ab 500 ms, FPS, durchschnittliche Framezeit, P95, Anteil langsamer Frames, automatische Hinweisdiagnose, Status bei pausierter Wiedergabe und ungültigen Messwerten; Browser-Tab-Wakeup-Spikes über 250 ms verworfen.
- `DynamicStage.tsx`: Instrumentierung in bestehender R3F-Schleife, ohne neuen GPU-Renderpass. Pro Frame nur Zählerarbeit; detaillierte Erfassung erst bei Publikation. Anzahl an bereits **V825-gedrosselten und zur Darstellung übergebenen** Instanzen für virtuelle Crowd, Partikel, Schaum, bewegte LED-Säulen und Spektraleffekte. Three.js-WebGLRenderer.info für Draw Calls, Dreiecke, Geometrien und Texturen, soweit verfügbar.
- `ConcertQualityDashboardV826.tsx`: lesbare Live-Ansicht mit FPS, Framezeiten, Effektbudgets und Abweichungshinweisen; Updates per React `useSyncExternalStore`, ca. zwei Updates pro Sekunde. Verfügbar unter Einstellungen -> Diagnose sowie Concert FX Studio in Anzeige.
- `concertFxStudioV810.ts`: `qualityDashboardV826` mit Default true, persisted in existing preference export/import. Bei false entfallen Messung und Publikation.
- Kompatibel mit manuellen V823-Cues, automatisch gesteuertem V824 und V825; verändert niemals Effekte, Songregie oder Kamera.

## Verifizierte Schritte

- `npm run test:v826`: **PASS** – 56 Testgruppen (Frames, 30/60-FPS, P95, Pausen, Invaliddaten, React-Store, Sicherheitsgrenzen, Integration).
- `npm run test:v826:types`: **PASS** – isolierte TypeScript-Prüfung des Datenkerns und des relevanten Settings-Moduls.
- `npm run check:syntax`: **PASS** – 1.190 TS/TSX-Dateien.
- `npm run check:architecture`: **PASS** – Version V826, 901 Architekturverweise.
- `test:v800` bis `test:v825`: **PASS**, 26 historische Testsuiten, in einem unabhängigen Mehrprozess-Durchlauf geprüft. Nach dem V826-Update der neun rein versionsgebundenen Tests prüfen diese weiterhin ihre vorherigen Fachanforderungen.
- Neu-Versionierung in `package.json` und `package-lock.json` konsistent; eingebunden in `check:fast`, `check:release`, `build:preflight`.
- Paketdateien auf Windows-/Linux-Casefold-Kollisionen und ZIP-Lesbarkeit geprüft.

## Noch offen / Grenzen

- `npm run typecheck` wurde gestartet, aber **nicht abgeschlossen** (Laufzeitlimit; kein PASS und keine Aussage über etwaige TypeScript-Gesamtfehler).
- `npm run build` mit Next.js-Kompilierung **nicht durchgeführt**: Im Container fehlen `node_modules` und Next.js-Binary; der vollständige vorgeschaltete Preflight wäre zudem lang.
- **Keine echte Browser-/WebGL-/GLB-/GPU- oder Raspberry-Pi-Abnahme**. Auf der Zielhardware sind visuelle Prüfung, Performancevergleich und realer Produktionsbuild auszuführen.
- Die FPS stammen aus R3F-Frame-Abständen, **nicht** aus GPU-Timer-Queries. P95 gilt nur für das letzte kleine Messfenster (max. 90 Frames); keine langfristige Statistik.
- Aktive Instanzzahlen sind die finalen Render-Cue-Sollzahlen. Shader-Primitiven, verworfene Instanzen und tatsächliche GPU-Kosten sind nicht gesondert instrumentiert. V825-Pressure und -Cost sind heuristische relative Werte und keine GPU-Auslastung. Three.js-Zähler sind Momentaufnahmen und können wegen internem Auto-Reset 0 anzeigen.
- Test-Suiten sind Programm-/Integrations-Tests und kein Ersatz für eine echte Konzertshow im Browser.

## Freigabe lokal (mit installierten Abhängigkeiten)

```bash
npm ci
npm run test:v826
npm run test:v826:types
npm run typecheck
npm run build
```

Danach echte Shows (1, 2 und 4 GLB-Avatare, Lyrics, unterschiedliche Genres, Laser+LED+Schaum) auf der Zielhardware und bei derselben Auflösung vergleichen. Aufwendige Tests nur mit explizit dokumentierten Messresultaten als bestanden behandeln.
