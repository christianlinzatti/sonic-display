# V525 – Verification (24.10.2026)

- **Basis**: veröffentlichtes vollständiges V524-ZIP (`sonic-display-v524-natural-full-body-dance-3.zip`). Alle 1.936 Originalpfade bleiben erhalten.
- **V525-Kerntest**: 30.000 deterministische, genreübergreifende Lyrics-Pläne, inklusive verifizierter und fehlender Wort-Timestamps, Pause, Reduced Motion, Vier-Avatar-Lesbarkeit, unverändertem Wortfortschritt und DOM-/3D-Integration: **PASS**.
- **Versionsregressionen**: V451–V525: **75/75 PASS** (in zwei Blöcken 49/49 und 26/26).
- **Isolierte TS-Kernprüfungen**: V492–V525: **34/34 PASS** (17/17 und 17/17).
- **GLB-Tests**: `test:gltf-hook-split`, `test:three-avatar-split`: **2/2 PASS**.
- **Source syntax/import bindings**: 735 TS/TSX-Dateien: **PASS**.
- **Architektur**: 229 Quellcodeverweise + Dokumentation: **PASS**.
- **V501-Kompatibilität**: alter String-Lookup des direkten `max3DWidth`-Zugriffs auf die unveränderte V501-Breitenquelle im neuen V525-Planer umgestellt, V501-Test besteht.
- **Full Next.js build und browserweiter TS-Typcheck**: **NICHT AUSGEFÜHRT** (keine installierten Projektnode_modules/Next.js). Lokal `npm install && npm run build` ausführen.
- **Echter 10-Zoll-Pi-Test mit GLB**: **NICHT AUSGEFÜHRT**. CSS-Bühnenränder sind heuristisch, keine exakte Gesicht-/Avatar-Okklusionsanalyse.
- **Keine** neuen Render-Loops, Timestamps, Sängerklassifizierungen, Importclip-Edits, Fuß-IK- oder Vocal-Lip-Sync-Manipulationen.
