# Sonic Display V326 – Advanced Multi-Avatar Stage Director

V326 erweitert die bisherige maximal zweiköpfige Bühnenformation **optional** auf drei oder vier gleichzeitig gerenderte und unabhängig animierte Tänzer. Basis: vollständiges Projekt V325.

## Bedienung

**Settings → Avatar → Multi-Avatar Choreography → Advanced Multi-Avatar Stage Director V326**.

1. Anzahl 3 oder 4 wählen, Mindestabstand der Bühnenplätze einstellen.
2. Optional ein V318-Analyse-JSON für den aktuellen Track importieren; Raster nach Takten oder Beats einstellen. Fehlen Musikmarker, kommt das BPM-Raster zum Einsatz.
3. Formations-Cue wählen, in der Draufsicht die vier bunten Bühnenpunkte verschieben. Formationen: Linie, breite Linie, Bogen oder versetzt. Pro Cue Solo-Fokus und Übergangsdauer einstellen. Per Timeline-Griff zeitlich verschieben.
4. Optionale 3D-Vorschau einschalten. Bei GLBs mit eingebetteter Animation wird der erste Clip für alle Vorschaufiguren zur gemeinsamen Zeit abgetastet; die eigentliche Bühne verfügt über vollständige unabhängige Avatar-Motion-Instanzen.
5. Für Tänzer 3 und 4 optional ein Modell aus der installierten statischen Modellliste auswählen; andernfalls werden die aktuellen Lead-/Partner-Einstellungen wiederverwendet. Die jeweiligen Avatar-Dateien werden getrennt geklont, einschließlich eigener Animationsmixer und IK.
6. Nur bei ausdrücklicher Zustimmung **Gruppenmodus live aktivieren**; V325-Zwei-Tänzer-Cues bleiben gespeichert und werden bei Deaktivierung wieder normal verwendet.
7. Gruppen-Choreografie optional als JSON exportieren/importieren. Importierte Daten sind zunächst **deaktiviert**, auch wenn die Datei `enabled:true` enthält.

## Architektur

- `components/visualizer/multiAvatarStageDirectorV326.ts`: Reine, deterministische Cue-Evaluierung, Dauer-/Koordinatengrenzen, Track-Isolation, Spacing/Lane-Korrektur und lokale Speicherung unter `sonic-multi-avatar-stage-v326`.
- `components/visualizer/MultiAvatarStageStudioV326.tsx`: Cue-Timeline mit V318/V319-Musikraster, Drag-and-drop der Bühnenpunkte, Modellwahl, Solo/Drop, Abspielen/Pausieren/Scrubben, Import/Export.
- `components/visualizer/MultiAvatarPreviewV326.tsx`: Abgeschlossene 3D-Vorschau; GLB-Klone mit unabhängigen AnimationMixern, gemeinsame Vorschau-Zeit, Fallback-Figuren.
- `components/visualizer/ThreeAvatar.tsx`: `GroupDancersV326` im **bestehenden Canvas**; drei/vier Dancer mit getrennten `workloadSlot`-Kennungen und getrennten GLB-Rigs. Die Bühnen-Gruppenpositionen werden über `useFrame` und eine gemeinsame Zeitbasis bewegt. Standard-V325- und frühere Zwei-Avatar-Systeme bleiben unverändert, wenn V326 nicht aktiv ist.

## Qualität, Sicherheit und Grenzen

- Die Bühnenplätze bleiben indexstabil (keine gegenseitige Kreuzung durch vertauschte Positionen). Der horizontale Mindestabstand wird begrenzt und ist in beliebigen Formationen konservativ; keine vollwertige Körper-/Armkollision. Eine Bewegung der gesamten Root-Gruppen kann während der Standphase Foot-Sliding verursachen. Bei V322-Foot-Lock werden Gruppenfahrten verlangsamt, aber nicht vollständig eliminiert.
- V326 verändert **keine GLB-Keyframes, Fußknochen, Foot-IK oder V323-Pose-Korrektur**. Für jeden Avatar werden existierende Musik-/Motion-Einstellungen wiederverwendet. Es gibt noch keine neue Kuratierung von vier unabhängig gewählten Clip-Abläufen oder tatsächliches physikalisches Partner-Kontakttracking.
- Exakte Renderkosten hängen von Anzahl, Mesh-Polygonen, GLB-Größe und GPU ab. Der Gruppenmodus ist für ältere/kleine Geräte standardmäßig ausgeschaltet. Für 10-Zoll-/Raspberry-Pi-Geräte zuerst mit drei sparsamen Avataren testen.
- Songbindung wird ausschließlich bei passender Track-ID und vorhandener gültiger Playback-Zeit aktiviert. Der V318-Import greift auf keine internen Spotify-Endpunkte zu.
- V325-Timeline, V324-Zwei-Avatar-Abstandsschutz, Duet-/Mirror-Modi und One-Click-Show-Presets bleiben unabhängig bestehen.

## Checks

- `npm run test:v326`: Count-3/4, deterministische Zeit-/Cue-Berechnung, Track-Isolation, konservative Abstände, Positionsgrenzen, Normalisierung, Import/Export-Persistenz, korrekte Bühnen- und Vorschau-Anbindung.
- `npm run verify:offline`: sämtliche Regressionen bis V326 einschließlich TS-/TSX-Syntax.
- Strenge isolierte TypeScript-Typprüfung der V326-Engine: `tsc --noEmit --strict --lib ES2022,DOM --target ES2022 --module esnext --skipLibCheck components/visualizer/multiAvatarStageDirectorV326.ts`.
- Produktionsbuild mit `npm install && npm run verify` lokal prüfen. Der vollständige Next.js-Typcheck, Produktionsbuild und echte GPU-Browserläufe sind in der bereitgestellten Umgebung **nicht bestätigt**, weil Next.js/React/Three und weitere npm-Dependencies fehlen.
