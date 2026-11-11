# Verifizierte Chromium-Vorbereitung ohne unnötige apt-Abhängigkeit

Der GitHub-Lauf für `019a0af` bestand 201 Regression-/Typ-/Build-Prüfungen und
den Windows-Smoke-Test. Unter Ubuntu scheiterte anschließend
`playwright install --with-deps chromium` am DNS-Zugriff auf
`azure.archive.ubuntu.com`. Es wurden überwiegend zusätzliche Schriftpakete
angefordert, während die aufgelisteten Browser-Systembibliotheken bereits
installiert waren. Die Browser-Suite und der Soak-Test liefen deshalb nicht.

`scripts/prepare-playwright-chromium.cjs` lädt zunächst den zur installierten
Playwright-Version gehörenden Chromium. Anschließend startet es diesen Browser
wirklich im Headless-Modus, erstellt eine Seite, rendert einen lokalen Titel und
schließt den Browser. Wenn das erfolgreich ist, benötigt der Runner für diese
Vorbereitung keine zusätzliche apt-Installation. Die vollständige bestehende
Desktop-/Touch-Suite einschließlich Screenshot- und Qualitätsnachweisen folgt
weiterhin verpflichtend.

Nur bei fehlgeschlagenem Start wird unter Linux `playwright install-deps
chromium` ausgeführt. Nach dieser Reparatur muss derselbe reale Browserstart
erneut bestehen. Downloadfehler, fehlgeschlagene Installation und weiter
fehlgeschlagener Start bleiben Fehler. Windows verwendet keinen Linux-Reparaturpfad.
In GitHub Actions gelten die festgelegten Playwright-Browser, ohne lokalen
Executable-Override. Lokale Proben können den vorhandenen Chromium über
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` nutzen.

`tests/playwright-chromium-bootstrap.cjs` prüft den funktionierenden Runtime-Pfad,
den notwendigen Reparaturpfad und alle Fehlerfälle. Die vorhandenen zwölf
Orchestrierungsprüfungen in `tests/v1005-playwright-production-regression.cjs`
bleiben erhalten. Die neue Prüfung gehört zum aktiven `test:v1136`-Pfad.
