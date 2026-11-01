# V779 – Verifikation

V779 stellt Messverfahren und strikte Ergebnisvalidierung bereit, **keine automatisch behaupteten FPS-Gewinne**. Die auswertenden Tests verwenden ausschließlich explizit gekennzeichnete synthetische Test-Berichte. Die echten Browsermessungen sind bis zur Ausführung auf einem Zielrechner offen.

- `npm run test:v779` – Gegenproben für fehlende/geänderte GLBs, falsche Reihenfolge, Software-Rendering, fehlerhafte Messreihen, Instabilität, CLI und Profilkennzeichnung.
- `npm run test:v779:types` – TypeScript Strict für das reine Bewertungsmodul.
- `npm run verify:v779:static` – V778/V777/V776 Rückwärtsprüfungen plus Syntax, Architektur, Lockfile, Dateinamen, GPU-Schutztests.
- `npm run typecheck`, `npm run build` – benötigen vollständige npm-Pakete; Ergebnis muss auf dem Zielrechner bestätigt werden.
