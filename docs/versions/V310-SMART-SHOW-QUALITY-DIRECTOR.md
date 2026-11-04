# Sonic Display V310 – Smart Show Quality Director

V310 baut auf **V309 One-Click Show Presets** auf. Es ergänzt einen **abschaltbaren, deterministischen Qualitätsregisseur** über der bestehenden V306-Show-Regie. Eine neue 3D-Engine, neue Assets oder teure Renderpässe sind nicht nötig.

## Was die Qualitätsregie verbessert

- **Kameravariation ohne Flackern:** Die jüngsten Kamerashots werden berücksichtigt; ein neuer Shot wird nur beim Wechsel des musikalischen Abschnitts oder nach einer längeren Phrasengrenze gewählt. Die Mindestdauer für Varianten innerhalb eines Abschnitts ist einstellbar.
- **Formationsvariation ohne hektischen Wechsel:** Solo-/Duo-/Mirror-Optionen werden bei einem Abschnittswechsel variiert. Im Drop bleibt die Synchronformation erhalten. Innerhalb eines Abschnitts wird die Formation nicht willkürlich umgeschaltet.
- **Ruhige Verse und Breaks:** Die automatische Kameraaktivität und Light-/FX-Gains werden bei ruhigen Abschnitten reduziert. Ein echter Drop behält seinen musikalisch erkannten Akzent.
- **Tänzer-Fokus und Effekt-Obergrenze:** Automatische Light-Beam-Gains und Show-Dance-FX werden begrenzt, ohne benutzerdefinierte Licht-Cues, Blackouts oder manuelle Effekte zu verändern.
- **Musikzeit statt Zufall:** Der Planer arbeitet mit Track-ID, Wiedergabeposition, BPM, Songabschnitt und zuletzt gewählten Einstellungen. Pausen, Rücksprünge, Trackwechsel und große Seeks werden abgefangen.

Die Songstruktur hängt weiterhin von der bestehenden Audioanalyse ab. Ohne live verfügbare Audiomerkmale nutzt Sonic Display ggf. geschätzte Daten; V310 **misst keine objektive Tanzqualität** und erkennt keine menschlichen Fehler mittels Computer Vision.

## Bedienung

Unter **Settings → Dynamic Stage → Smart Stage Director → Smart Show Quality Director · V310**:

- **Show-Qualität automatisch optimieren**: aktiv, wenn auch der Ultimate Show Director V306 aktiviert ist.
- **Abwechslung**: 0–100 % (Default 65 %). Unterhalb 20 % bleiben die Basiskamera- und Formationsentscheidungen erhalten. Zusätzliche Kameravarianten innerhalb derselben Songsektion erfordern mindestens 45 %.
- **Kameraposition mindestens halten**: 8–40 Sekunden (Default 14). Gilt für zusätzliche Varianten *innerhalb* einer Songsektion; musikalische Abschnittswechsel bleiben möglich.
- **Tänzer im Mittelpunkt**: 0–100 % (Default 70). Dämpft automatischen Lichtüberhang und FX.
- **Maximale automatische Dance FX**: 0–100 % (Default 75). Reduziert ausschließlich die automatischen V306-Effekt-Cues; manuell konfigurierte Effekte bleiben erhalten.

Die vier V309-Presets enthalten neue V310-Parameter:

| Preset | Abwechslung | Mindestdauer | Fokus | Auto FX max. |
|---|---:|---:|---:|---:|
| Hardtekk Mainstage | 85 % | 12 s | 65 % | 85 % |
| Deutschrap Spotlight | 45 % | 22 s | 88 % | 35 % |
| Cinematic Festival | 70 % | 18 s | 75 % | 65 % |
| Ambient Night | 30 % | 28 s | 90 % | 20 % |

Persönliche V309-Presets und ihre V309-Speicher-/Rückgängig-Funktionen werden um V310-Werte erweitert. Bestehende ältere V309-Presets ohne das Qualitätsfeld bekommen sichere Defaultwerte.

## Integration

- `components/visualizer/smartShowQualityV310.ts`: reiner Playback-Time-Regler, begrenzte Historien und persistierte Einstellungen.
- `components/visualizer/ShowQualityControlsV310.tsx`: Regler im bestehenden Einstellungsbereich.
- `components/visualizer/VisualizerStage.tsx`: Quality-State wird bei Trackrendering weitergeführt und moduliert den existierenden V306-Show-Cue **bevor** dieser an Bühne, Kamera und Avatar-Layer übergeben wird.
- `components/visualizer/showPresetsV309.ts` und `ShowPresetStudioV309.tsx`: V310-Presetwerte, Migration und Restore.
- `tests/v310-show-quality-regression.cjs`: deterministische Entscheidungen, Wiederholungsschutz, Drop-Sync, Break-Pacing, Pause, Seek, Opt-out, Reduced Motion, Storage und Wiring.

### Grenzen / manuelle Prioritäten

Gespeicherte Kamera-Keyframes und Live-Kamera-Edits haben weiterhin Vorrang. Manuell ausgewählte Duo-/Multi-Avatar-Modi bleiben erhalten; die automatische Formation wirkt nur, wenn die bisherige V306-Regie tatsächlich die Formation auswählen darf. Individuelle Licht-Timelines, Blackouts, Zugangserleichterungen und die GPU-Sparstufen werden nicht überschrieben. V310 verändert keine importierten Clips und führt keine gesonderten IK-Berechnungen durch.

## Verifikation

- `npm run test:v310` – bestanden.
- `npm run verify:offline` – bestanden (inkl. aller bisher aktivierten Regressionstests bis V310).
- `npm run check:syntax` – bestanden (347 TS-/TSX-Dateien).
- `npm run build:preflight` – **blockiert**: npm-Abhängigkeiten fehlen, Next.js/React/Three.js und zugehörige Typdefinitionen sind nicht installiert. Kein vollständiger Typcheck oder Next.js-Produktionsbuild behauptet.

Auf deinem Rechner im entpackten Projekt `npm install` und anschließend `npm run verify` ausführen. Das Archiv enthält bewusst weder `node_modules` noch `.next` oder `package-lock.json`.
