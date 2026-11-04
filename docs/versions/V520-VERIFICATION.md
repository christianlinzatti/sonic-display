# Sonic Display V520 – Verifikationsbericht

**Ausgangsrelease:** `sonic-display-v519-adaptive-concert-performance-optimization.zip` (1.908 Dateien, ZIP-CRC gültig). **Version:** `0.1.0-v520`.

## Durchgeführt

- `npm run test:v520`: **PASS** – 45.000 deterministische Qualitäts- und A/B-Simulationsfälle, strikt expliziter Start, stabile Live-Referenz, Pi-/Auto-Qualitätsschutz, rücknehmbare Änderung, keine freigegebene Folgemessung bei vermischten Optionen.
- `npm run test:v519` und `npm run test:v518`: **PASS** – bisherige 40.000/35.000 Tests sowie bestehende Messbasis.
- Historische Versionstests **V451–V520: 70/70 PASS** (separat als Offline-Tests ausgeführt).
- Isolierte TypeScript-Kernprüfungen **V492–V520: 29/29 PASS** (nur die dort definierten isolierten Testkonfigurationen).
- `npm run test:gltf-hook-split` und `npm run test:three-avatar-split`: **PASS**, keine Änderungen an GLB-Modul-/Mixer-Aufteilung.
- `npm run check:syntax`: **PASS**, 728 TS-/TSX-Quelldateien.
- `npm run check:architecture`: **PASS**, 211 vorhandene Codeverweise und Dokumentationsstand V520.
- Archivintegrität, Dateidifferenz und Vollständigkeit gegenüber der **veröffentlichten** V519 werden beim Erstellen erneut geprüft.

## Nicht durchgeführt / bewusst begrenzt

- Ein vollständiger Next.js-/Webpack-Produktionsbuild war in dieser Laufzeitumgebung **nicht möglich**, da die npm-Projektabhängigkeiten nicht installiert sind. Isolierte TSC-Kernprüfungen ersetzen den vollständigen React-/Next-Typecheck nicht. Lokaler Test: `npm install && npm run build`.
- Kein echter Raspberry-Pi-GPU-/Temperatur-/Betriebssystemtest und kein visueller Browser-Test mit echten installierten GLB-Avataren. Die ausgewiesenen FPS-Differenzen stammen nur aus tatsächlich aufgenommenen V518-Renderfenstern, nicht aus dieser simulierten Suite.
- Das Experiment setzt nur den bestehenden Grafikmodus; die DPR ist eine direkte gekoppelte Folge. Die Sicherheitsprüfung gibt eine Nachmessung **nur** bei gültigen, aktuellen, sonst unveränderten Renderoptionen frei und liefert keinen Kausalbeweis. Die Rücknahme benötigt noch den vom Versuch gesetzten Modus sowie Pi-Profil `off` und überschreibt keine manuellen Fremdänderungen.
- Ein Experiment bleibt beim Verlassen der Ansicht aktiv, bis es zurückgenommen oder nachgemessen und akzeptiert wird. Sitzungsspeicher kann bei Privacy-Modus gelöscht werden; dann erfolgt keine automatische Rücknahme. Das UI macht diese Grenzen sichtbar.
