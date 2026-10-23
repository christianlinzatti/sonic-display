# Sonic Display V350 – Lyrics & Photo Choreography

V350 synchronisiert **die bereits auf der Bühne angezeigten Lyrics** und die bestehenden Fotogalerien. Das Feature verändert keine Choreografie-Daten der Avatare und erstellt keine zusätzliche WebGL-Szene.

## Verhalten

* **Verse/Intro/Bridge/Outro:** Text hat Priorität. Die Galerie reduziert sichtbare Fotoebenen, dimmt Bilder, verlangsamt Fotoeffekte und weicht bei 3D-Bildkarten leicht von der Lyrics-Seite aus.
* **Chorus/Hook/Drop:** Zusätzliche Bildkarten können wieder auftreten. Die Bilddeckung steigt; 3D-Bewegung reagiert etwas deutlicher auf den Beat.
* **Unbekannter Songabschnitt:** Ausgewogener Modus ohne aggressive Effekte.
* **Keine angezeigten Lyrics:** Automatik greift nicht in die vorherige V349-Galerie ein. Eine bewusste manuelle V350-Vorgabe ist dennoch möglich.
* **V346 manuell:** Wenn der V346 Photo Director auf `manual` steht, respektiert V350 dessen Fotokarten-Anzahl und Layout-Auswahl.
* **Reduced motion / Pause:** Zusätzliche Musikbewegung wird reduziert bzw. abgeschaltet. Vorhandene Accessibility-Optionen bleiben wirksam.

V350 unterstützt die 2D-Galerie und V348-3D-Fotokarten sowie Multiscreen-Layouts ab V333. Textsignale kommen von der eigentlichen Lyrics-Anzeige, auch wenn die Lyrics als regulärer Overlay statt als 3D-Troika-Text erscheinen. Bei synchronisierten Lyrics berücksichtigt die Aktivität der aktuellen Zeile die Songposition; bei unsynchronisiertem Text reicht ein gültiger angezeigter Index.

## Aktivierung

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V350 – Lyrics & Photo Choreography`

1. **Lyrics-Foto-Choreografie aktivieren** anhaken (Standard: aus).
2. `Automatisch` oder `Manuell` wählen.
3. Textpriorität, Drop-Verstärkung und Bewegungsdämpfung einstellen.
4. Maximalzahl der Fotos für Verse und Hook/Drop wählen sowie Überblendzeit festlegen.
5. Im integrierten Szenensimulator Songabschnitt, Lyrics-Präsenz, Beat und Fotoanzahl wechseln. Die Vorschau verwendet dieselbe reine Entscheidungsfunktion wie die Bühne; sie startet keinen weiteren Renderer.

## Technische Integration

* `services/stageContent/lyricsPhotoChoreographyV350.ts`: normalisierte lokale Einstellungen, synchronisierte Lyrics-Aktivität, deterministische Cue-Entscheidung.
* `components/visualizer/LyricsPhotoChoreographySettingsV350.tsx`: Einstellungsoberfläche und direkter Cue-Simulator.
* `components/visualizer/VisualizerStage.tsx` und `registry.tsx`: tatsächliches Lyrics-Sichtbarkeitssignal und optionale Lyrics-Seite an Avatar-Bühne.
* `components/visualizer/ThreeAvatar.tsx` und `StageContentScreensV333.tsx`: Weitergabe an Einzel- und Mehrfachbildschirme.
* `StageContentScreenV330.tsx`: eine Entscheidung pro Bühnenbildschirm, Übergabe an realen 2D- oder 3D-Galerie-Renderer.
* `StageImageGalleryV338.tsx`: dimmt Bilder, begrenzt sichtbare Collage-Ebenen und pausiert aufdringliche Kinoeffekte bei Textfokus.
* `StagePhotoGallery3DV348.tsx`: glättet und versetzt Karten bereits mit vorhandener `useFrame`-Schleife; keine zusätzliche RAF-Schleife.

Einstellungen werden nur in `localStorage` unter `sonic-lyrics-photo-choreography-v350` gespeichert. Es werden keine Lyrics, Songverläufe, Foto-URLs oder anderen Inhalte durch V350 persistiert.

## Prüfen

```bash
npm install
npm run verify
```

Für gezielte Regression: `npm run test:v350`, für Quellen-Syntax: `npm run check:syntax`, für Offline-Suite: `npm run verify:offline`.

Die projektweite Build-Prüfung benötigt alle installierten Next.js-/React-/Three-Abhängigkeiten. Dieses Release wurde ohne diese Pakete erstellt: Offline-Regressionen und Syntax können hier geprüft werden, vollständiger Next.js-Build und visueller WebGL-Browsertest nicht.
