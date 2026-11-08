# V1087 · Ultimate Festival Drop

V1087 koordiniert eine **einzige, gemessene Beat-Flanke** über den vorhandenen
LED-Ring, die Laserfächer/-tunnel sowie V1084-Konfetti. Ergänzt wird eine einzige,
eng begrenzte transparente Torus-Schockwelle. Kein zweiter Timer, keine weiteren
Partikelgruppen, keine Hardware-Steuerung.

## Bedienung

Im **Arena Show Designer** einen gültigen Showplan laden, V1087 aktivieren und
mindestens zwei passende Effektsysteme separat eingeschaltet lassen. Stärke 0–80%.
Nur die echte Audio-Sektion `drop` *und* ein neuer gemessener Beat mit hoher
Bass-, Beat- und Energieintensität starten den Impuls. Ein geplanter Hook genügt
nicht. Die anschließende Sperre beträgt 3,6 Sekunden. Bei Pause, Seek,
Songwechsel, Low-Tier oder `prefers-reduced-motion` erfolgt kein neuer Trigger.

Bestehende manuelle Laser- und LED-Muster, deaktivierte Effekte, LED-Luminanz-
Budgets, Renderer-Batching und die optischen Schranken der Bühne bleiben erhalten.
Die zusätzliche Ringgeometrie löst **keine** physischen Schockwellen, CO₂-Jets,
Feuerwerk, externe Govee-Befehle oder Vollblitze aus.

## Testnachweis

`npm run test:v1087`, `npm run test:v1087:types` sowie `node scripts/v1087-release-readiness.cjs`.
Die vollständige Produktion inklusive Playwright ist separat in GitHub Actions zu
prüfen; eine reine Quellcodeprüfung bestätigt keine erfolgreiche Deployment-Pipeline.
