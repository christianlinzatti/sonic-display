# Sonic Display V418 – Rap Performance Quality Inspector

## Überblick

V418 erweitert den Rap Performance Editor um eine klickbare, gemeinsame **Timing-Zeitachse** für die vorhandenen Datenquellen. Es bleibt auf V417 aufgebaut und ergänzt **keine neue unabhängige Live-Motion-Engine**. Bestehende V412-Presets, V414-Lyrics-Gesten, V415-Lippenmodellierung und V416-/V417-Rapper-Szenen bleiben Eigentümer der jeweiligen Bewegungs-/Kamerapfade.

### Zeitachsen-Spuren

1. **Lyrics-Quelle**: explizite Zeilen- und, sofern vom Provider verfügbar, Wortzeitstempel.
2. **Mund (geschätzt)**: rein berechnete Wortfenster und eine vereinfachte Mund-/BPM-Verschlussvorschau. Diese Anzeige misst **nicht** die tatsächlich am GLB sichtbaren Morph-Werte, Audio-Phoneme oder die Renderlatenz.
3. **Gespeicherte Gesten**: V414 Kopf-/Arm-Akzente für den gewählten Song **und** Avatar. Veraltete oder falsche Anker werden nicht angezeigt.
4. **Rapper-Rollen**: V416 genehmigte Solo-, Duett-, Call-&-Response- und Hook-Segmente; die V417-Vorschläge sind erst nach ausdrücklicher Übernahme sichtbar.

Klick auf einen farbigen Balken oder Verschieben des Zeitschiebers zeigt die zugehörige **lokale Berechnung**. Die gemeinsame Zeitbasis verwendet die aktuelle Spotify-Position; **die Wiedergabeposition von Spotify wird niemals verändert**. Im Rap Performance Editor werden Kopf-/Arm-Akzente und eine textbasierte Mundöffnungs-Demo an den bereits ausgewählten GLB-Avatar übertragen, sofern dieser passende Rig-Komponenten hat. Bei fehlendem GLB wird das schematische 3D-Modell verwendet. Diese Vorschau ist kein Signal-Recording oder Qualitätsmessgerät.

### Kalibrierung und opt-in

- **Mund** –150 bis +150 ms
- **V414-Gesten** –250 bis +250 ms
- **V416-Rapper-Rollen** –250 bis +250 ms

**Positiver Offset**: Quelle wird etwas *früher* angezeigt/angesteuert; negativer Offset: *später*.

Die drei Einstellungen sind voneinander unabhängig und bleiben dauerhaft in den UiPreferences gespeichert. Sie betreffen die Live-Show **nur**, wenn der neue Haken **„V418-Timing-Korrekturen ausdrücklich in Live-Show anwenden“** gesetzt wurde. Ohne Haken bleiben bestehende V415-Mundversätze und V414-/V416-Zeitberechnungen unverändert. Die übergeordneten Feature-Opt-ins gelten weiterhin: V415-Mundpräzision, V414-Gesten und V416-Rollen müssen separat aktiv sein. Die V414-Gesten benötigen wie zuvor ein aktives V412-Preset, im dem ausschließlich bekannte Tanzclips zugelassen sind. Manuelle V385-Sängerbesetzung, choreografierte Shows, Kamera-Keyframes, Pausen und reduzierte Bewegung behalten ihre bestehenden Prioritäten.

> Wichtig: Die V418-Mundkorrektur ersetzt bei aktivierter V418-Live-Kalibrierung den alten V415-Mundversatz; die Werte werden nicht addiert. Bei ausgeschaltetem V418 gilt wieder die bisherige V415-Einstellung.

### Bedienung

1. Einen Track mit synchronisierten Lyrics wählen und bei Bedarf einen GLB-Avatar im Rap Performance Editor auswählen.
2. **Einstellungen → Anzeige → Rap Performance Editor → V418 Rap Performance Quality Inspector** öffnen.
3. Wort- und Szenenmarker auswählen; die lokale 3D-Vorschau betrachten, ohne Spotify zu verschieben.
4. Einen **Mund-, Gesten- oder Rollenversatz** einstellen und die lokale Visualisierung vergleichen.
5. Nur bei zufriedenstellendem Ergebnis ausdrücklich V418-Live-Korrekturen aktivieren; zum Vergleichen jederzeit deaktivieren.

Bei Lyrics ohne Wortzeitstempel werden **keine erdachten Wort-/Mundmarker** generiert. Die Wortvorschau bleibt in diesem Fall stumm und es erscheinen nur verfügbare Zeilen-/Szenenmarker. Es findet keine automatische Sänger-/Phonemzuordnung oder versteckte Latenzmessung statt.

## Technische Dateien

- `components/visualizer/rapPerformanceQualityV418.ts`: deterministischer, begrenzter Read-only-Timeline-Builder, Offset-Normalisierung und Sampler (mit bestehenden V414/V415/V416-Daten).
- `components/visualizer/RapPerformanceQualityInspectorV418.tsx`: visuelle mehrspurige Zeitachse, Regler, Scrubbing, lokale Preview.
- `components/visualizer/RapPerformanceEditorPanelV408.tsx` und `RapRealAvatarPreviewV409.tsx`: Nutzung des bestehenden GLB-/Demoszene-Renderers; bei V418-Auswahl wird ausschließlich ein Demonstrations-Mundsignal hinzugelegt.
- `components/visualizer/VisualizerStage.tsx`, `ThreeAvatar.tsx` und `registry.tsx`: optionale Kalibrierung im *bestehenden* Live-Signalfluss.
- `types/music.ts`, `context/UiPreferencesContext.tsx`: drei persistierte Offsets und Live-Opt-in standardmäßig **false**.
- `tests/v418-quality-inspector-regression.cjs`, `tests/tsconfig.v418-core.json`: Funktions-, Prioritäten-, Quellen-, UI-/Stage-Wiring- und isolierte Strict-Typprüfung.

## Build und Tests

```powershell
npm install
npm run test:v418
npx tsc --noEmit
npm run build
```

Diese Projektarchivversion enthält – wie die V417-Ausgangsbasis – **keine `node_modules` und keine `package-lock.json`**. `npm install` erzeugt lokal eine Lockdatei. Der komplette `next build` kann hier ohne npm-Projektabhängigkeiten nicht ausgeführt werden. Der Offline-Preflight prüft zuerst die Funktionen und meldet bei fehlenden Abhängigkeiten `BLOCKED`, keinen Kompilierungsfehler.
