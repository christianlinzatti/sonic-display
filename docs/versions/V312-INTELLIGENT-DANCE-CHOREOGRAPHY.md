# Sonic Display V312 — Intelligent Dance Choreography Director

## Ziel

Eine konsistente Duo-Tanzshow mit **zwei gleichzeitig geladenen Avataren**. V312 fügt keine neuen GLB-Animationen hinzu und generiert keine realistischen handanimierten Tanz-Motions. Stattdessen koordiniert es die **vorhandenen** Animationen und Musikreaktionen, Rollen, Gestik, räumliche Formationen und Partnerblickrichtungen besser.

## Neu

- **Phrasengenaue Solo-Wechsel:** Gleiche musikalische Zeitbasis (`progressMs`) für beide Tänzer; Wechsel nach 2 bis 16 Vierertakten; wiederholbare Ergebnisse ohne `Math.random()`.
- **Call & Response:** Lead- und Partner-Solo sowie gemeinsamer Abschnitt wechseln nach musikalischen Phrasen. Die sekundäre Beat-Gestik wird um bis zu einen Beat versetzt. Kleine Blickwinkeländerungen unterstützen das Partner-Spiel.
- **Sichtbarer Rollen-Kontrast:** Bei Solos dämpft V312 die *zusätzlichen reaktiven* Arm-, Bein- und Aggressionskomponenten des Background-Tänzers. Importierte GLB-Animationen werden nicht verändert oder pausiert; die existierende Fuß-IK läuft unverändert weiter.
- **Drop-Duo:** Ein erkannter Drop aktiviert gemeinsame synchrone Bewegung und eine breite Formation; `dropAccent` ist zeitlich auf höchstens ca. zwei Beats begrenzt. Kein künstlicher Accent nach Seek oder Trackwechsel.
- **Build / Break:** Beim Build erhält der Partner einen kurzen Vordergrund-Moment, beim Break reduziert V312 die szenische Bewegung und fokussiert den Lead.
- **Performance:** Regieentscheidungen werden nur bei Abschnitts-/Phrasenwechseln an React übergeben. Die Three.js-Gruppen und Mixer bleiben über Formationswechsel gemountet.

## Bedienung

1. **Settings → Dynamic Stage → Smart Stage Director → Intelligent Dance Choreography Director · V312** öffnen.
2. Mit *Intelligente Duo-Choreografie aktivieren* die Automatik einschalten.
3. Unter **One-Click Tanzshows** einen der Stile starten. *Hardtekk Mainstage* verwendet schnelle Wechsel, *Deutschrap Spotlight* Call-and-Response, *Cinematic Festival* längere Phrasen. *Ambient Night* hält die Automatik bewusst aus.
4. Bei Bedarf Takte je Solo-Wechsel, Solo-Kontrast, Partner-Interaktion, Formations-Abwechslung und gemeinsamen Drop anpassen.

V312 ist **nur bei eingeschaltetem Ultimate Show Director (V306) und aktivierten Show-Formationen** wirksam. Falls V206/V274 ausdrücklich als gemeinsamer Multi-Avatar Director aktiviert ist, hat dessen Choreografie Vorrang. Eine manuell festgelegte Duo-/Mirror-/Sync-Szene ohne automatischen Duo Director bleibt bestehen. Ein reines Solo kann die automatische Show-Regie übernehmen.

Gespeicherte Show-Presets enthalten die V312-Werte und können mit der vorhandenen Undo-Funktion wiederhergestellt werden. Bei **alten benutzerdefinierten V309–V311-Presets** wird V312 beim Import standardmäßig *deaktiviert*, um deren bisheriges Verhalten zu bewahren.

## Grenzen

- Maximal **zwei Tänzer**. Keine echte Partner-Kollisionsphysik, kein garantiertes Hand-zu-Hand-Matching.
- Die Songabschnitte stammen aus bestehenden heuristischen Musik-/Mikrofonsignalen. Es gibt keine direkte Spotify-Stem- oder präzise Beat-Grid-API.
- Hochwertige authentische Tanzbewegungen setzen gute kompatible GLB-Motions voraus. V312 choreografiert bestehende Bewegungsbausteine und fügt keine neuen Motion-Capture-Sequenzen hinzu.
- Reduced Motion unterdrückt zusätzliche Interaktionen. Low-tier-Performance-, IK- und manuelle Motion-Bestimmungen bleiben bestehen.

## Technische Integration

- `components/visualizer/intelligentDanceChoreographyV312.ts` — pure Music-Time-Choreography-Engine mit Einstellungen und Storage.
- `components/visualizer/IntelligentChoreographyControlsV312.tsx` — UI-Steuerung.
- `components/visualizer/ThreeAvatar.tsx` — V312 Tick im R3F-Canvas, dynamische Duo-Formation, Rollen-Kontrast und Partnerinteraktion.
- `components/visualizer/StageDirectorControlsV287.tsx` — Integration in Einstellungen.
- `components/visualizer/showPresetsV309.ts`, `ShowPresetStudioV309.tsx` — vier voreingestellte Profile, eigene Presets und reversible Speicherung.
- `tests/v312-intelligent-choreography-regression.cjs` — Grenzwerte, Rollen, Drop, Pause, Seek, Trackwechsel, Reduced Motion, Persistenz und Integration.

## Prüfung

```bash
npm install
npm run verify
```

`npm run verify:offline` funktioniert mit Node und TypeScript ohne installierte Projektabhängigkeiten (sofern eine passende globale TypeScript-Installation vorhanden ist). Der vollständige Next.js-Build benötigt `npm install` und sollte lokal geprüft werden. V312 wurde in der Ausführungsumgebung mit der Offline-Testreihe und Syntaxprüfung geprüft; der volle Build war mangels npm-Paketen nicht verfügbar.
