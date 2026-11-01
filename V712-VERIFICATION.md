# V712 – Verification / Freigabestatus

Stand: 29.10.2026. Ausgangspunkt: vollständige V711-Quellen.

## Bestandene Tests

| Prüfung | Kommando | Ergebnis |
|---|---|---|
| V712 Fach- und Robustheitstests | `npm run test:v712` | PASS, **79 Gruppen** und **12.000 ungültige Events** zurückgewiesen |
| Isolierter TypeScript-Kern | `npm run test:v712:types` | PASS, Exit 0 |
| Isolierter UI-TypeScript-/JSX-Check | `npm run test:v712:ui-types` | PASS, Exit 0 |
| Vollständiger Schnelltest | `npm run test:quick` | PASS, Exit 0, Versionen **V669–V712** inklusive Architektur/Syntax/Modulkollisionen/Sicherheitskontrollen |
| Source Syntax / Importbindungen | `npm run check:syntax` (im Schnelltest) | PASS, 992 TS/TSX-Dateien |
| Architektur | `npm run check:architecture` (im Schnelltest) | PASS, 646 Codepfade |
| Windows-/Linux-Dateinamen | `npm run test:module-case` | PASS, 1.676 Quelldateien, keine Case-Kollision |
| Test-Typisolation | `npm run check:test-types` | PASS, 8 isolierte test-only Deklarationen |
| Spotify-Konfigurations-/OAuth-Sicherheit | `npm run test:env:spotify-build` | PASS |

## Tatsächlich versucht, jedoch blockiert

- **`npm run build`**: Exit 1 bei `check:dependencies` vor Next.js: **0 von 17 direkten npm-Paketen** installiert und **kein `package-lock.json`**. Im Projektverzeichnis `npm install` durchführen, dann Check und Build wiederholen.
- **`npm run typecheck`**: Exit 2, weil produktive Next.js-, React-, Three- und Node-Module/Typdeklarationen fehlen. Isolierte V712-Checks erfolgreich, ersetzen nicht den projektweiten Check.
- **Echte Browser-/Last.fm-Abnahme**: nicht erfolgt; ohne installierte Abhängigkeiten und private Konto-/API-Schlüssel keine Live-Anbindung oder mobile visuelle Abnahme.

## Release und Datenqualität

- Vollständiger Quellcode mit Tests/Dokumentation gepackt; keine npm-Abhängigkeiten, Tokens oder `.env.local` enthalten.
- Auch ein gefüllter lokaler V706-Verlauf ist auf 8.000 Ereignisse beschränkt. Persönliche Wrapped-Zahlen sind **nur archivierte Scrobbles**, nicht Hörminuten oder ein nachgewiesener vollständiger Jahresverlauf.
- Aktives **Spotify Scrobbling** auf Last.fm bleibt allein für das Senden verantwortlich. Sonic Display liest und synchronisiert die Scrobbles lediglich; V712 fügt **keinen** neuen Scrobbler hinzu.

## Nachabnahme am Zielrechner

1. Im Projektordner `npm install` ausführen und `package-lock.json` prüfen/einchecken.
2. `npm run test:quick && npm run typecheck && npm run build` vollständig und erfolgreich ausführen.
3. Last.fm-Schlüssel in `.env.local` hinterlegen, reales Last.fm-Konto testen und Zeiträume um Jahres- und Sommerzeitwechsel visuell prüfen.
4. Im echten Browser 10-Zoll- und Mobilansicht, leeres Archiv, große Historie und Kontowechsel durchgehen.
