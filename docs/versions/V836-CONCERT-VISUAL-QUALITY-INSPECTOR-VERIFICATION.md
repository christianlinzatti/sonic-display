# V836 – Concert Visual Quality Inspector 2.0: Verifikation

**Ausgangsbasis:** V835 – Display Performance Studio  
**Version:** `0.1.0-v836`  
**Status:** Integrationsstand, **keine produktive Freigabe**

## Neu

- `components/visualizer/concertVisualQualityV836.ts`: funktionaler, deterministischer Live-Geometrie-Inspector (nur Auswertung).
- `components/visualizer/ConcertVisualQualityInspectorV836.tsx`: UI im bestehenden V751 Concert Quality Dashboard.
- Fünf Prüfgebiete: Kopfposition/Kamerarand, Gruppenkomposition und Kopfabstände, projizierter Körper/Fußknochen, DOM-Lyrics-Schutzbereich, Kopfpositionsänderung in aufeinanderfolgenden Messfenstern.
- Keine Neuaufnahme und keine automatischen Änderungen an Kamera, Licht, Lyrics, Gesichtsanimation oder Rendering.
- Keine Freigabe ohne Belege: `unverified` zählt **nicht** als bestandene visuelle Prüfung. Auch unauffällige Projektionen begründen **keine** gesamte Bildabnahme.
- Bis zu 24 aktuelle Messfenster im lokalen Arbeitsspeicher, ohne Songtitel oder Identifikatoren.
- Bestehende V829/V830-Abnahme bleibt unverändert die Freigabeautorität.

## Grenzen der Messung

Die Eingaben stammen aus der freiwilligen bestehenden V466/V754-WebGL-Probe. Gemessen werden nur auf Canvas und DOM projizierte Positionen. Die Prüfung kann **nicht** beweisen, dass Avatare pixelgenau sichtbar sind, ob ein Kopf von anderer Geometrie verdeckt wird, ob Lyrics tatsächlich lesbar sind, welchen Kontrast oder welche Lichtstimmung ein Frame hat, ob die Lippensynchronität stimmt oder ob ein Kameraschnitt gestalterisch gut ist. Ein größerer Positionssprung wird als Hinweis auf einen *zu überprüfenden* Wechsel ausgewiesen und nicht als bewiesener Fehler. Ein `clear`-Prüffeld bedeutet lediglich, dass in dieser Art Projektion keine Auffälligkeit erkannt wurde.

## Durchgeführte Tests

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v836` – 62 Testgruppen | PASS |
| `npm run test:v836:types` – isolierter strikter TS-Check | PASS |
| `npm run check:syntax` – 1207 TS/TSX-Dateien | PASS |
| `npm run check:architecture` – 933 Referenzen | PASS |
| `npm run test:module-case` – 2048 Quelldateien, case-insensitive Namenskollisionen | PASS |
| `npm run test:v800` bis `test:v835` – 36 Suiten (getrennte Durchläufe) | PASS |
| `npm run doctor:v831` | BLOCKED: lokale TypeScript- und Next.js-Dependencies fehlen |
| `npm run verify:production:v831` | BLOCKED, wie vorgeschrieben |
| Vollständiger `npm run typecheck` | NICHT ABGESCHLOSSEN (24-Sekunden-Limit, Exit 124) |
| `next build` | NICHT GETESTET: kein installiertes `next`, keine `node_modules` |
| Live-WebGL-/GLB- und GPU-Qualitätstest | NICHT GETESTET: benötigt echten laufenden Konzert-Renderer |

Historische Tests V830–V835 enthielten feste Obergrenzen der erlaubten Paketversion, die für V836 angepasst wurden. Die fachlichen Validierungen der Tests wurden nicht abgeschwächt.

**Für die Produktionsfreigabe:** In einer Umgebung mit installierten Abhängigkeiten `npm ci`, `npm run verify:production:v831` sowie echte Konzerttests in V829/V830 ausführen. Erst dann dürfen Build- und GPU-Abnahme als erfolgreich bezeichnet werden.
