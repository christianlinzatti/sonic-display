# V666 – Genre-Specific Dance Intelligence

## Verhalten

- Die bestehende V536-Auswahl **bereits vorhandener, geladener GLB-Clips** unterscheidet nun zusätzlich Rock und Pop statt beide generisch zu behandeln. Namen und Kategorien geben nur eine *Präferenz*, keine Garantie: fehlende Motion-Clips werden nicht erzeugt. V536 behält die manuellen Prioritäten und die bestehende Phrase-/Cooldown-Regel.
- Der neue pure Regler `components/visualizer/genreDancePerformanceV666.ts` moduliert **nur bereits vorhandene additive Rig-Kanäle**: Deutschrap betont Headnod/Schulter/Rap-Gesten, Hardstyle Brust-/Kick-Akzente, Hardtekk beweglichere Oberkörper-/Hüftakzente, Rock Kopf/Schulter, Pop Sway/Arme. Er erzeugt keine Pose, keine neue Animation, keine Bewegung aus einem Nullsignal.
- Der zusätzliche Ausdrucksregler ist **standardmäßig ausgeschaltet**. Einstellbar in `Einstellungen → Natürlicher Tanz → V666`, Stärke 0–100 % und automatisches Genre oder ausdrücklich gewähltes Profil.
- Die Verstärkung einzelner Overlay-Kanäle ist maximal 16 % (absoluter Faktor 0.84–1.16), nach Energie, Kick/Snare und ruhiger oder intensiver Songphase. Standsichere Hüftbewegungen werden bei beobachtetem Fußkontakt nicht verstärkt.
- V666 sitzt im *vorhandenen* GLB-Frame-Loop unmittelbar nach V665 und vor der Debug-/Rig-Schicht, ohne zusätzliche `useFrame`, Audio-Worker oder V492-Foot-IK-Aufruf. Manuelle Choreografien, aktive Sequenzen, importierte Clip-Prioritäten, Reduced Motion, Pause, niedrige Qualitätsstufe, fehlender Titel und unerkannte Auto-Genres deaktivieren die Modulation.
- Jeder Track-, Modell-, Genre- oder Seekwechsel startet die Hüllkurve neu. Browser-Storage-Fehler werden abgefangen; die V666-Einstellung wird über `services/settings/unifiedBackup.ts` für die Geräteübertragung gesichert.

## Grenzen

Eine stilistische Verstärkung von bestehenden Kanälen ersetzt keine echten tanzspezifischen GLB-Clips. Für sichtbar unterscheidbare Hardstyle-Kicks, Hardtekk-Footwork oder Rock-Headbanging sind entsprechend geriggte und kompatible Animationen nötig. Sprach-/Sängererkennung, Phonem- und Fußkontaktberechnung bleiben unabhängig. Vor Produktionsfreigabe: vollständiger TypeScript-Projektcheck, Next.js-Build und GLB-/GPU-Browser-Regressionen auf echter Hardware.

## Testbefehle

- `npm run test:v666`
- `npm run test:v666:types`
- `npm run test:smoke:v666`
- `npm run check:release` (beinhaltet vollständigen Projekt-Typecheck)
- `npm run build` (Next.js-Produktionsbuild; führt `check:release` als Prebuild aus)
