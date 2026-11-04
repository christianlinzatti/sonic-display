# V738 – Hip Motion Studio

**Ausgangsbasis:** V737 Foot Lock 2.0. Die bestehende V735-Funktionalität und das bestehende V737-Ankerverfahren bleiben erhalten.

## Neu

- `hipMotionStudioV738.ts`: zustandsbehaftete, aber isolierte Bewegungsüberblendung, sanfte C1-Easing-Kurve zwischen `Hip_Sway`, `Hip_Circle` und `Hip_Bounce` einschließlich automatischer Phrasenwechsel.
- Kein aufaddiertes Rotieren oder Verschieben von Meshes/Roots: Die Engine liefert denselben **bounded V735-Pose-Kanal** an den vorhandenen Rig-Controller. Danach erfolgt wie zuvor **ein** Grounding-/Foot-IK-Aufruf.
- Gespeicherte Regler für Übergangszeit (0,1–1,5 Sekunden), Modus-Intensitäten (0–150 % relativ zur V735-Grundstärke, intern auf 100 % Sicherheitsgrenze gedeckelt), Halftime/Normal/Doubletime. Die Gesamtgeschwindigkeit und Grundstärke bleiben in V735 konfigurierbar.
- Stopp, Reduced Motion, manuelle Timeline, vorhandene GLB-Motion und Track-Seek setzen den Überblendzustand zurück.
- AvatarEditor: wählbarer V738-Live-Modus, simuliertes Tempo (65–190 BPM), Genre und Anzeige der V135-Bodenkontaktphase links/rechts. Kein nachträglich gemessener IK-Fußschlupf.
- Kein GLB-Modell oder Skinning verändert. Separate Gesäßverformung und feste neue GLB-AnimationClips sind nicht Gegenstand dieser Version.

## Grenzen

- Exakte Beat-Phase hängt an der bereits vorhandenen musikalischen Zeituhr; beim Ändern von Speed/Rhythm während eines laufenden Titels kann die Phase springen. Übergänge zwischen Bewegungsmodi werden hingegen geglättet.
- Fußkontaktanzeige ist eine Diagnose der Kontakterkennung und bestätigt keine rutschfreie Pose.
- Physische GLB-/Browser-/GPU-Prüfung bleibt separat durchzuführen.

## Testen

```bash
npm ci
npm run test:v738
npm run test:v738:types
npm run verify:v738
```

`verify:v738` umfasst historische Regressionen, Syntax-/Architektur-/Dateinamenprüfung, vollständigen TypeScript-Check und `next build`. Die getrennte Prüfbilanz steht in `V738-VERIFICATION.md`.
