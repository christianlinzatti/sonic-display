# Sonic Display V543 – Concert Show Integration & Performance Validation

## Was wird geprüft?

- Gemeinsames, deterministisches Verhalten der **echten Funktionsmodule**: Genre- und Clipauswahl V535/V536, Rap-Duette/Hooks V527/V539, Kamerakomposition V528/V540, zeitgestempelte Lyrics V541 sowie Konzertlicht V462/V542. Auch die originalen Skelett- und Clip-Metadaten aller fünf GLBs werden als externe Testfixtures gelesen.
- Eigene V543-Gesamtübersicht unter **Einstellungen → Performance / Konzert-Benchmark** im vorhandenen V522-Widget, ohne neue Render- oder Messschleifen.
- Drei real gemessene V522-Benchmark-Durchläufe **je Szenario**: Deutschrap-Feature mit Vocal-Cast, Hardstyle-/Hardtekk-Drop und dreiminütige Langzeitshow; vergleichbare Device-/Grafikkonfiguration und gleiche FPS-Zielvorgabe.
- **Je Szene** vier getrennte, manuell zu bestätigende Sicht-/Hörprüfpunkte: lesbare Lyrics, plausibler Vocal-/Lip-Sync, natürliche Bewegungen/Fußkontakt, Kamera/Licht ohne störendes Überdecken. Bei erneutem Durchlauf, FPS-Zielwechsel und Zurücksetzen wird die Freigabe widerrufen.
- JSON-Export protokolliert Rohmessungen, per-Szene-Status und manuelle Bestätigungen; keine gefälschten fps und keine erfundene automatische Sichtprüfung.

## Grenzen und Testvorgaben

Die Offline-Simulation prüft nur Quellcode- und Zustandslogik; ein realer Next.js-Build, WebGL-Messungen und dauerhaft fehlerfreie optische Darstellung sind davon nicht bewiesen. Ein Browser kann echte, pro-Sekunde beobachtete FPS/P95/P99 anzeigen, aber das ist keine Garantie für Synchronität zum Audio oder thermische Langzeitstabilität eines Raspberry Pi. Die fünf externen Test-GLBs sind nicht im Release-ZIP.

Technische Tests: `npm run test:v543`, `npm run test:v543:types`, `npm run check:syntax`, `npm run check:architecture`; Regressionen der Versionen V522–V542. Realer Endtest nach `npm install && npm run build` auf der Zielplattform.

Optionales Release-Preflight ohne installierte Next.js-Abhängigkeiten: `npm run verify:v543`. Ohne die externen fünf GLBs werden die 405 funktionalen Fälle mit **ausdrücklich synthetischen** Clips durchlaufen. Die originale GLB-Datenprüfung findet nur statt, wenn die tatsächlichen Dateien vorhanden sind. Mit `SONIC_V543_SAMPLES=/pfad/zu/glbs` lässt sich der Pfad der Test-GLBs angeben.
