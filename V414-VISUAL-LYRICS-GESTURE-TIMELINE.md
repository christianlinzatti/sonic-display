# Sonic Display V414 — Visual Lyrics & Gesture Timeline

Neue Oberfläche unter **Einstellungen → Anzeige → Rap Performance Editor**. Bei vorhandenem synchronisierten Spotify-Lyrics-Datensatz lassen sich Zeilen und — sofern Zeitstempel vorhanden — einzelne Wörter als Zeitanker anklicken.

- Pro Zeitanker: Kopf-, Arm- oder kombinierter Gestenakzent, Intensität 0–150 %, Dauer 120–1500 ms und optional ein Tanzclip aus dem explizit aktiven V412-Preset.
- **Vorschau:** Lyrics-Time-Slider und direkte Bewegungsvorschau im bestehenden GLB-Avatar oder schematischen Modell. Die Vorschau simuliert weiterhin Beat-Impulse und beeinflusst weder Spotify noch die Live-Besetzung.
- **Speicherung:** lokaler Browser-Speicher, strikt pro Spotify-Track-ID und Avatar-ID. Keine Lyrics-Texte oder Binärdateien im Speicher. Nur Zeitanker, Typ, Intensität, Dauer und Clip-ID. Speichern und Entfernen per Schaltfläche.
- **Live:** ausdrückliche Option „Gespeicherte Lyrics-Gesten … anwenden“ (standardmäßig aus). Es ist zusätzlich ein gültiges aktives V412-Live-Preset für genau diesen Avatar erforderlich. V413-Lyrics-Akzente und V412-Preset bleiben bestehen. Autorisierte Tanzclips werden innerhalb des Presets begrenzt überblendet.
- **Schutz:** keine Eingriffe in manuell bearbeitete Choreografien, pausierte Wiedergabe oder reduzierte Bewegung; keine erfundenen Wortzeitstempel. Ist keine synchronisierte Lyrics-Quelle verfügbar, zeigt der Editor einen Hinweis. Fehlende oder nicht mehr zum Lyrics-Timing passende Anker werden ignoriert.

## Prüfung

`npm run test:v414` — isolierte Logik-/Integrationsregression. `npm run check:syntax`, `npm run test:imports`, `npm run test:module-case`.

`npm install` und `npx tsc --noEmit && npm run build` auf einem Rechner mit vollständigen npm-Abhängigkeiten ausführen. Das vorliegende Offline-Paket enthält keine node_modules.
