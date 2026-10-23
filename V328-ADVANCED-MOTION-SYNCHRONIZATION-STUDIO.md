# Sonic Display V328 – Advanced Motion Synchronization Studio

## Ziel und Einbindung

Optionales Studio für die tatsächliche Clip-Phase von **drei oder vier getrennten GLB-Animierungsinstanzen**. Aufbauend auf V326 (Bühnen- und Formationsregie) und V327 (musikreaktive Akzente) wird nun der **ausgewählte, laufende Three.js-AnimationAction** jeder Instanz nach derselben musikalischen Uhr auf eine Clip-Zeitposition gesetzt. Original-GLB-AnimationClips und Keyframes werden dabei nicht verändert. Individuelle Skeletons, Retargeting, Blend-Weights und bestehende Foot-IK bleiben separat.

Der gesamte V328-Modus ist anfangs **deaktiviert**. Er greift nur, wenn der V326-Gruppenmodus aktiv ist, und nicht bei manueller Avatar-Motion-Timeline, manueller Choreografie-Sequenz, Avatar-Loop-Preset oder einem aktiven Animation-Layer. Der Modus erfordert einen gültigen, laufenden GLB-Clip. Ein rein prozeduraler Avatar kann keine GLB-Clip-Phase erhalten.

## Neue Bedienung

**Settings → Avatar → Multi-Avatar Choreography → Advanced Multi-Avatar Stage Director V326 → Advanced Motion Synchronization Studio V328**.

- **GLB-Clip-Synchronisierung live aktivieren:** schaltet den tatsächlichen Clip-Phasen-Override ein.
- **Zyklus (Beats):** 1, 2, 4, 8 oder 16 Beats pro Clip-Schleife.
- **Uhr-Modus / Musikalische Clip-Zyklusphase:** rechnet die Beatposition in eine normierte Clipphase 0–100 % um. Unterschiedliche Cliplängen erreichen dieselbe Phase zur selben Zeit. Große Beschleunigung bzw. Verlangsamung kann das Ergebnis optisch beeinträchtigen.
- **Uhr-Modus / Echtzeit + Beat-Versatz:** bewahrt den originalen Sekundenverlauf des Clips, ergänzt aber einen Versatz in Beatlängen. Synchronität der prozentualen Clipphase ist bei unterschiedlichen Cliplängen dann nicht garantiert.
- **Startposition (Sekunden):** gemeinsamer Zeitursprung der Sequenz, z. B. erster Chorus. Bei importierten Beatmarkern innerhalb ihres Gültigkeitsbereichs wird die Beatposition des Ursprungs berücksichtigt.
- **Phasenversatz pro Tänzer:** Werte von −8 bis +8 Beats; z. B. 0, 0.5, 1, 1.5 für eine Beat-Kaskade oder alle 0 für Unison.
- **Clip-Index:** −1 = aktuell automatisch ausgewählter Clip; 0…63 = bestimmter im jeweiligen aktiven Mixerkatalog vorhandener Clip. Fehlt der Index, bleibt der automatisch gewählte Clip. Hinweis: Im Live-Modus enthält dieser Katalog auch importierte und installierte Clips; die 3D-Vorschau nutzt nur im Modell eingebettete GLB-Animationen und ist deshalb nicht für alle externen Library-Clips identisch.
- **3D-Vorschau:** verwendet denselben musikalischen Phasenalgorithmus, mit lokal gewählter Zeit auch im pausierten Editor.

## Zeitbasis und Schutz

Die Live-Bühne verwendet die lokale Gruppenuhr oder – bei expliziter Songbindung in V326 – die aktuelle Songposition (`cameraDirectorProgressMs`). In Letzterem Fall können importierte V318-Beatmarker verwendet werden, sofern sie streng aufsteigend und gültig sind und die Zeitposition in ihrem Bereich liegt. Außerhalb dieses Bereichs wird das BPM-Raster verwendet; bei nicht songgebundener Live-Uhr werden importierte Marker ignoriert. Beim Titelwechsel und einer fehlenden oder falschen Songbindung bleibt die V326-Gruppenregie deaktiviert.

`phaseForClipV328` ist eine pure, testbare Berechnungsfunktion. Die Marker werden als unveränderliche Analysedaten betrachtet und pro Array einmal validiert (WeakMap). Der positive Moduloperator vermeidet negative Clip-Zeiten. Fehlende Clips, ungültige Dauern, Pause und Reduced Motion führen zu keiner erzwungenen neuen Animationszeit.

Die Live-Steuerung schreibt nur in `AnimationAction.time` des jeweils gewählten laufenden Clips und aktualisiert die Instanz mit `mixer.update(0)`. Sie überschreibt nicht `AnimationClip.tracks`, importierte GLBs, die Root-Formation oder die IK-Ziele. Wenn ein Clip nicht kompatibel mit dem aktiven Avatar ist, behebt die Phasenregie das Rigging nicht. Unterschiedliche Tanzbewegungen werden **musikalisch phasengleich**, nicht automatisch inhaltlich zu derselben Pose.

## Grenzen und Verifikation

- V328 ist keine automatische Motion-Retargeting- oder Pose-Matching-Engine. Es synchronisiert die Zeitskala/Phase vorhandener Clips, nicht deren semantische Tanzschritte.
- Die Live-Auswahl nach Clip-Index kann von eingebetteten Clip-Indizes in der Vorschau abweichen (importierte, installierte oder maskierte Clips).
- Ohne echte, analysierte Beatmarker basiert die Sync auf BPM, nicht auf nachgewiesenen Onsets.
- Ein erzwungenes Clip-Looping kann bei nicht geloopten oder unpassend vorbereiteten Animationen harte Übergänge zeigen. V321-Qualitätsanalyse kann solche Clips prüfen.
- Root-Translation von V326 bleibt separat und kann trotz IK sichtbare Fußverschiebungen verursachen.
- Alle Offline-Regressionstests bis V328 inklusive Quellsyntax bestanden. Der isolierte strenge TypeScript-Check für `groupMotionSynchronizationV328.ts` ist erfolgreich. Ein vollständiger Next.js-Typcheck/Build war wegen fehlender npm-Abhängigkeiten in dieser Umgebung nicht möglich.

### Lokale Build-Prüfung

```bash
npm install
npm run verify
```

### Relevante Dateien

- `components/visualizer/groupMotionSynchronizationV328.ts` – Settings, BPM/Beat-Marker-Zeitschiene, normierte und echtzeitbasierte Clipphasen
- `components/visualizer/GroupMotionSyncControlsV328.tsx` – UI
- `components/visualizer/ThreeAvatar.tsx` – echte Laufzeit-Mixer in V326-Gruppenansicht
- `components/visualizer/MultiAvatarPreviewV326.tsx` – synchronisierte 3D-Demo eingebetteter GLB-Clips
- `components/visualizer/MultiAvatarStageStudioV326.tsx` – Integration ins Gruppenstudio
- `tests/v328-motion-sync-regression.cjs` – funktionale Regressionstests
