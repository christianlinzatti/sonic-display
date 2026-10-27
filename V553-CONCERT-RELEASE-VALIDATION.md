# Sonic Display V553 — Concert Experience Release Validation

## Ergebnis und Freigabephilosophie

V553 ist die letzte Version der Roadmap V544–V553. Sie fügt **keinen künstlichen Performance-Score** hinzu, sondern verbindet die bereits auf der laufenden WebGL-Hauptbühne erfassten Messungen (V518/V522/V543), die manuelle Konzert-Sichtprüfung und ausdrücklich extern nachgewiesene Build-/Gerätechecks.

**Stand dieser Quellcode-Lieferung:** Keine Produktionsfreigabe. Ein vollwertiger `next build` und ein echter visueller/thermischer Test auf einem Raspberry Pi wurden in dieser Entwicklungsumgebung nicht durchgeführt. Kein Browser-/Pi-Status wird auf der Grundlage simulierter Regressionstests automatisch bestätigt.

## Neuer V553-Freigabebereich

Unter dem vorhandenen **Concert Benchmark & Quality Validation** im Performance-/Diagnostikbereich der 3D-Bühne:

1. Je drei vollständige Live-Messläufe von Deutschrap-Feature (vier Avatare), Hardstyle-/Hardtekk-Drop und dreiminütiger Konzertshow erfassen; unveränderte Einstellungen und ein einziges FPS-Ziel verwenden. Die bestehenden V522-Routinen protokollieren FPS, P95/P99 der einzelnen Sekundenfenster, langsame Frames und weitere WebGL-Kenngrößen. Fehlende, fehlerhafte oder neue schlechtere Messungen blockieren die Freigabe.
2. Vier manuelle Prüfungen **pro Szene** abhaken: Lyrics, Lip-Sync/Sängerwechsel, natürliche Tanzanimation/Fußkontakt und Kameralicht. Diese Häkchen sind echte Bedienerbeurteilungen; die App prüft weder Lippenformen noch Pixel.
3. `npm install`, `npm run typecheck` und `npm run build` mit installierten Abhängigkeiten auf dem lokalen Entwicklungsrechner ausführen; Build-Ergebnis und Protokoll in den V553-Bereich kopieren. Die App kann den angegebenen Build nicht verifizieren.
4. Die Show anschließend **am echten Raspberry Pi** mit 10-Zoll-Touchscreen ausführen und die Benchmarks dort erneut erfassen. Gerät/Browser dokumentieren und per Häkchen bestätigen, dass die aktuellen Messungen wirklich auf diesem Pi ausgeführt wurden. Ein ausgewähltes Pi-Profil ist **kein Gerätebeweis**.
5. Die Touch-Darstellung, die dreiminütige Konzertshow ohne Hänger sowie Temperatur-/CPU-Throttling am Pi mit systemeigenen Diagnosewerkzeugen getrennt überprüfen. Die Web-App misst keine CPU-Temperatur oder thermisches Throttling.
6. Nur bei **allen** erfolgreichen Nachweisen zeigt V553 »Für menschliche Freigabeprüfung vorbereitet«. Selbst dieser Status ist eine dokumentierte menschliche Beurteilung, keine automatisch zertifizierte Hardware-, Build-, Bild- oder Audioqualität.

Unter »V553-Freigabebericht als JSON speichern« werden Live-Messungen, Run-IDs, Szenenbewertungen, offene Sperrgründe und die vom Nutzer eingetragenen Build-/Geräteinformationen exportiert. Beim erneuten Benchmark oder FPS-Wechsel werden die Pi-/Thermal-/Touch-Bestätigungen zurückgesetzt, während das davon unabhängige lokale Build-Protokoll erhalten bleibt. Das Löschen des Messverlaufs setzt die komplette Freigabe-Evidenz zurück. Der JSON-Export ist kein automatischer Cloud-Upload.

## Architektur und Sicherheit

- `services/monitoring/concertReleaseGateV553.ts`: reine Entscheidungslogik, ohne Timer, Netzwerkzugriff, eigene Hardware-Erkennung, GPU-Queries oder Speicherung.
- `components/visualizer/PiConcertBenchmarkStudioV522.tsx`: UI und Export auf der vorhandenen Live-Quelle. Keine neuen GPU-Meshes, zusätzlichen Render-Loops oder Songuhren.
- Respektiert weiterhin manuelle Rap-/Kamera-/Licht-Cues und 2D-/3D-Wortzeitstempel der V544–V552-Implementierungen. Keine GLB-Originaldateien im ZIP.
- Die V522-Frame-P99 ist das schlechteste P99-**Sekundenfenster**, kein P99 über alle Einzelbilder. Browser-JS-Heap entspricht nicht dem RAM-Verbrauch des Raspberry Pi.

## Tests

`npm run test:v553` simuliert neun vollständig beobachtete Benchmarkläufe **ausschließlich als deterministische Test-Fixtures**. Geprüft werden die korrekte Aggregation, Sicherheitsblockaden bei fehlendem Build/Hardware-Checks, unterschiedliche FPS-Ziele und Konfigurationen, spätere defekte/ungültige Messungen, Korrekturläufe und die Integration aller relevanten neuen Pipeline-Module. Das sind ausdrücklich keine echten FPS-Messungen.

`npm run test:v553:types` und `npm run verify:v553` prüfen neue Kerntypen sowie die letzten Versionen; der vollständige Next.js-Build und visuelle Tests müssen auf einem Rechner mit `node_modules` nachgeholt werden.
