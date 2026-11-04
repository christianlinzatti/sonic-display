# Sonic Display V368 — Vocal Performance Engine & Focus Karaoke

**Basis:** vollständiger Projektstand V367 (`0.1.0-v368`), die vorhandene Spotify-Color-Lyrics-/LRCLIB-/Genius-Fallbackkette bleibt unangetastet.

## Umsetzung

- Neuer deterministischer `resolveVocalPerformanceV368` in `components/visualizer/vocalPerformanceV368.ts`, mit präzisen Pausen (kein Öffnen ohne synchronisierte Zeitstempel) und getrenntem Rap-/Gesangs-Profil.
- **Automatik:** Genre `Rap`, `Hip-Hop`, `Trap`, `Drill` sowie schnelles Worttempo als Heuristik. Ist lediglich ein Genre bekannt oder stehen nur Zeilentimestamps bereit, bleibt die Einstufung unsicher. Manuelle Übersteuerung in den Einstellungen: **Auto, Rap, Gesang**.
- Vokalgruppen-Annäherung pro getaktetem Wort: offene, breite, gerundete Mundformen; Lippenkontakt am Wortanfang/-ende für *b*, *m*, *p*. Längere Vokale werden bei Gesang ruhiger, Rap wird deutlicher artikuliert. Zeilentiming nutzt schwächere Annäherung.
- Neuer GLB-Overlay-Controller `VocalRigV368`: ARKit-ähnliche Morph-Bezeichnungen für `jaw`, `round`, `wide`, `mouthClose`, `smile`, `brow`, `eyeBlink`, kompatibel mit vorhandener Gesichtsmimik. Fallback auf Kieferknochen, falls keine passenden Mundöffnungs-Morphs vorhanden sind. Overlay wird beim Entfernen bereinigt.
- Prozedurale Avatare erhalten ebenfalls Mundformung und gelegentliches Blinzeln. Mundtiming ist bei mehreren Tänzern gleich, Blink-Phasen unterscheiden sich, damit sie nicht alle gleichzeitig blinzeln.
- **Karaoke:** Drei-Zeilen-Fokus aus V367, Wort-Zeitstempel-Highlighting und zurückhaltende Fortschrittsleiste der aktuellen Zeile; westliche Wort-Zeitstempel ohne Trennzeichen bekommen normale Abstände.
- **UI:** `avatarVocalStyleV368`, `avatarFacialExpressionV368` mit Defaults und Reset unter den Avatar-Einstellungen. Intensität, Reduced Motion und Timing-Modus aus V367 bleiben wirksam.
- Kein neuer externer Anbieter, Tokenbedarf, Audiostream oder separater Timer.

## Grenzen

Diese Version berechnet **keine echten Phoneme**, keine Vocal-Stem-Separation und keine Spracherkennung. Bei Spotify `LINE_SYNCED` ist der Silbenverlauf geschätzt. Ohne synchronisierte Lyrics bleibt der Mund ruhig; Blinzeln und Mimik werden nur auf kompatiblen Modellen sichtbar. Herkunft, Takt und Audio-Energie ermöglichen keine sichere Aussage, ob wirklich gerappt/gesungen wird. Das System beeinflusst weder Spotify-Audio noch Playback.

## Tests in der vorliegenden Umgebung

- **PASS** `npm run check:syntax` (488 TS-/TSX-Dateien).
- **PASS** `npm run test:v368`, `npm run test:v367`, `npm run test:v366`, `npm run test:multi-avatar`, `npm run test:v350`, `npm run test:v354`, `npm run test:v355`, `npm run test:v358` bis `npm run test:v363` sowie `npm run test:v365`.
- Der historische Offline-Lauf wurde bis einschließlich V357 erfolgreich absolviert, danach durch das Zeitfenster unterbrochen; **keine vollständige Testfreigabe**.
- **NICHT GEPRÜFT / BLOCKIERT:** vollständiger strenger TypeScript-Check und Next.js-Production-Build; die hochgeladene ZIP enthält kein `node_modules` und keine `package-lock.json` (`build:preflight` meldet 16 fehlende Pakete). Lokal mit Netzzugang: `npm install`, danach `npm run verify`.

## Änderungen

- `components/visualizer/vocalPerformanceV368.ts` (neu)
- `components/visualizer/VocalRigV368.tsx` (neu)
- `components/visualizer/ThreeAvatar.tsx`, `registry.tsx`, `VisualizerStage.tsx`
- `components/KineticLyrics.tsx`, `components/SettingsPanel.tsx`, `app/globals.css`
- `types/music.ts`, `context/UiPreferencesContext.tsx`, `package.json`, Regressionstests.

Diese Version verwendet weiterhin die V367-Karaoke- und Lyrics-Architektur. V367-Funktionen und die alten Files bleiben als Referenz erhalten.
