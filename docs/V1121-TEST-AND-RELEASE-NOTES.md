# V1121 – Test- und Release-Notizen

`npm run test:v1121` kompiliert reale TS-Quellen isoliert. Es prüft 288
Kombinationen aus Genre, Intensitätslimit, Übergangsstil, Stärke und Länge,
und darüber hinaus Szenengrenzen, nicht überlappende Zeitfenster,
Smoothstep-Samples, invalid inputs, die unveränderte V1040-Partitur,
explizite Freigabe und den Schutz vor Hardware- und Netzwerkausführung.

`npm run test:v1121:types` prüft die isolierten TypeScript-Kern-Typen.
`tests/e2e/ai-immersive-scene-transitions-v1121.spec.cjs` wird als
Chromium-Desktop- und Touch-Test in der echten CI-Produktionsumgebung
mit sechs Übergängen, manueller Probeposition, unverändertem Showplan und
Freigabesperre ohne aktivierten Show Director ausgeführt.

Zusätzlich sind die vollständigen alten KI-Regressionsketten,
Source-Preflight, ZIP-Import-Simulation, Struktur- und Architekturtests
zu prüfen. Node-24-Next.js, Windows-Build und Playwright müssen nach dem
GitHub-Import erst noch vollständig als bestanden bestätigt werden.
