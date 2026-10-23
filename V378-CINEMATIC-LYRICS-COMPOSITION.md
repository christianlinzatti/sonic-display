# Sonic Display V378 – Cinematic Lyrics Composition

V378 verbindet die V377-Duettkamera mit dem tatsächlich aktiven Karaoke-Text. Die Funktion arbeitet mit den vorhandenen Spotify-/Lyrics-Zeitstempeln und komponiert **nur automatische** Kameraeinstellungen. Es werden keine Stimmen identifiziert, keine fehlenden Wortzeiten erfunden und keine neuen GLB-Modelle geladen.

## Optionen

Settings > Avatar & Tanz > V377 Cinematic Duet Camera > **V378 Cinematic Lyrics Composition**

- **Aus** (Standard): V377 bleibt unverändert.
- **Lesbarkeit**: geschützter Textbereich, mehr Abstand, ruhige Darstellung.
- **Filmisch**: zusätzlich ein seltener lyrikbetonter Shot am Ende einer Vier-Zeilen-Phrase, wenn echte Wortmarken vorhanden sind.
- Intensität 0–100 %; separat einschaltbare Kontrastplatte für die Karaoke-Texte.

V378 ist nur bei aktivem, synchronisiertem und tatsächlich *im Bühnenbild eingeblendetem* Text aktiv. Fehlende Zeilenzeiten, stille Stellen, pausierte Wiedergabe und Reduced Motion führen nicht zu neuen Kamerafahrten. Gespeicherte Presets/Keyframes, manuelle Shots, Live-Editor und authored Bühnenregie gehen vor. Die automatische V377-Duettkamera und V369-Vocal-Close-ups bleiben erhalten und bilden die Grundlage für eine additive sichere Bildkomposition. Eine abgeblendete Fläche hinter 3D- und DOM-Lyrics sowie responsive Layoutgrenzen dienen zusätzlich der Lesbarkeit.

Die Inspektor-Vorschau ist eine reine Simulation, kein Screenshot. Der Lyrics-Fokus folgt einer deterministischen Phrasenregel, nicht einer semantischen Erkennung wichtiger Aussagen.

## Prüfung

**Bestätigt:** `npm run check:syntax` prüft 502 TS-/TSX-Dateien erfolgreich. 120/120 Einzelschritte aus `verify:offline` sind erfolgreich gelaufen (in zwei Blöcken). Das Projekt enthält 1.130 erhaltene Dateien aus V377 und vier neue V378-Dateien. **Nicht bestätigt:** Next.js-Production-Build bzw. vollständiger TypeScript-Typcheck; der Vorcheck meldet 16 fehlende von 17 benötigten npm-Abhängigkeiten sowie kein Lockfile. Auf einem Rechner mit Netzwerk: `npm install && npm run verify`.
