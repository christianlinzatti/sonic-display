# V834 – Adaptive Performance Intelligence 3.0: Prüfbericht

## Implementierung

- Grundlage: V833 – GPU Memory & Resource Cleanup 2.0, unveränderte bestehende Konzert-FX-Renderobjekte.
- Neuer reiner Planer `components/visualizer/cameraAwarePerformanceV834.ts`: unter anhaltender V825-Framezeitlast werden bei **bestätigter V761-Kameraabsicht** (Porträt/Dialog) ausschließlich die bereits genehmigten Effektbudgets für **Publikum, Schaum, Partikel, Spektral und Bodennebel** weiter reduziert.
- Große Totalen (`wide`, `pulse`, `rise`) und dramaturgisch wichtige Drops/Finalen behalten ihre Wirkung; V825 darf weiterhin bei kritischer Last drosseln.
- Explizite manuelle V823-Timeline-Cues bleiben auf ihren Spuren geschützt. Manuelle Kamera, nicht bestätigte V761-Kameraabsicht, abgeschaltete V810-Freigabe, Pausen, Blackouts, reduzierte Bewegung und ausgeschalteter V825-Optimizer führen nicht zu einer V834-Sonderregel.
- Keine neuen Kameraschnitte, Shader, Lichter, InstancedMeshes, Timer oder WebGL-Objekte.
- Einstellungen: `cameraAwareV834` (Standard ein) und `cameraStrengthV834` (Standard 65 %), persistiert über `normalizeConcertFxV810`.
- Live-Dashboard V826 zeigt V834-Kameramodus und die **modellierte relative Kosteneinsparung**. Die Concert-FX-Studio-Vorschau ist explizit simuliert.

## Erledigte lokale Tests

- **V834-Funktionstests:** 52 von 52 Gruppen bestanden (`npm run test:v834`).
- **Regressionen:** V800–V833, **34 von 34 Suiten** bestanden; ältere V830–V833-Versionserwartungen wurden auf V834 erweitert, ohne fachliche Testbedingungen zu entfernen.
- **Isolierter TypeScript-Check:** V834 erfolgreich (`npm run test:v834:types`).
- **Weitere isolierte Typprüfungen:** V825, V827, V832, V833 erfolgreich.
- **Syntaxprüfung:** 2.395 TS-/TSX-Dateien bestanden (`npm run check:syntax`).
- **Architekturprüfung:** 927 Referenzen, 10 Abschnitte, bestanden (`npm run check:architecture`).
- **Windows-/Linux-Dateinamenprüfung:** keine casefold-Kollisionen im ZIP.
- **Paket- und Lockfile:** Version `0.1.0-v834` synchron, V834-Tests an Anfang von `check:fast`, `check:release` und `build:preflight` eingebunden.
- **ZIP:** erstellt und Integrität geprüft.

## Ausdrücklich **nicht** bestanden / nicht abgeschlossen

- **Vollständiger Projekt-TypeScript-Check:** `npm run typecheck` wurde gestartet, aber kein Abschluss/Exit-Code innerhalb des verfügbaren Ausführungsfensters erreicht. Nicht als bestanden bewerten.
- **Next.js-Produktionsbuild:** nicht durchgeführt, da die Projekt-Abhängigkeiten (`node_modules/.bin/next`) in dieser Umgebung fehlen. Nicht als bestanden bewerten.
- **Live 3D/GPU-Benchmark:** nicht durchgeführt. Keine gemessene GPU-Zeit, keine VRAM-Zahlen, keine behauptete Framerate-Verbesserung.
- **Kameraabsicht ist kein tatsächliches Occlusion-Culling.** Ein V761-Porträt signalisiert nur die bestätigte Regieabsicht; die Sichtbarkeit einzelner Bühneneffekte wird nicht pixelweise gemessen.

## Bei verfügbarer Build-Umgebung

```
npm ci
npm run test:v834
npm run test:v834:types
npm run typecheck
npm run build
```

Danach reale Songdurchläufe mit 1, 2 und 4 geladenen GLB-Avataren sowie Live-GPU-/FPS-Abnahme im V829/V832-Dashboard durchführen. Die GitHub-Actions-Release-Prüfungen sind im Projekt enthalten, aber ihre Ausführung wurde hier nicht nachgewiesen.
