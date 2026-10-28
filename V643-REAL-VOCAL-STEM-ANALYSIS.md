# V643 – Real Vocal Stem Analysis

## Implementierte Funktion

V643 ergänzt im bestehenden `SettingsPanel.tsx` das aufklappbare **V643 Vocal Stem Lab**.
Es analysiert **vom Nutzer freiwillig bereitgestellte und als bereits isoliert gekennzeichnete**
Vocal-Stems (z. B. mit eigener Software getrennte WAV-/MP3-Dateien) – nicht den Spotify-
Audiostream. Es existiert weiterhin **kein** Zugriff auf Spotify-Roh-PCM und keine automatische
Extraktion von Spotify-Stems.

### Nutzung

1. Aktuellen Spotify-Song laden, Einstellungen → Avatar / Gesang öffnen.
2. V643 Stem Lab ausklappen, Sänger-Slot 1 bis 4 manuell auswählen.
3. Zu diesem Song gehörende, **volle und zeitlich passende** Gesangsspur auswählen
   (maximal 80 MB, 2–720 Sekunden; Länge innerhalb von 3,5 Sekunden vom Song).
4. „Stem analysieren“ anklicken. Du siehst den groben Energieverlauf, Einsätze,
   einen Periodizitätsindikator, mögliche Vocal-Phrasen und Clipping.
5. Weitere getrennte Spuren können anderen Slots zugeordnet werden. Merkmalbericht
   als `sonic-v643-vocal-*.json` exportieren oder in derselben Sitzung importieren.

Es werden keine Dateien an einen Server gesendet. `AudioContext.decodeAudioData`
und ein sparsamer, deterministischer Scan arbeiten lokal im Browser. Die eigentlichen
Audiodaten werden nach dem Scan nicht im Anwendungszustand gespeichert. Der
JSON-Bericht speichert nur Track-ID, manuell zugewiesenen Slot und verdichtete
statistische Merkmale; **nicht** Audiodaten, Lyrics, Dateinamen oder Künstleridentität.
Beim Songwechsel werden die geladenen Berichte verworfen. Einstellungen/V423 bleiben
unverändert. Manuelle JSON-Sicherung ist nötig, um die Ergebnisse dauerhaft zu behalten.

### Fachliche Grenzen

- `source: user-declared-isolated-vocal` **belegt keine** tatsächliche Isolation.
  Selbst eine gelungene Datei-/Songlängenprüfung belegt nicht dieselbe Aufnahme.
- 80-ms-RMS-/Einsatz- und vereinfachte Korrelationsmerkmale ergeben nur grobe
  Regionen. Instrumente, Hall, untonhafte Konsonanten und Atemgeräusche können
  zu falschen positiven oder negativen Ergebnissen führen.
- Eine Periodizität ist **keine** erkannte Tonhöhe, Phonemspur, Artikulation,
  Sprecherdifferenzierung oder genaue Silbenposition.
- Das ist eine Offline-Analysebasis für die geplante V644-Weiterentwicklung.
  V643 steuert keinerlei GLB-Morph-Targets oder vorhandene Sängerrollen.
- Keine zusätzlichen Render-/Audio-Analyzerschleifen; nur Benutzeraktionen.

### Datenmodell und Sicherheit

- `vocalStemAnalysisV643.ts`: rein lokale Analyse, 80-ms-Punkte (0–100),
  begrenzte Phrasenliste, geprüfte Version-1-Schema-Validierung.
- Maximal vier Slots; Import und Export sind strikt an die aktuelle Track-ID
  und zeitlich an die Songlänge gebunden. Unbekannte, ungültige und manipulierte
  Punktwerte werden abgewiesen.
- Audioupload 80 MB, PCM max. 256 MiB, analysierte Songlänge höchstens 12 Minuten;
  nur Mono oder Stereo (3+ Kanäle werden abgewiesen). Die Kanäle werden für die Energie getrennt bewertet, um Gegenphasenauslöschung zu vermeiden. Bei 192-kHz-Multikanal-Aufnahmen ggf. vorher
  in der eigenen Audiosoftware herunterrechnen.
- Bei manuellem Songwechsel während `decodeAudioData` wird das Ergebnis verworfen.

### Dateien

- `components/visualizer/vocalStemAnalysisV643.ts` – deterministischer Merkmals-Scanner.
- `components/visualizer/VocalStemLabV643.tsx` – nur bei Bedarf eingeblendete lokale UI.
- `components/SettingsPanel.tsx` – Einstieg in der Vocal-Sektion.
- `tests/v643-vocal-stem-analysis-regression.cjs` – Regressionstests + 12.000 Samples.
- `tests/tsconfig.v643-core.json` – eigene Typprüfung.

### Verifikation

`npm run test:v643`, `npm run test:v643:types`, `npm run test:smoke:v643`,
`npm run verify:v643`, `npx tsc --noEmit`, `npm run build`.

Ein grüner Core-Typcheck oder simulierte Signale beweisen weder reales Browser-Audio-
Decoding mit jedem Dateiformat noch akustische Genauigkeit. Es fehlen hier
weiterhin installierte Next.js-Projektabhängigkeiten für den Produktions-Build.
