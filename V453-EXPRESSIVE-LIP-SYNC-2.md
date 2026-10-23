# Sonic Display V453 – Expressive Lip-Sync 2.0

V453 erweitert die bestehende synchronisierte V368–V423-Vocal-Regie um **dezente visuelle** Mund-, Augenbrauen- und Kopfaccentuierung. Für den Anwender sind keine zusätzlichen Einstellungen, KI-Modelle, Audio-Dateien, API-Schlüssel oder Hintergrunddienste erforderlich.

## Funktion

- Die neue reine Funktion `enhanceExpressiveLipV453` arbeitet ausschließlich bei **aktiven, tatsächlich vorhandenen Wort-Zeitmarken**, nicht bei bloßen Zeilen-Timings. Sie validiert die Zeichenfolge des laufenden Worts und berücksichtigt die bekannten Wortgrenzen. Kein erdachtes Silben-/Phonem-Timing und keine Künstleridentifikation.
- Bei schnellen Rap-Wörtern steigen nur die *Interpolationsgeschwindigkeiten* für Mund und Lippen sanft; längere Gesangswörter behalten ruhigere Übergänge. Der zusätzliche Kiefer-Impuls ist bewusst klein, mit maximal 0,065 und unveränderter bilabialer Lippenverschluss-Priorität.
- Sehr kleine Wangen-/Brauen-Akzente und bis 0,015 rad Kopfneigung ergänzen die vorhandene V406-Rap-Expression. Kopfakzente entfallen bei vom Nutzer festgelegten Body-/GLB-Motions.
- Der prozedurale `ThreeAvatar` und der animierte GLB-`VocalRigV368` verwenden denselben reinen Planer. Die bestehenden Morph-Target-Overlays schreiben niemals direkt in die Basisanimation und geben vorherige Overlay-Anteile wieder frei.
- V385-manually excluded singer slots bleiben ruhig. Vorhandene V420-Wort-Keyframes und rechtmäßig bereitgestellte lokale V423-Audio-Munddaten haben **Vorrang vor automatischen V453-Mund-Anpassungen**.
- Pause, ausgeschalteter Lip-Sync, Reduced Motion, fehlende/schlecht passende Lyrics oder ungültige Wiedergabezeit liefern **keinen** neuen V453-Accent. GLB-Gesichts-Interpolation verwirft beim Songwechsel, bei Rücksprüngen oder großen Zeitsprüngen den vorherigen Interpolationszustand.
- V453 ändert keine gespeicherten Einstellungen, Tracks, Lyrics-Zeitstempel, Künstlerrollen, GLB-Animationsdateien oder Kamera-Keyframes.

## Dateien

- `components/visualizer/expressiveLipSyncV453.ts`: deterministischer Planer und additives Head-Overlay.
- `components/visualizer/VocalRigV368.tsx`: GLB-Rig-Anwendung mit adaptiver Attack/Release-Zeit und Seek-Reset.
- `components/visualizer/ThreeAvatar.tsx`: prozedurales Gesicht und bestehendes GLB-Kopf-Overlay.
- `tests/v453-expressive-lip-sync-regression.cjs`, `tests/tsconfig.v453-core.json`: funktionale und streng typisierte Kernprüfungen.

**Grenzen:** Ohne extrahierbare Tonspur oder ein passendes Modell können Lippenbewegungen nur aus Lyrics und freiwillig bereitgestellten V423-Daten *visuell geschätzt* werden. Rap-Doubles, Adlibs, reale Phonemzeitpunkte und der tatsächliche Sänger sind aus diesen Daten nicht bestimmbar.

## Prüfen

```powershell
npm install
npm run verify:v453
npm run typecheck
npm run build
```

Siehe `V453-VERIFICATION.md` für die tatsächlich ausgeführten Prüfungen.
