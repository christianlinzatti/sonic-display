# Sonic Display V785 – Verifikation (31.10.2026)

## Durchgeführte Prüfungen

- `npm run test:v785` – PASS: 3D-Lyrics-Grenzen, sechs Anker, Hysterese bei sicheren Ankern, ungültige Frames, Clip- und Proxy-Kollisionserkennung, Zeilenverzögerung und Vergleichsgrenzen; Offline-CLI und Pipeline.
- `npm run test:v785:types` – PASS: isolierte strikte TypeScript-Prüfung von `lyricsProtectionV785.ts` und `lyricsReviewV785.ts`.
- Regressionen `npm run test:v760` bis `npm run test:v784` (vorhandene Versionsskripte) – PASS.
- Vorhandene isolierte `test:v760:types` bis `test:v784:types` – PASS.
- `npm run check:syntax` – PASS, 1.123 TS-/TSX-Dateien.
- `npm run check:architecture` – PASS, Architekturstand 0.1.0-v785.
- `npm run test:module-case` – PASS, keine Windows-/Linux-Dateinamenkollisionen.
- `npm run check:lockfile:v752` – PASS, 18 direkte Pakete im Lockfile.
- Fehlerfall `npm run benchmark:v785:lyrics -- --url=http://127.0.0.1:39999` – korrekt `blocked`, 0 Szenenzeilen, Exit-Code 2, keine behaupteten FPS-Werte.

## Nicht verifiziert

- Der volle Projekt-Typecheck (`npm run typecheck`) wurde angestoßen und endet mit Fehlern wie `Cannot find module 'next/server'` und fehlenden Node-/React-Typen: die 18 direkten npm-Abhängigkeiten sind hier nicht installiert.
- Der **Next.js-Produktionsbuild** ist nicht verifiziert und wird nicht als bestanden gemeldet.
- **Echte Browser-WebGL-Messungen** von FPS/Clipping/Avatarüberlagerungen stehen aus. Die Tests sind Funktionstests der Messlogik, keine behaupteten optischen Qualitätsgewinne.
- Die vier echten GLB-/GPU-Durchläufe sind auf einem Rechner mit installiertem `npm ci`, laufendem Next.js-Server und Chromium durchzuführen.
- V785 ist ausschließlich im lokalen GLB-Diagnosemodus aktiv; die produktive Spotify-Lyrics-/Konzertkamera bleibt unverändert.

Siehe `V785-LYRICS-PERFORMANCE-PROTECTION.md` für Bedienung und Berichtformate.
