# Sonic Display V518 – Release-Verifikation (24.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v518`: **35.000** deterministische Render-Messfenster und **136 Capture-Stichproben**, einschließlich 2–4 Avataren, wechselnder Qualität/DPR, Pi-Effektbudget, Lyrics, Lip-Sync, reaktivem Licht, fehlender JS-Heap-API und zurückgewiesener alter/ungültiger Messwerte.
- **68 Versionsregressionen V451–V518 bestanden**, einschließlich der TypeScript-Kernprüfungen innerhalb der älteren V451–V467-Versionstests. Siehe `V518-REGRESSIONS.txt`.
- **27 isolierte TypeScript-Kernprüfungen V492–V518 bestanden**, siehe `V518-TYPECHECKS.txt`.
- `npm run test:gltf-hook-split`, `npm run test:three-avatar-split`: bestanden; Original-GLB/IK-/Avatar-Hooks unverändert.
- `npm run check:syntax`: **724 TS/TSX-Quelldateien**, bestanden.
- `npm run check:architecture`: **204** geprüfte aktuelle Pfadreferenzen und zehn Architekturabschnitte, bestanden.
- `package.json` auf `0.1.0-v518` erhöht; V518-Regressions- und isolierte Typprüfung stehen an erster Stelle von `build:preflight`.
- ZIP-Bestand und CRC werden nach Erstellung mit dem veröffentlichten V517-Archiv verglichen.

## Schutzmaßnahmen und Messgrenzen

V518 nutzt **nur den bestehenden Hauptbühnen-Render-Sampler** (ca. 1 Hz) und einen neuen maximal 120 Fenster langen, sitzungsbasierten Puffer. Captures setzen mindestens sechs konsekutive Fenster mit derselben Avatarzahl, Grafik-Tier/DPR, Pi-Budget sowie Lyrics-/Lip-Sync-/Reaktivlicht-Status voraus; maximal 20 Fenster pro Messpunkt. Es gibt keinen zweiten WebGL-Renderer, keine zusätzliche Animation-Schleife, keine Qualitätsänderung, keine Manipulation von GLB-Clips, Lippen-/Hand-/Fuß-IK oder manuellen Choreografien. JSON-Export nur durch bewusste Aktion.

Gemessen werden Browser-FPS, Fenster-P95, langsame Frames und WebGL-Ressourcen-Zähler (Draw Calls/Dreiecke), optional die Browser-Chromium-JavaScript-Heap-Größe. Keine verlässlichen GPU-Zeiten, VRAM-Auslastung, GPU-Temperatur oder Raspberry-Pi-Prozess-RAM-Messungen. Unterschiedliche Tracks/Szenen/Temperatur können das Ergebnis auch bei gleicher Renderkonfiguration verändern. Es liegen **keine echten Raspberry-Pi-Benchmarks** vor; der Regressionstest simuliert Eingangsmesswerte und prüft die Verarbeitung, nicht die Hardwareleistung.

## Noch offen

- Vollständiges `next build` und visueller GLB-/Raspberry-Pi-Test: Die Laufzeitumgebung enthält kein installiertes `node_modules` mit `next`/`react`/`three`. Auf dem Zielsystem `npm install && npm run build` sowie echte Duett-/Vierer-Gruppentests durchführen.
