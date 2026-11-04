# V823 – Visual FX Timeline Editor: Funktion und Prüfung

## Implementiert

- Pure, deterministische, seek-stabile, songbezogene Cue-Evaluation in `components/visualizer/visualFxTimelineV823.ts`.
- Ein visueller Fünf-Spuren-Editor in `components/visualizer/VisualFxTimelineEditorV823.tsx` (Laser, LED, Partikel, Schaumkanone, V819-Lichtübergang).
- Cues hinzufügen, auswählen, Start/Dauer/Stärke/Effektspuren/Modus bearbeiten, entfernen. Zeitcursor und schematische Vorschau; den aktuellen Spotify-Titel über den vorhandenen Playback-Snapshot übernehmen oder eine Titel-ID manuell eintragen.
- `boost` und `mute` setzen **nur bestehende** Effekte innerhalb verifizierter Musikabschnitte herauf oder herab. Kein Erzwingen von inaktiven V810/821/816/817/819-Effekten; keine neuen Show-Schnitte, keine neue Audio-/Beat-Zeitquelle, keine zusätzlichen Meshes oder Partikel-Budgets.
- Song-Cues gespeichert unter `UiPreferences.concertFxV810.timelineCuesV823`; bestehende Einstellungen bleiben kompatibel. Maximum 200 Cues insgesamt und 48 je Track, Validierung und Normalisierung bei Import.
- LED-Cues können einen V821-Look innerhalb der vorhandenen LED-Rückwand auswählen. Die V635/V647-Grundebene bleibt autonom.
- Übergangscues ändern nur die Intensität eines durch V791 bestätigten Übergangs; keine neuen Kameraschnitte oder Seams.
- Schutz: vorhandene verified-V604/V761-Abschnittsfreigabe, Pause, reduced motion, manuelle Licht-Cues, Blackout, Lyrics-/Gesichtsschutz und visuelles Budget bleiben maßgeblich.

## Ausgeführte Prüfungen

- `npm run test:v823`: **PASS**, 39 funktionale und Integrations-Testgruppen (CRUD-Contract, Bounds, Validierung, Songisolation, Fade, Pause, Seek, Schutzfreigabe, fünf Spuren).
- `npm run test:v823:types`: **PASS**, isolierter strict TypeScript-Check der V810/V821/V822/V823-Planer.
- `npm run test:v800` bis `npm run test:v822`: **PASS**, alle 23 bisherigen Versions-Regressionen in mehreren Testbatches. V800–V808: starre Versionstests um V823 erweitert (inhaltliche Assertions unverändert).
- `npm run check:syntax`: **PASS**, 1186 TS-/TSX-Quelldateien.
- `npm run check:architecture`: **PASS**, 894 Pfadreferenzen, 10 Architektursektionen.
- `npm run test:module-case`: **PASS**, keine Windows-/Linux-Kollisionsnamen.
- `npm run check:lockfile:v752`: **PASS**.

## Nicht als bestanden gewertet

- `npm run typecheck` (vollständiges Projekt): **ZEITLIMIT**, innerhalb von 18 Sekunden kein Ergebnis (Exit 124); kann nicht als bestanden behauptet werden.
- `npm --ignore-scripts run build`: **BLOCKIERT**: `next: not found` (Exit 127, Projektpakete fehlen). Auch eine vollständige vorgeschaltete Release-Testkette ist lokal noch auszuführen.
- Browser-/WebGL-/GPU-Abnahme mit echten GLB-Avataren, Lyrics, LED, Laser, Schaum, manuellen Cues sowie Langzeit-Performance: **nicht durchgeführt**.
- Zusätzliches V823-React-TSX mit sämtlichen Projekt-Dependencies vollständig kompilieren: **nicht durchgeführt**.

**Status: Integriert / isoliert getestet, NICHT produktiv freigegeben.**

## Lokale Freigabe (Windows)

```powershell
npm ci
npm run test:v823
npm run test:v823:types
npm run typecheck
npm run build
```

Danach im echten Browser für einen verifizierten Spotify-Titel Test-Cues im Settings > Concert FX Studio > V823 anlegen; Wiedergabe, Seek, Trackwechsel, manuelles Licht, Pause und Blackouts sowie mehrteilige Performances testen.
