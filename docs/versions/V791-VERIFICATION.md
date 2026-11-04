# V791 – Prüfbericht (31.10.2026)

## Bestanden

- `test:v791` – Szenen-/Akt-Grenzen, identische Werte auf beiden Seiten, Song-/Zeit-/Seek-Validierung, Pause/Low/Reduced-Motion, manuelle Prioritäten und Lyrics-Schutz, 3D-Kamera-/Licht-Laufzeitverdrahtung.
- `test:v791:types` – isolierter strenger TypeScript-Check des V791-Moduls.
- `test:v790`, `test:v790:types`, `test:v789`, `test:v789:types`, `test:v788`, `test:v788:types`, `test:v787`, `test:v786`, `test:v785`, `test:v784`, `test:v761`, `test:v670`, `test:v671`, `test:v679`, `test:v681`, `test:v609` – vorhandene, relevante Regressionen.
- `check:syntax`, `check:architecture`, `test:module-case`, `check:lockfile:v752`.
- V609-Quelltextassertion wurde auf die bewahrte V609-Beschränkung plus V791-Minimum aktualisiert; keine Änderung an der V609-Laufzeitlogik.

## Eingeschränkt / noch offen

- Die Umgebung enthält keine vollständigen npm-/Next.js-/React-/Three-Abhängigkeiten. `npm ci --offline` schlägt wegen fehlendem lokal gecachten `zustand` fehl; Online-`npm ci` schlägt wegen DNS-Fehlern `EAI_AGAIN` fehl. Nach dem Installationsversuch wurden alle unvollständigen `node_modules`-Dateien entfernt.
- Der vollständige Projekt-Typecheck (`npm run typecheck`), der Next.js-Produktionsbuild (`npm run build`) und echte Browser-/WebGL-Tests sind hier **nicht** als erfolgreich verifiziert.
- Beim optionalen Lauf von `test:v610` scheitert eine ältere rein textuelle Prüfung an der inzwischen veränderten Spotlight-Formel. Die unveränderte V610-Prüfdatei bleibt erhalten; `test:v610` ist nicht Teil der V791-Release-Gates.

## Lokale Abnahme

```bash
npm ci
npm run typecheck
npm run build
```

Danach einen Track mit importierten V604-Abschnitten und mehrteiligen V761-Szenen live prüfen: Kamerawechsel innerhalb eines langen Verse sollen nahtloser wirken, Übergänge zu Hook/Drop weicher sein und manuelle Kamera-Cuts/Licht-/Lyrics-Cues unverändert funktionieren. In den Stage-Attributen `data-v791-edge`, `data-v791-kind` und `data-v791-scene` lässt sich die V791-Entscheidung sehen.
