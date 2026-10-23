# Sonic Display V411 – Visueller Rap-/Tanz-Motion-Timeline-Editor

**Basis:** V410. Bestehende Karaoke-, Vocal-, Avatar-, Kamera-, Choreografie-, Performance- und Show-Funktionen bleiben erhalten.

## Neu in V411

Im bisherigen **Rap Performance Editor** unter **Einstellungen → Anzeige** lässt sich jetzt **Motion-Timeline V411** aktivieren.

- Für einen installierten GLB-/GLTF-Avatar können bis zu **12 Clips** aus dessen eingebetteten Animationen, konfigurierter Motion und vorhandener Charakter-Motion-Bibliothek zusammengestellt werden.
- Jeder Timeline-Eintrag hat eine **Dauer von 1–30 Sekunden**, einen **Crossfade zum nächsten Clip** (0–4 Sekunden), eine **Verse-/Hook-Rolle** und **Rap-Akzent 0–150 %**. Crossfades werden auf maximal die halbe Dauer beider beteiligten Clips beschränkt, damit auch kurze Segmente abspielbar bleiben.
- Clips lassen sich **hinzufügen, entfernen, nach oben/unten sortieren**, durch Klicken auf den Timeline-Balken oder den Positionsregler **anspringen**, als Loop abspielen oder pausieren. Die bereits vorhandene Geschwindigkeitsauswahl **0,5× bis 1,5×** steuert die Vorschau.
- Sanfte, zeitabhängige **Smoothstep-Crossfades** werden über gewichtete `AnimationAction`s eines einzigen Three.js-`AnimationMixer` auf dem **gekapselten Skinned-Mesh-Klon** ausgeführt. Wenn ein Clip zweimal vorkommt, erhält jeder Eintrag eine eigene Animationsaktion und einen eigenen Zeitcursor.
- Nach dem Mixer-Update werden die vorhandenen **V405–V410-Rap- und Lip-Sync-Gesten** auf die resultierende Tanz-Pose gelegt. Die vorherigen Zusatzrotationen und Mouth-Morph-Werte werden vor jedem Frame zurückgenommen, um Drift zu vermeiden. Der Rap-Akzent des aktiven Timeline-Segments steuert zusätzlich die simulierten Vocal-Gesten.
- Externe Animationen laufen weiterhin über `retargetHumanoidClips`. Dieselbe externe GLB wird nicht erneut angefordert, nur weil Clips umsortiert oder Überblendzeiten verändert wurden. Fehlende Motion-Dateien erzeugen einen Status; verbleibende verfügbare Clips werden weiter abgespielt.
- Die Timeline wird **pro Avatar im Browser** (`localStorage` unter `sonic.rap.motion.timeline.v411.<avatarId>`) gespeichert; es werden nur IDs und Zeitwerte gespeichert, keine GLB-Dateien und keine URLs. Ungültige/alte Einträge werden beim Laden begrenzt und übersprungen.

## Bedienung

1. **Einstellungen → Anzeige → V411 Rap Performance Editor** öffnen.
2. Im Feld **Vorschau-Avatar** den gewünschten installierten Charakter auswählen.
3. **Motion-Timeline V411** aktivieren.
4. Unter **Clip hinzufügen** einen vorhandenen Clip auswählen, **+ Clip** anklicken; für weitere Clips wiederholen.
5. Mit ↑ / ↓ die Reihenfolge, **Dauer**, **Überblendung**, **Verse/Hook** und **Rap-Akzent** bearbeiten. Oberhalb zeigt ein Timeline-Balken den Ablauf; der Schieberegler steuert die Position.
6. Mit **Pause / Abspielen**, **Loop**, **↺ Anfang** und **Motion-Tempo** die Sequenz beurteilen.
7. Für einen reinen Einzelclip-Test die Motion-Timeline wieder ausschalten: Das bewährte V410-Auswahlfeld erscheint unverändert.

## Schutz und Grenzen

- **Nur Vorschau**: Die Timeline wird **nicht** als Live-Bühnenchoreografie veröffentlicht, exportiert oder auf andere Avatare übertragen. Die Live-Avatar-Auswahl, Motion-Bibliothek und laufende Show werden nicht geändert. Lediglich die explizit aktivierte V408-Rap-Performance-Reglersteuerung beeinflusst weiterhin die Live-Show.
- Die Rhythmus- und Rap-Akzente im Editor sind **Simulation**, keine aus Spotify abgeleiteten Kick-/Snare-Ereignisse oder echte Phonem-Analyse. Auf der Live-Bühne benötigt die V407-Rhythmusreaktion weiterhin gemessene Mikrofonwerte.
- Im Editor werden bei externen GLB-Motion-Dateien weiterhin nur die vom vorhandenen Retargeter unterstützten Humanoid-Quaternion-Tracks des ersten kompatiblen Clips verwendet. Unvollständige Rigs, Browser/CORS, fehlende Mouth-Morphs und komplexe nicht-humanoide Animationen können die Vorschau einschränken.
- Loop-Grenzen zwischen letztem und erstem Clip werden derzeit nicht zusätzlich überblendet. Zeitdauern sind editorseitige Vorschauabschnitte und ändern die zugrunde liegenden GLB-Dateien nicht.
- Beim Abspielen werden bis zu 12 AnimationActions innerhalb eines einzigen Mixers gewichtet; sehr große GLB-Dateien können Speicher/CPU belasten.

## Technische Stellen

- `components/visualizer/rapMotionTimelineV411.ts`: validierte Timeline-Daten, Scheduling, Crossfades, deterministisches Sampling, Reihenfolge.
- `components/visualizer/RapPerformanceEditorPanelV408.tsx`: Timeline-Oberfläche, Steuerung, Wiedergabeposition, pro-Avatar-Browser-Speicherung.
- `components/visualizer/RapRealAvatarPreviewV409.tsx`: parallele MotionActions, externes Clip-Retargeting, sichere Rap-Gesten-Layer und Playback.
- `tests/v411-rap-motion-timeline-regression.cjs`: u.a. Overlaps, Seek, Loop, Clamp, fehlende Daten, Wiederholungsclips, Rückwärtskompatibilität und Integrationschecks.

## Testbefehle

```powershell
npm install
npm run test:v411
npm run test:v410
npm run test:imports
npm run verify
```

`npm run verify` führt die Regressionstests, TypeScript-Prüfung und anschließend den Next.js-Produktionsbuild aus.
