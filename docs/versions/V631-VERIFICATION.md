# V631 – Verifikation (27.10.2026)

## Ausgeführt und bestanden

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v631` | PASS: 50 Regressionstest-Gruppen + 12.000 deterministische synchrone Mundraten-Samples |
| `npm run test:v631:types` | PASS: isolierte TypeScript-Kernprüfung |
| `npm run test:smoke:v631` | PASS: gesamte V630→V616-Kette, Check Source Syntax und Architektur |
| `npm run verify:v631` | PASS: Smoke und V617, V612, V597, V546, V572, V581, V562, V523, V561 |
| `npm run check:syntax` | PASS: 855 TS-/TSX-Dateien (aus Smoke) |
| `npm run check:architecture` | PASS: 514 Architektur-/Source-Referenzen; 10 Kapitel (aus Smoke) |
| `npx tsc --noEmit` | Nicht ausgeführt: vollständige Projektabhängigkeiten fehlen im Release-Arbeitsverzeichnis |
| `npm run build` | Nicht ausgeführt: Next.js/node_modules nicht installiert |
| Echte visuelle Konzertprüfung | Noch offen – hier keine echten GLB-/Browser-Aufnahmen oder Audio-Lippenmessungen |

## Prioritäten, Garantien und Regressionen

1. Die V631-Policy ändert ausschließlich die Geschwindigkeit vorhandener Kiefer- und Mundform-Ziele, nie deren Ton-/Phonem-Zuordnung.
2. Ausschließlich synchronisierte und bestätigte Rap-Wortabschnitte mit autorisiertem Performer dürfen aktiv sein. Fehlende Zeiten, Wiedergabe im Stillstand, Seek-Lücken und unsynchronisierte Texte = neutral.
3. Manueller Gesichtseditor und manuelle Sängerrollen, Trackgebundene V420-Wort-/Silbenedits, V423-Audiomundspur, gesiegelte B/P/M-Onsets und nächste B/P/M-Anschlüsse behalten Vorrang.
4. GLB-Morph-Overlay sowie prozeduraler Mundpfad nutzen dieselbe V631-Funktion, ohne Morphs, AnimationMixer oder Shader anzulegen.
5. Ratenmultiplikatoren bleiben im Bereich 0,85–1,15, inaktiver Zustand exakt Faktor 1. Kein Einfluss auf Augen/Brauen/Grinsen/Blenden oder Fuß-IK.
6. Die bisherige V562-Mundkalibrierung und abschließende V384-Kontaktbegrenzung bleiben nach der V631-Ratenebene aktiv.
7. Eine ältere V572-Quellcodeprüfung wurde für den angehängten V631-Geschwindigkeitsfaktor aktualisiert; alle bisherigen V572-V617-Raten müssen weiterhin Teil der Formel bleiben. V572-Test besteht.

## Noch offen

- `npm install`, `npx tsc --noEmit`, `npm run build` auf Windows 11.
- Real-GLB-Test mit 1–4 Avataren, schnellen und langsamen Deutschrap-Passagen, manuellem Sängerwechsel und optischem Vorher/Nachher-Vergleich; Audio-/Wort-Offset separat prüfen. Ohne gemessene Vocals keine behauptete echte Phonemtreue.

```powershell
npm install
npm run test:smoke:v631
npm run verify:v631
npx tsc --noEmit
npm run build
```
