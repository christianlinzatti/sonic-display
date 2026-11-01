# V657 – Verification, 28.10.2026

Basis: Sonic Display V656. Portable Backup mit eigenständigen GLB-Dateien, verwalteten Motion-GLBs, Bildern, gefilterten Avatar-Metadaten, Kamera-/Show-Presets und bestehenden V184-Backup-Einstellungen.

## Erfolgreich

- `npm run test:v657`: TAR-Roundtrip, Asset-SHA-256, Metadaten-SHA-256, Größen-/Pfad-/Typprüfung, abgebrochene/unzulässige TAR-Enden, Referenz-Remapping.
- `npm run test:v657:types`: isoliertes Archivmodul.
- `npm run test:smoke:v657`: vollständige aktuelle Kette bis V616, Exit Code 0 (Log `/mnt/data/v657_smoke.log`).
- `npm run test:v656`: Lasttests und CI-Gate.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`: bestanden.

## Noch offen

- `npm run typecheck` wurde versucht; TS2307/fehlende Node-Typen, Next.js, React etc. wegen nicht installierter Projektabhängigkeiten. Kein vollständiger Typecheck bestätigt.
- `npm run build` bzw. Next.js-Produktionsbuild nicht bestätigt; GitHub Actions soll Windows und Ubuntu prüfen.
- Kein Browser-/Vercel-Blob-End-to-End-Test mit echten GLB-Dateien. Keine Garantie über die Speicherbelastung großer Archive.
- Externe, temporäre und nicht verwaltete Dateien müssen separat übertragen werden. Backup enthält keine Spotify-Tokens und ist keine atomare Transaktion.
