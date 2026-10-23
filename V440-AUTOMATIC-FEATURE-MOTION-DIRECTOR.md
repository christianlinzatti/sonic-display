# Sonic Display V440 – Automatic Feature Motion Director

## Ziel

Auf Basis V439 kombiniert V440 die gemessenen GLB-Motion-Profile mit einer möglichst selbsttätigen Song-Inszenierung und aktiviert bei **mehreren Spotify-Track-Künstlern** eine zweite Bühnenfigur. Es gibt **keine Stimmerkennung**: Die visuelle Aufmerksamkeitsverteilung erfolgt anhand von Zeit- und Songstruktur und stellt keine Aussage dar, wer eine Zeile singt.

## Features

1. `automaticFeatureShowV440.ts`: Pure, begrenzte Auswertung der Spotify-Credits, automatische Duo-Bühne (zwei Slots), deterministischer Vers-Fokus nach Phrasen, gemeinsame Hook-/Duett-Choreografie und rein visuelle V436-Kamera-Zuordnungen. Unicode-normalisierte Duplikatvermeidung; keine Titelstring-Behauptungen über Künstler.
2. `VisualizerStage.tsx`: Liegen mindestens zwei eindeutige Spotify-Künstler-Credits vor, wird bei Avatar-Visualisierung, eingeschalteter Option, Solo-Grundmodus und nicht aktiviertem Reduced Motion für diesen Song der `duet`-Bühnenmodus gesetzt. Die Einstellung wird **nicht dauerhaft überschrieben**; beim nächsten Solo-Titel gilt wieder die ursprüngliche Aufstellung. Vorhandene explizite `sync`, `mirror` und `duet`-Einstellungen bleiben unangetastet.
3. Die Clip-Auswahl V438/V439 bekommt ein primäres und ein **unabhängiges sekundäres** Sequenzgedächtnis. Hook/Verse/Break sowie musikalische Energie und gemessene GLB-Profile beeinflussen die beiden Rollen unterschiedlich. Die Option `avoidMotionId` vermindert unnötig identische automatische Animationen – ausdrücklich als Hook/Verse markierte manuelle Clips behalten Priorität.
4. `ThreeAvatar.tsx`: Die V440-Empfehlungen werden als Clipwunsch an die vorhandene GLB-Animations-Mixer/-Crossfade-Logik weitergegeben, statt eine zusätzliche oder austauschende Engine zu laden. Manuelle Choreografie, Blend/Timeline, evolutionäre oder adaptive explizite Sequenzen bleiben vorrangig; unbekannte Clips fallen auf die bisherige Auswahl zurück. Bei rein prozeduralen Avataren erfolgt keine fiktive GLB-Motion-Übernahme.
5. Die bestehende V436-Kamera kann bei Feature-Songs den **visuellen Fokus** in vierzeiligen Abschnitten wechseln. V416-Originalrollen haben Vorrang, Hooks nutzen weiterhin die gruppierte Einstellung. Dadurch werden **keine** Vocal-/Lip-Sync-Rollen generiert oder übergeben.
6. UI: `V440 · Automatic Feature Show` in den Einstellungen der Motion Intelligence, mit separaten Schaltern und Anzeige der tatsächlich gelieferten Spotify-Credits.

## Grenzen und Schutzvorkehrungen

- Automatisch sind bis zu **zwei** Bühnen-Avatare vorgesehen. Songs mit drei oder mehr Künstlern werden erkannt, aber nicht automatisch mit drei oder mehr Figuren besetzt. Bereits konfigurierte Multi-Avatar-Gruppen können ihre eigenen Einstellungen nutzen.
- Die aktuelle Künstler-Information kommt aus `track.artistDetails` beziehungsweise `track.artists`. Texte wie `(feat. XYZ)` reichen ohne Track-Credits nicht für eine verlässliche automatische Besetzung.
- Es findet weder Spracherkennung noch Erkennung der tatsächlich singenden Person, der Songrolle oder des Künstleraussehens statt. Das gewählte zweite Modell ist das vorhandene sekundäre Modell (standardmäßig prozedural), nicht ein vorgetäuschtes Abbild des Feature-Künstlers.
- Für tatsächlich wechselnde **GLB-Animationen** müssen entsprechende Dateien für die jeweilige Avatar-ID vorhanden, die Motion-Library-Automatik angeschaltet und die V437/V438-Automatik zugelassen sein. Die Bühne kann trotzdem beide Avatare zeigen, wenn keine GLBs installiert sind.
- Bei `reducedMotion`, deaktivierter Option, deaktiviertem Avatar-Visualizer oder explizit konfigurierter Aufstellung nimmt V440 keine automatische Änderung der Formation vor. Speichern/Seek/Spotify-API-Aufrufe findet in der Planungslogik nicht statt.
- Die GLB-Ergebnisse V439 bleiben heuristisch; professionelle Tanzqualität, Fußkontakt, verlässliche Musik-Downbeats oder einzelne Rapper-Stimmen sind damit nicht verifiziert.

## Testen

```powershell
npm install
npm run verify:v440
npm run typecheck
npm run build
```

Der Produktions-Build und ein tatsächlicher Browser-/WebGL-Test mit mehreren echten Avataren sind nicht Bestandteil des isoliert ausgeführten Tests in dieser Umgebung.
