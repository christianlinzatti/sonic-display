# Sonic Display V416 – Multi-Avatar Rap Duet Studio

## Ziel
Sichere, vom Nutzer **explizit** gestaltete visuelle Rollenverteilung bei Rap-Duetten mit zwei, drei oder vier Avataren. Grundlage sind vorhandene synchronisierte Spotify-Lyrics und die bestehende V385-/V376-/V377-/V415-Pipeline. Es findet **keine automatische Sprecher- oder Phonemerkennung** statt.

## Bedienung
1. Spotify-Titel mit synchronisierten Lyrics abspielen und eine Duo-Bühne oder die V326-Bühne mit drei/vier Avataren aktivieren.
2. In **Einstellungen → Anzeige → V416 Multi-Avatar Rap Duet Studio** einen Lyrics-Bereich auswählen.
3. `Solo / Lead`, `Call & Response`, `Duett (beide Stimmen)` oder `Gemeinsame Hook` wählen, Lead/Partner und Intensität festlegen und speichern.
4. Mit dem Vorschau-Regler die Rollenzuordnung **ohne Veränderung der Spotify-Wiedergabe** prüfen.
5. Die Live-Option explizit einschalten; bei Bedarf automatische Kameraführung zusätzlich aktivieren.

## Funktionsumfang
- Track-ID-gebundene Speicherung im bestehenden UI-Präferenzspeicher; vorhandene V385-Zuordnungen werden nicht überschrieben.
- Validierte Zeilenbereiche, 0–3 Avatar-Slots, maximal 150 Szenen pro Song, letzter überlappender Eintrag gewinnt.
- Bei `Solo`: nur der zugewiesene Avatar lip-synchron als Hauptstimme.
- Bei `Call & Response`: opt-in visualisierte Übergabe bei ca. 62 % der Zeile; eine künstlerische Segmentierung, keine akustisch erkannte Antwort.
- Bei `Duett`: beide gewählten Avatare artikulieren gleichzeitig.
- Bei `Hook`: alle sichtbaren Avatare werden der gemeinsamen Gesangsrolle zugeordnet.
- Gestenakzente über die vorhandene V376-Rollensteuerung; lip-synchrone Rollen über die bestehende V385-Singer-Mask; kein konkurrierender neuer Animations-Mixer.
- Kameraoptik verwendet vorhandene V377-Fokus-/Zweier-/Gruppen-Shots und den vorhandenen Kamera-Hold; explizite Duett-Zeilen erhalten einen Zweier-Shot.

## Prioritäten und Schutzmaßnahmen
1. Nutzerdefinierte Show-Timelines, manuelle Kameras, gespeicherte V385-Stimmenzuordnungen und V326-/V325-Choreografien haben Vorrang.
2. V416 ist default `false`, nur für denselben Track, gültige Lyrics und mindestens zwei Avatare aktiv.
3. Bei Pausen und Lyrics-Gaps keine V416-Aktivität. Reduzierte Bewegung verhindert zusätzliche Gesten und Übergaben.
4. Keine Änderungen an vorhandenen GLB-Dateien, GLTF-Mixern, Retargeting, Choreografie-Presets oder Spotify-Wiedergabe.
5. Ohne passenden V416-Cue greift die bisherige V375/V376/V385-Steuerung unverändert.

## Technische Orte
- `components/visualizer/rapDuetStudioV416.ts` – reine, deterministische Casting-/Cue-Logik.
- `components/visualizer/RapDuetStudioPanelV416.tsx` – sichtbarer Editor.
- `components/visualizer/ThreeAvatar.tsx` – beide bestehenden Avatar-Pipelines.
- `components/visualizer/StageCameraDirectorV289.tsx` – automatische Kamera mit Schutzregeln.
- `components/visualizer/VisualizerStage.tsx` – Track- und Einstellungskontext.
- `context/UiPreferencesContext.tsx`, `types/music.ts`, `components/visualizer/registry.tsx` – Schema/Persistenz.
- `tests/v416-rap-duet-studio-regression.cjs` und `tests/tsconfig.v416-core.json` – Tests.

## Lokale Windows-Prüfung
```powershell
npm install
npx tsc --noEmit
npm run build
```
Das vollständige `next build` konnte in der Bereitstellungsumgebung ohne installierte Projektnode_modules nicht ausgeführt werden. Die Offline-Regressionsprüfungen und der gezielte Strict-Typcheck sind separat dokumentiert.
