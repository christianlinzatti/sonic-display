# V1037 · Arena Transformation 2.0

## Implementiert

* 4/6/8 animierte Bühnen-Petalen am äußeren Rand der 360°-Rundbühne (low/balanced/high).
* Sanfte radiale Translation (max. 46 cm) und Anhebung (max. 16 cm) mit begrenztem Drehen.
* Auto-Modus: Verse = Halo, Build = Spirale, Hook/Drop = Fächer, Break = geschlossen.
  Alternativ manuell Fächer, Spirale oder Halo; Stärkeregelung 0–100 %.
* Szene dreht sich unverändert zusammen mit den Avataren; die zentralen Bühnenbretter,
  Fuß-Kontakte und Avatarrigs werden **nicht** verschoben oder skaliert.
* Erhalt aller V1031–V1036-Elemente, keine neuen Netzwerkaufrufe oder zusätzlichen
  WebGL-Lichtquellen. Bei Musikpause wird die letzte Bühnenposition eingefroren,
  bei reduzierter Bewegung wird die Mechanik zurückgesetzt.
* Einstellungen → Dynamic Stage → Arena; aktualisierte Bühnenvorschau.

## Tests und reale Einschränkungen

`npm run test:v1037`, `npm run test:v1037:types`, `npm run check:syntax`,
`npm run check:architecture`, `npm run verify:v959:source`.
Nach `npm ci` sind zusätzlich `npm run typecheck` und `npm run build:next`
über GitHub Actions (Ubuntu + Windows) vorgesehen. Eine echte Browser- und
WebGL-Prüfung ist zusätzlich erforderlich.

## Priorisierung V1038–V1042

1. V1038: Floating Stage – separat steuerbare, schwebende, rein dekorative
   Plattformen mit klaren Avatar-Kollisions-/Sichtbarkeitsgrenzen.
2. V1039: Laser/Hologramme 2.0 – erweiterte Formationen mit GPU-Budget.
3. V1040: KI-Showplanner – optionale API, Datenminimierung, lokaler Fallback,
   Vorschau und nachvollziehbare Cues.
4. V1041: Avatar-Formations-/Choreografie-Director – nur vorhandene passende
   Animationen, Foot-IK und Übergangsprüfungen.
5. V1042: Govee Sync – lokale/API-Limits, Gerätezuordnung, Ausfall-/Offline-
   Fallback und sichere Begrenzung der Lichtwechsel.

Bewusst noch nicht in V1037 implementiert: schwebende Avatarplattformen, neue
Hologrammsysteme, generative KI-Abfragen oder reale Govee-Gerätesteuerung.
