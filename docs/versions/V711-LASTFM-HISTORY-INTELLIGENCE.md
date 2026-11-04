# V711 – Last.fm History Intelligence

## Ort und Nutzung

**Zuletzt gespielt → Last.fm-History → Deine Hörmuster entdecken**. Nach dem Einrichten eines Last.fm-Benutzers und dem Import bereits gespeicherter Scrobbles erscheint das neue Auswertungsfeld unterhalb der bisherigen V710-Langzeitübersicht. Ohne gespeicherte Ereignisse werden Nullwerte angezeigt.

- Zeitraum wählbar: letzte 30, 90 oder 365 rollierende Tage beziehungsweise gesamtes Archiv. Das wirkt auf Kennzahlen, Top-Songs, Top-Künstler, Tageszeit und Wochentag.
- Zeitzone wählbar: **Europe/Vienna** (MEZ/MESZ, echte Sommerzeitregeln) oder **UTC**. Betroffen sind Monatsgrenzen, Hörtage, Wochentage und Tageszeit.
- Top-Künstler: Anzahl archivierter Scrobbles, verschiedene Songs und verschiedene Kalendertage, jeweils höchstens 10 Ergebnisse.
- Top-Songs: Wiedergaben und aktive Tage, jeweils höchstens 10 Ergebnisse.
- Monatsübersicht: zwölf Kalendermonate mit Scrobble-, Künstler- und unterschiedlichen Songzahlen; unabhängig vom Auswahlzeitraum, inklusive Monaten mit Nullwerten.
- Künstlertrends: 30 Tage gegenüber den 30 Tagen davor; sechs stärkste Zunahmen und sechs stärkste Abnahmen. Die Trends verwenden stets die beiden rollierenden 30-Tage-Fenster, unabhängig vom Ranking-Zeitraum.
- Tageszeiten: 0–6, 6–12, 12–18, 18–24 Uhr in der gewählten Zeitzone.

## Datenschutz und Zählweise

Das Dashboard wertet nur das **bestehende lokale Last.fm-Archiv V706** aus, ohne Netzwerkzugriff oder Schreibzugriff. Die bestehenden Spotify-Statistiken und die V708/V710-Automatiken bleiben unverändert. Es werden **Scrobbles**, keine durchgängige Hörzeit, gezählt. Fehlende, privat gebliebene oder noch nicht nachgeladene Scrobbles beeinflussen die Kennzahlen; eine Verringerung eines Künstleranteils ist keine sichere Änderung des persönlichen Geschmacks. In V706 sind höchstens 8.000 Scrobbles je Konto gespeichert. Die Ranglisten gruppieren Künstler und Songnamen normalisiert, nicht über Spotify-IDs. Duett-Credits werden nicht semantisch auf einzelne Künstler aufgeteilt.

## Technische Umsetzung

- `lib/lastfm-intelligence-v711.ts`: deterministische, testbare reine Statistiklogik; validiert Einträge und akzeptiert maximal 8.000 Events.
- `components/LastFmIntelligencePanelV711.tsx`: clientseitige Darstellung aus dem übergebenen Archiv; Filter und Zeitzone sind temporärer UI-Zustand.
- `components/LastFmHistoryPanelV706.tsx`: Einbindung in bestehende Last.fm-Chronik.
- `app/globals.css`: responsives, mit Tastatur bedienbares Dashboard.
- `tests/v711-lastfm-intelligence-regression.cjs` und `tests/tsconfig.v711-*`: Grenzfall-, Zeitzonen- und Typprüfung.

Ein echter Last.fm-Live-Test und ein kompletter Next.js-Produktionsbuild bleiben bis zu installierten npm-Abhängigkeiten offen (siehe Verifikation).
