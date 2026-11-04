# V268 – Smart Performance Profile Sync & Backup

Übernahme aus V267 mit JSON-Export und validiertem Import. Die Sicherung enthält `format`, `version`, `exportedAt` und `profiles`. Maximal 256 KB und 30 Profile; ungültige Werte, unbekannte Versionen und doppelte IDs werden abgewiesen. Import-Vorschau bietet Auswahl je Profil; ID-Konflikte behalten standardmäßig den vorhandenen Datensatz, können ausdrücklich ersetzt werden. Profile anderer Geräte werden ebenfalls lokal gespeichert, aber nicht automatisch angewendet. Import verändert nur die Profilverwaltung und keine Live-Performance-Konfiguration. Speichern erfolgt weiterhin über localStorage; der Browser synchronisiert nicht mit anderen Geräten. Bei mehr als 30 Einträgen bleiben die 30 zuletzt eingefügten erhalten.

Tests: `npm run test:v268`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
