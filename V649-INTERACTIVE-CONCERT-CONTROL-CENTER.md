# V649 – Interactive Concert Control Center

Die Steuerzentrale öffnet sich im **Touchmodus** über „Steuerzentrale“. Es handelt sich um eine nicht modale, seitlich angedockte Oberfläche, die die laufende Wiedergabe nicht pausiert. Mit „Fertig“ oder `Escape` wird sie geschlossen. Die Oberfläche stellt fünf Bereiche bereit: Bühne, Kamera, Lyrics, Avatare und Licht.

## Funktion

- **Bühne:** vorhandene neun Stage-Themes, Beatreaktion.
- **Kamera:** Vocal-Kamera-Modus und -Stärke; optionale Rap-Kameraregie. Bereits authored Kamera-Keyframes und Singer-Rollen werden nicht überschrieben.
- **Lyrics:** Avatar/Mix/Lyrics-Kioskansicht, drei V648-Lesbarkeiten, individuelle Schriftgröße, Lyrics-Fokus und Immersive-Modus.
- **Avatare:** Solo, Sync, Spiegel, Duett; bestehende Tanzstile, Lip-Sync-Schalter. Keine erfundenen Sängerzuweisungen, keine neuen GLB-Dateien.
- **Licht:** bestehende Bühnenlicht-Intensität, Details, Stärke und Reduced Motion.
- **Rückgängig:** letzte über diese Zentrale vorgenommene *Einstellungsänderung*, ausschließlich die betroffenen Felder. Touch-Lesbarkeit und Ansicht verbleiben im V648-Touchzustand und werden nicht Teil dieser Rückgängig-Funktion.

Die Schaltflächen ändern die vorhandenen UI-Preferences, nicht den Spotify-Stream. Die Änderung kann visuelle Re-Initialisierungen auslösen und ist keine Garantie für unterbrechungsfreie WebGL-FPS. Andere Kamera-Regisseure oder manuelle Änderungen können Vorrang behalten. Kein Raspberry-Pi-Leistungstest ohne Hardware.

## Prüfen

`npm run test:v649`, `npm run test:v649:types`, `npm run test:smoke:v649`, `npm run verify:v649`, `npx tsc --noEmit`, `npm run build`.
