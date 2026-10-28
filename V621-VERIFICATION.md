# V621 – Verifikation (27.10.2026)

## Erfolgreiche Prüfungen

- `npm run test:v621`: **52 Regressionstest-Gruppen**, **20.000** synthetische Song-/Licht-/Effektzustände, neue Lichtpläne mit gleicher Track-ID und bestätigter Songphase, Zeitschutz, Blackouts, Lyrics, Genre-/Drop-Akzente, additive Effektbudgets.
- `npm run test:v621:types`: TypeScript-Kernprüfung bestanden.
- `npm run test:smoke:v621`: komplett bestanden; beinhaltete V620, V619, V618, V617, V616, V608, V601 und Architekturprüfung.
- `npm run verify:v621`: vollständig bestanden; zusätzlich V542/V551/V609/V611 und vollständige Syntaxprüfung.
- Weitere, separat bestandene Tests: `test:v610`, `test:v602`, `test:v555`, `test:v608:types`, `test:v601:types`, `test:v609:types`, `test:v542:types`.
- `npm run check:syntax`: **845 TS/TSX-Dateien** erfolgreich geparst und Imports geprüft.
- `npm run check:architecture`: **495 Quellpfadreferenzen**, zehn Architekturabschnitte, Releasekennung V621.

## Kleine Kompatibilitätsanpassungen an älteren Regressionen

- V610 erwartet weiterhin die unveränderte Reihenfolge der vorhandenen Lichtfaktoren; die neue V621-Multiplikation folgt nun auf den bestehenden V610-Faktor.
- V616 prüft weiterhin, dass `prebuild` einen V616-Test aufruft, durchläuft dazu aber den gesamten registrierten npm-Abhängigkeitsgraphen statt ausschließlich den ersten `test:smoke`-Nachfolger.

## Nicht hier nachgewiesen

In der Ausführungsumgebung sind nicht alle Projekt-`node_modules` installiert. Daher wurden **weder `npx tsc --noEmit` für das gesamte Next.js-Projekt noch `npm run build`** vollständig nachgewiesen. Der echte Konzert-Eindruck mit GLB-Avataren, die Lichtlesbarkeit auf der Zielanzeige und FPS-/GPU-Messungen müssen lokal im Browser bewertet werden. Die synthetischen Tests sind kein Echtbild-/Performance-Beweis.

```powershell
npm run verify:v621
npx tsc --noEmit
npm run build
```
