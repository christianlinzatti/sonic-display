# V739 – GLB Motion Integration & Availability Warnings

**Basis:** `sonic-display-v738-hip-motion-studio.zip` (unveränderte Herkunft der Komponenten außer den hier dokumentierten V739-Anpassungen). Version `0.1.0-v739` in `package.json` und `package-lock.json`.

## Neu

- Im Avatar-Editor gibt es für `Hip_Sway`, `Hip_Circle`, `Hip_Bounce` zwei **getrennte** Auswahltypen: **GLB-Clip** und **prozedural**.
- Ist ein als GLB ausgewählter Clip nicht in den tatsächlich geladenen Animationsnamen des aktuellen Modells enthalten, erscheint `role="alert"` und es wird **kein** anderer Clip stillschweigend abgespielt. Erst nach der GLB-Inventarisierung wird eine Abwesenheit behauptet.
- Prozedurale Auswahl ist ausdrücklich als solche gekennzeichnet und funktioniert ohne entsprechenden GLB-Clip. Fehlende Hips-Bones werden als Warnung, unvollständige Fußknochen als Hinweis ausgegeben.
- Im Avatar-Editor wird ein **rig-spezifischer** `AnimationClip` mit 8-Beat-Loop, BPM und Geschwindigkeit erzeugt und als **einzelner** Clip in einer **vollständigen Avatar-GLB** exportiert. Exportiert wird **ein Clip pro Knopfdruck**, nicht in einem Schritt eine fertige globale Bibliothek.
- Die exportierte Datei kann über den vorhandenen **Motion Installer** dem Zielavatar zugewiesen werden. Der GLB-Export installiert die Datei **nicht automatisch** und ersetzt nicht das ursprüngliche GLB-Modell.
- Die Character Motion Library überprüft vor Vorschau und Aktivierung, ob die Motion-GLB ladbar ist und mindestens einen Animationsclip enthält. Nicht vorhandene oder unlesbare Dateien werden über `role="alert"` angezeigt.

## Verifiziert

| Befehl | Ergebnis |
|---|---|
| `npm run test:v739` | PASS, 28.392 deterministische Auswahl-, Warnungs-, Keyframe- und Export-Mockprüfungen |
| `npm run test:v739:types` | PASS, strikt isolierter Typcheck der Clip-Verfügbarkeitslogik |
| `npm run test:v738` / `test:v738:types` | PASS, 75.085 Motion-Studio-Prüfungen |
| `npm run test:v737` / `test:v737:types` | PASS, Grounding-Foot-Lock-Prüfungen |
| `npm run test:v736` / `test:v736:types` | PASS, 61.582 Hüft-Motion-Samples |
| `npm run test:v735` | PASS, V735-Motion- und Rig-Regression |
| `npm run test:v665` / `test:v666` | PASS, bestehende Grounding-/Genre-Prüfungen |
| `npm run check:syntax` | PASS, TS/TSX Syntax und doppelte Imports |
| `npm run check:architecture` | PASS, Architektur-/Versionsstruktur |
| `npm run test:module-case` | PASS, keine Windows/Linux-TS-Modulnamenkollisionen |

## Noch nicht erfolgreich abgeschlossen

- `npm ci --offline` scheitert mit **ENOTCACHED** (`zustand-5.0.16.tgz` fehlt). Es konnte keine komplette Installation der npm-Abhängigkeiten ausgeführt werden.
- `npm run typecheck` kann die nicht installierten Next.js-/React-/Three-/Node-Typen nicht auflösen. Die vollständige Typkorrektheit der neuen React-Komponenten/GLB-Exporter ist damit **nicht bewiesen**.
- `npm run build` wird durch `check:dependencies` gestoppt: 18 direkte Pakete fehlen (u.a. Next.js, React, Three.js). Kein erfolgreicher Produktionsbuild.
- Der Export wurde **mit gemocktem Three.js/GLTFExporter** und deterministischen Keyframes getestet. Kein tatsächlicher binärer GLB-Roundtrip, keine echte Avatar-v2-GLB, kein GPU-/Browser-Test, keine gemessene Fußrutschfreiheit.
- Separate Gesäßknochen/Morph-Targets und neue Hautgewichte werden nicht hinzugefügt. **Fuß-IK ist nicht in die exportierte GLB gebacken** und muss bei Bedarf im Zielavatar weiter greifen.

## Lokal nachholen (Windows PowerShell)

```powershell
npm ci
npm run verify:v739
```

Danach in **Einstellungen → Avatar-Editor → Animation clip** eine nicht vorhandene GLB-Hüftanimation auswählen und die Warnung prüfen; danach die prozedurale Alternative aktivieren. Den entsprechenden Clip als GLB exportieren und über den Motion Installer dem **gleichen Avatar-Rig** zuweisen. Den neu geladenen GLB-Clip in der 3D-Vorschau visuell prüfen, besonders Knie, Fußrutschen, Übergänge sowie Play/Pause und Modellwechsel. Falls der Importpfad keine ausreichend kompatiblen Animationstracks bietet, Original-GLB und prozedurale Variante beibehalten.
