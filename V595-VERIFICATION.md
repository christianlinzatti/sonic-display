# V595 – Verifikationsbericht (26.10.2026)

## Umfang

**Automated Live Concert Visual Regression 2.0** ergänzt die V594-Vorher-/Nachher-Analyse mit Szenenklassifikation, PNG-Bewegungsmaskierung und wiederholten heuristischen Warnungen aus echten V592-Livebühnen-Aufnahmen. Die bestehende React-Three-Fiber-Bühne, Spotify-Datenquelle, GLB-Assets, IK, Lip-Sync, VFX, Kamera und manuelle Choreografien bleiben unverändert. Der V592-Browser-Runner liest pro Aufnahme zusätzlich nur vorhandene Stage-Labels, die zum Zeitpunkt der Messung tatsächlich in der `VisualizerStage` gerendert werden.

## Verifikation in der aktuellen Laufzeit

| Befehl | Ergebnis |
|---|---|
| `npm run test:v595` | **PASS: 34 Testgruppen**, darunter echte Quellreport-Prüfschranken, Songzeit-Paarung, Solo/Duett/Hook/Drop-Nachweis, fehlende Szenen, manuelle Markierung, Bewegung-/Lyrics-Masken, verzerrte PNGs, wiederholte Clipping-/Lyrics-/Kamera-Warnungen, HTML/XSS-Sicherheit, fehlende Originalbilder und lokale CLI-Ausgabe |
| `npm run test:v595:types` | **PASS** – isolierter TypeScript-Kern aus V592; neue V595-Module sind Node.js/CommonJS |
| `npm run test:smoke:v595` | **PASS** – neue 34 Gruppen + V594 (35), V593 (23), V592 (10), V591 (10), V590 (14), Architektur; auch im abschließenden Gesamtlauf erfolgreich |
| `npm run verify:v595` | **PASS** – finaler Stand: V595 (34), V594 (35), V593 (23), V592 (10), V591 (10), V590 (14), V589 (25), V588 (16), V580 (79), V572 (69) und Syntax/Imports |
| `npm run test:v595 && npm run test:v594 && npm run test:v595:types` | **PASS** – finaler Stand mit **34** V595-Gruppen, historischer V594-Kompatibilität und TypeScript-Kern |
| `npm run check:syntax` | **PASS** – 820 TypeScript-/TSX-Quelldateien (V595 ergänzt nur CommonJS-Dateien und eine bestehende `.cjs`-Datei) |
| `npm run check:architecture` | **PASS** – Release-Version V595, vollständige Systemarchitektur und 417 Quellreferenzen |

Die 34 neuen V595-Testgruppen benutzen lokal generierte **Testberichte und PNG-Pixelbilder**. Diese sind ausschließlich Test-Fixtures; **sie stammen nicht von einem tatsächlich laufenden Spotify-Browser mit realen GLB-Performern**. Die produktive CLI prüft die erwarteten Formate und Vergleichsvoraussetzungen, kann aber den Inhalt einer außerhalb dieses Projekts angefertigten Datei nicht kryptografisch attestieren.

## Nicht durchgeführt / nicht nachgewiesen

- **Kein** kompletter `next build` oder tatsächlicher Chromium/Spotify/WebGL-Testlauf in dieser Umgebung: `node_modules` fehlen und es ist keine gültig authentifizierte Spotify-Liveszene mit GLB-Dateien eingerichtet.
- **Keine** automatisierte optische Freigabe oder behauptete visuelle Verbesserung; ein maskierter Pixelunterschied ist weder Beweis für Verschlechterung noch für Verbesserung.
- **Kein** echter Raspberry-Pi-Benchmark, keine GPU-/Thermikmessung und keine über den Browser hinaus nachgewiesenen FPS-Werte.
- Bei fehlendem Solo-, Duett-, Hook- oder Drop-Beleg erscheint `not-observed`, niemals `passed`. Wiederholte Warnungen erfordern immer eine manuelle Bewertung.

## Wiederholbar

```bash
npm run test:v595
npm run test:smoke:v595
npm run verify:v595
```

Mit tatsächlichen lokal aufgenommenen V592-Messungen:

```bash
npm run benchmark:v595:regress -- --baseline=artifacts/v595/baseline/report.json --candidate=artifacts/v595/candidate/report.json --out=artifacts/v595/review
```

Optional `--marks=artifacts/v595/marks.json` für zeitlich belegte **manuelle** Solo-/Duett-/Hook-/Drop-Annotationen. Der Bericht ist ausschließlich lokal, read-only und immer zur visuellen Sichtprüfung vorgesehen.
