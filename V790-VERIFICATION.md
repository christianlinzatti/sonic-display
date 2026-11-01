# V790 – Prüfbericht, 31.10.2026

## Bestanden

- `npm run test:v790` – nachgewiesener V604/V761/V671/V679-Szenenabgleich, Haupt- und Nebenhöhepunkte, Build-Antizipation, Break-Kontrast, manuelle Priorität, protected lyrics, Track-/Zeit-/Seek-Validierung, inaktiver Fallback, V670-Schutzkette.
- `npm run test:v790:types` – isolierter strenger TypeScript-Check der neuen Regielogik.
- `npm run test:v789`, `npm run test:v789:types` – unveränderte Lichtarchitektur und isolierter Typcheck.
- `npm run test:v788`, `test:v787`, `test:v786`, `test:v785`, `test:v784` – ältere Performance-, Kamera-, Lyrics- und Governor-Regressionen.
- `npm run test:v761`, `test:v670`, `test:v671`, `test:v679`, `test:v681` – vorhandene Szenen-/Songregie und Qualitätsschutz. V671/V679/V681-Strukturtests wurden ausschließlich für die zusätzliche V790-Zwischenstufe erweitert; die funktionalen Assertions blieben bestehen.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:lockfile:v752` – bestanden.

## Hier nicht abgeschlossen

- `npm run check:dependencies` meldet 0/18 installierte direkte npm-Abhängigkeiten (u. a. React, Next.js, Three.js, R3F und Typdefinitionen). Es handelt sich um eine unvollständig eingerichtete Build-Umgebung.
- Der vollständige Projekt-`npm run typecheck` konnte hier nicht erfolgreich abgeschlossen werden; ein Versuch hat das Ausführungszeitlimit überschritten.
- `npm run build` und echte WebGL-/GLB-GPU-Abnahme wurden in dieser Umgebung nicht ausgeführt. **Kein vollständiges Produktiv-Build-Zertifikat.**

## Nötige lokale Abnahme

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

Anschließend einen Track mit importierter V318-Songstruktur (Verse, Hook, Build, Drop, Break) prüfen. Erwartet: `data-v790-evidence=verified-show`, ein Haupt-Peak, sanfter Build-Aufbau und zurückhaltende Breaks. Bei fehlenden bestätigten Abschnitten muss `off` erscheinen; manuelle Kamera-/Licht-/Tanz-Aktionen, Lyrics und Lip-Sync bleiben unverändert. Live mit realen 2/4 GLB-Avataren auf mehreren Bühnen und `/diagnostics/concert-benchmark` validieren.
