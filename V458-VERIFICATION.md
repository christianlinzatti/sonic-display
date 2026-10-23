# Sonic Display V458 – Prüfbericht

## Bestanden

- `npm run verify:v458` (Exit 0): V458-Funktionstest + isolierte
  TypeScript-Kernprüfung; gezielte Regressionen aus V423/V429/V442 und
  V445–V457, darunter die gesamten V451–V457-Ketten.
- V458: 2–4 Avatare, einheitliche Hook-Akzente, versetzte Verse-Reaktionen,
  normaler und enger Bühnenabstand, Contact-/Foot-IK-Vorrang,
  Qualitätsstufen, Pausen-/Manuell-/Reduced-Motion-Vorrang,
  ungültige Eingaben, deterministische Planung sowie eine **synthetische
  30-Minuten-Simulation** mit zwei bis vier Avataren.
- Zusatztests `test:v325` bis `test:v329`, `test:v392`, `test:multi-avatar`
  und `test:partner-sync` bestanden (historische Ensemble-, Motion-Sync-,
  Contact-IK- und Multi-Avatar-Integrationen).
- `npm run test:imports`: 994 Projektdateien und 2.194 Imports ohne Fehler.
- `npm run test:module-case`: 994 Projektdateien ohne problematische
  case-insensitive Modulnamen.
- `npm run check:syntax`: 625 TS-/TSX-Dateien ohne Syntaxfehler.
- Die frühere statische V452-Renderer-Prüfung wurde auf den tatsächlichen
  verfeinerten V458-Rootpfad aktualisiert; die V452-Funktionsprüfungen
  und manuellen Sicherheitsabfragen bleiben im Test erhalten.
- Die alte V457-Versionseinschränkung wurde auf künftige Versionen erweitert,
  ohne die Show-Continuity-Assertions zu entfernen.
- Release-ZIP: alle Dateien aus V457 vorhanden, zusätzliche V458-Dateien,
  keine doppelten Namen/ungültigen ZIP-Einträge.

## Noch nicht bestätigt

- Ein vollständiges `npm run typecheck` über alle React/Next.js-Module und
  `npm run build` konnten **nicht durchgeführt** werden, weil in der
  bereitgestellten Laufzeit keine installierten `node_modules`/React-/Next.js-
  Pakete vorhanden sind. Die isolierte TypeScript-Prüfung ersetzt dies nicht.
- Keine realen WebGL-Animationsvergleiche mit den GLB-Modellen des Nutzers,
  keine Raspberry-Pi-FPS-Messung oder Temperatur-/Throttling-Messung.
- Eine deterministische 30-Minuten-Simulation der Bewegungsplaner ist
  **kein** 30-minütiger Browser- oder Endgerätetest.
- Die historischen Zusatztests decken nur die jeweils benannten Bereiche ab;
  nicht jede Regression sämtlicher früherer Versionen wurde gestartet.
