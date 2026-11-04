# V827 – Automatic Concert Quality Tuning & Live-Benchmark: Prüfbericht

**Stand:** vollständiger Quellcode basierend auf V826, **noch keine Produktionsfreigabe**.

## Implementiert

- `components/visualizer/automaticConcertQualityV827.ts`: adaptiver Qualitätstuner mit 0,5-s-Messfenstern aus V826, mindestens 2–4 schlechten Fenstern vor Reduktion, 4–8 guten Fenstern vor langsamer Erholung. Drei Modi sanft, ausgewogen, schnell. Zusätzlicher Regeldruck ist auf 85 % begrenzt und wird nur an den vorhandenen V825-FX-Planer weitergegeben. Die Regie überschreibt weder deaktivierte Effekte noch V823-Timeline-Sperren, Song-Blackouts, Lyrics- oder Vocal-Schutz. Ohne gültige Messung, bei Pause oder deaktiviertem V825/V826 wird der Auto-Druck zurückgesetzt.
- `components/visualizer/concertBenchmarkV827.ts`: geführter **Live-Benchmark** in der echten Hauptbühne, keine synthetische FPS-Behauptung. Automatische Messung mit jeweils 12 Sekunden für konfigurierte 1, 2 und 4 Performer, **nachdem der Anwender selbst die Besetzung geändert hat**. Song, Qualitätsprofil und konfigurierte Anzahl müssen pro Messfenster stabil sein. Ergebnisse: FPS, Ø Framezeit, höchster Fenster-P95, Slow-Frame-Anteil, Renderer-Draw-Calls und Dreiecke. Daten verbleiben nur flüchtig im Browserprozess; Neustart löscht sie.
- `components/visualizer/ConcertBenchmarkPanelV827.tsx`: Start/Stop/Reset, Fortschritt und 3-Zeilen-Vergleich; im Concert FX Studio und unter Diagnose.
- `DynamicStage.tsx`, `ThreeAvatar.tsx`: nur tatsächliche Hauptbühnen-Render-Frames dürfen Benchmarks liefern. Renderer-Vorschauen werden nicht als reale GLB-Leistung gezählt. Updates maximal ca. 2 Hz, keine neue Geometrie/Shader/Renderpass.
- V810-Einstellungen: `autoQualityV827`, `autoResponseV827`, persisted in existing preference export/import; V826-Dashboard zeigt automatische Regellast. V827-Testgates in Build-Preflight, Fast- und Release-Check.

## Abgeschlossene Prüfungen

- `npm run test:v827`: **PASS – 64 Testgruppen**, darunter Pause, nicht verifizierter Song, Stufen, Hysterese, sichere Abschaltung, Snapshot-Grenzen, messbare Durchläufe, falsche Besetzung, Track-/Profilwechsel, Store und Integrationspfade.
- `npm run test:v827:types`: **PASS – isolierte TypeScript-Prüfung** der relevanten V810/V823/V825/V826/V827-Kernmodule.
- `npm run check:syntax`: **PASS – 1.193 TS-/TSX-Dateien**.
- `npm run check:architecture`: **PASS – 904 Code-Verweise**, dokumentierte V827-Architektur.
- `npm run test:v800` bis `npm run test:v826`: **PASS – alle 27 vollständigen historischen Testsuiten**. Die alten Versions-Regexe wurden nur um V827 erweitert, ohne Funktionsprüfungen zu lockern.
- `package.json` und `package-lock.json` auf 0.1.0-v827 konsistent; ZIP, Dateinamenkollisionen und Paketwurzel validiert.

## Nicht abgeschlossen / Grenzen

- **Vollständiger TypeScript-Check:** `npm run typecheck` gestartet, innerhalb Zeitlimit nicht abgeschlossen (kein PASS/FAIL bestätigt).
- **Next.js-Produktionsbuild:** nicht erfolgreich geprüft; `node_modules/.bin/next` ist in dieser Umgebung nicht vorhanden. Daher keine Release-Freigabe.
- **Visuelle/GPU-/Hardware-Abnahme:** nicht durchgeführt. Der neue Algorithmus basiert auf gemessenen R3F-Frame-Abständen, **nicht** auf GPU-Timer-Queries. V825 bleibt ein relatives FX-Kostenmodell.
- **1/2/4-GLB-Benchmark:** Es werden **konfigurierte Bühnen-Performer** gemessen, nicht die Zahl tatsächlich geladener GLB-Meshes. Der Benchmark wechselt Avatare nicht selbst und lädt keine GLB-Dateien automatisch. Der Nutzer muss die Besetzung jeweils manuell auf 1/2/4 umstellen und dieselbe Auflösung / Song / Effektlast / möglichst gleich komplexe GLBs wählen.
- **P95:** maximaler P95-Wert der einzelnen 0,5-s-Fenster, kein aggregierter Gesamt-P95. Draw Calls / Dreiecke sind WebGLRenderer.info-Snapshots und keine GPU-Lastmessung.
- **Raspberry Pi vs. Mini-PC:** bisher keine Vergleichsmessungen auf solchen Geräten. Keine hardwarebezogene Geschwindigkeitsempfehlung möglich.

## Lokale Freigabeschritte

```powershell
npm ci
npm run test:v827
npm run test:v827:types
npm run typecheck
npm run build
```

Danach 1-, 2- und 4-Avatar-Konstellationen im echten Browser bei gleicher Zielauflösung mit repräsentativen GLBs, aktiviertem Lippen-/Lyrics-Sync und mehreren komplexen FX-Shows vergleichen. Falls Framezeiten instabil werden, Screenshots und Diagnoseausgaben dokumentieren.
