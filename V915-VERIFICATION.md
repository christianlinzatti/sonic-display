# V915 – Prüfbericht

- Basis: `sonic-display-v914-advanced-light-transitions-full.zip` (vollständige V914-ZIP mit unverändertem V910-Bridge-Protokoll).
- Umgesetzt: V915-Gruppenmodell, validierte private IPv4-Gruppenmitglieder, exklusive IP-Zuordnung, Synchron-/Individualmodus, Gruppendimmer, rein lokale Vorschau, manuelle Aktionen mit Priorität vor Musikautomatik, Entwurf/Speichern/Verwerfen, tokenfreier JSON-Export/-Import, React-Panel- und Musik-Sync-Integration, Touchscreen-CSS, Dokumentation, CI und Testskripte.
- **PASS** `npm run test:v915`: 21 Testgruppen inklusive 3.000 genre-/phasenbezogener Lichtkombinationen.
- **PASS** `npm run test:v915:types`: strenge TypeScript-Kernmodule.
- **PASS** `npm run verify:v915:focused`: enthält alle V909–V915-Regressionen (einschließlich isolierter Kern-Typechecks), V908 (966), V907 (1.096), Syntax (1.337 TS/TSX-Dateien) und Architektur.
- **NICHT BESTANDEN / NICHT FREIGEGEBEN** `npm run typecheck`: externe React-, Next.js- und Node-Typdefinitionen fehlen in der Testumgebung, entsprechend schlägt der Gesamt-Typecheck mit `Cannot find module` fehl. Die UI-Komponenten wurden syntaktisch geprüft, aber kein vollständiger UI-Typecheck mit realen Abhängigkeiten durchgeführt.
- **NICHT VERIFIZIERT** `npm run build`: kein lokaler Produktionsbuild; dafür ist erst `npm ci` mit vollständig verfügbaren Abhängigkeiten nötig. Der CI-Workflow enthält weiterhin den vollen Build samt Prüfungen.
- **NICHT VERIFIZIERT** echte Raspberry-Pi- und Govee-Hardware (H6063, H610B, H61A2, H6051). LAN-UDP reagiert nicht garantiert auf Paketkommandos; V910-Bridge bleibt unverändert.
- Die historische Paketversionsangabe `0.1.0-v908` wird wegen alter fest kodierter Regressionen beibehalten. Die neue Funktion trägt den Stand **V915**.
