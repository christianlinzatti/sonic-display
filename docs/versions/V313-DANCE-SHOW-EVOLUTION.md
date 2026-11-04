# V313 – Dance Show Evolution

Basis: **V312 Intelligent Dance Choreography Director**. V313 fügt der automatischen Konzertshow eine songweite Dramaturgie hinzu. Bestehende Audioanalyse, Kamera, Beleuchtung, GLB-Animationen, Stage-Presets, Duo-IK und manuelle Bearbeitung bleiben erhalten.

## Funktion

- **Intro** (erste ~12 %): Licht-/FX-Akzente etwas zurückhaltender; optional beginnt das Duo mit einem fokussierten Lead, sofern der aktuelle Musikabschnitt `verse` ist.
- **Groove** (ca. 12–52 %): die Basisregie V306/V310 steuert Verse, Hooks und Breaks, ohne die Choreografie zu überladen.
- **Rise** (ca. 52–77 %): allmählich mehr Bühnenenergie; der V312-Duo-Regisseur kann bei Builds den Partner stärker in den Fokus nehmen.
- **Peak** (ca. 77–92 %): spätere bestätigte Drops/Hooks erhalten etwas mehr Raum, ohne neue Drop-Signale zu simulieren.
- **Finale** (ab ca. 92 %): eine höhere Bühnenintensität, bei einem *neu beginnenden* Hook oder Drop gegebenenfalls breite Kamerakomposition und synchronisierte Formation; Breaks bleiben bewusst ruhig.

Die Prozentwerte sind heuristische **Dramaturgie-Hinweise**, keine verifizierte musikalische Struktur. Ein Track erhält nur dann einen zeitabhängigen Bogen, wenn eine plausible Dauer von mindestens 45 Sekunden bekannt ist. Ein Drop wird nur durch die vorhandene Musikabschnittserkennung ausgelöst, niemals allein durch die Restzeit.

Die Übergänge nutzen sanfte Smoothstep-Kurven und keine Zufallsentscheidung pro Renderframe. Zusätzliche Tanzenergie wird ausschließlich über den bestehenden reaktiven `danceAggression`-Parameter übertragen. **Importierte GLB-Clips, gespeicherte Keyframes und IK-Anker werden nicht modifiziert.** Der V312-Duo-Regisseur berücksichtigt die Phasen innerhalb seiner vorhandenen musikalischen Phrasen.

## Bedienung

`Settings → Dynamic Stage → Smart Stage Director → Dance Show Evolution · V313`

Einstellungen: Aktivieren, Dramaturgie-Intensität, ruhiger Einstieg, spätere Höhepunkte, Finale ein/aus, echte Breaks und Drops priorisieren. Alle Werte werden lokal gespeichert und die laufende Bühne synchronisiert nach Einstellungsänderungen automatisch. Das Feature wirkt nur bei aktiviertem **Ultimate Show Director V306**.

Auch die One-Click-Shows enthalten abgestimmte V313-Werte: Hardtekk Mainstage (starker Höhepunkt), Deutschrap Spotlight (zurückhaltend), Cinematic Festival (deutlicher Film-Bogen), Ambient Night (minimalistisch). Eigene V312-Presets ohne V313-Daten erhalten **V313 deaktiviert**, damit sich ihr Erscheinungsbild beim Upgrade nicht unerwartet verändert. Die Preset-Wiederherstellung sichert V313 ebenfalls.

## Sicherheit und Grenzen

- Kein zusätzlicher Canvas, keine Raymarching-/Partikelsimulation, keine neuen Audio-Abhängigkeiten.
- Bei Pause oder `reducedMotion` werden keine neuen V313-Zusatz-Cues angewendet.
- Seek und Trackwechsel werden im Planner erkannt; keine künstlichen Übergangsblitze.
- V310-FX-, Licht- und Lichtkegel-Budgets haben Vorrang. Andere automatische V306-Subsysteme bleiben weiterhin abwählbar.
- Manuelle Kamera-/Licht-Timelines und importierte Animationen werden nicht überschrieben.
- Automatische Songabschnitte und Zeitbögen beruhen auf den vorhandenen Daten und können die echte musikalische Form verfehlen.

## Dateien

- `components/visualizer/danceShowEvolutionV313.ts`: Einstellungen, Zeitdramaturgie, begrenzte Cue-Modulation.
- `components/visualizer/DanceShowEvolutionControlsV313.tsx`: Live-Konfiguration in Settings.
- `components/visualizer/VisualizerStage.tsx`: Verknüpft Songlänge, V310-Budget und V306-Show-Cue.
- `components/visualizer/ThreeAvatar.tsx`: Skalierung der additiven Tanz-Akzente.
- `components/visualizer/intelligentDanceChoreographyV312.ts`: Phasensignale für Solo-/Duo-Bewegungen.
- `components/visualizer/showPresetsV309.ts` und `ShowPresetStudioV309.tsx`: mitgelieferte Presets und rückwärtskompatible Wiederherstellung.
- `tests/v313-dance-show-evolution-regression.cjs`: pure JS/TS-Regression mit Songphasen, Audio-Abschnitten, Pause, Seek, Reduced Motion, Effektbudgets und Presets.

## Prüfen

```sh
npm install
npm run verify:offline
npm run verify
```

**Prüfstatus dieser Ausgabe:** Offline-Tests und TS/TSX-Syntax bestanden. Ein vollständiger Next.js-Build / TypeScript-Typcheck kann erst mit installierten Projektabhängigkeiten ausgeführt werden.
