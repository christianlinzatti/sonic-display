# Sonic Display V358 – Adaptive Show Learning

V358 baut auf V357 auf und ergänzt **optionale, lokale, begrenzte Langzeitpräferenzen** für automatische Regieentscheidungen. Ziel ist, wiederkehrend günstige Kombinationen von Kamera und Tanzformation künftig gelegentlich vorzuziehen, ohne den deterministischen V356-Planer, die V357-Qualitätskorrekturen oder manuell verfasste Shows zu ersetzen.

## Bedienung

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V358 – Adaptive Show Learning`

- **Aktivierung explizit erforderlich** (Standard: deaktiviert, unabhängig von den früheren Regiefunktionen).
- Modi: Aus, Vorsichtig, Ausgewogen. Schwellenwert: 3–12 geeignete Messungen pro Kombination, Standard 4. Maximaler Einfluss: 5–40 % der absoluten Songphrasen, Standard 25 %.
- Einsicht in die aggregierten Stichprobenzahlen, gemessenen Durchschnitts-FPS und **heuristischen** V357-Planungsscores.
- Simulation aktueller Präferenzen, ohne Live-Messwerte zu erzeugen oder Trainingsdaten zu verändern.
- Einstellungen zurücksetzen oder die vollständige Lernhistorie mit Bestätigung lokal löschen.

## Architektur

- `services/stageContent/adaptiveShowLearningV358.ts` ist die reine, synchron aufrufbare Policy für Datenvalidierung, lokale Persistenz, Kontextklassifizierung, Training und konservatives Cue-Ranking.
- `components/visualizer/ThreeAvatar.tsx` beobachtet vorhandene Songpositions-Updates und übernimmt abgeschlossene, zusammenhängende Phrasen. Erst **beim Übergang zur unmittelbar nächsten Phrase** wird ein Datensatz übernommen, wenn mindestens 65 % der alten Phrase beobachtet wurden und die vorhandene Render-Diagnostik höchstens vier Sekunden alte, plausible FPS- und P95-Framezeitwerte hat. Es gibt weder neue Timer noch zusätzliche Canvas-/WebGL-Instanzen.
- `components/visualizer/AdaptiveShowLearningSettingsV358.tsx` bietet Einstellungen, Statistik, Simulation und Löschfunktion über den bisherigen Galerie-Vorschaubereich.
- Nur aktive automatische V356/V357-Szenen mit verlässlicher Spotify-Position werden beobachtet. Keine Aufzeichnung bei Pause, reduzierter Bewegung oder manueller Timeline. Die eingegebene Track-ID wird ausschließlich **flüchtig im laufenden Browser-Tab** benutzt, um zusammenhängende Phrasen zu erkennen.
- Gespeichert werden ausschließlich maximal 64 aggregierte Kombinationen aus **normalisiertem Genre**, Songabschnitt, grober Inhaltsbelegung, Solo/Gruppe, Kamerashot, Formation, Beobachtungszahl, aufsummierten FPS- und Heuristikwerten sowie Zeitstempel. Kein Song, Titel, Lyrics-Text, Bild, Audio oder Rohbildrate wird mitgespeichert. Speicherung nur im lokalen Browser-Speicher (`localStorage`), keine Netzwerkanfrage.
- Pro Datensatz werden höchstens 120 Beobachtungen gewichtet. Historien-Importe aus dem Speicher werden strikt begrenzt und bereinigt. Wenn Speicher nicht verfügbar ist, ist der Lernmodus nicht persistent und schlägt fehl, ohne die Show abzubrechen.

## Was ist ein Messwert – und was nicht?

Der FPS-/P95-Wert stammt aus den bereits laufenden realen Render-Metriken. Die V357-Zahl ist dagegen **eine Heuristik der geplanten Show**. Für die lokale Präferenzwertung wird ein klar dokumentierter Mix von 55 % Heuristik und 45 % gemessener Performance verwendet; er ist keine trainierte KI und kein Beleg für subjektive Qualität. Die FPS-Messung ist eine **Momentaufnahme zum Phrasenende** und kann von Gerät, anderen Programmen und der restlichen Szene beeinflusst sein. Deshalb ist das Ergebnis höchstens ein schwaches Präferenzsignal.

## Sicherheitspriorität

1. Eine manuell gespeicherte und passende V354-Show-Timeline, eine pausierte Show oder reduzierte Bewegung verhindert V358 vollständig.
2. V358 verändert **keine** Licht- oder FX-Gains. V351-Lyrics-Schutz, V355-Performance- und Sicherheitsbudgets sowie der V357-Planer gelten unverändert.
3. Bei Lyrics sind nur `wide`/`medium` Kameraperspektiven lernfähig; bei einzelnen Avataren nur `solo`-Formation. Unpassende Beobachtungskontexte werden niemals vermischt.
4. V358 setzt nur bei genügend historischer Evidenz, klarem Abstand zur bestehenden Wahl und höchstens einer festen absoluten Phrase pro konfigurierter Quote einen neuen automatischen Vorschlag. Bei Unsicherheit bleibt die bisherige V357-Entscheidung bestehen. Dieser absolute Phrasenindex macht Suchvorgänge reproduzierbar.
5. Neue Speicherstände ändern keine früher manuell eingestellten Kamera-Presets, Import-Motions oder Show-Clips.

## Tests und Grenzen

`npm run test:v358` deckt Opt-in, Kontextbildung, Datenbegrenzung, ungültige/fremde Felder, frische Render-Messwerte, Beobachtungsdauer, Sicherheitsvorrang, manuelle Regie, Speicherfehler und Löschung ab. `npm run verify:offline` enthält außerdem die bestehenden V265–V357-Tests.

**Keine** Messung wurde auf echter 10-Zoll-Hardware / Raspberry Pi durchgeführt. Ein vollwertiger Next.js-Build und der vollständige projektweite TypeScript-Check bleiben ohne die npm-Pakete und ein installiertes `node_modules` ausstehend. Auf dem Zielrechner: `npm install` und `npm run verify`.
