# V641 – Full Concert Quality Validation

## Ziel und tatsächlicher Umfang

V641 ergänzt den **bestehenden** lokalen QA-Inspector V466 um eine nur manuell startbare, zeitlich begrenzte **Vollsong-Messung**. Sie benutzt reale Browser-QA-Snapshots und Metadaten aus der bereits gerenderten `VisualizerStage`. Sie generiert **keine** synthetischen Szenen, keinen neuen Render-Loop und greift weder in die Show noch in Spotify, den GLB-Mixer oder die Lyrics ein.

### Bedienung

1. Anwendung auf `http://127.0.0.1:3000/?benchmarkV592=1` starten (für GLB-Mesh-Nachweis auf Loopback); im Visualizer auf Avatar/3D-Bühne wechseln, lokale QA-Schaltfläche öffnen.
2. Song am **Anfang** mit einem echten geladenen GLB-Avatar starten. In QA **Neue Song-Aufzeichnung** drücken.
3. Die gesamte Wiedergabe beobachten. Währenddessen prüft V641 etwa alle 1000 ms die bereits vorhandenen V466-Messwerte. Fehlende oder veraltete Messwerte, Pausen, Seek-Sprünge und lange Lücken zählen nicht als gemessene Dauer.
4. Am Ende **Aufzeichnung beenden** und **JSON-Prüfbericht** wählen. Die Datei enthält technische Messwerte und Metadaten, **keinen Audioinhalt oder Lyrics-Text**. Sie enthält aber eine Track-ID; Datei entsprechend behandeln.
5. Das gleiche Experiment getrennt mit **1, 2 und 4 GLB-Avataren** auf dem **gleichen Gerät/Browser, bei gleicher Auflösung, gleichem Song und vergleichbaren Bühneneinstellungen** wiederholen.
6. Dateien per CLI vergleichen:

```powershell
npm run audit:v641:compare -- --avatar1=sonic-v641-audit-1-avatars.json --avatar2=sonic-v641-audit-2-avatars.json --avatar4=sonic-v641-audit-4-avatars.json --deviceLabel="Windows PC / 1280x800" --out=v641-comparison.json
```

Der Profilvergleich verlangt zusätzlich für mindestens 75 % aller Messpunkte tatsächlich über V592 bestätigte GLB-Mesh-Gruppen in der angegebenen Zahl. Ohne den Loopback-Diagnosemodus ist die allgemeine V641-Songprüfung nutzbar, der GLB-Profilvergleich aber bewusst gesperrt.

Der Vergleich kann ohne alle drei Profile ausgeführt werden, markiert dann aber fehlende Messungen. Die Vergleichsdatei wird **nicht** automatisch veröffentlicht oder hochgeladen.

### Prüfgrößen und Grenzen

- Tatsächlich zusammenhängend beobachtete Wiedergabezeit in % der Trackdauer. Breite Abdeckung verlangt >=80 % sowie Messungen nahe Anfang und Ende, mindestens 30 gültige Punkte und FPS-Daten. Selbst dann ist der Status **`broad-coverage-needs-human-review`**, nicht `passed`.
- Gemessene Browser-FPS (Minimum und Median), Median der bereits berechneten P95-Fensterzeiten, Draw Calls, Dreiecke (bei Profilvergleich).
- Als **Heuristik**: länger gleichbleibende Kamera- und Regie-Metadaten, mögliche Kopfprojektion außerhalb der Bühne und projizierte Nähe zum DOM-Lyrics-Rechteck. Keine Pixelerkennung, keine glaubwürdige Aussage über sichtbare Gesichter oder echte Textlesbarkeit.
- Angezeigte Fokus-/Kapitelmetadaten liefern **keinen Beleg dafür, welcher Künstler singt**. Die Aufzeichnung beweist weder Lippen-Synchronität noch Tanz-Natürlichkeit noch künstlerische Dramaturgie. Menschliche Prüfung und ggf. Bildaufnahmen aus den vorhandenen V592/V603-Benchmarkprogrammen bleiben nötig.
- Eine Browsermessung auf Windows sagt **nicht** aus, ob ein Raspberry Pi performant ist. Kein erfundener GPU-Zeitwert, keine Raspberry-Pi-Zertifizierung.
- Kein zusätzliches `useFrame`, kein Netzwerk, keine lokalen Speicher-APIs, keine persistente Aufnahme ohne ausdrücklichen JSON-Export. Bei geschlossener QA wird die Sammlung beendet. Maximal 1200 Beobachtungen in einer Aufnahme.

### Integration

- `components/visualizer/fullConcertQualityAuditV641.ts`: reine konservative Prüflogik.
- `components/visualizer/FullConcertQualityAuditPanelV641.tsx`: opt-in QA-Recorder, lokaler Bericht-Export.
- `components/visualizer/ConcertQualityInspectorV466.tsx`: vorhandener QA-Schalter und Panel unverändert, mit zusätzlichem Abschnitt.
- `components/visualizer/concertQualityStoreV466.ts`: read-only Snapshot-Getter; V466-Veröffentlichungsweg unverändert.
- `components/visualizer/VisualizerStage.tsx`: nur Track-/Zeit-/Play-Status als zusätzliche DOM-Metadaten, bereits vorhandene Regie-Metadaten.
- `scripts/v641-full-concert-compare.cjs`: lokal ausführbarer Vergleich echter, unabhängig erfasster Profile.

### Tests

`npm run test:v641`, `npm run test:v641:types`, `npm run test:v641:compare`, `npm run test:smoke:v641`, `npm run verify:v641`, anschließend auf deinem Rechner `npx tsc --noEmit` und `npm run build`.

**Visuelle Abnahme und Lastvergleich mit echten GLB-Dateien bleiben bis zu realen Aufnahmen offen.**
