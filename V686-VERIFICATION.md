# V686 – Prüfprotokoll (28.10.2026)

## Erfolgreich

- `npm run test:v686`: **74 Prüfungen** einschließlich **10.000 simulierter Frames**. Verifizierte Wort-Zeitmarken, schnelle Rap-Wörter, B/P/M-Zielverschlüsse, Gap-/Seek-/Pause-Grenzen, Sänger- und manuelle Priorität, Endlichkeit und begrenzte Multiplikatoren.
- `npm run test:v686:types`: **PASS**, strenge TypeScript-Isolationsprüfung der neuen Timing-Logik (auf Basis der historischen V631-Prüfkonfiguration).
- `npm run test:quick`: **PASS** für V669–V686, Syntax (947 TS/TSX-Quellcodedateien), Architektur (607 Referenzen), Modul-Casing (1599 geprüfte Quelldateien), typisierte Test-Isolation und Spotify-Umgebungschecks.
- Separat erfolgreich: `npm run test:v367`, `test:v384`, `test:v405`, `test:v415`, `test:v420`, `test:v423`, `test:v476`, `test:v496`, `test:v523`, `test:v538`, `test:v561`, `test:v597`, `test:v631`, `test:v644`, `test:v661`, `test:v662`, `test:v685`.
- Strenge Typenprüfungen der älteren Module V597, V631, V644, V661 und V662 bestanden.
- Die zuvor veralteten Testannahmen V476, V523, V538 prüfen jetzt den aktuellen V680+ Release-Ablauf statt die historisch entfernte `build:preflight`-Vollkette. Die einzelnen Tests bestehen.

## Grenzen

- `npm run check:dependencies` und `npm run build` sind **blockiert**: **17 npm-Pakete** und `package-lock.json` fehlen in der Ausführungsumgebung. Ein vollständiger React-/Next.js-Projekttypcheck und der Produktionsbuild sind **nicht bestätigt**.
- Kein Test in einem echten WebGL-Browser und keine Hör-, Audio- oder Avatar-Bildabnahme; kein Test der tatsächlichen Lippenform eines spezifischen importierten GLB-Avatars.
- Geschriebene Lyrics enthalten **keine echten Sprachphonem-Zeitmarken**. V686 verbessert nur den Rampenverlauf bereits existierender Morph-Zielwerte an vorhandenen Wort-Zeitmarken. Weder Audio-Sprechertrennung noch KI-Phonemerkennung wird behauptet.
- Manuelle V644/V662-Timelines, Vocal-Stems V661, V420 Wort-Edits, V423 Audio-Munddaten, V562 Kalibrierung, manuelle Sängerzuordnung, Reduzierte Bewegung und Quality-Tier „low“ bleiben maßgeblich.

## Windows-Nachprüfung

```powershell
npm install
npm run test:quick
npm run test:v686:types
npm run build
```

Visuelle Kontrolle: schnelle Deutschrap-Strophe mit Wortmarken, Hook, 2–4 Performer mit echter Sängerzuordnung, Bilabial-Verschlüsse, Pausen, Seek, manuelle Viseme-Silenz, Vocal-Stem, ausgeschaltete Lyrics und GLB-Modelle mit unterschiedlichem Facial Rig.
