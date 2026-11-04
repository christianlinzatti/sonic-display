# Sonic Display V470 – Rock, Pop & Genre Fusion

Aufbauend auf V469 (Expanded Genre Intelligence) und V468 (Reactive Visual Performance).

## 34 Genre-Profile

Die ursprünglichen Rock- und Pop-IDs bleiben erhalten. Für Rock wurde lediglich das sichtbare Label von „Rock / Metal“ in „Rock“ geändert, da Metal seit V469 eine eigene ID besitzt.

**Sieben neue Stile:** Pop-Rock (`poprock`), Indie-Rock (`indierock`), Alternative Rock (`alternativerock`), Punk-Rock (`punkrock`), Indie-Pop (`indiepop`), Electro-Pop (`electropop`) und Dance-Pop (`dancepop`).

Alle sieben sind enthalten in:
- `config/musicGenres.ts` – Last.fm-Aliasnamen, Labels, Avatar- und Lichtfarben, Familienzuordnung.
- `services/stageContent/genreVisualDirectorV352.ts` – unterscheidbare Kamera-/Licht-/DanceFX-/Farbprofile.
- `components/visualizer/adaptiveGenreDance.ts` – unterschiedliche BPM-/Energie-/Tanzprofile.
- `components/visualizer/genreSpecificDanceIntelligence.ts` – Ranking vorhandener installierter GLB-Motions; keine generierten Motion-Dateien erforderlich.
- `components/visualizer/lightingGenreProfiles.ts` – neue manuelle Licht-Presetzuordnungen mit Fallback auf die ursprüngliche Pop-/Rock-Familie.
- Alle bestehenden, registry-basierten Genre-Auswahllisten.

## Automatische Genre-Fusion

`services/genre/genreIntelligence.ts` erkennt zwei Genre-Hinweise aus **verschiedenen** Last.fm-Tags, sofern beide eine ausreichende Evidenz haben. Die Mischung beträgt für den zweiten Stil 20–42 %. Zu schwache, nullgewichtete und aus einem zusammengesetzten Tag abgeleitete Hinweise erzeugen keine künstliche Mischung. Ein generisches Elterngenre und sein Untergenre bilden keine Fusion.

Beispiele: `pop + rock`, `deutschrap + trap` oder `hardtechno + schranz`, wenn Last.fm jeweils zwei hinreichend starke unabhängige Tags liefert.

Der API-Response `/api/genre` enthält zusätzlich `fusion`, mit `primary`, `secondary` und `secondaryWeight`. Der Haupt-Genre-Identifier bleibt bestehen, damit alte Künstler-/Avatar-/Lichtzuordnungen gültig bleiben. `useGenreDetection`, `MusicContext`, `VisualizerContext` und `VisualizerStage` übertragen die Fusion an den laufenden Genre Visual Director. Eine **manuelle Genre-Korrektur** deaktiviert die automatische Fusion für diesen Song.

Die Bühnenregie interpoliert ihre Genre-Paletten, Licht-/Beam-Stärken, Effekte, Kamera- und Foto-Bewegung zwischen beiden Stilen. Die bisherige Priorität von Lyrics, Pausenzustand, „Reduzierte Bewegung“ und manuell ausgewählter Bühne bleibt bestehen. Die Stage-Theme-ID des dominanten Genres bleibt bestehen (kein zusätzlicher Renderpass).

Das Adaptive Genre Dance Studio interpoliert bei Auto-Modus Energie, Aggressivität, Variation und die Vorschau-BPM, nutzt aber weiterhin ausschließlich installierte und zugelassene GLB-Clips. Echt gemessene bzw. manuell vorgegebene BPM schlagen die Profileinschätzung. Explizite manuelle Dance-Overrides haben Vorrang.

## Einstellungen und Vorschau

Im Genre Visual Director gibt es die neue Option **„Genre-Fusion automatisch mischen“** (standardmäßig aktiviert); für die Simulation lässt sich ein zweites Genre auswählen. Die Fusion-Vorschau ändert nur die simulierten Cues, nicht die Wiedergabe. Das Music-Animation-Panel zeigt bei erkannter Fusion beide Genres und den Anteil des Zweitstils an. Der gleiche Schalter steuert die Fusion des Adaptive Genre Dance Studio.

## Grenzen

- **Last.fm liefert Tags, keine musikalischen Stems.** Die Kombination ist eine heuristische Show-Gestaltung, keine verlässliche zeitliche Genre-Segmentierung im Track.
- Ohne `LASTFM_API_KEY` kann man Genres weiterhin manuell wählen, eine automatische Last.fm-Fusion ist dann nicht verfügbar.
- `fusion` ist keine neue persistente Genre-ID. Bestehende sieben Basisgenres und 20 V469-Untergenres, gespeicherte Korrekturen sowie lokale Konfigurationen bleiben kompatibel.
- Die Bühne wechselt nicht automatisch bei jeder Songsekunde zwischen Genres; die zeitliche Energie wird weiterhin durch bestehende Beat- und Struktur-Systeme bestimmt.

## Validierung

- `npm run verify:v470` – bestanden: V470-Suite, V469-Suite und zielgerichteter TypeScript-Check, V468, V467, V210, Syntax, Imports und Modul-Casing.
- `npm run test:v470` – deterministische Hybrid-, Genre-, UI-Integrations-, Lyrics-/Reduced-Motion- und Override-Checks.
- `npm run typecheck` / `npm run build` – in dieser Laufzeit nicht vollständig möglich, weil die npm/Next.js/React-Abhängigkeiten nicht installiert sind. Bitte auf dem Entwicklungsrechner nach `npm install` ausführen.
