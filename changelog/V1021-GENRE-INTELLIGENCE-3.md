# V1021 – Genre Intelligence 3.0

- Reiner, deterministischer Genre-Storyboard-Planer. Kein Audio-Klassifikator und keine Songmarker aus Metadaten.
- Getrennte Profile für Deutschrap (Lyric-Fokus), Hardtekk (Geometrie/Footwork), Hardstyle (Festival-Builds) und Deutschrock/NDH (Arena/Band); neutraler Fallback.
- Profilbezogene Vorschläge je bestätigtem V1020-Akt, dynamische Soll-Intensität (nicht Audioenergie).
- Live-FX-Deck zeigt die aktuelle Stilidee, nächsten bestätigten Akt und Quellenhinweis.
- Sicherheit: Keine Timeline, Pause, Seek, Blackout und manuelle Regie deaktivieren die Vorschau. Lyrics-Vorrang und Bewegungsreduktion wirken auf alle Genreprofile.
- Keine Netzwerk-Requests, Timer, Storage oder Hardware-/Kamera-/FX-Auslösung.
- V1021 Regression, isolated TypeScript, GitHub- und Vercel-Prüfungen; ZIP vollständig und ohne Build-Artefakte.

### CI-Fix aus V1020

Die gemeinsame DTO-Definition `types/playbackCore.ts` löst `Track`/`Lyrics` von `types/music.ts` (umfangreiche 3D-/Avatar-Typreferenzen). `types/music.ts` reexportiert die unveränderten Typen, damit bestehende API-Aufrufer kompatibel bleiben. `lib/smartOfflineV1016.ts` importiert die Typen nun direkt. Die bereits vorhandenen isolierten V1010/V1012/V1014-TypeScript-Aufrufe funktionieren dadurch ohne Test-Shims oder künstliche `.d.ts`-Deklarationen.
