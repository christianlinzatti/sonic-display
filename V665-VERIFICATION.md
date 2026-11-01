# V665 – Prüfbericht (28.10.2026)

## Geprüft und bestanden
- `npm run test:v665`: 40 Testgruppen, 15.000 simulierte Grounding-/GLB-Szenen, einschließlich Kontaktwechsel, sanfter Freigabe beim Abheben, Seeks, Titel-/Modellwechsel, manuellem Vorrang, deaktivierter Standardkonfiguration, sicherem Storage und Sicherung des neuen Einstellungsschlüssels.
- `npm run test:v665:types`: isolierter TypeScript-Check des neuen Controllers.
- `npm run test:v596`, `test:v596:types`, `test:v545`, `test:v545:types`, `test:v494`, `test:v494:types`, `test:v481`, `test:v481:types`, `test:v482`, `test:v482:types`, `test:v493`: bisherige Fußkontakt-/Hocke-/Motion-Tests bestanden.
- `npm run test:v664`, `test:v664:types`, `test:v663`, `test:v663:types`: Duett- und Rap-Performance-Regressionen bestanden.
- `npm run check:syntax`: 917 TS/TSX-Quelldateien geprüft.
- `npm run check:architecture`: aktuelle Architekturreferenzen geprüft.
- `npm run test:module-case`: 1544 Quelldateien ohne Windows-/Linux-Namenskollision.
- `npm run check:test-types`: test-only Deklarationen sind aus dem Produkt-Build ausgeschlossen.
- `npm run test:env:spotify-build`: Spotify/OAuth-Build-Umgebungsprüfung bestanden.
- ZIP-CRC und exakter Patch-Rekonstruktionsvergleich nach Paketierung (siehe Paketprüfung).

## Nicht als bestanden zu betrachten
- **Gesamte `test:smoke:v665`**: nach erfolgreichem Durchlauf der V665, V596/V545/V494/V481/V482/V493, V664 und weiterer Regressionen wegen des Ausführungslimits während der historischen V663-Kette abgebrochen. Kein erfolgreicher Exit Code der Gesamtkette.
- **`npm run typecheck`**: tatsächlich ausgeführt, Exit 2: `node_modules` fehlt. Vor allem `next/server`, React-/Node-Typen und andere externe Typdefinitionen können nicht aufgelöst werden. Dies ist *kein* bestandener Gesamt-Typecheck und schließt zusätzliche Fehler bei installierten Abhängigkeiten nicht aus.
- **`npm run build` / Next.js-Produktionsbuild**: ohne installierte Abhängigkeiten nicht erfolgreich ausgeführt. Auch GitHub Actions und reale WebGL-/GLB-Performance wurden hier nicht getestet.
- `package-lock.json` wird vom Quellprojekt weiterhin nicht mitgeliefert. Der installierte Abhängigkeitsstand ist nicht reproduzierbar eingefroren.

## Funktionale Grenzen
V665 ist eine opt-in **heuristische Dämpfung vorhandener additiver Rig-Bewegungen**. Sie erzeugt keine realistischen Kollisionskräfte, keine physikalisch korrekten Fußsohlen und keine neuen Hocke-Clips. Die V492-Fuß-IK und bestehende GLB-Animationen bleiben maßgeblich; für Sichtfreigabe sind echte GLB-Browser-Szenen und der finale Produktionsbuild erforderlich.
