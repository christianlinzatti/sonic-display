# V198 – Smart Choreography Evolution

Auf Basis von V197. In der Character Motion Library kann pro Charakter und Phase (verse/build/drop/break) eine Reihenfolge aus bis zu zwölf installierten Motions festgelegt werden. Ein Klick auf „Sequenz vorschlagen“ erstellt eine deterministische Auswahl aus installierten Clips; es werden keine neuen Animationen generiert. Jede Motion läuft für eine konfigurierbare Anzahl Takte. Der Live-Player verwendet die vorhandenen Clip-Preloads und Crossfades; manuell aktivierte Sequenzen haben Vorrang vor V196/V197-Einzelzuordnungen. Bei ausgeschalteter Option gilt die frühere Auswahl. Lokale Browser-Speicherung. BPM ist nur ein angenähertes Zeitraster, keine direkte Spotify-Audioanalyse.

## Tests
`npm run test:evolution`, `npm run check:syntax`, `npm run typecheck`, `npm run build`. Letztere erfordern installierte npm-Abhängigkeiten.
