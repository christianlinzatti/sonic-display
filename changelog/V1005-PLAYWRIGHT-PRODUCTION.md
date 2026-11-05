# V1005 – Playwright gegen den Produktionsbuild

## Einspielen

`SonicDisplay-V1005.zip` unverändert unter `releases/` auf `master` hochladen und committen.
Der vorhandene Workflow **Sonic Display - Versioned Project ZIP Import** importiert die Quellen
und startet **V965 Verified Room Wave and Deployment Production Gate** auf Linux und Windows.
V1005 hängt Playwright direkt in `scripts/v965-production-verify.cjs` hinter den erfolgreichen
Produktionsbuild ein. Damit funktioniert die Automatisierung auch dann, wenn der Importer
wie vorgesehen `.github/**` aus dem ZIP überspringt. Kein zusätzliches Workflow-Einspielen nötig.

Auch der bereits im Repository vorhandene **Vercel Production Parity**-Workflow führt
Playwright bei Quellcode-Pushes auf `master` und Pull Requests automatisch aus. Dazu hängt
V1005 den Browsertest an `scripts/vercel-production-build.cjs`, ausschließlich innerhalb
von GitHub Actions. Direkte Vercel-Deployments behalten ihren Build-Ablauf ohne Browserinstallation.

## Was automatisch passiert

1. Reproduzierbares `npm ci` einschließlich exakt versioniertem `@playwright/test`.
2. Vorhandene Regressionen, vollständige TypeScript-Prüfung, echter `next build`.
3. Überprüfung der frischen Build-Artefakte; Installation von Chromium
   (unter Linux einschließlich Systembibliotheken).
4. `next start` ausschließlich auf `127.0.0.1:3215`; ein bereits belegter Port führt zum Fehler.
5. Zwölf Tests: sechs Fälle jeweils mit Desktop- und Touch-Geräteprofil.
6. Fehler, fehlende Browser, fehlende Reports oder übersprungene Tests lassen den Check fehlschlagen.

Getestet werden Startseite und Reload, Produktions-CSS/JS, Hydration und nachgeladenes
Einstellungsdialogfenster, Speichern/Reload/JSON-Export des Abnahmeformulars,
die echte Spotify-401-Antwort ohne Sitzung, PWA-Manifest und Icons sowie eine echte 404-Antwort.
Browser-Laufzeitfehler und defekte `/_next/static/`-Dateien lassen UI-Tests fehlschlagen.
Es gibt keine simulierten App- oder API-Antworten und keine erforderlichen GitHub-Secrets.
Der Testserver erhält synthetische Spotify-/Session-Konfiguration; die Tests verbinden kein Konto.
Touch ist Chromium-Geräteemulation, keine Zertifizierung eines physischen iPads oder von Safari.
Diese Suite deckt keine echte Spotify-Wiedergabe, GPU-/GLB-Konzertqualität oder Govee-Hardware ab.

## Ergebnisse auf GitHub

Unter **Actions → V965 Verified Room Wave and Deployment Production Gate** beide Jobs prüfen.
Der grüne ZIP-Import allein ist kein bestandenes Testergebnis.
Die Job-Zusammenfassung zeigt Playwright PASS/FAIL und Testzahlen. Das bestehende Artefakt
`sonic-v965-<Betriebssystem>-production` enthält:

- `v965-production-proof.json`: Gesamtstatus einschließlich `playwright`, Build-ID und Testzahlen.
- `v959-regression-logs/playwright-production.log`: vollständiger Playwright-JSON-Report und Status,
  auch bei fehlgeschlagenem Browserstart oder Tests.

Beim Parity-Workflow enthält das Artefakt `vercel-parity-<Betriebssystem>` die
`vercel-production-proof.json` einschließlich Playwright-Status. Ausführliche Fehlermeldungen
stehen außerdem im Job-Log.

Der HTML-Bericht und Fehler-Screenshots/Traces entstehen zusätzlich unter
`reports/playwright-production/`. Der bestehende geschützte Workflow lädt diese Verzeichnisse
nicht hoch; die JSON-Berichte werden über seine bereits vorhandenen Artefaktpfade gesichert.

## Lokal

```sh
npm ci --include=dev
npx playwright install --with-deps chromium
npm run test:e2e:production
npx playwright show-report reports/playwright-production/html
```

`test:e2e:production` baut immer frisch und führt dann Playwright aus.
`test:e2e:browser` ist der Browserlauf gegen einen bereits vorhandenen Build.
Die CI-Einbindung verwendet den gerade verifizierten Build derselben Gate-Ausführung und baut
kein zweites Mal. Lokale Linux-Installationen können optional
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` verwenden; GitHub Actions verwendet
immer den zur Playwright-Version passenden heruntergeladenen Chromium.

Orchestrierungsregressionen: `npm run test:v1005`.
