# V423 – Prüfprotokoll

## Bestehende Sicherheits- und Funktionsprüfungen
- `npm run test:v423`: bestanden – synthetischer PCM-Signalverlauf, Ganzzahlgrenzen, Datensatzvalidierung, Song-Identität, Dauerschranke, Pausen/Reduced Motion/Live-Schalter, deterministische Wiedergabeposition, V420-Manuell-Vorrang, Körper-/Rollen-Unveränderlichkeit, Bühne und beide Live-Avatar-Pipelines.
- `npm run test:v404` bis `npm run test:v423`: 20/20 bestanden (V421-Test nach Aktualisierung seiner alten Paketversionsannahme erneut bestanden).
- Ausgewählte historische Prüfungen: 18/18 bestanden (einschließlich V389 nach Aktualisierung einer historischen Paketversion-Assertion).
- `tsc -p tests/tsconfig.v423-core.json`: bestanden – eigenständige Strict-Typprüfung der Audioanalyse und zentralen Vocal-Pipeline.
- `npm run check:syntax`: bestanden – 573 TS/TSX-Dateien.
- `npm run test:imports`: bestanden – 1.928 lokale Imports in 906 geprüften Projektdateien.
- `npm run test:module-case`: bestanden – keine Windows-Modulnamenskollisionen.

## Grenzen der Verifikation
- Die TypeScript-Strict-Prüfung deckt die neuen Kernmodule ab, **nicht** das ganze Next.js-Projekt.
- Keine echten Mikrofon- oder Spotify-Audio-Messungen; Testsignale werden künstlich im Test erzeugt. Browser-Codecs und Browser-/GPU-Rendering wurden nicht live geprüft.
- `node_modules` und `package-lock.json` sind in dieser Erstellungsumgebung nicht vorhanden; `npm run build` ist damit **nicht verifiziert**. Bitte nach `npm install` lokal `npx tsc --noEmit; npm run build` ausführen.
- Die Merkmale beruhen auf kompletter Audiomischung und liefern keinen phonemgenauen Lippen-Sync; diese Grenze wird bewusst im UI angezeigt.
