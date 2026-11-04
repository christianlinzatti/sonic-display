# Sonic Display V747 – Cinematic Camera Director

**Quelle:** V746, kein eigenständiger Kamera-Renderer. Der neue `performanceCameraDirectorV747.ts` komponiert eine kleine additive Kamerakorrektur auf der vorhandenen R3F-Kamera in `StageCameraDirectorV289.tsx`.

## Ablauf und visuelle Wirkung

- **Rap / gesungene Passage:** Ein kleiner, weich einblendender Fokus auf die mit V528 *bestätigte* Sängerrolle. Eine Tanz-Lead-Rolle allein ist kein Nachweis einer Gesangsrolle.
- **Duettwechsel:** Bei ausdrücklich zugeordnetem Sängerwechsel eine begrenzte, weiche Kameraversetzung.
- **Hook:** Gemeinsames Ensemblebild aus dem aktuell bestätigten V604-Songabschnitt.
- **Drop:** Weitwinkelakzent und dezenter Kamerahöhenimpuls bei einem verifizierten Drop.
- **Build-up:** Leicht ansteigende Kamera. **Break:** ruhigeres Ensemblebild. **Verse ohne gesicherte Stimme:** konservativer Bühnenausschnitt statt erfundener Sänger-Nahaufnahme.

Die neuen Einstellungen unter *Avatar & Tanz → Cinematic Camera Director V747* sind dauerhaft: Aktivierung, Stärke, Sängerfokus, Gruppenbilder sowie die Dauer der weichen Einblendung.

## Vorrang und Sicherheitsgrenzen

1. Authored shots, Live-Editor, Keyframes, Timeline, manuelle Kamera und reduzierte Bewegung gehen vor. Das gilt auch für einen gestoppten Song und Qualitätsstufe `low`.
2. Der Planer akzeptiert nur eine zum aktuellen Track passende aktive V528-Szene oder einen zum Playback-Zeitpunkt passenden V604-Akt mit Quelle `verified-v600`; andernfalls bleibt der zusätzliche V747-Effekt aus.
3. Ein Sängerwechsel wird gehalten statt abrupt geschnitten. Der Zustand wird bei Trackwechsel, rückwärtsgerichtetem Seek, langer Zeitsprungunterbrechung, Pause oder Verlust gültiger Evidenz bereinigt.
4. Die bestehenden V550/V540-Projektionsmessungen prüfen die gesamte sichtbare Besetzung (auch Köpfe und Füße), bevor eine neue Kameraposition angenommen wird. Jede Verschlechterung führt zurück zum ursprünglichen Bild. Bei aktiviertem Lyrics-Schutz entfällt zusätzlicher horizontaler Schwenk.
5. Die Reihenfolge bleibt V633 → V682 → V655 → **V747** → V351, wobei V351 die **finale** Lyrics-Schutzprüfung bleibt. Es gibt keine zweite Kamera, keine weiteren `useFrame`-Schleifen und keine neue Spracherkennung.

## Einschränkungen

Die Kamera kann nur auf verifizierte Signale reagieren, die von der bisherigen Pipeline geliefert werden. Ohne Sängerzuordnung können bei einem Song weiterhin Gruppenbilder aus validierten Songabschnitten erscheinen, jedoch keine Sänger-Nahaufnahmen. Für den visuellen Nachweis von Ausschnitt, Crop und Bewegung am tatsächlichen Avatar-GLB ist ein Browser- und GPU-Test erforderlich. Die isolierten Tests enthalten synthetische Kamera- und Ankerdaten, keinen echten Bühnenrender.

## Verifikation

`npm run test:v747`, `npm run test:v747:types` sowie `npm run verify:v747`. Vor der produktiven Verwendung außerdem `npm ci`, `npm run typecheck` und `npm run build`. Siehe `V747-VERIFICATION.md`.
