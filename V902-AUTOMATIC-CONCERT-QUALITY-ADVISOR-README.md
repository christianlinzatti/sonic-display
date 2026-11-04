# V902 – Automatic Concert Quality Advisor

V902 nutzt das bereits vorhandene **V901-Live-Dashboard** als einzige Datenquelle. Es macht ausschließlich nachvollziehbare Vorschläge und ändert nichts automatisch.

## Neue Bedienung

Im LIVE-FX-Deck unter **V901 Concert Quality Intelligence** befindet sich **V902 Automatic Concert Quality Advisor**.

1. Die V901-Analyse liefert eine Warnung während einer bestätigten, laufenden V900-Songszene.
2. Das Panel bietet für erlaubte Auto-Einstellungen einen konkreten Vorschlag mit **Ist-Wert, Vorschlagswert, Begründung und erwarteter Wirkung**.
3. **Vorschau anzeigen** öffnet einen Vergleich. Erst **Diese Änderung bestätigen** überträgt den einzelnen Vorschlag. **Abbrechen** verändert nichts.
4. Ändert sich inzwischen die Szene, die konkrete Einstellung oder verschwindet die zugrunde liegende Warnung, wird die Vorschau **ungültig**; sie muss erneut gewählt werden.
5. Ein JSON-Export dokumentiert Vorschläge **ohne** sie zu übernehmen.

## Konkrete Bereiche

- **FPS/FX-Druck**: Nur bei gültigen, tatsächlich gemessenen V826-Rendererwerten und Warnungen können **bereits eingeschaltete** Partikel-, Laser- und Spotlight-Intensitäten abgesenkt werden. Keine Effektaktivierung und kein garantierter FPS-Gewinn.
- **Kamera**: Bei gemessenen Framezeitspitzen kann die automatische Bewegungsintensität reduziert werden – zur Bildberuhigung, **nicht** als behauptete technische FPS-Reparatur.
- **Lyrics**: Bei passenden V901-Konfigurationswarnungen können V900- oder V897-Lyrics-Schutzoptionen ausdrücklich aktiviert werden.
- **Tanz**: Der bereits vorhandene V899-Fußkontaktschutz kann nach Bestätigung aktiviert werden. Es werden weder Clips, Animationen, V325-Timelines noch Fußsperren bearbeitet.
- **LED-Wall**: V901 bewertet ihre geplante Regie und zeigt Warnungen. V902 überschreibt **keine** frei gestalteten LED-Presets oder manuellen Timelines.

## Schutz & Grenzen

- Nur bestätigte V604/V900-Szene; Pause, reduzierte Bewegung, fehlende Daten und deaktivierte Regie verhindern Änderungsvorschläge.
- Vorschläge werden vor der Übernahme frisch validiert; die React-State-Setter prüfen zusätzlich den bisherigen Wert.
- Ein deaktivierter Effekt bleibt deaktiviert; bereits vorhandene Blackout-, Autorenschafts-, Lyrics-, Kamera- und Leistungsprüfungen bleiben zuständig.
- Keine neue 3D-Ressource, keine zusätzlichen Telemetrie-Polls, kein Server-/KI-Zugriff und keine verdeckten Setting-Writes.
- Keine optische Analyse der Show und keine behauptete Validierung einer sichtbaren FPS-Verbesserung. **Jede Empfehlung im echten Browser nachtesten.**

## Tests

`npm run test:v902`, `npm run test:v902:types`, `npm run test:v902:ui-types`, `npm run verify:v902:focused`. Der vollständige `npm ci`, `npm run typecheck`, `npm run build` und WebGL-Test sind separat nachzuholen; siehe `V902-VERIFICATION.md`.
