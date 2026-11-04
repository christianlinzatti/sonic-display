# V856 · Test-/Release-Status (01.11.2026)

**Erfolgreich ausgeführt**

- `npm run test:v856`, `npm run test:v856:types`, `npm run test:v856:ui-types`: Monatsanalyse, Zeitzonen, 90-Tage-Wiederentdeckungen, lesender Zugriff und Komponententypen.
- `npm run test:v855`, `npm run test:v855:types`, `npm run test:v855:ui-types`: bestehender Spotify-History-Explorer.
- `npm run test:v714` / `npm run test:v714:types`: jährliche Last.fm-Auswertung; vorhandene Funktionen unverändert.
- `npm run test:v701`, `npm run test:v701:types`: lokales Spotify-Archiv.
- `npm run test:v849`, `v850`, `v851`, `v852`, `v853`, `v854`: bestehende Festival- und Spotify-Connect-Regressionen.
- `npm run check:syntax` und `npm run check:architecture`.

**Nicht freigegeben / offen**

- `npm run typecheck`: innerhalb des verfügbaren Prüffensters ohne Ergebnis beendet. Nicht als bestanden bewertet.
- `npm run build`: gestartet, erste Preflight-Tests bestanden, Produktionsbuild aber nicht vollständig abgeschlossen (sehr lange Prebuild-Tests und keine vollständige lokale Installation der Projektpakete). Nicht als bestanden bewertet.
- `npm run test:v714:ui-types` (älterer isolierter Prüfkontext) meldet bestehende Typfehler in V729/V730/V732-Komponenten und einer unvollständigen Test-React-Deklaration (z. B. `key`-Attribute). Die neue V856-Komponente besteht ihren getrennten UI-Typecheck. Eine finale Typprüfung mit allen echten React-/Next-Abhängigkeiten bleibt notwendig.
- Browser-, 10-Zoll-Touch- und tatsächliche Last.fm-Konto-Abnahme nicht durchgeführt.

**Für lokale Freigabe:** `npm ci`, `npm run typecheck`, `npm run build`; anschließend Last.fm-Monat und Zeitzonenwechsel mit echtem Archiv testen.
