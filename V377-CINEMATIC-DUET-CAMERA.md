# Sonic Display V377 – Cinematic Duet Camera

Auf Basis des vollständigen V376-Projekts. Die Erweiterung nutzt die **bereits existierende R3F-Kamera**, das V376-Lyrics-Dialogsignal und die tatsächlich sichtbaren Bühnenanker von V326 bzw. der Duo-Formation. **Keine zusätzlichen Canvas, GLB-Reloads oder Lautsprecher-/Sprechererkennung.**

## Funktionsweise

- In Strophen fokussiert die Kamera den aktuellen visuellen Lead. Sie benötigt synchronisierte Lyrics mit echten Zeilenzeitstempeln und den aktivierten V376-Dialog.
- Im kurzen Übergabemoment zeigt sie beide Tänzer (Two-Shot), sofern beide sichtbar sind.
- Bei `hook` / `drop` weitet sich das Bild auf die sichtbare Gruppe. Das gilt auch in Textlücken, solange die Duettkamera eingeschaltet ist und mindestens zwei Tänzer existieren.
- Tatsächliche Szenenpositionen werden maximal etwa fünfmal pro Sekunde in der Kamera gelesen. Blenden und Grenzen werden im vorhandenen Kamera-Update verarbeitet, dadurch ohne zusätzliche React-Render pro Frame.
- Mit `holdCinematicDuetShotV377` sind versehentliche schnelle Schnittwechsel reduziert; Pausen, Rückwärtsseeks und größere Zeitsprünge löschen den Kamerahalt.
- V369-Vocal-Close-up tritt bei aktiver V377-Kamera zurück; bei Abschaltung übernimmt wieder die bisherige Automatik. Danach gelten weiterhin V351-Lyrics-Schutz und die vorhandene Kamerasicherheit.

## Einstellungen

Settings > Avatar & Tanz > V376 Interaktive Vocal-Duette > **V377 Cinematic Duet Camera**.

- **Aus** (Standard): keine Änderung gegenüber V376.
- **Dezent**: stärkere Zurückhaltung und weichere Kamerafahrten.
- **Filmisch**: klarere Lead-Nahaufnahmen, Zweieraufnahme bei Übergaben und Gruppenbilder für Hooks/Drops.
- Intensität: 0–100 %.

Der V373-Inspector zeigt den geplanten Shot für ausgewählten Abschnitt und 1/2/4 Tänzer. Er ist eine Simulation, kein Echtzeit-Screenshot.

## Prioritäten und Grenzen

Live-Kameraeditor, manueller Kameramodus, gespeicherte Kamerapresets/-Keyframes, ausdrücklich authored Show-/Duo-/Gruppenskripte und reduzierte Bewegung überschreiben bzw. deaktivieren V377. Zusätzlich verhindern `guardAutomaticCameraV351` und geringe Winkel-/Zoom-Grenzen, dass automatisch gesteuerte Einstellungen Lyrics vollständig verdrängen. Kein Sprecher-Diarization, keine Stimmtrennung und keine Wort-Timing-Schätzung. Die Zuordnung betrifft die **visuelle Lead-Rolle**, nicht identifizierte Musiker.

## Verifikation

`npm run check:syntax` und `npm run test:v377` benötigen keine npm-Installation, sofern der bereits gebündelte Testlader verfügbar ist. `npm install && npm run verify` führt auf einem vollständigen System zusätzlich Typprüfung und Next.js-Build aus. Das Release enthält bewusst keine installierten npm-Abhängigkeiten und keine package-lock.json; ein vollständiger Build ist in diesem Container ohne diese Abhängigkeiten nicht verifizierbar.
