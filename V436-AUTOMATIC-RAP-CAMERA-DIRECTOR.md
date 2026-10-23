# Sonic Display V436 – Automatic Rap Camera Director & Auto-Fix Studio

## Ziel: so wenig Handarbeit wie möglich

V436 erweitert V435 um eine **automatische Gesamtanalyse des aktuell geladenen Songs** mit synchronisierten Lyrics. Die V436-Automatik ist standardmäßig **eingeschaltet**, verändert aber den Live-Betrieb erst, wenn der Benutzer die bereits vorhandene **V429 Rap-Kamera aktiviert**, mindestens zwei Avatare verwendet und die anderen Kamera-Sicherheitsbedingungen erfüllt sind. In V436 selbst müssen keine einzelnen Shot-Korrekturen gespeichert werden.

### 1. Automatische Grundregie ohne manuelle V416-Rollen

Wenn keine gültigen V416-Szenen existieren, erzeugt V436 **kamerabezogene, heuristische** Ersatzszenen aus synchronisierten Lyrics:
- Zurückhaltende Solo-Kameraführung für normale Verse, mit visuellem Avatar-Slot 0.
- Wenn sich **mehrere aufeinanderfolgende längere Lyrics-Zeilen** an deutlich unterschiedlichen Songstellen wiederholen, können diese Bereiche als Hook inszeniert werden.
- Die Erkennung bewertet ausschließlich Textwiederholungen. Sie **erkennt weder Stimmen noch reale Rapper, Chorus-Sänger oder eine zuverlässige musikalische Form**.
- Bestehende manuell erstellte V416-Rollen werden nicht ersetzt. Die automatisch inferierten V416-Szenen wirken **nur in der V429-Kamera**; Vocal-Casting, Lippenanimation und V425-Ausdrucksregie werden dadurch nicht umgeschrieben.

Die API `cameraSceneAssignmentsV436` bietet transparent `inferred:true` und die Quelle `auto-lyrics`, während echte Zuordnungen `authored-lyrics` bleiben.

### 2. Automatische Shot-Korrekturen pro Song

- Die Vorschau-/Liveregisseur-Logik erstellt maximal 128 zusätzliche Shot-Anpassungen für höchstens 5.000 synchronisierte Lyrics-Zeilen.
- Sehr kurze Einstellungen (unter 850 ms) und dichte Cut-Folgen können den vorherigen sicheren Shot halten, anstatt eine überhastete Kamerafahrt zu starten.
- Authored Hook-Push-Szenen werden nicht automatisch entfernt; der unmittelbar nächste Shot nach einer Hook wird nicht erzwungen.
- **Manuelle V430-Edits und V432-Keyframes werden nie durch V436 überschrieben.** Im Live-Datenfluss werden V436-Fixes als erste und V430-Edits als letzte Einträge übergeben; letztere gewinnen.
- Bei Ausschalten von V436 wird der ursprüngliche V430-Datenfluss wiederhergestellt. Automatische Fixes müssen **nicht gespeichert** werden.

### 3. Automatische Anpassung der Übergangsparameter

Für maximal 16 nachvollziehbare Song-Übergänge testet V436 eine kleine feste Anzahl an V433-Varianten (Weichheit/BPM-Ausrichtung). Daraus entsteht eine **songbezogene, flüchtige** Empfehlung, die bei aktiver V429/V436-Kamera automatisch im vorhandenen V433-Übergangsregisseur verwendet wird.

Das Livebild nutzt die bestehenden Sicherheitsprüfungen, Kameraregie-Prioritäten, lyrics-sensitive Framing-Grenzen und den einzigen vorhandenen 3D-Renderer. Das BPM-Raster bleibt eine Näherung: Es wird **keine historische Kick-Phase erfunden**. Quantisierung des BPM-Werts auf 5er-Schritte begrenzt Neuberechnungen bei jitterndem Tempo. Die Analyse läuft über React-Memoisierung **nicht pro Renderframe**; insbesondere ein Spotify-Zeitupdate löst keine neue Songanalyse aus.

### 4. Bedienung

1. Unter **Einstellungen → Anzeige → Rap Performance Editor → V429** mindestens zwei Avatare auswählen und **„Automatische Rap-Kamerafahrten live aktivieren“** einschalten.
2. Einen Titel mit synchronisierten Lyrics abspielen. **V436 „Ganzer Song automatisch optimieren“** ist bereits aktiviert und erstellt einen fertigen Kameraplan – auch ohne V416-Rollen.
3. Optional die Anzahl der Auto-Korrekturen, die geschätzte Qualität und die gewählten Übergangseinstellungen ansehen. Bei Bedarf unter „Automatische Korrekturen ansehen“ auf die Lyrics-Zeile springen, **ohne Spotify zu seeken**.
4. Optional kann der Benutzer die Shot-Änderungen mit „Vorschläge optional fest in V430 speichern“ in der bisherigen lokalen Bibliothek festschreiben. Es werden nur bislang nicht manuell bearbeitete Zeilen gespeichert. Zum normalen Livebetrieb ist das **nicht notwendig**.
5. Mit dem V436-Schalter zur ursprünglichen handgesteuerten V429/V430/V433-Führung zurückkehren.

### 5. Grenzen und Sicherheit

- **Keine Stimmerkennung** und keine automatische Identifikation von beteiligten Künstlern/Tracks aus Audio.
- Visuelle Bewertung beruht auf vereinfachter Kamerageometrie, V433-Interpolation und V435-Heuristiken. Sie kann reale Verdeckungen oder schlecht sichtbare GLB-Gesichter nicht zuverlässig feststellen.
- Ohne zeitlich synchronisierte Lyrics oder mit nur einem Avatar stehen keine V436-Rap-Kamera-Szenen zur Verfügung.
- V436 schaltet die Basis-Kamera **nicht** gegen den Wunsch des Benutzers ein. Solange V429 deaktiviert ist, bleibt die Bühne unverändert.
- **Wenn V429 und V436 beide aktiv sind**, wird die V433-Übergangsglättung automatisch benutzt, selbst wenn die ältere separate V433-Checkbox ausgeschaltet ist. V436 auszuschalten stellt das frühere Verhalten der V433-Checkbox wieder her.
- Manuelle Kamera-/Keyframe-Modi, reduzierte Bewegung, Lyrics-Framing und priorisierte Konzert-/Duett-Kameraregien bleiben geschützt.
- Im Browser wird keine kontinuierliche Hintergrundaufgabe oder externe KI-Inferenz gestartet.

## Wesentliche Dateien

- `components/visualizer/autoRapSceneAssignmentsV436.ts` – transparente, rein lyrics-basierte Verse-/Hook-Grundregie.
- `components/visualizer/rapCameraAutoFixV436.ts` – deterministic, bounded song-wide cuts and transition-profile search.
- `components/visualizer/RapCameraAutoFixPanelV436.tsx` – fertige automatische Vorschläge, Ein/Aus, Einsicht und optionales Festschreiben.
- `components/visualizer/VisualizerStage.tsx` – Memoisierung und Einbindung in die bestehende V429/V430/V433-Kamera-Pipeline.
- `components/visualizer/rapCameraTimelineV431.ts`, `expressiveRapDirectorV425.ts`, `cinematicRapCameraV429.ts` – transparente Quellenmarkierung und Vorschau der V436-Fallbacks.
- `tests/v436-rap-camera-autofix-regression.cjs` – Song-, Hook-, Safety-, Bounds- und Quelltests.
- `tests/tsconfig.v436-core.json` – strenge TypeScript-Kernprüfung.

## Windows-Prüfung

```powershell
npm install
npm run verify:v436
npm run test:imports
npm run typecheck
npm run build
```
