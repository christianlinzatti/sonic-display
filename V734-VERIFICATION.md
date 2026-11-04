# V734 – Prüfbericht

Stand: 30. Oktober 2026. Grundlage: vollständiges V733-ZIP, keine Dateien der Basis entfernt.

## Bestanden

- 12 neue Laufzeitprüfungen: Spotify-/Lyrics-Fristen einschließlich hängender Body-Auswertung, nachfolgende Anfragen, sofortiger Abbruch, verspätete Ergebnisse, Bild-Warteschlange und Unmount, Rotation über 101 Konten bei wechselnder Redis-Reihenfolge, Ressourcenfreigabe, GLTF-Download-Timeout und verspätete Dekodierung nach Abbruch.
- 68 V733-Prüfungen (36 Kern-, 21 asynchrone und 11 UI-Prüfungen).
- 17 ausgewählte ältere Testsuiten: 16 im Regressionslauf einschließlich V729–V732 und Lifecycle/Push, zusätzlich V659 (620 gespeicherte Animationen, 250 Auswahlmöglichkeiten, 100 Wechsel mit begrenztem Cache).
- Syntaxprüfung: 1.036 TS/TSX-Dateien.
- Architekturprüfung: 715 aktuelle Quellverweise. Die zunächst veraltete Dokumentationsversion wurde korrigiert; der erneute Lauf besteht.
- Vollständiger eigenständiger Typecheck: Exitcode 0, nach den letzten Änderungen an der Download-Zuordnung.

## Produktionsprüfung

Produktionsbuild: Exitcode 0. Verwendet: `SONIC_LOW_MEMORY_BUILD=1`, `RAYON_NUM_THREADS=1`, `NODE_OPTIONS=--max-old-space-size=2048` und `npm --ignore-scripts run build`. Das historische npm-Prebuild-Skript und die vollständige historische Testsammlung wurden nicht ausgeführt. Ein vorheriger Buildlauf wurde für die zusätzliche Absicherung der Download-Zuordnung bewusst gestoppt; der abschließende Lauf ist erfolgreich.

Produktionsserver gestartet; Startseite liefert HTTP 200. Dies ist ein Starttest, keine vollständige UI-Abnahme. Bestehende CSS-/Autoprefixer- und Webpack-Cache-Warnungen bleiben im Buildprotokoll sichtbar.

## Aussagegrenzen

Kontrollierte Simulationen, keine Live-Abnahme mit Spotify, Lyrics-Anbietern, Redis oder Push-Geräten. Kein visueller 3D-Test und keine Browser-Heap-/GPU-Langzeitmessung; daher keine Behauptung vollständiger Leak-Freiheit. Zwölf neue Prüfungen sind keine vollständige Testsammlung aller historischen Versionen.

GLTF-Dekodierung kann bereits synchron auf dem Hauptthread laufen; ein Timeout kann diese Arbeit nicht präemptiv stoppen. Abbruch von externen Unterressourcen hängt vom Three.js-Loader und Browser ab. Spät fertiggestellte Assets werden aufgeräumt. Das Push-Arbeitsbudget bleibt zwei Konten pro Aufruf; bei wachsender Nutzerzahl und vielen Künstlerseiten muss der Betreiber die Kapazität weiterhin berücksichtigen.

Die installierten Abhängigkeiten der V730-Arbeitsumgebung wurden wiederverwendet. Keine frische Installation oder Deployment. React Test Renderer meldet eine bestehende Deprecation-Warnung. Frühere Versionsberichte im ZIP sind historische Dokumentation. Protokolle dieses Durchlaufs stehen unter `verification-v734/`.
