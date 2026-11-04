# Sonic Display V423 – Audio-Aware Rap Lip-Sync

## Zweck und Datenquellen
V423 ergänzt die text- und Lyrics-basierten Mundanimationen von V415/V419 um **optionale, messbare Audioeigenschaften aus einer vom Benutzer ausdrücklich bereitgestellten lokalen Audiodatei**. Diese Funktion bietet einen ersten Audio-gestützten Schritt. **Sie ist keine echte Phonemtranskription, keine isolierte Gesangsspur und keine Sprechererkennung**. Spotify bietet für diese Anwendung keine frei dekodierbare Audiospur; die Musik wird weder aus Spotify extrahiert noch abgegriffen.

## Bedienung
1. Eine Spotify-Aufnahme mit synchronisierten **Wortzeitstempeln** öffnen und das Rap Performance Editor Panel aufrufen.
2. Den Abschnitt **V423 · Audio-Aware Rap Lip-Sync** öffnen.
3. Eine eigene, passende und vollständig dekodierbare Audiodatei per Dateiauswahl bereitstellen. Die Abweichung der Dauer vom Titel darf maximal 3,5 Sekunden betragen.
4. **Lokale Datei analysieren** – zunächst ist das nur eine unverbindliche Vorschau. Auf einer kleinen Zeitachse erscheinen die gemessenen Energie-, Klanghelligkeits- und Einsatzwerte. Die Vorschau bewegt Spotify nicht.
5. Nur ausdrücklich **Merkmale diesem Song zuordnen und speichern**. Audiodaten werden nicht gespeichert; nur gerundete, begrenzte Merkmalswerte.
6. Wahlweise **Audio-Hinweise optional für Live-Mundformen verwenden** einschalten. Zusätzlich muss V419 Rap-Silbenartikulation aktiv sein. Die globale Lippenanimation sowie Pause-/Reduced-Motion-Regeln bleiben gültig.
7. Den Stärke-Regler (0–100 %) und einen eigenen lokalen Datei-Audio-Versatz (−1000 … +1000 ms) einstellen. Bei Bedarf die Daten entfernen.

## Was wird technisch analysiert?
Die Datei wird mit der Browser-`AudioContext.decodeAudioData`-Funktion **lokal** entschlüsselt. In 80-ms-Schritten entstehen drei Ganzzahlmerkmale von 0 bis 100:
- **RMS-Energie:** Schätzung des lokalen Lautstärkeverlaufs (auf das 88. Perzentil normalisiert).
- **Klanghelligkeits-Proxy:** normierte Differenzenergie des Audiosignals – kein gemessenes Formantenspektrum und keine identifizierte Vokalqualität.
- **Einsatz-Proxy:** rascher Anstieg der lokalen RMS-Energie, möglicherweise auch durch Schlagzeug oder andere Instrumente.

Da die gesamte Mischung analysiert wird, sind diese Signale **nicht zwingend vom Sänger verursacht**. V423 modifiziert daher nur zurückhaltend die bereits vom Rap-Artikulationsmodell geschätzten Kiefer-/Lippenformen. Ohne valide und passende Analyse wird nichts verändert.

## Schutzmechanismen und Grenzen
- Nur bei synchronisierten Lyrics **mit tatsächlichem Worttiming**, aktivem Rap-Gesang, laufender Wiedergabe und expliziter V423-Aktivierung; sonst bleibt das V419/V420-Verhalten unverändert.
- Der aktuelle Song muss zur gespeicherten Spotify-Track-ID gehören. Bei abweichender Dauer über 3,5 Sekunden gilt die Analyse als nicht passend; der Zeitversatz ist begrenzt.
- Bei bereits gespeicherten, aktivierten **V420-Mundform-Keyframes für dieses Wort** wird V423 nicht angewandt. Dadurch haben bewusst gesetzte Korrekturen stets Vorrang.
- Die vorhandenen B/P/M-Lippenverschlüsse werden nicht verändert. Rapper-Rollen, Kamera, Tanz, Lyrics-Timing und Körpergesten werden nicht modifiziert.
- Kein permanenter Mikrofonzugriff und kein Speichern von Audiodaten. Höchstens vier Titeldokumente in den bestehenden lokalen Einstellungen, maximal 12 Minuten pro Aufnahme, maximal 12.000 Audio-Merkmalspunkte und 80 MB Dateigröße vor Dekodierung.
- Persistente Daten werden vor der Nutzung validiert und die kostenintensive Punktprüfung je Dokumentobjekt nur einmal ausgeführt. Kein Web-Service oder externes Spracherkennungsmodell ist erforderlich.
- Browser-Codecs und Speicherlimits können Audioimporte begrenzen. Der Produktions-Build erfordert lokal installierte npm-Abhängigkeiten.

## Integration
- `components/visualizer/rapAudioAwareV423.ts`: validierte Merkmalsanalyse aus PCM, interpolierter Sample-Reader, vorsichtige Live-Korrektur.
- `components/visualizer/RapAudioAwarePanelV423.tsx`: lokale Datei, Visualisierung, ausdrücklich getrennte Vorschau/Speicherung/Aktivierung, Löschen und Offset.
- `components/visualizer/vocalPerformanceQualityV374.ts`: bestehende V415/V419/V420-Pipeline; V423 wird **nach V420** ausgeführt und respektiert gespeicherte Keyframes.
- `components/visualizer/VisualizerStage.tsx`, `registry.tsx`, `ThreeAvatar.tsx`, `VocalRigV368.tsx`: Live-Weitergabe an beide 3D-Gesichtspfade.
- `components/visualizer/VocalSyncInspectorV373.tsx`: zusätzliche Datenquellenanzeige für Energie, Helligkeit und Einsätze.
- `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/SettingsPanel.tsx`: optionale Präferenzen, V423 standardmäßig aus.
- `tests/v423-audio-aware-rap-lipsync-regression.cjs`: isolierte Sicherheits-, Signal- und Integrationsregression.

## Windows – Installation und Prüfung
```powershell
npm install
npm run test:v423
npx tsc --noEmit
npm run build
```
Ein erfolgreicher Next.js-Produktions-Build konnte in der Erstellungsumgebung ohne installierte npm-Abhängigkeiten nicht durchgeführt werden.
