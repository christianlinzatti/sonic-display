# V657 – Complete Portable Backup (28. Oktober 2026)

## Ziel und Umsetzung

Gerätewechsel mit exportierbaren, eigenen GLB- und Motion-Dateien statt nur mit referenzierten JSON-Werten. Die neue Oberfläche liegt in Einstellungen → Display (`components/PortableBackupV657.tsx`). Die bisherigen V184–V186-Einstellungs- und Diagnosesicherungen bleiben unverändert verfügbar.

- **Export**: Nur Administratoren dürfen serververwaltete Assets und gefilterte Avatar-Metadaten auflisten. Ein natives TAR-Archiv enthält `manifest.json` als ersten Eintrag, die von V184 erlaubten Browser-Keys (einschließlich V190 Motion Library, V492 Blend-Presets, V290 Kamera und V354 Timeline), erlaubte Modell-Metadaten und eigenständige GLB-/Vorschaudateien. Prüfsummen werden pro Asset errechnet. Keine Erweiterung der Storage-Key-Allowlist um Spotify-Tokens.
- **Vorschau**: Liest Header und geprüfte Prüfsummen aller enthaltenen Dateien; keine Installation während der Vorschau. Zeigt Dateianzahl, Einstellungsanzahl und nicht auflösbare Referenzen an.
- **Import**: Admin- und Origin-Schutz für Dateiinstallationen. Assets unter **neuen** Namen installieren, URLs und `local:`-Modellreferenzen in JSON-Settings und Avatar-Metadaten remappen. Keine automatischen Überschreibungen bestehender Browser-Settings. Default-Avatar-Zuordnungen separat opt-in. Bei Fehlern bleibt ein Teil der zuvor installierten Dateien eventuell erhalten.
- **Sicherheit**: TAR-Headerchecksum, Grenzen für Einträge/Gesamtgröße, erlaubte Dateinamen und relative Pfade, Datei-SHA-256. Kein willkürlicher Download-Proxy für fremde Hosts, sondern nur vorher gelistete verwaltete Medien. SHA-256 ist keine Signatur: Nur vertrauenswürdige Archive importieren.

## Limits und bewusste Einschränkungen

- 150 Dateien, maximal 100 MiB pro Einzeldatei, maximal 650 MiB binäre Nutzdaten. Browser müssen beim Prüfen einzelner Dateien diese einmal vollständig einlesen, was gerade auf schwacher Hardware Speicher benötigt.
- Der lokale Entwicklungsimport ist auf 35 MiB pro GLB beziehungsweise 5 MiB pro Vorschaugrafik begrenzt; bei Vercel Blob gelten die Upload-Limits der vorhandenen Anwendung.
- Standalone GLB-Dateien sind übertragbar; glTF mit externer `.bin`-/Texturstruktur und FBX-Quelldateien sind **nicht** Teil dieser automatischen Migration.
- Nicht verwaltete externe Bild-/Motion-URLs sowie abgelaufene temporäre `blob:`-URLs sind als nicht automatisch übertragbar gekennzeichnet. Lokal oder serverseitig außerhalb der bekannten Medienordner gespeicherte Dateien müssen separat übertragen werden.
- Keine atomare Rollback-Garantie für einen mehrstufigen Upload. Metadaten und Browser-Einstellungen werden erst **nach** den Dateiinstallationen geschrieben. Die URL-Migration ersetzt nur bekannte exakte URLs/IDs; URLs innerhalb von Freitexten oder anderen Datenbanken werden nicht stillschweigend umgeschrieben.
- Für V657 ist ohne echten Test mit Vercel Blob, Windows, Linux und komplexen GLB-Assets keine produktive Funktionsfreigabe zu behaupten.

## Testbefehle

`npm run test:v657`, `npm run test:v657:types`, `npm run test:smoke:v657`, `npm run check:release`, `npm run build`.

Die vollständige Projekt-Typprüfung und Next.js-Produktionserstellung erfordern installierte npm-Abhängigkeiten und bleiben die finale Freigabebedingung.

## Verifikation dieser Auslieferung

- V657 TAR-/SHA-256-/Pfad-/Remapping-Regressionen, aktueller Smoke-Test bis zu V616, Syntax- und Architekturprüfungen bestanden.
- Vollständiger TypeScript-Projektcheck wurde versucht, konnte ohne installierte Next.js-, React- und Node-Typ-Abhängigkeiten nicht bestanden werden (TS2307). Der Next.js-Produktionsbuild wurde deshalb nicht als grün gewertet.
- Echte End-to-End-Tests mit Vercel Blob, Browser-Speicher und GLB-Dateien auf Windows/Linux stehen aus. Die V657-Änderungen sind bereit für CI, nicht als produktiv freigegeben.
