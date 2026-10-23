# Sonic Display V462 – Concert Lighting Director 3.0

## Zweck

Ein genresensibler Lichtregisseur ergänzt die **bereits existierende** 3D-Bühnenbeleuchtung und die Concert Atmosphere V308. Er erstellt keine neuen GPU-Lichter, keine Stroboskope und keine neuen Laser. Bestehende manuelle Licht-Timelines, Blackouts, Anzeige- und Bewegungseinstellungen haben Vorrang.

## Verhalten

- **Deutschrap, Hip-Hop, Trap:** Die Sweeps sind ruhiger, vorhandene Gesichts-/Fülllichter werden leicht betont und der Nebel abgeschwächt. Hooks erhalten sanfte Gruppenakzente.
- **Hardstyle und Hardtekk:** Bei vorhandener Drop-/Kick-Evidenz werden die vorhandenen Scheinwerfer und Lichtkegel etwas stärker gesteuert. Hardtekk erhält einen leicht dynamischeren, weiterhin begrenzten Schwenk. Ohne Kick-Signal wird ein Drop nicht allein vom Genre her künstlich verstärkt.
- **Neutral:** Geringe Akzente bei Hooks, ansonsten weitgehend unverändert.
- **High / Balanced / Low:** Balanced dämpft die Zusatzakzente; Low deaktiviert sie vollständig.
- **Sicherheit und Prioritäten:** Während Pause, deaktivierter Lichtreaktion, reduzierter Bewegung, gespeicherter Licht-Timelines, gewolltem Blackout oder deaktivierter Show-Beleuchtung macht der neue Regisseur keine Veränderung.

## Technische Integration

- `components/visualizer/concertLightingDirectorV462.ts` – reine, deterministische Signalplanung mit streng begrenzten Werten.
- `components/visualizer/DynamicStage.tsx` – nutzt die Multiplikatoren auf bestehende Key-/Fill-/Beam-Lights und Lichtschwenks.
- `components/visualizer/ConcertAtmosphereRendererV308.tsx` – nutzt denselben Plan für bestehende Spotlights, Lichtkegel und Bodennebel; keine zusätzlichen Renderobjekte.
- Alle Eingaben stammen aus den vorhandenen Genre-, Songabschnitts-, Kick-/Energie-, Qualitäts- und Show-Signalen. Songabschnitte sind ggf. Heuristiken und keine behaupteten Spotify-Metadaten.

## Bewusste Grenzen

Kein neuer Lichteditor, keine neuen GPU-Ressourcen, keine zusätzlichen API-Dienste. Ein höherer Multiplikator garantiert keine sichtbare Wirkung, wenn ein Effekt vom Benutzer abgeschaltet oder durch die Qualitätsstufe deaktiviert ist. Die Renderwirkung und FPS auf echter Raspberry-Pi-Hardware müssen gesondert getestet werden.
