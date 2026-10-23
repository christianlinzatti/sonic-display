# V245 – Central Genre Registry & Build Fix

- Genre-Definitionen und Avatar-Farben liegen in `config/musicGenres.ts`.
- `MusicGenre` wird aus den Registry-Keys abgeleitet; `GENRES` ebenfalls. Bestehende Importe aus `types/animation.ts` funktionieren weiter.
- `GenreAvatar.tsx` nutzt die Registry und enthält keine duplizierte Farbtabelle.
- Die Benchmark-React-Komponente heißt jetzt `PerformanceBenchmarkPanel.tsx`; ihre Exportfunktion bleibt `PerformanceBenchmark`.
- `performanceBenchmarkMetrics.ts` enthält weiterhin die Berechnungsfunktionen.
- Für ein weiteres Genre einen Registry-Eintrag mit `label`, `a`, `b`, `accent`, `avatarLabel` hinzufügen. Andere genreabhängige Module mit bewusst expliziten Listen können weiterhin Anpassungen benötigen.
- Unter Windows beim Aktualisieren alte Dateien entfernen / frisches Verzeichnis verwenden, damit vorherige, nur in Großschreibung unterschiedliche Dateinamen nicht liegen bleiben.
- Build lokal: `npm install && npm run build`. Ohne installierte Abhängigkeiten nicht vollständig verifizierbar.
