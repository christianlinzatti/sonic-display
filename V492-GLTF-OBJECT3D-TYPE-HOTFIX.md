# V492 – GLB-Hook Object3D TypeScript-Hotfix

Nach der zweiten `ThreeAvatar`-Modularisierung lieferte `npm run typecheck` zwei Fehler `TS2741`/`TS2345` in `GltfDancerAvatarV492.tsx` bei den Aufrufen von `useGltfVocalMotionV492` und `useGltfFootContactV492`.

## Ursache und Behebung

`cloneSkinnedScene(scene)` liefert ein `Object3D`, das keine `Group` sein muss. Die Hook-Parameter `model` waren irrtümlich als `Group` deklariert. Beide neuen Hooks nehmen nun `model: Object3D` an. Der tatsächliche `<group>`-Root für die Foot-IK bleibt `RefObject<Group | null>`.

Es wird kein unsicherer Cast verwendet. Die Hooks benutzen am `model` lediglich `Object3D`-Funktionen (`traverse`, `bindBones`, `prepareAvatarWardrobeV468`). Die Animation und Foot-IK selbst bleiben unverändert. Der GLB-Hook-Regressionstest überprüft beide Parameterverträge.

## Auf Windows verifizieren

```powershell
npm run test:gltf-hook-split
npm run typecheck
npm run build
```

Die Versionsnummer bleibt `0.1.0-v492` (Typecheck-Hotfix ohne Feature-Änderung).
