# Sonic Display V214 – Motion Plan Frame Optimization

- Motion-Prefetch-Planung wird nur neu gerechnet, wenn sich Takt, Phase, Avatar, Timeline, Motion-Bibliothek oder Lookahead-Einstellung ändern.
- Keine Neuplanung in jedem React-Three-Fiber-Frame (typischerweise bis zu 60 unnötige Planungen pro Sekunde und Avatar bei 60 FPS).
- Erhält die bisherige sofortige Aktualisierung nach Änderungen an Bibliothek oder Timeline, sofern deren React-State immutable aktualisiert wird.
- Planvergleich verwendet vollständige JSON-Daten statt eines potentiell kollidierenden zusammengesetzten Trennzeichen-Strings.
- Zusätzlicher Regressionstest: `npm run test:motion-plan-v214`.
- Keine Änderung an den gespeicherten Einstellungen oder Formaten der Choreografien.

## Prüfung

`npm run verify:offline` führt die statischen und funktionalen Regressionstests aus. Für `npm run typecheck` und `npm run build` müssen die npm-Abhängigkeiten installiert sein (`npm install`).
