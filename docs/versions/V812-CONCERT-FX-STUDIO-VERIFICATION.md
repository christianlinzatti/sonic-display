# V810–V812 – Concert FX Studio 2.0

Basis: V809 (Original-ZIP).

## Implementiert

- V810: zentrale, validierte Effektsteuerung, Genre-Paletten, Farben, Intensität,
  Qualitätsprofile Performance / Balanced / Ultra, simulierte Vorschau im Einstellungsbereich.
- V811: Laser Matrix und Lichtbänder, eine neue GPU-Fläche hinter den Avataren.
- V812: Erweiterung des bestehenden LED-Wand-Shaders um Audio-Wellen, EQ-Balken,
  Frequenzringe und dezente Glitch-Geometrie.
- Sicherheit: geprüfte Songabschnitte, Pausen, Blackouts, gespeicherte Timelines,
  Reduced Motion, Low-Tier und Lyrics-/Porträtschutz haben Priorität.

## Teststand

- V810-812: neue Core-/Integrationsregressionen bestanden.
- V800–V809: bestehende Regressionen bestanden.
- Syntax, Importbindungen und Architekturcheck bestanden.
- Isolierte V810 TypeScript-Checks bestanden.
- **Nicht bestätigt:** vollständige TypeScript-Prüfung und echter Next.js-Build:
  Abhängigkeiten waren nicht installiert; npm-Registry nicht erreichbar, `npm ci`
  fehlgeschlagen. Browser-/GLB-/GPU-Tests ausstehend.

## Auf Entwicklungsrechner prüfen

```bash
npm ci
npm run test:concert-fx
npm run check:release
npm run typecheck
npm run build
```

**Noch offen:** V813–V829 samt Hardware-Benchmarks, Editors, Capture und Gesamtabnahme.
