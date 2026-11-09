# V1131 – Concert Story & Crew

## Start

Wie bisher: `npm ci`, Konfiguration anhand `.env.example` übernehmen und `npm run dev` starten.

Unter **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** die gemeinsame Regie einschalten. Ein Trio frei besetzen und auf der Bühne einrichten. Die Trio-Schaltfläche behält den intelligenten Modus jetzt bei, wenn er bereits aktiv ist. Andere bestehende Modi bleiben auswählbar.

## Die Show entwickelt sich über den Song

Ein gemeinsamer Dramaturgie-Baustein versorgt Tanz, Körperausdruck, automatische Kamera, Bühnenlicht und Lyrics. Wiederkehrende synchronisierte Textblöcke liefern Refrain-Hinweise. Der erste Refrain eröffnet die Show, weitere Besuche steigern die Intensität. Das letzte Zehntel eines bekannten Songs bekommt ein Finale, sofern gerade kein ruhiger Teil oder Aufbau vorliegt. Textpausen schaffen bewusst Kontrast.

Die Crew wechselt zwischen Solos, Tanzduellen, Ruf und Antwort und gemeinsamen Höhepunkten. Beim Tanzduell übernehmen zwei Figuren aktive Rollen; die Begleitung bleibt zurückhaltender. Kopf und Brust wenden sich dezent zum Partner. Arme antworten beatversetzt. Die Figuren behalten ihre Plätze; es gibt keine unkontrollierten Laufwege oder behauptete Handkontakte.

Automatische Kameras rahmen größere Gruppenmomente etwas weiter und verschieben den Blickpunkt sanft. Vorhandene manuelle, gespeicherte, geschützte oder gesangsbezogene Kameraeinstellungen behalten Vorrang. Die Lichtintensität folgt der gleichen Dramaturgie; Blackouts, manuelle Lichtsteuerung und Bewegungsreduktion werden respektiert. Refrains erhalten eine begrenzte zusätzliche Lyrics-Betonung in DOM und 3D.

## Neue Beinarbeit für alle elf Figuren

Jede Figur enthält vier zusätzliche, tatsächlich eingebettete Clips:

- **Side Glide:** seitlicher Schritt mit kleinem Fußhub.
- **Diagonal Step:** diagonale Vorwärtsschritte mit höherem Fußhub.
- **Heel-Toe:** rhythmische Vor-/Rück-Taps bei waagerechter Sohle.
- **Pivot Step:** kontrollierte Drehung des angehobenen Fußes; die Sohle bleibt eben.

Die Schritte werden mit gebackener Zweiknochen-IK erzeugt. Standfüße bleiben verankert, die Füße kehren weich zum Ausgangspunkt zurück. Diese Bewegungen sind prozedural erstellt, keine Motion-Capture-Aufnahmen. Die ursprüngliche Crew enthält jetzt 16, die Encore-Crew 22 und die Headliner 26 Clips – insgesamt 240 eingebettete Animationen. Auch gemischte Gruppen können die neuen gemeinsamen Schrittfolgen abspielen. Die übrige Genre-Auswahl und das Bewegungs-Gedächtnis bleiben erhalten; dichte Strophen bekommen nicht ständig zusätzliche Fußarbeit.

## Die Show ohne Spotify-Anmeldung prüfen

Die Browser-Tests verwenden weiterhin `tests/fixtures/concertMocksV1130.cjs`. Spotify, Genre und Lyrics werden im Browser abgefangen. Die Lyrics sind eigens geschriebener Testtext mit Wort- und Zeilenzeitmarken. Die Mocks unterstützen kontrollierte Positionen, Pause, Trackwechsel, fehlende Lyrics und Fehlerstatus. Produktive Spotify-/Lyrics-Routen bleiben unverändert.

In der normalen Oberfläche kann die 3D-Vorschau bereits geladene Lyrics verwenden:

1. **Show-Simulation öffnen**.
2. **Aktuelle Songposition übernehmen**; dies übernimmt die Position und schaltet die Abschnittswahl auf Lyrics-Ableitung.
3. **Show-Simulation starten**. Die Vorschau bleibt eine separate Probe und steuert Spotify nicht.
4. Positionen überspringen, Rollen und Showkapitel unter dem Canvas vergleichen. Für längere Songs wächst der Vorschau-Zeitraum bis maximal eine Stunde mit.

## Grenzen und Prüfungen

Die Regie ist lokal und regelbasiert. Wiederholte Lyrics sind ein Strukturhinweis, keine Audio- oder Drop-Erkennung. Es wurde keine zusätzliche Spotify-Audioanalyse und kein externes generatives KI-Modell eingebaut. Verfügbare echte Abschnitts-/Energiesignale werden weiter genutzt; fehlendes Tempo fällt wie bisher auf 120 BPM zurück.

- `npm run typecheck`
- `npm run test:v1131`
- Produktionsbuild: `SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build`
- Danach `npm run test:v1131:browser`. Lokal gegebenenfalls `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` voranstellen oder einen passenden Playwright-Browser installieren.

Assets reproduzieren: `blender -b -t 2 --python scripts/generate-sonic-avatars.py -- --ensemble`.

Quellcode, Assets, Test-Mocks, Lockfile und Prüfbericht sind in der ZIP enthalten. Abhängigkeiten, Build-Caches und Zugangsdaten sind nicht enthalten.
