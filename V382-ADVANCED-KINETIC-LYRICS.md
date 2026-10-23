# Sonic Display V382 – Advanced Kinetic Lyrics

V382 baut auf V381 auf und behält die bisherigen 3D-Positionen, die Gesichts-Sicherheitszonen und sämtliche Kamerafunktionen bei.

## Neue Funktionen

- Gemeinsame reine Timing-Berechnung in `components/visualizer/kineticLyricsV382.ts`, genutzt von `KineticLyrics.tsx` und `Lyrics3DScene.tsx`.
- Bei echten Wort-Zeitstempeln werden Wort-Füllstand, kurzzeitiges Anheben und Skalieren nach Wiedergabezeit berechnet. Beim Zurückspringen ist das Ergebnis reproduzierbar.
- Liegen nur Zeilen-Zeitstempel vor, werden gleichmäßig verteilte Wortzeiten **als Schätzung** verwendet. Ohne Synchronisierung werden keine Wortanimationen vorgetäuscht.
- Rap: kurze, zurückhaltende Impulse bei dichter Sprache; Festival: stärkere, klar begrenzte Akzente; Cinematic: dezente Bewegung. Im Automatikmodus wird das vorhandene Genre benutzt, soweit es der Bühne zur Verfügung steht, sonst der gewählte klassische Lyrics-Stil.
- Festival-Drop-Akzente nur bei gemessener Audioenergie. In der 2D-Anzeige ist hierfür eine aktivierte Mikrofonanalyse notwendig; die 3D-Bühne verwendet das bereits normalisierte Audio-Signal. Ein Genre allein löst nie einen vermeintlichen Drop aus.
- Die 3D-Wortfarbe interpoliert zwischen den eingestellten Farben. Niedrige GPU-Qualitätsstufen behalten den bisherigen, sparsamen Zeilen-Fallback.
- Pausen und reduzierte Bewegung stoppen Bewegungsimpulse; der korrekte Füllstand bleibt sichtbar. `prefers-reduced-motion` deaktiviert außerdem die CSS-Bewegung.

## Bedienung

`Settings → Display → Lyrics · Animation` oder `Settings → Display → Lyrics Studio → Karaoke`:
Stil **Klassisch/Aus**, **Automatisch**, **Rap-Flow**, **Festival/Hardtekk** oder **Cinematic**; Regler für Wortimpuls 0–100 % und Schalter für gemessene Drop-Akzente. Die V379-Schnellvorlagen wählen entsprechende V382-Stile mit.

## Grenzen und Validierung

V382 benutzt **Lyrics-Zeitstempel und vorhandene Audio-Kennzahlen**, keine echte Phonem-Erkennung und keine Spotify-Audio-API. Offline-Syntax: `npm run check:syntax`. Zieltest: `npm run test:v382`. Gesamtsuite: `npm run verify:offline`. Für `npm run build` und `npm run typecheck` müssen alle npm-Abhängigkeiten installiert sein; das Projektarchiv enthält bewusst keine node_modules.
