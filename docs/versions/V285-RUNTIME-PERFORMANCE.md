# Sonic Display V285 — Runtime Performance

## Was ist neu?

- `RuntimePerformancePanelV285` unter **Settings → Diagnose**: DOM Ready, First Contentful Paint, Load Event, Zeitpunkte wichtiger UI-Meilensteine, Session-FPS und (soweit vom Browser unterstützt) JS-Heap sowie Langzeit-Heap-Trend.
- `runtimePerformanceV285.ts` sammelt einmalige Lade-Meilensteine lokal und speichert nichts persistent.
- Visualizer wird als React-Mount-Messpunkt erfasst. **Wichtig:** Das ist nicht der Zeitpunkt des ersten fertigen WebGL-Frames.
- Der bestehende 250-ms-Fortschrittstimer läuft nur bei aktiver Wiedergabe; in einem versteckten Tab wird er nicht aktualisiert.
- Performance-Diagnose wird bei Bedarf geladen und nutzt bestehende Langzeit-FPS-Daten.
- Bestehende Spotify-, Lyrics-, Stage-, Motion- und Avatarfunktionen bleiben bestehen.

## Überprüfung

`npm run verify:offline` (statische Syntax- und Regressionstests). Für einen vollständigen Next.js-Build mit installierten Abhängigkeiten `npm install && npm run build`.

## Zu beachten

FPS und Langzeit-Trends stehen erst nach Wiedergabe und ausreichenden Messpunkten zur Verfügung. Die vom Chromium-Browser bereitgestellte Heap-API ist nicht in allen Browsern verfügbar. Messungen sind keine Garantie für Leistungsverbesserungen auf jedem Gerät.
