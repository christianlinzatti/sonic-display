# V266 – Smart Performance Experiment Manager

Auf V265 aufgebaut. Abgeschlossene Optimierungsversuche mit sechs Vorher- und sechs Nachher-Messungen werden lokal im Browser als maximal 20 Einträge gespeichert. Die Übersicht zeigt Konfigurationen, FPS- und Framezeit-Vergleiche und markiert die nach heuristischem Score beste Messung. Die beste Messung ist nicht zwingend die beste Konfiguration für andere Musik oder Szenen. Die Konfiguration eines beliebigen Versuchs kann in einer Vorschau ausdrücklich übernommen und anschließend rückgängig gemacht werden. Es ändern sich nur Renderqualitätsmodus und Multi-Avatar-Director-Aktivierung. Löschen entfernt Einträge lokal. Browser-Speicher kann blockiert oder gelöscht werden; kein Server-Upload. Ohne gültige Baseline wird kein Versuch erfasst.

Prüfen: `npm run test:v266 && npm run check:syntax` sowie lokal `npm install && npm run typecheck && npm run build`.
