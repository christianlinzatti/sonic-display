# Sonic Display V283 – Lazy Stage Preview

Aufbauend auf V282, ohne Entfernen der bestehenden Funktionen.

## Änderung
- `StageThemePreviewGrid.tsx` lädt `StageThemeCardScene` und `StagePreviewModal` via `next/dynamic` mit `ssr: false` nach Bedarf.
- Beim Öffnen der Settings wird zunächst **kein** Thumbnail-WebGL-Canvas erzeugt. Die 3D-Miniatur wird erst bei Hover, Tastaturfokus oder Klick aktiviert.
- Nur eine Miniatur-3D-Szene gleichzeitig (Hover/Fokus vor aktivierter Karte). Während das große Modal geöffnet ist, ist die Miniatur abgeschaltet.
- CSS-Beat-Previews bleiben vor der 3D-Aktivierung sichtbar.
- Alle bestehenden Bühnen, Spots, Nebel, Kamera-Controls und Auswahlaktionen sind beibehalten.

## Verifikation
- `npm run verify:offline`: PASS.
- Neue Regression: `tests/v283-lazy-stage-preview-regression.cjs`: PASS.
- Syntaxprüfung: PASS.
- Der V282-Regressionstest wurde für zukünftige Versionen ab V282 geöffnet, ohne andere Prüfungen abzuschwächen.
- Voller `next build`: hier nicht durchgeführt, da `node_modules` in der Kopie nicht vorhanden sind.

## Erwartete Wirkung
- Weniger anfängliche Arbeit in den Settings und weniger gleichzeitig aktive WebGL-Kontexte.
- Die tatsächliche Byte-Einsparung im First-Load-Bundle wurde nicht gemessen; Next.js-Build und Browser-Performance bitte lokal prüfen.
