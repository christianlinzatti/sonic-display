# V795 – Prüfbericht

Datum: 31.10.2026. Grundlage: vollständiges Sonic Display V794-ZIP.

## Erfolgreich ausgeführt

- `npm run test:v795`: echte deterministische Szenenausgaben für Verse, Build, Hook, Haupt-Drop, Break und Finale; Grenzen und Laufzeit-IDs; Genre-unabhängige sichere Geometriemaße; Bounds der Positionen; Seek/Replays; Pausen; Reduced Motion; Low-Tier; Lyrics, Sängerfokus und 4-Avatar-Dämpfung; explizite Komponentenverkabelung.
- `npm run test:v795:types`: strenger isolierter TypeScript-Test der neuen reinen V795-Logik.
- Regressionen `test:v794`, `test:v793`, `test:v792`, `test:v791`, `test:v790` und ihre isolierten TypeScript-Tests; `test:v789` und `test:v788`.
- Bühnen-/Schutztests `test:v622`, `test:v635`, `test:v647`, `test:v690`, `test:v691`, `test:v670`, `test:v785`, `test:v787`.
- `check:syntax`, `check:architecture`, `test:module-case`, `check:lockfile:v752`.
- Eine alte V690-Quelltext-Regressionsprüfung wurde ausschließlich an die Erweiterung des bisherigen V690-Morph-Wertes angepasst. Der ursprüngliche V690-Wert muss nach wie vor vorkommen; die V690-Funktionstests sind weiterhin bestanden.

## Offen / Einschränkungen

- Das Projekt hat in dieser Umgebung kein `node_modules`. Schon in V794 war eine offline-Installation wegen eines nicht gecachten Pakets gescheitert. Vollständiges `npm run typecheck` und `npm run build` konnten hier daher **nicht erfolgreich ausgeführt und bestätigt** werden.
- Kein Browser-WebGL-Test mit echten Avataren und gemessenen FPS, kein Test auf einem Raspberry Pi / 10-Zoll-Gerät.
- V795 bewegt nur vorhandene Portale und verändert die vorhandene LED-/Farbkulisse, **keine kompletten Stage-Mesh- oder Szenen-Crossfades**. Licht-Cues, Szenen- und Sängerfokus werden durch bestehende Komponenten geregelt. Bei fehlenden verifizierten V790-Abschnitten ist V795 absichtlich deaktiviert.

## Lokale Freigabe vor Produktivbetrieb

```bash
npm ci
npm run test:v795
npm run test:v795:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

Für die visuelle Abnahme: Festival, Rock, Cyberpunk und Galaxy mit 1, 2 und 4 GLBs sowie ruhige/helle Passagen, Songwechsel, Seek, Pausen, Lyrics, saved light timelines und Blackouts testen.
