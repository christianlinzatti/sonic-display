# Sonic Display V509 – Prüfbericht

Stand: 24.10.2026. Release-Basis: vollständiges Sonic Display V508 ZIP, erweitert zu V509.

## Erfolgreich ausgeführt

- `npm run test:v509`: **PASS** mit 36.000 deterministischen Drei-/Vierer-Frames. Geprüft: musikalisch verzögerte Ensemble-Phrasen, Verse/Hook/Drop, manuell gesetzte Bühne und Motion-Priorität, validierte Track-Zuordnung beim Duo, gemeinsame Duett-Hooks, Low-Tier und Reduced Motion, unplausible Eingaben, V506-/V508-Hazard-Softening, kein Root-Travel bei Duetten, und Fußkontakt-Gates einschließlich nicht unterstützter/fehlender V494-Reports und hoher Drift. Quellcode-Verkabelung beider Bühnenvarianten ebenfalls kontrolliert.
- **59/59 historische Versionsregressionen** erfolgreich: `test:v451` bis `test:v509`, keine übersprungenen Versionen; Protokoll außerhalb des ZIPs: `/mnt/data/sonic-v509-regressions.log`.
- **17/17 isolierte TypeScript-Kernprüfungen** erfolgreich: `test:v493:types` bis `test:v509:types`, keine übersprungenen Versionen.
- `test:three-avatar-split` und `test:gltf-hook-split`: **PASS** (bestehende GLB-Mixer-, IK- und Hook-Modulgrenzen bleiben intakt).
- `check:syntax`: **PASS**, 706 TS-/TSX-Quelldateien.
- `check:architecture`: **PASS**, 180 aktuelle referenzierte Codepfade, zehn Abschnitte und referenzierte Dokumente.
- Release-ZIP wird zusätzlich per Python-ZipFile-CRC und kritischen Dateipfaden validiert.

## Verhalten und Prioritäten

Der neue V509-Planer erzeugt ausschließlich kleine Phrasenbewegungen im **bestehenden** `useFrame`-Pfad; er kennt keine echte Sänger- oder Rap-Phonemerkennung. Die automatisch bestimmten Rollen bei 3/4 Avataren sind visuelle V495-Rollen, keine zugewiesenen Gesangsstimmen. Automatische Gruppen dürfen nur Z-Bewegung mit freigegebenem V494-Kontaktbericht ergänzen; Duette erhalten niemals zusätzliche V509-Root-Bewegung. V506/V508-Kollisionsrisiko kann die Ergänzungen zurücknehmen. Alle importierten GLB-Motions, Lippen-, Handkontakt- und Fußkontakt-IK sowie manuelle Formationen behalten Vorrang.

## Nicht vollständig verifiziert

- Kein vollständiger Next.js-/Webpack-/React-Produktionsbuild: Die Anwendungs-Abhängigkeiten (`node_modules`) sind in dieser isolierten Laufzeit nicht installiert. Die isolierten TypeScript-Prüfungen ersetzen nicht `npm run typecheck` oder `next build`.
- Keine interaktive Prüfung mit echten, animierten GLB-Modellen auf einer GPU oder einem Raspberry Pi. Kapsel-/Abstandssicherheit ist approximativ, keine harte Mesh-Kollisionsgarantie.

## Lokale Abnahme

```powershell
npm install
npm run build
```

Anschließend die 2er-Duette (einschließlich gemeinsamer Hook), automatische Dreier-/Vierergruppen, Wechsel Verse/Hook/Drop, verschiedene Körpergrößen, manuellen Override, schnell gespielte Deutschrap-Vocals, Reduced Motion und Pi-Low-Tier direkt am Bildschirm testen.
