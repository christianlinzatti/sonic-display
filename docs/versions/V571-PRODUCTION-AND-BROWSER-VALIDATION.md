# V571 – Production Build & Browser Validation

**Stand:** 25.10.2026 · **Release-Status:** Quell-/Regressionstests verfügbar, **kein** erfolgreicher Next.js-Produktionsbuild und **keine** echte Pi-Freigabe im Entwicklungscontainer.

## Motivation

V570 enthält weder `package-lock.json` noch installierte npm-Abhängigkeiten. Das bisherige `prebuild` rief eine sehr lange historische Testkette auf, bevor `next build` starten durfte. Ein normaler Entwicklungsbuild soll nicht an hunderten unveränderten Alttests hängen; die vollständige Testabnahme bleibt erhalten.

## Reproduzierbare Installation – einmalig auf deinem Windows-PC

PowerShell im Projektordner (Node 22 empfohlen):

```powershell
node --version
npm --version
npm install --no-audit --no-fund
# npm install erzeugt package-lock.json anhand der aktuell erreichbaren npm-Registry.
# package-lock.json danach ins Repository COMMITTEN, nicht nur lokal liegen lassen.
npm ci --no-audit --no-fund
npm run audit:v571:environment -- --require-lock --require-dependencies
npm run test:smoke:v571
npm run typecheck
npm run build
```

**Wichtig:** Eine ehrliche, aus der npm-Registry aufgelöste Lockdatei konnte in dieser offline/abgeschotteten Entwicklungsumgebung nicht erstellt werden. V571 enthält daher **keine erfundene Lockdatei**. Erst nach `npm install`, Versionierung von `package-lock.json` und anschließendem `npm ci` ist die Abhängigkeitsbasis reproduzierbar. `.github/workflows/concert-validation-v571.yml` nutzt `npm ci`, wenn das Lockfile vorhanden ist; andernfalls ist der Initial-Bootstrap via `npm install` ausdrücklich **nicht** reproduzierbar.

## Getrennte Tests

| Befehl | Bedeutung |
| --- | --- |
| `npm run test:v571` | V571 Build-/Browser-Harness-Regressionssuite, offline |
| `npm run test:smoke:v571` | Schnelle V571/V570-Regressions-, Syntax- und Architekturtests |
| `npm run build` | Schnelle `prebuild`-Prüfung, danach **echter** Next.js-Produktionsbuild |
| `npm run build:preflight` | Unveränderte breite historische Build-Regression, ergänzt um V571 |
| `npm run verify:v571` | V571 + historische gezielte V570/V569/...-Regressionen, ohne reale Browser-/Pi-Abnahme |
| `npm run verify:release:v571` | Historische Preflight-Tests, **strenger** Lock-/Dependency-Check, echter Next-Build |
| `npm run audit:v571:environment -- --json` | Maschinenlesbarer Status: Version, Node, installierte Pakete, Lockfile und offene Prüfschritte |

Bei fehlender Registry/Abhängigkeiten ist ein Build **blockiert**, nicht bestanden. Das Audit führt absichtlich **keinen** Build aus und meldet dafür immer `not-run`.

## Browser-Sichtprüfung und nachvollziehbares Artefakt

In einem Terminal:

```powershell
npm run dev -- --hostname 127.0.0.1
```

Im zweiten Terminal (mit Chromium/Chrome auf `PATH`; andernfalls `--chromium="C:\Program Files\Google\Chrome\Application\chrome.exe"` angeben):

```powershell
npm run test:v571:browser -- --url=http://127.0.0.1:3000/ --open-selector="[data-v571-preview-open]" --require-webgl --out=artifacts/v571/preview
```

Der Browser öffnet im Regelfall automatisch die Einstellungen, wählt den Avatar-Reiter, klickt die 3D-Vorschau und wartet auf den zugehörigen Dialog. Ergebnis: **PNG plus JSON** mit Dokument-/Canvas-/Eingangsprüfstatus. Das Ergebnis ist **nur ein Browser-Smoketest**, keine bestätigte Tanz-, Mund-, Lyrics- oder Pi-Qualität.

Für eine Avatar-Rig-Sichtung bei vorher ausgewähltem, ladbarem echten GLB und aktiviertem echten GLB-Modus (die Moduswahl gegebenenfalls vor einem manuellen Sichttest einstellen):

```powershell
npm run test:v571:browser -- --url=http://127.0.0.1:3000/ --open-selector="[data-v571-preview-open]" --require-webgl --require-glb --out=artifacts/v571/avatar-rig
```

**Einschränkung:** `--require-glb` prüft das im V570-Eingangscheck **tatsächlich gescannte Mund-Rig**. Der V570-Dialog startet nicht zwingend mit eingeschaltetem echten GLB. Ohne aktivierten und erfolgreich geladenen GLB-Modus ist dieser Test folgerichtig **nicht bestanden**. Der Script-Aufruf setzt absichtlich keine persistenten Avatar-Einstellungen. Das Skript akzeptiert aus Sicherheitsgründen nur lokale HTTP(S)-Ziele (`127.0.0.1`, `localhost`, `::1`).

Die Möglichkeit `--self-test` erzeugt nur eine **Browser-Testfixture** und darf niemals als Konzert-App-Ergebnis ausgegeben werden. Der Container-Browser ist in dieser Umgebung administrativ so konfiguriert, dass sämtliche Navigationsadressen gesperrt sind; selbst eine lokale Fixture kann deshalb **blockiert** werden. Diese Sperre wird weder umgangen noch als Erfolg gewertet.

## Manuelle Prüfung mit eigenen GLB-Avataren

1. **Solo-Deutschrap:** echten Avatar in 3D-Vorschau aktivieren, Gesicht nah, V562-Kalibrierung an/aus; Mundschluss, Lip-Sync und Silbenübergänge visuell beurteilen.
2. **Duett:** zwei tatsächliche GLB-Modelle laden; auf separate Rig-Statusmeldungen, eindeutige Demo-Kennzeichnung, Beleuchtung und echte manuelle Sängerzuordnungen achten.
3. **Tanz & Lyrics:** verschiedene Tanzclips mit V565-A/B-Überblendung und gut lesbaren Haupt-Lyrics vergleichen. Keine Auswertung allein aus Screenshots ableiten.
4. **Raspberry Pi:** vergleichbare 10-Zoll-Show-Szenen unter Last mehrere Stunden ausführen und reale FPS, Framezeiten, WebGL-Fehler, RAM-Verlauf, GPU-Temperatur und Eingabeverzögerung dokumentieren. Keine hardwarebezogenen Leistungszahlen aus den Offline-Simulationen ableiten.

**Release-Freigabe:** erst nach erfolgreichen `npm ci`, `npm run typecheck`, `npm run build`, echten Browser-/GLB-Sichtprüfungen und Pi-Laufzeittests. Automatisierte V571-Quelltests allein reichen nicht aus.
