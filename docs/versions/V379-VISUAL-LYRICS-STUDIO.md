# Sonic Display V379 — Visual Lyrics Studio

**Basis:** V378 Cinematic Lyrics Composition. Alle bestehenden Projektdateien, API-Routen, 3D-Avatare, Musik- und Kamera-Direktoren bleiben erhalten.

## Bedienung

Öffne **Settings → Display → Lyrics Studio → V379 · Visual Lyrics Studio**. Die Vorschau zeigt die echte `KineticLyrics`-Komponente mit denselben Browser-Einstellungen wie der Hauptbildschirm. Schrift, Größe, Position, Neon-/Kinetic-/Cinematic-Stil, Wort-Hervorhebung, Geschwindigkeit, Offset und Kontrast können unmittelbar eingestellt werden.

### Vorschau und Quellen

- **Demo:** Vier ausdrücklich als Demo gekennzeichnete Zeilen mit tatsächlichen Demo-Wort-Zeitstempeln. Mit dem Play/Pause-Knopf und Schieberegler kann man den Demo-Song beliebig durchlaufen und vorspulen. Das Demo-Autoplay läuft nur solange die Anzeige aktiv ist.
- **Spotify-Titel:** Die Option erscheint nur, wenn Track und Lyrics vorhanden sind. Die Anzeige verwendet die fortgeschriebene Spotify-Zeit plus den Lyrics-Offset. Die Studio-Vorschau kann Spotify **nicht** starten, pausieren oder vorspulen.
- **Diagnose:** Zeigt an, ob echte Wortmarken, Zeilenmarken, reiner Text oder keine Lyrics vorliegen. Erfindet keine Wortzeitstempel.

### Ein zentraler Arbeitsbereich

1. **Schrift & Layout:** Fünf Browser-Schriftstile, Kinetic/Cinematic/Neon/Klassisch, Schriftgröße, Position, Glow und zwei Verlaufsfarben.
2. **Karaoke:** Zeilenfokus, Fortschrittsfarben, Intensität, Animationstempo, Mikrofonreaktion und Lyrics-Offset.
3. **Kamera & 3D:** Immersiver Modus, links/rechts, Tiefe, V378-Komposition und Kontrastfläche; Verse/Hook/Drop als rein visuelle *Vorschau-Simulation* wählen.

Die drei Schnellvorlagen **Deutschrap**, **Festival/Hardstyle** und **Kino** setzen ausschließlich existierende UI-Einstellungen samt neuem Schriftstil. Es werden keine Choreografie- oder Kamerapresets gelöscht. Die ausgewählte Vorlage ist direkt anpassbar und die Änderungen werden wie bisher lokal in den UI-Preferences gespeichert.

### Geltungsbereich und Grenzen

Die Lyrics in der **2D-Vorschau werden von der echten Karaoke-React-Komponente** gerendert. Tänzer-Silhouetten, 3D-Seitenlage und Kameraausschnitt sind zur Orientierung eine **performante CSS-Layoutsimulation**, kein zweites 3D-Canvas. Die tatsächliche 3D-Bühne verwendet ihre bisherigen Three.js- und Troika-Textobjekte. Die neuen Schriftfamilien gelten für 2D; für 3D steht weiterhin die vorhandene Schrift bereit. Die tatsächliche V378-Kameraplanung behält Vorrangregeln für manuelle Kamerafahrten, Kameraeditor, reduzierte Bewegung und fehlende Synchronisierung. V379 führt **keine** Spracherkennung, Sprecherzuordnung oder Phonem-Analyse ein.

Der Demo-Kameraplan wird auch beim stehenden Demo-Frame berechnet; tatsächliche Pausen der Spotify-Wiedergabe deaktivieren die automatische Kameraplanung wie bisher. Die CSS-Simulation ist insbesondere kein Genauigkeitsbeweis für konkrete Avatare oder Bildschirmgrößen.

## Prüfung

- `npm run check:syntax`
- `npm run test:v379`
- `npm run test:v378`
- `npm run verify:offline`
- `npm run build:preflight`, `npm run typecheck`, `npm run build` nach `npm install` in der vollständigen Entwicklungsumgebung.

Hinweis: Das heruntergeladene ZIP enthält wie seine Vorgänger keine `node_modules` und kein durch `npm install` erzeugtes Lockfile. Ohne diese Abhängigkeiten ist ein realer Next.js-Production-Build aus diesem Quellarchiv nicht verifizierbar.
