# V659 – Unlimited Motion Playback

## Umsetzung

- Entfernt die Renderer-Begrenzung auf die letzten 24 installierten Motion-GLBs. Alle vorhandenen Einträge bleiben für automatische Auswahl und geplante Choreografien sichtbar.
- Decodiert/retargetiert externe Motion-GLBs **bedarfsgerecht** (nicht den gesamten Katalog auf einmal). Die Arbeitsmenge ist durch das bestehende Motion-Prefetch-/Memory-Profil begrenzt, maximal zwölf Ziel-Assets im V659-Plan.
- Gewählte Motion, noch laufende Action und vorausgeplante Cues werden priorisiert, unbenutzte Cache-Einträge verdrängt. Bis der Ersatz geladen ist, spielt die bisherige Motion weiter.
- Rap-Live-Presets mit `installed:ID` werden an ihrer Zeitposition priorisiert, inklusive Duett-Crossfade mit zwei Clips.
- Asynchrone Ladeergebnisse gelten nur für die aktuelle Avatar-/Retargeting-Generation. Bei einem durch einen Planwechsel abgebrochenen In-flight-Load wird neu geplant.
- Die bisherigen V212-/V213-Prefetch- und Memory-Profile werden weiterverwendet. Keine neuen Render-Loops oder globalen 3D-Loader-Caches.

## Abgrenzung

„Unlimited“ bezieht sich auf die frühere **24er-Auswahlbegrenzung im Renderer**. Die 250-Einträge-Grenze der Motion-Metadatenbibliothek und ihrer Vorschau ist ebenfalls entfernt. Der optionale „alle Clips einer GLB importieren“-Workflow bleibt weiterhin auf 64 Clips pro Datei begrenzt; Browser-Speicher und verfügbare Hardware bleiben begrenzende Faktoren. Bei defekten GLBs wird die bisherige Animation erhalten, ein Retry ist nach erneuter Bibliotheksaktualisierung möglich. Echte 3D-GLB-Integration, Performance-GPU-Messung und Next.js-Produktionsbuild benötigen eine Umgebung mit installierten Abhängigkeiten.

## Tests

`npm run test:v659` prüft 620 gespeicherte Metadateneinträge und die Auswahl alter, mittlerer und neuer Einträge in 250 Motion-Assets, 100 aufeinanderfolgende Cachewechsel, Duplikatvermeidung, begrenzte Pinning-Menge und Quellcode-Verdrahtung. `npm run test:v659:types` prüft das Planungsmodul isoliert. Smoke: `npm run test:smoke:v659`.
