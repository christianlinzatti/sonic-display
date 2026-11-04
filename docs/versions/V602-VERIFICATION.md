# V602 Verifikationsprotokoll – 26.10.2026

## Erfolgreich ausgeführt

- `npm run test:v602` – PASS, **40 Regressionstestgruppen und 31.200 deterministische Effekt-/Avatar-/Budget-Kombinationen**. Dies sind simulierte Policies, **keine** echten Raspberry-Pi-FPS oder GPU-Messungen.
- `npm run test:v602:types` – PASS, isolierte TypeScript-Prüfung der V602/V601/V479-Regeln.
- `npm run test:smoke:v602` – PASS, inklusive V601, V600, V599, V598, V479 und aktueller Architekturkontrolle (436 referenzierte Dateien).
- `npm run verify:v602` – PASS: die obige Smoke-Kette sowie V597 Lip-Sync, V596 Fußarbeit, V595 visuelle Regression, V572 Munddynamik, V589 GLB-Quellprüfungen und Quellcode-Syntaxprüfung.
- `npm run check:syntax` – PASS, **827 TypeScript-/TSX-Dateien** mit Import/Syntaxkontrollen.
- `npm run test:v552` – PASS, 43.200 deterministische Transparenz-/Draw-Call-Szenarien.
- `npm run test:v518` – PASS, 35.000 simulierte Beobachtungsrahmen und Sitzungsberichte.
- `npm run test:v569` – PASS, 33 Langzeit-/LOD-/Speicher-Sicherheitsprüfungen.

## Begrenzt / noch nicht ausgeführt

- `npm run build` / komplette `npm run typecheck` sind **nicht ausgeführt**; `node_modules` ist im Arbeitscontainer nicht installiert. Die isolierten V602-Typprüfungen ersetzen keine globale Next.js-Typprüfung.
- Kein Chromium-WebGL-Test mit tatsächlichen GLB-Avataren, kein echter Spotify-Livebenchmark.
- **Kein Raspberry-Pi-FPS-, Temperatur-, GPU-Verbrauchs- oder Speicherbenchmark.** V602 regelt ausschließlich auf Basis der bereits bestehenden V479-Messfenster (Browser-FPS/p95), die in den Tests kontrolliert simuliert wurden.
- Es liegen daher **keine nachgewiesenen FPS-Gewinne** oder visuell abgenommenen Verbesserungen vor. Für die Qualitätsfreigabe müssen mindestens dieselbe Konzertpassage und identische Modellanzahl vor/nach V602 am Zielgerät verglichen werden.

## Schutzgrenzen

Manuelles Renderprofil verhindert V602-DPR-Capping. Manuelle Licht-Timelines und `stageReactive=false` verhindern zusätzliche Shader-Dimmung. Projektionstext, Lyrics-Zeitstempel, Sängerzuordnungen, Foot-IK, importierte Animationen und V600-Vollsongregie sind nicht Teil der V602-Policy.
