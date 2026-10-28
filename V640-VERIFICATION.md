# V640 – Verifikation (2026-10-27)

## Bestanden

- `npm run test:v640`: **PASS** – 57 Tests, 12.000 deterministisch simulierte Messfenster.
- `npm run test:v640:types`: **PASS** – isolierte TypeScript-Kernprüfung.
- `npm run test:smoke:v640`: **PASS** – in einem vollständigen, zusammenhängenden Durchlauf bis V616, danach Syntax und Architektur.
- `npm run verify:v640`: **PASS** – V639–V635 sowie ältere V626, V602, V552, V518, V355, V253, Syntax- und Architekturtests.
- `npm run test:v463`: **PASS** – V463 Session-Guard inklusive veralteter Metriken, Pausen und manuellen Einstellungen.
- `npm run check:syntax`: **PASS**, 864 TS/TSX-Quellcodedateien.
- `npm run check:architecture`: **PASS**, 521 geprüfte Referenzen.

## Anpassungen historischer Quelltext-Tests

V572 prüfte einen Mundzielnamen vor V632, V253/V254 sowie V463 prüften
alte Literalformen des Übergangs-Guards. Ausschließlich deren statische
Quelltextmuster wurden auf die aktuelle, unverändert geschützte Laufzeitfunktion
umgestellt. Bestehende Tests der eigentlichen Schutz- und Berechnungslogik
liefen weiterhin erfolgreich.

## Noch nicht nachgewiesen

- `npm run typecheck` (gesamtes Projekt): fehlende `react`, `next`, `@types/node` und andere Abhängigkeiten in dieser Umgebung.
- `npm run build --ignore-scripts`: **nicht ausführbar** (`next: not found`); kein erfolgreicher vollständiger Produktionsbuild behauptet.
- Visuelle Browser-Tests mit echten GLB-Avataren und längerem Spotify-Playback.
- GPU-Benchmark, messbarer FPS-Gewinn, Hardware-/Pi-Eignung. P95/P99 sind Framezeiten, Draw Calls/Dreiecke nur GPU-Lastindikatoren.

## Release

Enthält den kompletten V639-Quellstand plus V640 Runtimeintegration,
Regressionstests, TypeScript-Konfiguration und Dokumentation.

