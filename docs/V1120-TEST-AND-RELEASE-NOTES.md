# V1120 – Test- und Release-Notizen

`npm run test:v1120` kompiliert die unveränderten produktiven TS-Module in
isolierter Form und testet 256 Kombinationen aus Genre, Intensitätslimit,
Lichtstil und Stärke sowie gebundene Übergänge, bewusste Atempause,
Autoren-Zeitgrenzen, Showplan-Validierung, Opt-in und Konfliktschutz.

`npm run test:v1120:types` prüft die Kern-Types. Die neue
`tests/e2e/ai-dynamic-lighting-v1120.spec.cjs` läuft in der Produktions-CI
gleichzeitig auf Chromium Desktop und Touch: sieben Szenen, keine unerlaubte
Showplan-Änderung/Netzanfrage und Sperre ohne aktivierten Show Director.

Alle früheren KI-Regressionen und der komplette Repository-Preflight müssen
bestehen. Node-24-Next.js und echte Browser-Builds sind erst nach GitHub-
Import vollständig als freigegeben zu betrachten.
