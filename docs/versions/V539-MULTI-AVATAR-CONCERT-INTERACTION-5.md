# V539 – Multi-Avatar Concert Interaction 5.0

## Implementierung

- Erweitert nach V517/V527 die vorhandene 2-, 3- oder 4-Avatar-Bühne um kurze gezielte Blickkontakte zwischen **bestätigten** Lead-/Feature-Sängern und aufmerksam reagierenden Crew-Mitgliedern.
- Reagiert nach einem explizit zugeordneten Handoff innerhalb von ~900 ms; später erlischt der Gestenimpuls.
- Bei gemeinsamen Hooks erhalten die Darsteller gedehnte Phrasen-Akzente statt Zucken im Silbentakt; in einer automatisch zusammengestellten Crew rein **visuell**, ohne Sängerzuschreibung.
- Abstandsprüfung für Blicke (.9–5.5 Bühnen-Einheiten), sanfte Ein- und Ausblendung an den Grenzen der verifizierten Vocals, begrenzte Drehwinkel (<=.028 rad), Risikoabsenkung durch V506/V508.
- Ausführung im bestehenden `useFrame`: keine zusätzlichen Timer, Mixer, API-Aufrufe, WebGL-Renders oder zusätzlichen Dateien beim Import. Kein Einfluss auf Positionierung, GLB-Animationen, Lip-Sync oder Fußkontakt.
- Fail-closed bei fremdem Track, fehlenden Cast-Daten, inaktiver Wiedergabe, reduzierter Bewegung, manueller Choreografie, ungültigen Positionen und niedriger Renderstufe.

## Grenzen

Die Interaktion beruht auf V385/V416/V496 **vom Nutzer zugeordneten** Sängern. Sie leitet aus Spotify-Credits oder Lyrics ohne Attribution **keine** Sängeridentitäten oder Vocal-Timestamps ab. Die technischen Tests ersetzen keinen optischen Test mit den installierten fünf GLB-Avataren und mehreren echten Tracks.

## Prüfung

`npm run test:v539` und `npm run test:v539:types`; dazu `npm run check:syntax`, `npm run check:architecture`, Regressionen V517/V527/V538 und kompletter Next.js-Build bei installierten Abhängigkeiten.
