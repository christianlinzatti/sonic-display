# Sonic Display V561 – Prüfbericht (25.10.2026)

## Tatsächlich erfolgreich geprüft

- `npm run test:v561`: **18** V561-Regressionen (Wort-/Zeilenzeitstempel, Demo-/Song-Trennung, Pause, Reduced Motion, Frischegrenze, Offset, Spotify-Zeit, Import-/Klon-Isolation, realer V368-Morph-Renderer, manuell zugeordnete Morphs, Bedienung, Syntax).
- `npm run test:v561:types`: isolierte Kern-Typprüfung (V561-Zeit-/Quellenplaner zusammen mit der bestehenden V367/V368-Lyrics-Synchronisation).
- `npm run test:v554` bis `npm run test:v560` sowie zugehörige isolierte Typprüfungen: **bestanden**.
- `npm run test:v551` und `npm run test:v551:types`: **12.150** Bühnen-/Beleuchtungskombinationen bestanden.
- `npm run test:v552` und `npm run test:v552:types`: **43.200** deterministische Raspberry-Pi-Draw-Budget-Frames bestanden.
- `npm run test:v553` und `npm run test:v553:types`: **9** Verifikations-Fixtures bestanden.
- `npm run check:syntax`: **783** TS/TSX-Dateien erfolgreich geprüft.
- `npm run check:architecture`: **330** referenzierte Quelldateien, zehn Architekturabschnitte und Version **0.1.0-v561** konsistent.

## Explizit nicht geprüft

- Kein vollständiger Next.js-/React-/Three.js-Produktionsbuild, da die Archivquelle kein `node_modules` enthält. `tsc -p tests/tsconfig.v561-core.json` ersetzt keine komplette Projekt-Typprüfung.
- Kein echter Browser-/WebGL-Test mit dem persönlichen GLB, Morph-Target-Speicherverhalten oder Musik-Playback und kein echter Raspberry-Pi-FPS-/Thermal-/10-Zoll-Test.
- Wort-Timestamps sind keine Phonem-Daten. Die visuelle Artikulation ist eine aus zeitmarkiertem Text abgeleitete Schätzung; Demo-Beat-/Musikenergie ist kein gemessener Spotify-Gesang.

## Nachprüfung auf Entwicklungsrechner

1. Archiv in einem eigenen Verzeichnis entpacken.
2. `npm install`, anschließend `npm run typecheck` und `npm run build` ausführen.
3. In Einstellungen → Konzert-Bühneneffekte → „3D-Effekte & GLB-Lip-Sync ansehen · V561“ den echten GLB laden; in der Gesichts-Nahaufnahme „Deutschrap-Demo“, „Gesangs-Demo“ und, falls echte synchrone Lyrics vorliegen, „Aktueller Song“ prüfen.
4. Mehrere Avatare ausprobieren (ARKit, VRM/Oculus, benutzerdefinierte manuelle Zuordnungen sowie Modelle ohne Mund-Morphs), Materialvergleich ein/aus und Langzeit-/Raspberry-Pi-Stabilität kontrollieren.
