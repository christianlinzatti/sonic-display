# V763 – Interactive Concert Timeline Studio

## Ziel und Einstieg

Im Bereich **Einstellungen → Dynamic Stage → V763 Interactive Concert Timeline Studio** zeigt das Studio die tatsächlich vom laufenden `VisualizerStage` erzeugten Szenen des verifizierten V761-Songplans. Darunter bearbeitest du manuelle Cues in den vorhandenen V354-Spuren Kamera, Licht, Tanz/Formation, Effekte, Lyrics und Fotos. Es gibt **keinen zweiten, konkurrierenden Show-Renderer**.

## Bedienung

1. Spiele einen Song in der Hauptansicht. Die V763-Vorschau übernimmt dessen tatsächliche Song-ID, Dauer und aktuellen Sekundenstand. Die Regie-Szenen werden nur angezeigt, wenn V761 ein verifiziertes V604-Szenenbild liefert.
2. Erstelle eine **an den aktuellen Song gebundene** Timeline; falls bereits eine V354-Show mit Cues vorhanden ist, sichere sie zuvor als JSON und bestätige das Ersetzen ausdrücklich. Die bisherige V354-Speicherung enthält technisch nur **eine** lokale Show, noch keine Mehrsong-Bibliothek.
3. Ziehe die Vorschauposition oder kehre zur Live-Position zurück. Das Bewegen des Vorschau-Sliders ändert weder Spotify noch die tatsächliche Wiedergabe.
4. Füge Cues in der passenden Spur an der gewählten Position ein. Wähle den Cue-Balken und bearbeite Anfang, Dauer, Bezeichnung und Aktionswert. Lösche ungewünschte Cues.
5. Aktiviere die manuellen Song-Cues ausdrücklich. Alle Bearbeitungen werden über die V354-Speicherung gesichert und auf der Bühne per vorhandenem V354-Playback ausgewertet.

## Architektur

- `components/visualizer/concertTimelineBridgeV763.ts`: rein temporäre, geprüfte, songgebundene Datenbrücke. Keine Web-API, keine neuen Zeitstempel und keine automatische Speicherung der V761-Szenen.
- `components/visualizer/VisualizerStage.tsx`: veröffentlicht den echten V761-Plan in auf Sekunden begrenzten Statusaktualisierungen. Ohne bestätigte Szenen zeigt V763 keine erfundenen Segmente.
- `components/visualizer/InteractiveConcertTimelineStudioV763.tsx`: songgebundene V354-Cue-Bearbeitung, sechs Spuren, Vorschau und Export/Schutz vor Überschreiben.
- `components/visualizer/ThreeAvatar.tsx`: bestehender V354-Playbackpfad mit aktivem Track-Check. Der manuelle Licht-Cue unterdrückt außerdem die optionalen V762-Lichtakzente in `DynamicStage.tsx`.
- `services/stageContent/showTimelineV354.ts`: unverändertes Clip-Format, Begrenzung auf 400 Cues und sichere Auswertung der Clips. Speicherung als Browser-localStorage, in der vorhandenen portablen Datensicherung enthalten.
- Typalias-Kompatibilität: `StageLightingSettingsV762` zeigt nun auf den bereits vorhandenen `DynamicStageLightingSettingsV762`-Typ. Dadurch ist die öffentliche Typreferenz in `types/music.ts` und `registry.tsx` wieder auflösbar.

## Bewusste Grenzen

- Kein automatischer Import oder Überschreiben der vorgeschlagenen V761-Szenen. Diese bleiben eine schreibgeschützte zweite Ebene; manuale V354-Cues bleiben unabhängig davon.
- Keine neue Kamerafahrt, Lichtquelle, Nebelpass oder 3D-Shader. Die Kamera-/Licht-/Animationswirkung kommt aus den bestehenden V354-Renderpfaden und deren Schutzregeln.
- Keine automatische Sängeridentifizierung und keine Änderung von Phonemen, Fuß-IK, importierten GLB-Clips oder Künstlerzuordnungen.
- V354 besitzt weiterhin eine lokale Show. Für verschiedene Songs vorher exportieren oder das vorhandene portable Backup verwenden; eine Mehrsong-Timeline-Bibliothek ist eine mögliche künftige Erweiterung.
- Ein realer GLB-/WebGL-Browser-Test und der vollständige Next.js-Produktionsbuild stehen aus, solange die Projektpakete in dieser Umgebung fehlen.
