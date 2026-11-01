# Sonic Display V833 – GPU Memory & Resource Cleanup 2.0

**Status: Implementierter und automatisiert regressionstesteter Integrationsstand – NICHT produktiv freigegeben.**
**Basis:** V832. **Datum:** 1. November 2026.

## Implementierte Änderungen

- `resourceCleanupV833.ts`: deduplizierte Freigabe von **privat gehaltenen** `dispose()`-Ressourcen; wiederholte `dispose()`-Aufrufe eines Scope sind sicher; isolierte Fehler stoppen andere Freigaben nicht. Beschränkte Zähler für Aufräumversuche, Erfolge und Fehler, ohne Objekt-/Fehlerreferenzen im Status zu speichern.
- `disposeDancePostProcessingV654.ts`: alle eigenen Render-Pässe und der Composer werden auch dann freigegeben, wenn ein anderer Pass eine Exception auslöst. Keine neuen Passes oder Render-Targets.
- `privateGltfLifecycleV769.ts`: private GLTF-Inspektionsassets werden höchstens einmal freigegeben; ein fehlerhaftes Dispose verhindert weitere Freigaben nicht. Das gilt auch für private Render-Targets. **Nie** auf gemeinsam genutzte `useGLTF`-Assets anwenden.
- `disposeClonedAvatarSkeletonsV654.ts` und `loadMotionAssetV734.ts`: Teilausfälle beim Abbau privater Skeleton-/Animations-Ressourcen stoppen weitere Freigaben nicht. Eigene Materialien und Geometrien bleiben vom shared GLTF-Cache getrennt.
- `previewGltfCacheV654.ts`: sichere, manuelle `trimInactive()`-Funktion; nur Cacheeinträge **ohne aktive Besitzer** werden entfernt. Fehler im Clear-Callback werden gezählt und stoppen die übrige Bereinigung nicht.
- `usePreviewGltfCacheV654.ts`, `PerformanceMemoryDashboardV770.tsx`: neue Diagnoseaktion zum Entfernen inaktiver Dekodier-Cacheeinträge, Zähler privat besessener Dispose-Operationen und ergänzter JSON-Export. Aktive Avatare bleiben unberührt.
- `package.json`, Lockfile, Architektur und neue V833-Tests ergänzt. Die bereits vorhandene GitHub-Actions-Prüfung von V832 bleibt erhalten.

**Wichtige Grenze:** `useGLTF.clear()` entfernt einen Cacheverweis. Es ist **kein** Nachweis, dass Grafikspeicher freigegeben wurde; die Drei-/Browser-/GPU-Lebensdauer ist komplexer. Die Bereinigung deaktiviert oder zerstört keine aktiv geteilten Geometrien/Materialien/Texturen. Die berichteten MiB sind Schätzwerte der Dekodierdaten – kein gemessener VRAM. Der Report stellt weder Leckfreiheit noch erfolgreiche GPU-Lasttests in Aussicht.

## Tatsächlich durchgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v833` – 34 Testgruppen | **Bestanden** |
| `npm run test:v833:types` | **Bestanden** |
| Historische `npm run test:v800` bis `npm run test:v832` – 33 Suiten | **Alle bestanden** |
| `tests/resilience-v654-regression.cjs` | **Bestanden** |
| `tests/resource-lifecycle-v654-regression.cjs` | **Bestanden** |
| `tests/v656-production-stability-regression.cjs` | **Bestanden** |
| `tests/v768-avatar-cache-budget-regression.cjs` | **Bestanden** |
| `tests/v769-private-gltf-lifecycle-regression.cjs` | **Bestanden** |
| Typprüfungen der bisherigen V654, V768 und V832-Module | **Bestanden** |
| `npm run check:syntax` | **Bestanden**, 2.394 TS-/TSX-Quellen |
| `npm run check:architecture` | **Bestanden**, 925 aktuelle Referenzen |
| Build Doctor: Lockfile, Node, Dateinamen, Prüfscripte | **Bestanden**; 0 Groß-/Kleinschreib-Kollisionen |
| Vollständiges `npm run typecheck` | **Nicht abgeschlossen**, nach 25 Sekunden Zeitlimit abgebrochen |
| Next.js-Produktionsbuild | **Nicht durchführbar**, lokale `next`- und TypeScript-Abhängigkeiten fehlen |
| Technische V831-Production-Gate-Prüfung | **Korrekt blockiert**, `productionReleased=false` |
| Echter GPU-/VRAM-/GLB-Langzeittest | **Nicht durchgeführt** |

Hinweis zu historischen Tests: Versionsprüfungen in V830/V831/V832 wurden auf das neue Release erweitert; die fachlichen Prüfungen blieben bestehen. Die V832-Regressionsprüfung sucht die V832-Tests nun innerhalb der Prüfketten, statt nur am Anfang, weil V833 vorrangig ausgeführt wird.

## Reproduzierbare Prüfung bei vorhandenen Abhängigkeiten

```powershell
npm ci
npm run test:v833
npm run test:v833:types
npm run verify:production:v831
```

Der Production Gate prüft die Release-Testkette, den vollständigen TypeScript-Check und den wirklichen Next.js-Produktionsbuild und blockiert auf Fehler. Der vorhandene V832-GitHub-Actions-Workflow kann diese Prüfungen für Push und Pull Requests auf Windows/Linux anstoßen, sobald der neue Projektstand im Repository liegt. Ein tatsächlich erfolgreiches GitHub-Actions-Ergebnis liegt für V833 hier **nicht** vor.

### Reale GPU-Abnahme (offen)

Wechsle längere Zeit zwischen mindestens zwei Avatar-GLBs, den Bühnenwelten und den Effekten, wiederhole die gleichen Szenenzyklen mit konstanten Einstellungen und vergleiche WebGL-Geometrien-/Texturenzähler, Heap, FPS und Framezeit vor/nach einer Ruhephase. Für echte VRAM-/GPU-Zeitwerte ist externes Browser-/Systemprofiling erforderlich. Ein steigender Zähler ist allein noch kein Beweis für ein Leck, ein gleichbleibender Zähler auch keine Garantie für Leckfreiheit.
