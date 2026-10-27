# V569 – Raspberry Pi Performance & Long-Run Stability

## Änderungen

- **GLB-LOD-Playbackbuffer:** `lodPlaybackBufferV569.ts` aktualisiert pro aktivem GLB eine wiederverwendbare Momentaufnahme. Anders als vorher entstehen **nicht für jeden Clip in jedem Renderframe neue JavaScript-Objekte und keine `Object.entries`-Liste**. Neue Animationen werden dynamisch aufgenommen, entfernte Clip-Namen gelöscht; **keine feste Clipzahlgrenze**. Die Abspielzeit, Lip-Sync, Beat und die AnimationMixer-Frequenz bleiben gleich.
- **LOD-Laufzeitmetadaten:** `lodPlaybackContinuity.ts` entfernt verwaiste Live-Zustände bei einer tatsächlichen Veröffentlichung (maximal einmal pro Sekunde) und begrenzt die gespeicherten Quellen auf 32. Das beschränkt lediglich Quellen-Metadaten, **nicht die Motion-Bibliothek oder die Anzahl importierbarer Clips**. Keine extra Timer.
- **LOD-Diagnostik:** `lodContinuityDiagnostics.ts` vermeidet Listenallokationen im Hotpath `getOutgoingLodPose()`. Ohne tatsächlichen parallelen LOD-Wechsel entfallen teure Posevergleiche und unnötige React-Benachrichtigungen; der echte Variantenwechsel bleibt diagnostizierbar.
- **Manuelle Eingriffe und Bühnenwirkung:** Keine Änderung an der Zahl der Avatare, an den dynamischen Tänzen, manuellen Timelines, Gesichtsanimationen, Lyrics, Kameras, Licht und Blackouts. V355/V463/V479/V552 behalten die automatische Bildqualitäts- und FPS-Begrenzung.

## Verifikation und Grenzen

`npm run test:v569`, `npm run test:v569:types` und `npm run verify:v569`. Synthetischer Test mit tausenden Frames prüft die **Objektidentität der Clip-Snapshots** statt nur einen behaupteten Performancegewinn. Echte GC-Zeit, Speicherverläufe über mehrere Stunden, FPS und GPU-Speicher auf einem Raspberry Pi müssen gesondert gemessen werden. Vollständige Next.js-Buildprüfung erfordert installierte Projekt-Dependencies.
