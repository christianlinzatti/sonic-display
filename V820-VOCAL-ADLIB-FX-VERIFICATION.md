# V820 – Vocal & Adlib FX Studio

Basis: V819 cinematic scene transition archive. Vollständiger aktualisierter Projektstand.

## Geliefert

- `vocalAdlibFxPlannerV820.ts` wertet ausschließlich gespeicherte, von V496 geprüfte Vocal-Segmente des aktuellen Songs und einen bestätigten V810-Konzertabschnitt aus.
- Unterschiedliche Seitenbühnen-Akzente für Lead und Feature; aktive Adlibs ergänzen den Hauptsänger, übernehmen aber nicht automatisch dessen Rolle.
- Die optionalen Adlib-Wörter verlangen zusätzlich eine explizit getaggte synchronisierte Lyrics-Zeile und eine passende echte Wort-Zeitmarke innerhalb des Adlib-Segments. Ohne verifizierte Daten kein Adlib-Text. Keine Stimmerkennung/Adlib-Vermutung.
- Drei leichte, tiefengeprüfte 3D-Flächen außerhalb der zentralen Sichtachse; eine wiederverwendete CanvasTexture, beim Unmount freigegeben. Keine neuen Kamera- oder Lichtquellen.
- FX-Studio: Hauptschalter, Lead, Feature, Adlibs, Worttext, Intensität, simulierte Preview, Performance/Balanced/Ultra. V810-Persistenz mit migrationssicheren Defaults.
- V810-Gates: Pausen, Blackout, manuelle Lichtregie, manuelle Kameraführung, Reduced Motion, niedrige Gerätequalität; keine Überdeckung der Performer/Lyrics.

## Prüfungen

- `npm run test:v820`: **PASS**, 18 Testgruppen (Timing, Rollen, Track-IDs, Textevidenz, Gating, Geometrie und Integration).
- `npm run test:v820:types`: **PASS**, isolierte strikte TypeScript-Prüfung des reinen Planners.
- `npm run check:syntax`: **PASS**, 1181 TS/TSX-Quelldateien.
- `npm run check:architecture`: **PASS**, Architekturreferenzen und Versionsstand.
- `node tests/v800...v819`: **PASS**, 20 historische Versions-Regressionstests, alte Tests V800–V808 nur um Versionswert 820 erweitert.
- **Offen:** vollständiger `npm run typecheck` erreichte innerhalb des Prüfzeitlimits keine Abschlussmeldung. 
- **Offen:** `npm run build` erreicht wegen der extrem langen `check:fast`-Vorkette nicht den Next.js-Build; im aktuellen Arbeitsverzeichnis sind keine produktiven npm-Abhängigkeiten installiert.
- **Offen:** echter Browser-/WebGL-Durchlauf, mehrere reale GLB-Avatare und GPU-Leistungsmessung.

Dieses ZIP ist eine getestete Entwicklungsintegration, **keine produktive Freigabe**.

## Lokale Freigabe auf einem Rechner mit allen Abhängigkeiten

```powershell
npm ci
npm run test:v820
npm run test:v820:types
npm run typecheck
npm run build
```

Abnahme: echte Vocal-Timeline mit Verse/Feature/Adlib und zeitmarkierten Lyrics prüfen; Kameraschnitt, Mundbewegung, Lyrics-Lesbarkeit und Framerate über gesamten Song kontrollieren. Neu eingeführte Optionen werden auch bei älteren Einstellungen auf sichere Defaults gesetzt.
