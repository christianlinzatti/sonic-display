# V654 Resource Lifecycle Hotfix: Dateiimport, Spotify-Polling und Avatar-Skeletons

Build-Stand: `0.1.0-v654`, Hotfix ohne neue Produkt-Versionsnummer.

## 1. Import-Warteschlange und Blob-URLs

`components/CharacterMotionBatchInstaller.tsx` hält maximal 60 Import-Dateien. Bei jedem Import verwaltet `ownedBlobUrls` die Blob-URLs nur für die noch vorhandenen IDs; die Hilfsfunktion `retainImportQueueV654` liefert verdrängte Einträge explizit zurück. Deren URLs werden **sofort** per `URL.revokeObjectURL` freigegeben und aus der Besitzliste entfernt. Zusätzlich werden zugehörige Inspektions-, Clip-, Fingerprint- und Qualitätscache-Einträge gelöscht. Späte asynchrone Ergebnisse dürfen entfernte Dateien nicht wieder in Caches eintragen. Die vorhandene Unmount-Bereinigung bleibt erhalten.

Regression: 90 Dateien in drei Batches → 60 verbleiben; 30 Blob-URLs werden bei der Verdrängung freigegeben, statt bis zum Schließen des Dialogs zu verbleiben.

## 2. Spotify-Polling: nur eine Timerkette

`hooks/usePlaybackPolling.ts` benutzt eine stabile Effekt-Lebensdauer, einen ref-basierten Retry-Delay statt React-State-abhängiger Timer-Neustarts und Promise-Deduplizierung auch bei manueller Aktualisierung. `createSingleFlightPollingV654` verwaltet genau einen ausstehenden Timeout und genau eine laufende Polling-Kette. `visibilitychange` kann bei einer laufenden Anfrage keine weitere starten. Cleanup beendet die Kette und verhindert nachträgliche Timer. Eine Generation schützt React-State vor Ergebnissen einer vorherigen Mount-Instanz.

Regression: mehrere Tabwechsel während einer pending Spotify-Anfrage, Fehler-Backoff, manuelle Aktivierung und Cleanup.

## 3. SkeletonUtils-Klone und GPU-Ressourcen

In folgenden sechs Stellen werden die **jeweils geklonten** Skeletons beim Wechsel bzw. Unmount mit `Skeleton.dispose()` freigegeben:

- `GltfDancerAvatarV492.tsx` (Hauptbühne und LOD-Wechsel)
- `AvatarPreview3D.tsx` (inkl. `AnimationMixer.uncacheRoot()`)
- `AvatarSkeletonEditor.tsx`
- `MultiAvatarCameraCanvasV399.tsx`
- `MultiAvatarPreviewV326.tsx`
- `RapRealAvatarPreviewV409.tsx`

`disposeClonedAvatarSkeletonsV654` dedupliziert die Skeletons innerhalb eines Klons. **Wichtig:** Die aus `useGLTF()` gecachten Originale, Geometrien und gemeinsam genutzten Materialien/Texturen werden nicht freigegeben. Das würde andere Avatar-Instanzen beschädigen.

Regression: gemeinsames Skeleton in mehreren SkinnedMeshes wird nur einmal disposed. Ein echter GPU-Leak-Test benötigt Browser, WebGL-Renderer und reale GLB-Dateien (z. B. `renderer.info.memory.textures` vor/nach LOD-Zyklen).

## Testbefehle

```bash
npm run test:resource-lifecycle
npm run test:resource-lifecycle:types
npm run test:character-batch
npm run test:v529
npm run test:v532
npm run test:v533
npm run test:v534
npm run test:v535
npm run test:smoke:v654
npm run verify
```

`npm run test:resource-lifecycle` und der isolierte Typcheck sind in `test:smoke:v654` und `check:release` eingebunden.

## Prüfstatus in der Erstellungsumgebung

Die gezielten Ressourcen-, Import-, Motion-, Spotify-, Syntax- und Architekturtests und `test:smoke:v654` bestanden. **Der vollständige `tsc --noEmit` und der Next.js-Produktionsbuild wurden nicht bestanden/bestätigt:** In der Erstellungsumgebung fehlen npm-Abhängigkeiten wie Next.js, React und ihre Typdefinitionen. Daher anschließend in der regulären Arbeitsumgebung `npm install`, `npm run verify` ausführen und Windows/Linux-GitHub-Actions abwarten. Die tatsächliche GPU-Speicherentwicklung muss bei wiederholten Avatar-/LOD-Wechseln im Browser gemessen werden.
