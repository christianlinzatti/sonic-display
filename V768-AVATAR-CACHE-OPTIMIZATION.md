# V768 – GLB-Avatar-Cache: Budget & sichere Freigabe

## Änderungen

- Das aus V654 vorhandene LRU-/Owner-Modell begrenzt jetzt **maximal sechs inaktive GLB-Loader-Einträge** und **96 MiB geschätzte dekodierte Nutzlast**. Erreicht einer der Grenzwerte sein Maximum, werden die ältesten **inaktiven** GLBs entfernt (`useGLTF.clear`).
- Aktive GLB-Avatare, Vorschau-Instanzen und Duette behalten ihren Cache-Eintrag auch bei einem hohen Speicherverbrauch. Owner-Zähler und idempotente Cleanup-Funktionen verhindern vorzeitiges Evicten bei paralleler Benutzung.
- `blob:`- und `data:`-GLBs werden beim letzten `release()` sofort aus dem Loader-Cache entfernt. URLs werden hier nicht selbst revoked, da der Importmanager dafür zuständig ist.
- Eigene importierte Animations-GLBs (`ImportedAnimationAvatar`) und gemeinsam verwendete Motion-Quellen (`SharedEmbeddedAvatarV531`) werden ebenfalls erfasst.
- Einmalige Byte-Schätzung pro `scene` über deduplizierte Buffer-Attribute, Morph-Attribute, Texturpixel und Animationsdaten. Kein Full-Scene-Traversal pro Frame.
- In der **lokalen** V767-GPU-Diagnose werden Cache-Einträge und geschätzte inaktive Bytes angezeigt. Der Stresstest verwendet dieselbe Cache-Retention für echte GLBs.

## Wichtig: Bedeutung des Speicherbudgets

Das ist ein **weiches Budget für geschätzte, dekodierte Loader-Payloads** und **kein VRAM-Limit**. Texturkompression, Shader, externe Referenzen, Treiber und WebGL-Uploader sind nicht vollständig bestimmbar. `useGLTF.clear()` vergisst eine geladene GLTF im Loader, verfügt aber **nicht** über die GPU-Ressourcen, die möglicherweise von anderen 3D-Instanzen geteilt werden. Das ist beabsichtigt: ein aggressives `geometry.dispose()` / `texture.dispose()` könnte aktive Tänzer beschädigen. Eigenständige `SkeletonUtils.clone`-Instanzen werden weiterhin durch den bestehenden V654-Lebenszyklus bereinigt.

Nicht sämtliche direkten `GLTFLoader`- oder `useGLTF`-Verbraucher des gesamten Projekts werden vom V768-Cachebudget abgedeckt. Für sie ist eine gesonderte Owner-/Dispose-Analyse erforderlich.

## Prüfen

```powershell
npm ci
npm run test:v768
npm run test:v768:types
npm run verify:v768:static
npm run typecheck
npm run build
```

Chromium-Stress (nach `npm run dev`): `npm run test:v767:browser`.

### Verifikation hier

- V768, V767, V766 und V760–V765 Regressionen: **bestanden**.
- V654-Ressourcen-Regressionen und V656-Regression: **bestanden**.
- 1087 TS/TSX-Dateien Syntax/Import-Bindings: **bestanden**.
- Architektur, Modul-Groß-/Kleinschreibung, Lockfile: **bestanden**.
- Strenger TypeScript-Check der zwei reinen Cache-/Schätzmodule: **bestanden**.
- Vollständiger TypeScript-Check: **nicht bestanden**, da die npm-Abhängigkeiten (Next.js, Three.js, React und Node-Typdefinitionen) in dieser Umgebung fehlen.
- Produktionsbuild/Chromium-GPU-Messung: **nicht durchgeführt** (Abhängigkeiten und Server fehlen). Keine FPS- oder reale VRAM-Ersparnis behauptet.
