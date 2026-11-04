# V781 – Verification

Pruefungen in der Auslieferungsumgebung:

- `npm run test:v781`: reale Sampling-Integration statisch; isolierte Unit-Tests fuer Frame Pacing, Pose-Holds, Mund-Holds, Body-Sampling und optionales Foot Sliding sowie Fail-Closed-Reportvalidierung.
- `npm run test:v781:types`: reine V781-Modul-Typpruefung (ohne React/Next.js-Abhaengigkeiten).
- `npm run verify:v781:static`: V780–V776 Regressions- und Syntax-/Architektur-/Lockfile-/Dateinamenspruefungen plus wichtige GPU-Tests.
- `npm run typecheck`, `npm run build`: nur mit vollstaendig installierten npm-Abhaengigkeiten aussagekraeftig.
- `npm run benchmark:v781:motion`: nur mit lokalem Next.js und Chromium und einer GLB-Figur aussagekraeftig.

Keine Browsermessung und keine daraus abgeleitete Hardwarezusage ohne lauffaehige Umgebung.
