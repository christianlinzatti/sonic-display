# Sonic Display V1105 – Playwright Visual Regression & Accessibility

- Sechs zusätzliche echte Playwright-Browser-Szenarien jeweils auf Desktop und Touch (12 Fälle).
- Screenshots derselben UI vor und nach Reload werden über dekodierte PNG-Pixel verglichen; 7 % maximaler Unterschied, Farbkanal-Toleranz 14. Kein plattformübergreifender Golden-Screenshot.
- Neue UI-Audits für horizontale Überläufe, sichtbare Einstellungsüberschrift und Suchfeld, Keyboard-Fokus, tabbed Navigation, reduzierte Bewegung und sichere Govee-Schaltflächen.
- Offline Report `reports/playwright-production/visual-gallery/quality.html` mit getrennten Statusnachweisen pro Test und Browser; JSON parallel.
- Fehlende Screenshots, Browser-Projekte, skipped/flaky/failed Tests werden nicht als Produktionspass gezählt.
- V1104-HTML-Screenshot-Galerie und bestehende Playwright-Traces bleiben unverändert erhalten.
- CI-Regression + isolierter TS-Check im Prebuild und in Release-Gates; keine Live-Geräte, kein Spotify-Login.

**Hinweis:** Echte Browserergebnisse können erst nach Node-24-Build und Playwright in GitHub Actions entstehen. Lokale Node-22-Quellcodeprüfungen ersetzen keinen Chromium-Produktionsnachweis.
