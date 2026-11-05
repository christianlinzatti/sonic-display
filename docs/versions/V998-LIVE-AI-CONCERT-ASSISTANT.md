# V998 – Live AI Concert Assistant

## Bedienung

Unter **Live FX → V998 Live AI Concert Assistant** eine Anweisung formulieren, z. B.:

- „Mach die Bühne düsterer und zeige mehr Nahaufnahmen vom Rapper.“
- „Hardtekk: Neon-Atmosphäre, weite Festival-Kamera.“
- „Weniger Effekte und sanftere Kamerabewegungen.“

**KI befragen** sendet nur Anweisung und Genre an den serverseitigen Endpunkt `app/api/ai/live-concert/route.ts` und kann API-Kosten verursachen. Mit **Lokal entwerfen** arbeitet die App rein regelbasiert und ohne Netzwerkabfrage. Ohne hinterlegtes `OPENAI_API_KEY` gibt es keine KI-Abfrage; Offline-Entwürfe funktionieren weiter.

Die Vorschau zeigt die **tatsächlich durchführbaren Änderungen (vorher → nachher)**. Erst **Änderungen für die Show übernehmen** verändert die Einstellungen. **Letzte Live-Regie rückgängig** stellt den vorherigen Zustand nur wieder her, wenn derselbe Song läuft und seither keiner der vier beteiligten Reglerbereiche verändert wurde.

## Erlaubte Anweisungen

| Bereich | Änderbar | Grenzen |
| --- | --- | --- |
| Atmosphäre V885 | Farbpalette, Intensität | 4 Paletten, 0–75 %, nur wenn bereits aktiviert |
| Genre-Bühne V894 | Bühnenlook, Intensität | 4 Looks, 0–75 %, nur wenn bereits aktiviert |
| Kamera V992 | Stil und Intensität | 3 Stile, 0–75 %, nur wenn bereits aktiviert |
| Live FX V881 | Intensitätsobergrenze | 0–75 %, ausschließlich Reduktion gegenüber Ist-Wert |

Andere Regler werden nicht vom Assistenten verändert. Dies ist eine **virtuelle Einstellungsänderung**, keine direkte Effekt-Auslösung. Bereits vorhandene Schutzmechanismen für Lyrics, manuelle Show-Timelines, Blackout, reduzierte Bewegung und bestätigte Songabschnitte gelten unverändert. Die Regie selbst erzeugt weder Zeitpunkte noch BPM, Beatmessung oder Sängerzuordnung. Insbesondere lassen sich Bass-Schockwellen, Stroboskope, Spotify-Wiedergabe oder Govee-Geräte nicht direkt über die KI steuern.

Das **bewusste Einverständnis** ist pro Vorschlag erforderlich. Bei Songwechsel werden Anfrage, Vorschau und Rückgängig-Zustand verworfen; die übernommenen Nutzereinstellungen sind weiterhin reguläre lokale Einstellungen und keine nur für einen Song flüchtigen Parameter. Die Freigabe erfolgt für den momentan aktiven Song; die übernommenen Regler sind anschließend normale, persistente Nutzereinstellungen und werden beim nächsten Titel nicht automatisch zurückgesetzt.

## Architektur / Datenschutz

- `lib/liveConcertAssistantV998.ts`: reine Typ- und Whitelist-Normalisierung, lokale Stichwortplanung, identische Vorschau-/Apply-Transformation.
- `components/visualizer/LiveConcertAssistantV998.tsx`: per Track gemountete Oberfläche, AbortController für veraltete Anfragen, manuelle Zustimmung, die genaue diff-basierte Vorschau und Undo-Status.
- `components/visualizer/LiveFxDeckV881.tsx`: bestehende State-Owner; nur bekannte, bereits aktivierte virtuelle V885/V894/V992/V881-Einstellungen werden nach Freigabe über ihre bisherigen Normalisierer verändert. Single-camera, keine zusätzliche GPU-Schicht.
- `app/api/ai/live-concert/route.ts`: Same-Origin-Check, Spotify-Sessionprüfung, ≤ 4 KiB Payload, kurze Timeout-geschützte Responses-API-Anfrage, per-Session-Burstlimit, JSON-Schema + erneute Whitelistvalidierung. Kein `store`, keine eingehenden Lyrics, Audiodaten, Spotify-Tokens oder Historie beim KI-Anbieter. API-Schlüssel nur auf dem Server. App-Instanz-Burstlimit ersetzt nicht globales Rate-Limiting in einer WAF.

## Tests und Freigabe

`npm run test:v998`, `npm run test:v998:types`, `npm run verify:v998:focused`, `npm run check:syntax`, `npm run check:architecture`, `npm run typecheck`, `npm run build:next`.

Die V998-Suite deckt API-Authentifizierung, CSRF-Origin, 429, 502/503, manipulierte Antworten, Offline-Fallback, 10.000 sichere FX-Zustände und Integrations-Invarianten ab. Für eine Produktionsfreigabe sind außerdem ein vollständiger TypeScript-Check und der **Next.js-Produktionsbuild auf Node 24** erforderlich; lokal ohne installierte Projektabhängigkeiten nicht bestätigt.

## Veröffentlichung

Das vollständige ZIP `SonicDisplay-V998.zip` in `releases/` auf Branch `master` hochladen und den Projekt-Archive-Importer sowie die GitHub Actions prüfen. Der Importer importiert `.github/workflows` bewusst nicht: Änderungen an `v832-continuous-validation.yml` und die neue `v998-live-concert-validation.yml` müssen separat committed werden.
