# V803 – Visual Concert Comparison Studio

## Ziel
V802 bietet planbasierte Vorher/Nachher-Vorschläge. V803 ergänzt eine **opt-in gerenderte 3D-Vorschau** für die jeweils ausgewählten und verifizierten Kameraentwürfe, ohne Änderungen an der Live-Kamera oder der V354-Timeline.

## Einstieg
Einstellungen → Concert Quality Dashboard → V802 Improvement Assistant → eine Kamera-Alternative auswählen → **V803 Visual Concert Comparison Studio** → Szene und gemeinsamen Songzeitpunkt wählen → **Echten 3D-Vergleich öffnen**.

## Implementierung
- `visualConcertComparisonV803.ts`: reine, deterministische und fail-closed Auswahl. V790-Storyboard, V802-Vorschau, Track-ID, Dauer, Szenenindex, Zeitfenster und originale/entworfene Kameraabsicht müssen zusammenpassen. Es werden keine nicht belegten Song-Szenen ergänzt.
- `VisualConcertComparisonPanelV803.tsx`: Szene und Zeitpunkt per Schieberegler auswählen, A/B-Vorschau nur bei explizitem Klick einblenden. Unmittelbar bei Song-/Entwurfswechsel wird sie geschlossen. Keine Speicherung, kein Export und keine Live-Kamerasteuerung.
- `CameraComparisonCanvasV803.tsx`: **ein** zusätzliches, nur bei geöffnetem Vergleich angelegtes WebGL-Canvas mit der vorhandenen `DynamicStage`, dem aktuell ausgewählten Avatar-GLB (falls vorhanden) und einer auf dem ersten eingebetteten Clip basierenden **identischen eingefrorenen Pose**. Derselbe 3D-Szenenbaum wird einmal pro Vorher- und Nachher-Kameraposition mittels Scissor/Viewport gerendert. Das GLB wird nur einmal geklont und beim Unmount bereinigt. Keine zwei voneinander abweichenden Animationen oder Bühnenzustände.
- Die jeweils aktive Bühnenstil-Einstellung und ausgewählte GLB-URL werden in der bestehenden `SettingsPanel`-Kette an das Dashboard weitergereicht. Ohne GLB wird deutlich sichtbar ein **Demo-Performer** gezeichnet, nicht ein vermeintlich echter Avatar.
- An Vorher und Nachher ändert sich ausschließlich die angenäherte **Kameraposition/FOV**. Songzeitpunkt, GLB-Sample, Geometrie und Licht bleiben gleich. Es gibt keine eigene zusätzliche Render-Loop außerhalb von React Three Fiber. `frameloop="demand"` vermeidet dauerhaftes Rendern.
- Die vorhandene V802-V354-Übernahme bleibt unverändert und benötigt weiterhin Bestätigung, vorhandene passende Song-Timeline und konfliktfreie manuelle Cues.

## Aussagegrenzen
- **Echt gerendert**, aber **nicht** ein Live-Video- oder Pixelmitschnitt: Der Vorschauwinkel wird aus V790-Intents in statische Kameraposen übertragen, nicht aus der finalen V289/V747/V797-/manuellen Live-Kamera. Das Ergebnis ist ein visuell beurteilbarer **Näherungsvergleich**.
- Die isolierte Bühne verwendet vorhandene `DynamicStage`-Geometrie mit angehaltener Reaktivität. Das aktuelle Echtzeit-Licht, mehrere Vocal-Performer, Lyrics, manuelle Licht-Timelines, Körper-IK und Live-Lip-Sync sind **nicht eins zu eins enthalten**. Der erste GLB-Animationsclip (falls vorhanden) wird als Standbildprobe zum gemeinsamen Zeitpunkt gesampelt; das ist **kein verifiziertes Vocal- oder Tanz-Timing**.
- Eine bessere strukturelle V801-Bewertung ist kein Beweis für schönere Kamerabilder. Es wird kein GPU-Qualitätswert erfunden; echte Browser-/WebGL-Abnahme steht noch aus.
- Eine zusätzliche WebGL-Instanz wird **nur während der geöffneten Vorschau** benötigt. Bei niedriger Leistung die Vorschau schließen. Der Live-Renderer wird nicht ersetzt oder beeinflusst.

## Prüfungen
`npm run test:v803`, `npm run test:v803:types`, relevante Regressionen, `check:syntax`, `check:architecture`, `test:module-case`, `check:lockfile:v752`. Siehe `V803-VERIFICATION.md`.
