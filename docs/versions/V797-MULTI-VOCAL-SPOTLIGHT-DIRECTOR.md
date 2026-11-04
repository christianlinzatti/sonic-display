# Sonic Display V797 – Multi-Vocal Spotlight Director

## Umsetzung

V797 verbindet **bereits bestätigte und trackgebundene** Vocal-Zuordnungen aus V385, V416 oder V496 über den bestehenden V528-Szenenplan mit Kamera und Bühnenlicht. Der Pure-TS-Planer `components/visualizer/multiVocalSpotlightDirectorV797.ts` erkennt ausschließlich aus den vom Nutzer festgelegten Einsätzen die folgenden Bühnenrollen:

- **Solo:** Der aktuell zugeordnete Lead-Slot erhält einen sehr dezenten Portraitlichtakzent.
- **Übergabe:** Vorheriger und neuer Sänger werden gemeinsam bei einem bestätigten Wechsel berücksichtigt.
- **Duett:** Die vorhandene Fill-Leuchte kann dem zweiten aktiven Performer folgen; eine vorsichtig erweiterte Kameraperspektive berücksichtigt beide sichtbaren Sänger.
- **Ensemble:** Bei mindestens drei zugeordneten Performern wird die bestehende automatische Kamera nur geringfügig geweitet.

## Schnittstellen

`ThreeAvatar.tsx` erstellt den V797-Cue **einmal** auf Basis der vorhandenen V528-Evidenz und reicht ihn an `StageCameraDirectorV289.tsx` und `DynamicStage.tsx` weiter. Die Kamera verändert nur Z/FOV in engen Grenzen und nur bei echten, sichtbaren Performer-Ankern. Sie bleibt im bestehenden Canvas; der abschließende V351-Lyrics-Schutz bleibt erhalten. Die Lichtanpassungen begrenzen Key- und Fill-Gewinne und nutzen **vorhandene** Beleuchtung und Performer-Positionen, keine zusätzlichen WebGL-Lichter. Über `data-v797-mode`, `data-v797-lead`, `data-v797-cast` sind die aktuellen Entscheidungen diagnostizierbar.

Bei Songwechsel/Seek, ungültigen Zuordnungen oder Lücken fällt V797 unverzüglich in die bisherige Regie zurück. Manuelle Kamera-, Show- und Licht-Cues, Blackouts, reduzierte Bewegung, niedrige Qualitätsstufe und Lyrics-Sichtbarkeit haben Vorrang. Vor der Lichtanwendung prüft der Renderer die tatsächlich aktive Licht-Timeline erneut.

**Nicht enthalten:** automatische Sängererkennung oder Adlib-Diarisierung, neue Motion-Clips, unabhängige Moving Heads oder Erweiterungen der Lippensynchronität. Bereits vorhandene Vocal- und Avatar-Regien behalten die Verantwortung für Gesang, Mundbewegung und Tanz.

## Prüfung

```bash
npm run test:v797
npm run test:v797:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

Weitere Details: `V797-VERIFICATION.md`.
