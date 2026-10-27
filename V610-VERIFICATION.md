# V610 – Verifikationsprotokoll (26.10.2026)

**Projektbasis:** vollständiges V609-Release mit 2.360 Dateien, als lokaler Quellstand nach V610 kopiert. 

## Erfolgreich ausgeführt

- `npm run test:v610`: **46 Gruppen, 30.000 deterministische, begrenzte Genre-/Songzeit-Samples** für Deutschrap, Hardstyle und Hardtekk. Schutz: Track/Dauer/Songabschnitt, Genre-Mismatch, manueller Tanz/Kamera/Licht, Low Tier, Reduced Motion, Pause, echte Kick-Unterstützung für Drops, Lyrics, Wiederholung/Determinismus und echtes Runtime-Wiring.
- `npm run test:v610:types`: **PASS** – isolierter TypeScript-Core-Check.
- `npm run test:smoke:v610`: **PASS** – einschließlich V352-Genre-Regression, V609-Szene, V608-Licht, V607-Duett, V604-Gesamtdramaturgie, V600-Regie und `check:architecture`.
- `npm run verify:v610`: **PASS** im ersten vollständigen Durchlauf (`/mnt/data/v610-verify.log`); er enthielt zusätzlich V606-Kamera/Lyrics, V599-Duett, V597-Lip-Sync, V596-Fußarbeit, V595-Bildregression, V572-Deutschrap-Mundbewegungen, V589-GLB und `check:syntax`. Ein späterer redundanter Wiederholungslauf wurde durch die Ausführungszeitgrenze unterbrochen, **ohne einen Testfehler nachzuweisen**. Danach alle Zusatztests unten einzeln erneut ausgeführt.
- Erneut getrennt **PASS**: `test:v606`, `test:v599`, `test:v597`, `test:v596`, `test:v595`, `test:v572`, `test:v589`, `test:v528`, `test:v540`, `test:v550`, `test:v585`, `test:v605`, `test:v352`, `test:v610:types`, `check:architecture`, `check:syntax`.
- `check:syntax`: **834 TS-/TSX-Dateien**, Imports/Syntax ohne gemeldete Fehler.
- `check:architecture`: 461 gültige referenzierte Projektdateien und zehn Architekturabschnitte.
- Altere Kamera-Strukturregressionen V528/V540/V550/V585/V605/V606 suchen jetzt den echten Guard-Eingang `genreFramedV610`, behalten aber alle vorherigen Reihenfolgen-/Schutzprüfungen bei. V352 historische Release-Whitelist wurde durch einen zukunftssicheren Versionsformatcheck ersetzt; dessen eigentliche Genreprüfungen blieben erhalten.

## Nicht ausgeführt / nicht nachgewiesen

- Kein vollständiger `next build` oder `tsc --noEmit` für die **gesamte App**, weil die für React/Next/Three benötigten `node_modules` nicht im Projekt-Container installiert sind. Die isolierten Core-Typechecks und alle Syntaxprüfungen sind **kein Ersatz** für eine vollständige Buildprüfung.
- Keine echten Spotify-/GLB-/Chromium-Videos der Gesamtshow. Künstlerische Verbesserungen und dauerhaftes 30/60-FPS-Verhalten sind im realen Browser **nicht nachgewiesen**.
- Keine Raspberry-Pi-Hardwaremessung: Es ist noch keine Hardware angeschafft. Die Plattformauswahl sollte erst nach dem geplanten universellen V618-Hardwarebenchmark erfolgen.
