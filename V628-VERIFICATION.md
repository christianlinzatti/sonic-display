# V628 – Verifikation (27.10.2026)

## Ergebnis dieser Quellcode-Prüfumgebung

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v628` | PASS: 43 neue Regressionstest-Gruppen, 13.890 synthetische Konzert-Zeitpunkte |
| `npm run test:v628:types` | PASS: eigenständige TypeScript-Kernprüfung |
| `npm run test:smoke:v628` | PASS: neue V628-Regie sowie Regressionen V627–V616, Syntax und Architektur |
| `npm run verify:v628` | PASS: oben plus V604, V611, V610, V606, V613, V351, V595 und V627-TypeScript |
| Syntax | PASS: 852 TS/TSX-Dateien |
| Architektur | PASS: 507 referenzierte Codepfade und 10 Architekturkapitel |
| Volles `npx tsc --noEmit` | Nicht ausgeführt: Projektabhängigkeiten fehlen |
| Next.js `npm run build` | Nicht ausgeführt: Projektabhängigkeiten fehlen |
| Visuelle GLB-/Spotify-Abnahme | Noch offen; benötigt echten Browser und Musik-/Avatar-Testdaten |

## Verifizierte Schutzregeln

- Nur bestätigte V600/V604-Abschnitte und zugehörige V623-Dramaturgie dürfen die finale automatische Inszenierung verändern.
- Track-ID, Trackdauer, aktueller Songabschnitt, Motiv, Kapitel, Wiederholungsindex und Songposition werden gegengeprüft.
- Fehlende, veraltete oder widersprüchliche Quellen bleiben ohne neue Modulation; Pause, Low-Tier und Reduced Motion ebenfalls.
- Bei bereits geschützten Lyrics oder Vokalfokus werden Kamera und Dekoration ausschließlich gedämpft.
- Ein unbestätigter Drop kann keine stärkere zusätzliche Tanzenergie erhalten.
- Manuelle Dance-, Kamera- und Lichtsettings werden nicht verändert.
- Der neue Finishing-Pass begrenzt alle Multiplikatoren auf vorhandene V623-Grenzen und führt die zusätzlichen Akzente an Abschnittsgrenzen auf null zurück.
- Keine neuen 3D-Lichtquellen, Renderloops, GLB-Clips, Spotify-Anfragen, Ressourcen oder Audio-Erkennung.
- Tests verwenden simulierte Metadaten und Zeitpunkte, **keine echte Konzertaufnahme oder FPS-Messung**.

## Lokale Windows-Freigabe

```powershell
npm install
npm run test:smoke:v628
npm run verify:v628
npx tsc --noEmit
npm run build
```

Anschließend echte 2-/3-/4-Avatar-Shows und mehrere vollständige Songs anhand der V627-Qualitätsprüfung auf Kamera, Lyrics, Lippen- und Körpersynchronisierung sowie Bühnenwirkung visuell prüfen.
