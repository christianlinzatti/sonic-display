# V463 – Prüfbericht

## Erfolgreich

- `npm run test:v463`: 12s-Songwechsel/8s-Rückkehr/15s-WebGL-Schutzphase, Pause, Tab unsichtbar, Zeitlücken, ungültige Messwerte, Stale-/Future-Frames, manuelle Renderqualität, Mikrofon-only-Betrieb, vorhandenes Render-Monitoring.
- 30-minütige **deterministische Zustands-Simulation**, mit regelmäßigem Songwechsel und gedachter 4-Avatar-Szene: 330 gültige Messzeitpunkte, 30 geschützte Zeitpunkte; keine Überläufe oder unendlichen Zeitwerte. **Keine gemessenen FPS.**
- `tsc -p tests/tsconfig.v463-core.json --noEmit`: isolierter TypeScript-Kerncheck.
- Zusätzlich separate ältere Tests: `test:v253`, `test:v254`, `test:v355`, `test:v388`, `test:v395`, `test:performance` und `test:quality-manager`. Historische feste Versions-/Quelltext-Erwartungen wurden auf die aktuellen, weiterhin geschützten Funktionswege angepasst; die jeweiligen funktionalen Assertions bleiben bestehen.
- `npm run verify:v463`: V463, die oben genannten Performance-Regressionen, V455–V462, V429, V423 und Imports/Syntax/Modulnamen. Der separate ältere Komplettlauf bis V423 wurde zuvor bis zur Importprüfung durchgeführt, aber am Laufzeitlimit beendet; die Strukturprüfungen wurden daher zusätzlich einzeln ausgeführt. `verify:v463:extended` führt auf Wunsch die komplette ältere V462-Kette zusätzlich aus.
- Das vollständige ZIP wird auf Archiv-CRC sowie alle Dateien aus V462 abgeglichen.

## Nicht bestätigt

- `npm run typecheck` und `npm run build` mit allen React-/Next-/Drei-Dependencies: Im bereitgestellten Quellbaum ist `node_modules` nicht enthalten.
- Sichtqualität, wirkliche FPS und GPU-Speicher auf einem Raspberry Pi mit 2–4 benutzerdefinierten GLB-Avataren, Spotlight, Nebel und Karaoke. Diese Punkte erfordern einen echten Test auf der Zielhardware.
