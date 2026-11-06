# V1013 – Production Build Stabilization

- Der vollständige V965-Workflow führt nun auch V1010, V1011, V1012 und V1013 als verpflichtende parallele Regressionen im V931-Gate aus. Ein Fehler verhindert unverändert die Produktionsfreigabe.
- Vor dem Paketdownload wird versionsneutrale V1013-Prüfung durchgeführt: package.json, package-lock.json, Feature-/Roadmap-Version, Node 24, Prebuild-Einstieg sowie GitHub-/Vercel-Tests. Ohne externe Bibliotheken.
- Historische V1012-Regressionsprüfung von festem `v1012` auf versionsneutrale Prüfung (`>=1012`) umgestellt, damit der Folgerelease nicht fehlschlägt.
- Änderungen an zukünftigen Versionen mit veralteter `sonicFeatureRelease`, unvollständigem Lockfile oder fehlender Windows-Matrix werden erkannt. Negative Fixture-Tests beweisen die Fehlersperre.
- Die echten Node-24-Tests in CI (TypeScript, Next.js, Playwright) bleiben verpflichtend; kein Mock und keine Testdeklaration kann sie ersetzen.
- Die bestehenden V1012-Wiederherstellungsregeln und Benutzeraktions-Prioritäten bleiben unverändert.
- Das ZIP enthält keine `node_modules`, `.next`, Secrets oder `releases`. Die GitHub-ZIP-Importlogik schützt `.github/**` und synchronisiert diesen Pfad nicht; V1013 benötigt für die verbesserte Hauptprüfung **keine** Workflow-Dateiänderung.

## Status

Lokale Tests, Quellcode-Syntax, Release-Metadaten, Netzwerk-Regressionen und Lockfile-Konsistenz werden geprüft. Vollständiger TypeScript-/Next.js-/Playwright-Produktionsbuild muss mit installierten Abhängigkeiten unter Node 24 durch GitHub Actions bestätigt werden.
