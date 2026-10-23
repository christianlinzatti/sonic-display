# Sonic Display V318 – Unified Track Analysis Engine

## Ziel

Optionale Track-Metadaten (BPM, Beat-, Takt- und Abschnittsmarkierungen) werden in ein neutrales, von Spotify unabhängiges Datenmodell überführt. Damit kann Sonic Display seine vorhandenen Live-Schätzungen ergänzen, ohne die private Spotify-Infrastruktur anzusprechen. V318 ist bewusst **nicht** der früher diskutierte Advanced Motion Timeline Editor.

## Verwendung

1. Spotify-Titel starten und unter **Settings → Dynamic Stage → Smart Stage Director → Unified Track Analysis · V318** öffnen.
2. Falls eine aus einer rechtmäßig verfügbaren Quelle stammende Analyse als JSON vorliegt, diese für den gerade laufenden Titel auswählen.
3. Der Import bleibt track-spezifisch und lokal im Browser (maximal drei Tracks). Dieselben Songinformationen werden nicht übermittelt. Die Funktion enthält **keinen Request** an `spclient.wg.spotify.com`, und es werden keine privaten Cookies oder Sitzungstokens beschafft.
4. Die Anzeige zeigt vorhandene Beats, Takte, Tempo und einen Abschnittshinweis. Beim Titelwechsel sucht die Regie nur nach dem zum aktuellen Track gehörenden Import; ohne Import bleibt die Live-Schätzung aktiv.
5. Über **Analyse für diesen Titel entfernen** lässt sich der betreffende lokale Datensatz löschen.

## Unterstütztes JSON

Das klassische Audio-Analysis-Format in Sekunden wird eingelesen:

```json
{
  "track": {"tempo": 164, "time_signature": 4, "duration": 195},
  "beats": [{"start": 0.18, "duration": 0.365, "confidence": 0.9}],
  "bars": [{"start": 0.18, "duration": 1.46, "confidence": 0.9}],
  "sections": [{"start": 0, "duration": 32, "confidence": 0.8}]
}
```

Alternativ wird ein `analysis`, `audio_analysis`, `audioAnalysis` oder `data`-Umschlag mit demselben Inhalt akzeptiert. Die neutrale Sonic-JSON-Form verwendet `schema: "sonic-track-analysis-v318"`, `trackId`, `durationMs`, `tempo`, `timeSignature`, und Marker mit `startMs`/`durationMs`.

Spotify-`sections` tragen typischerweise **keine** semantischen Labels (`drop`, `hook`, ...). V318 leitet diese Labels nicht erfunden daraus ab. Optional ausdrücklich gelieferte und ausreichend vertrauenswürdige `label`-Felder dürfen die Live-Einschätzung ergänzen. Die vorhandene Audioerkennung bleibt bei nicht bezeichneten Passagen maßgeblich.

## Architektur

- `services/musicAnalysis/trackAnalysisV318.ts`: Provider-Vertrag `TrackAnalysisProviderV318`, `normalizeTrackAnalysisV318`, `resolveTimelineV318`, `loadFromProvidersV318` und der lokale Provider `localImportProviderV318`. Keine Remote-Abhängigkeiten, keine Tokens.
- `TrackAnalysisControlsV318.tsx`: JSON-Import, Status/Timeline und Track-Löschung.
- `VisualizerStage.tsx`: synchronisiert den Import pro Track und nutzt die zentralisierte Timeline für Show-Abschnitte, Kamera, Bühnenwechsel und Takt-/Phrasenslots der automatischen Motion-Auswahl.
- `intelligentDanceCombinationV242.ts`: optionaler `phraseSlot` als Eingabe, damit eine importierte Taktliste rhythmisch sauberere Wechsel erlaubt; ohne Import bleiben BPM-basierte Slots erhalten.

**Prioritäten:** Manuelle Benutzerentscheidungen → eindeutig gelabelte importierte Sections → vorhandene Live-Dance-Intelligence. Für Beat-/Taktpositionen haben importierte Marker Vorrang. Die BPM-Quelle ist bei vorhandenem Import der Import, sonst die vorhandene Live-Schätzung.

## Grenzen

- Kein automatisches Abrufen über den nicht offiziell unterstützten `spclient.wg.spotify.com`-Host.
- Kein direkter Audiostream oder echte Waveform-Analyse. BPM und Songphrasen aus JSON sind Metadaten; Live-Kick-/Bass-Energie wird weiterhin separat erfasst.
- Marker mit unbekannter Track-ID werden nicht versehentlich anderen Titeln zugeordnet; JSON-Dateien ohne ID werden explizit dem gerade ausgewählten Track zugeordnet.
- Das Format wird clientseitig bis 1,5 MB eingelesen. Server-Verfügbarkeit und Rechte an den Analysedaten liegen bei einer möglichen zukünftigen Provider-Anbindung.
- Die Import-Caches sind browserlokal; die regulären Settings-/Backupfunktionen übertragen sie nicht automatisch.

## Prüfung

`npm run test:v318` prüft Sekunden-/Millisekundenkonvertierung, Abschnittslabel, Beat-/Takt-Timeline, Quellenpriorität, Track-ID-Schutz, Cache, Fallback und die Integration. `npm run verify:offline` führt die bestehende Regressionstestreihe mit aus.

Ohne installierte npm-Abhängigkeiten kann `npm run build`/vollständiges `npm run typecheck` hier nicht bestätigt werden. Mit `npm install && npm run verify` lokal prüfen.
