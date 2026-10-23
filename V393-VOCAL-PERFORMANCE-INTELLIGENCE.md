# V393 – Vocal Performance Intelligence 3.0

## Neue Funktion

V393 verbindet die **bereits vorhandenen, zeitlich synchronisierten Vocal-Cues** (V368/V372/V374/V384) mit moderaten Kopf-, Blick-, Brust- und Armgesten. Die neue Schicht betrifft sowohl die prozeduralen R3F-Avatare als auch importierte GLB-Avatare und läuft **nach** der bestehenden V376/V386-Gesangs-/Konzertregie.

Unter **Einstellungen → Vocal Performance → V393 · Vocal Performance Intelligence 3.0** stehen folgende Möglichkeiten bereit:

- **Aus** (Standard; V392-Verhalten bleibt gleich)
- **Dezent**: geringere Bewegungsakzente, insbesondere auf kleinen Displays
- **Ausdrucksstark**: stärkere, weiterhin begrenzte Live-Gestik
- **Betonung und Gestik**: 0 bis 100 %

## Details

1. Rap-Passagen erhalten kurze, körperlich geerdete Betonungen und abwechselnde linke/rechte Arm-Akzente. Gesangspassagen öffnen die Haltung sanfter.
2. Die schon vorhandene Mundform und der Lippenverschluss bleiben unverändert. Eine geschlossene Artikulation dämpft zusätzliche Kopfbetonungen.
3. Lead-Avatare werden stärker betont als Backings; V385/V374-Rollen bleiben maßgeblich. Es wird **nicht** anhand des Audios ermittelt, wer tatsächlich singt.
4. Bei aktiver übergeordneter Show-Regie können Hook-/Drop-Abschnitte etwas intensiver, Breaks ruhiger gestaltet werden. Ohne Show-Regie wird kein erfundener Songabschnitt angenommen.
5. **Nur wortgenau synchronisierte Lyrics** erzeugen zusätzliche Betonungen. Zeilenweise Lyrics erhalten keine simulierten Wortimpulse.
6. Bei Pause, ausgeschaltetem Lip-Sync, Reduced Motion, manuell priorisierter Choreografie oder importiertem priorisiertem Animationsclip bleibt der V393-Zusatzeffekt vollständig aus.
7. Bewegungswerte sind durch Winkelgrenzen auf die bisherigen V371-Rigkanäle begrenzt; V371 übernimmt weiche Übergänge. Fuß-IK, Animation-Mixer und Audio-Synchronisation werden nicht verändert.

## Neue Dateien und Integration

- `components/visualizer/vocalPerformanceIntelligenceV393.ts` – reine, deterministische, begrenzte Body-Cue-Funktion
- `components/visualizer/ThreeAvatar.tsx` – Integration in prozedurale und GLB-Avatare
- `components/visualizer/registry.tsx`, `components/visualizer/VisualizerStage.tsx`, `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/SettingsPanel.tsx` – Einstellungen, Weitergabe und Reset
- `tests/v393-vocal-intelligence-regression.cjs` – Verhaltenstests für Wortvertrauen, Rollen, Sicherheit, Grenzen und Integration

## Grenzen

Spotify stellt für gewöhnliche Web-Wiedergabe keine direkt verwertbare isolierte Gesangsspur bereit. Daher ist V393 **kein tatsächliches Phonem-Tracking**, sondern eine visuelle, textgestützte Annäherung anhand vorhandener Zeitmarken und Audiosignale. Für überprüfbar präzise Lippen-/Gesten-Synchronisation wäre später eine rechtmäßig verfügbare separate Audiodatei bzw. eine Audioanalysequelle nötig.

## Tests

`npm run test:v393`, `npm run check:syntax` und `npm run verify:offline`.

Auf einem Rechner mit npm-Abhängigkeiten: `npm install && npm run verify`. Der vollständige Next.js-Build ist in der Offline-Arbeitsumgebung wegen fehlender Abhängigkeiten **nicht** verifiziert.
