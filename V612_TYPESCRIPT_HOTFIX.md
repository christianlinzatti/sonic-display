# Sonic Display V612 — TypeScript-Korrekturen

Diese Ausgabe basiert auf `sonic-display-v612-expressive-vocal-facial-performance-7.zip`. Funktionsumfang und Versionsnummer bleiben V612.

## Behobene Fehler (21 TypeScript-Meldungen)

- **ConcertDetailStageV555.tsx (1):** Three.js-`Line` als wiederverwendetes `<primitive>` erzeugt (anstelle von `<line>`, das als SVG-Line interpretiert wird). Material/Geometrie werden beim Unmount freigegeben. Keine zusätzlichen Render-Loops.
- **DanceFormationActorsV492.tsx (6):** Nicht erreichbare `together`-/`greeting`-Vergleiche entfernt. `DuoScene` kennt nur `solo`, `sync`, `mirror`, `duet`; die entfernten Ausdrücke waren zur Laufzeit immer `false`. Bestehende manuelle Vorrangregeln bleiben unverändert.
- **DynamicStage.tsx (2):** Elternketten berücksichtigen typisiert `Object3D.parent: Object3D | null` und mögliche fehlende Objekte.
- **lodPlaybackBufferV569.ts (1, gemeldet in GltfDancerAvatarV492.tsx):** Unterstützt jetzt auch `null` für nicht vorhandene `AnimationAction`-Einträge. Vorhandenes Entfernen inaktiver Snapshots bleibt erhalten, ohne zusätzlichen Aufwand pro Frame.
- **StagePreviewModal.tsx (1):** Berechnet die Anzahl für die Vorschau vor der bedingten JSX-Verzweigung; die bereits auf Nicht-Duett eingegrenzte Verzweigung wird nicht mehr mit `duet` verglichen. V559-Regressionsassertion entsprechend angepasst.
- **VocalRigV368.tsx (10):** Head-Bone-Erkennung sammelt typisiert echte gefundene Knochen, statt eine in der Callback-Funktion veränderte Variable außerhalb zu verengen. Die Bewegungs-/Release-Logik bleibt unverändert.

## Prüfung

- 21 von 22 gezielt ausgeführten Skript-/Regressionstests erfolgreich, inklusive Source-Syntax, Architektur, V555/V556/V559, V563/V566, V569, V581/V582, V597 und V601/V602/V612.
- Der **V492-GLB-Hook-Modularisierungs-Test scheitert bereits in der unveränderten Eingabeversion**: `GltfDancerAvatarV492.tsx` wird vom Test mit 1322 Zeilen gezählt, der historisch gesetzte Grenzwert ist kleiner als 1210. Diese bestehende Refactoring-Aufgabe wurde nicht durch einen TypeScript-Hotfix kaschiert.
- Zusätzlicher Laufzeittest: `null`-AnimationAction entfernt einen vorherigen Clip-Snapshot korrekt.
- **Vollständiger `tsc --noEmit`-Lauf hier nicht möglich**: Das Archiv enthält keine installierten `node_modules`; der lokale Installationsversuch der npm-Abhängigkeiten konnte in der Ausführungsumgebung nicht abgeschlossen werden. Daher sind keine falschen Aussagen über einen grünen vollständigen Typecheck enthalten.
- Die npm-Meldung `Run npm audit for details` betrifft mögliche Abhängigkeits-Sicherheitsmeldungen und ist **getrennt** von den 21 TypeScript-Fehlern. Ohne Audit-Bericht und Abhängigkeitsinstallation wurden keine Paketversionen verändert.

## Lokal ausführen

```powershell
npm install
npx tsc --noEmit
node tests/v612-expressive-vocal-facial-performance-regression.cjs
npm audit
```

Der ZIP-Inhalt kann über das bestehende Projekt gelegt werden. Bei lokal bereits installierten Dependencies wird so die vorhandene Installation beibehalten.
