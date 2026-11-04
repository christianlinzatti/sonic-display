# Sonic Display V778 – Concert Performance Quality Advisor

## Zweck und Grenzen

V778 **wertet ausschließlich vorhandene V777-Browsermessberichte aus**. Es startet keinen Benchmark automatisch, erfindet keine FPS und wendet keine Einstellungen am Live-Konzert an. Verglichen werden drei reale Bühnen mit jeweils zwei und vier GLBs, echten Renderer-Statistiken und deterministischen Testsignalen für Beat, Vocal und Lyrics. Die vollständige Spotify-/Motion-/Lip-Sync-Konzertlogik wird von der V777-Fixture nicht ausgeführt.

Die Testszenen müssen vollständig sein (Cyberpunk, Rock, Galaxy mit 2 bzw. 4 GLBs), die Frame-Metriken positiv, die GLB-Dateiprüfsummen SHA-256-konform und die Testparameter zur V777-Fixture passend. Ein fehlgeschlagener/`blocked`-Browserlauf wird **nicht** als Benchmark behandelt. Der Code validiert einen Dateibericht, kann aber nicht kryptografisch beweisen, dass jemand die JSON-Werte nicht manuell geändert hat.

## Browser-Diagnose

1. Nach `npm ci`, `npm run typecheck`, `npm run build`, `npm run start` mit dem V777-Benchmark unter `/diagnostics/concert-benchmark?concertBenchV777=1` auf localhost echte Messungen durchführen und den JSON-Bericht speichern. Alternativ den Browser-Runner benutzen.
2. `/diagnostics/concert-quality` öffnen. V777-JSON unter **Bericht** auswählen.
3. FPS-Ziel 30, 45 oder 60 auswählen. Tabellen für die 6 Szenen zeigen FPS, P95, Draw Calls, das verbleibende Framebudget und Zielerreichung.
4. Bei Bedarf eine ältere V777-Messung als Basis laden. Streng inkompatible Testumgebungen, GLB-Hashes und Fixture-Parameter werden ausdrücklich abgelehnt.
5. Ergebnis und Vergleich per **Beratung als JSON exportieren** lokal sichern. Keine Serveraktion, WebGL-Canvas, Mikrofonnutzung oder automatische Änderung der Bühnenkonfiguration.

## Offline-CLI

```sh
npm run benchmark:v777:browser -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb --label=Mein-Rechner --out=artifacts/v777/current.json
npm run benchmark:v778:advise -- --input=artifacts/v777/current.json --target=60 --out=artifacts/v778/advice.json
```

Die CLI erzeugt `artifacts/v778/advice.json` und `artifacts/v778/advice.md`. Zusätzlicher Vergleich:

```sh
npm run benchmark:v778:advise -- --input=artifacts/v777/after.json --before=artifacts/v777/before.json --target=45 --out=artifacts/v778/vergleich.json
```

Fehlt ein gültiger echter Bericht, schreibt die CLI einen explizit blockierten Bericht ohne Profilvorschlag (Exit-Code 2). Bei ungleichen GLB-Prüfsummen, Browser/Renderer, Canvas-DPR, Fixture-Version oder Testeinstellungen markiert der streng über V777 abgesicherte Vergleich `incompatible` (Exit-Code 2), statt einen Erfolg zu behaupten. Ohne Eingabedatei / mit ungültiger JSON-Syntax beendet die CLI mit Exit-Code 1.

## Empfehlungslogik

Pro Bühne und Avatarzahl gilt das gewählte FPS-Ziel nur dann als erreicht, wenn **gemessene FPS ≥ 90 % des Ziels** **und P95-Framezeit ≤ 1000 / FPS-Ziel (ms)** sind. Der Sicherheitsabstand wird pro Szene transparent ausgewiesen. Nur wenn alle drei Bühnen bestehen, werden **4 GLBs** oder andernfalls **2 GLBs** empfohlen. Erreicht keine Avatarzahl das Ziel, wird **keine** als ausreichend bestätigt.

Die Profile `high`, `balanced` und `low` entsprechen vorhandenen Sonic-Display-Qualitätsbezeichnungen, sind aber zunächst **zu testende Vorschläge** – keine garantierten Bildraten oder automatisch aktivierte Settings. Nur wer sowohl Ziel und >=20 % P95-Reserve erreicht (bei >=95 % Ziel-FPS), bekommt `high` vorgeschlagen. Ein Draw-Call-Zähler allein beweist keinen GPU-Engpass; vermeintliche Engpässe werden nur als mögliche Ansatzpunkte benannt. Für Versionenvergleiche müssen FPS **und** P95 deutlich und in dieselbe Richtung verbessert sein (>3 %), um als eindeutige Verbesserung zu zählen.

## Hardwareevidenz

- **reference-only:** Enthaltene ca. 38-KB-Testfigur: nur Funktionstest. Hardwarewahl unmöglich.
- **software-only:** SwiftShader/Software: keine reale GPU-Performance ableitbar.
- **fixture-only:** Eigene GLBs auf einer realen GPU: Aussagen gelten ausschließlich für **diese Hardware**, die **berichtete Auflösung** und die isolierte V777-Fixture. Auch hier ist keine konkrete Raspberry-Pi- oder Mini-PC-Empfehlung aus dem Desktoptest seriös.

Für die 10-Zoll-Hardwareentscheidung mehrere Läufe mit tatsächlich geplanten GLBs, Display-Zielauflösung, mehreren Liedabschnitten, kompletter 3D-Konzertdarstellung und nach Möglichkeit dem Zielgerät oder vergleichbarer GPU durchführen. Temperatur/Throttling, echte Spotify-/Audioanalyse und laufender Betrieb können die Ergebnisse verändern. `renderer.info.memory` zählt Ressourcen, keine VRAM-Bytes.

## Tests

- `npm run test:v778` – vollständige und ungültige Berichtsdaten, 30/45/60 FPS, 2/4 GLBs, Profilvorschläge, Hardwarewarnungen, Vergleich, UI-Integration und CLI JSON/Markdown.
- `npm run test:v778:types` – reine TS-Empfehlungslogik ohne React/Next-Abhängigkeiten.
- `npm run verify:v778:static` – neue und V776/V777-Regressionen, Syntax, Architektur, Lockfile und Case-Kollisionen.
- Produktionsbuild und echte Browsermessung müssen separat auf einem Rechner mit installierten npm-Abhängigkeiten erfolgen.
