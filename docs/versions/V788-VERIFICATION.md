# V788 – Release- und Testnachweis

## Implementiert

- Eigenstaendige Qualitaetsbudget-Regeln mit 24-Frame-P95-Fenster, 2 langsamen/5 schnellen Fenstern und 72-Frame-Cooldown.
- Priorisierte Buehnen-Aenderungen: dekoratives Licht und DanceFX, **keine** Reduktion von Avatar-/Mundanimation, Lyrics, Kamera oder Saenger.
- Ausschliesslich lokaler V777-Konzertbenchmark per URL-Opt-in. Kein automatischer Eingriff in die produktive Spotify-Live-Show.
- Vier gegenlaeufige Browserlaeufe off/on/on/off, 3 Buehnen × 2/4 GLBs mit GPU-, Konfigurations- und SHA-256-Identitaetspruefung; JSON-/Markdown-Ausgabe und Browser-Diagnoseansicht.
- Fail-closed bei fehlenden Messungen, Software-Renderer, manipulierten Level-Logs, unterschiedlichen GLBs oder anderer Testkonfiguration.

## Erfolgreich in der aktuellen Umgebung ausgefuehrt

- `npm run test:v788`, `npm run test:v788:types`.
- `npm run test:v760` bis `npm run test:v787` einzeln (alle 28 Versionstests bestanden).
- `npm run test:v776:types` bis `npm run test:v787:types` einzeln (alle 12 isolierten Typpruefungen bestanden).
- `npm run test:v552`, `npm run test:v569` (GPU-/Lebenszyklusschutz).
- `npm run check:syntax` – 1.133 TS-/TSX-Quelldateien.
- `npm run check:architecture` – Release-Version V788, 814 Codepfade.
- `npm run check:lockfile:v752` – Lockfile und Abhaengigkeiten deklariert.
- `npm run test:module-case` – 1.923 Quelldateien ohne Dateinamenkollisionen.
- Kontrollierter Browserfall ohne Next.js-Server: Exitcode 2, Review `blocked`, 0 Ergebniszeilen, keine erfundenen GPU-Werte.

## Nicht nachweisbar in dieser Umgebung

- `npm run typecheck` **scheitert** wegen fehlender Laufzeit-/Typ-Pakete (`next`, `react`, `three`, `@types/react`, ...), 0 von 18 direkten npm-Paketen installiert. Aus den vielen fehlenden Modulen koennen keine abschliessenden Aussagen zu vollstaendigen produktiven Typen abgeleitet werden.
- `npm run build` mangels installierter Projektabhaengigkeiten nicht als bestanden verifiziert.
- Es laeuft hier kein vollstaendiger lokaler Next.js-Produktionsserver mit Chromium/echten GLBs. **Keine echten V788-FPS-Werte oder GPU-Einsparungen erhoben.**
- Keine visuellen oder Lip-Sync-Nahaufnahmen mit produktiven GLBs; der Governor bleibt darum nur in der Benchmark-Fixture.

Lokale Endabnahme: `npm ci && npm run typecheck && npm run build`; danach `npm run start` und `npm run benchmark:v788:governor -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb --target=45`.
