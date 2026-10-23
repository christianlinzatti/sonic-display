# V384 – Natural Vocal Articulation

## Überblick

V384 erweitert die bestehende V368–V374-Pipeline mit einem deterministischen Artikulationspass `naturalVocalArticulationV384.ts`. Er läuft **nach** den V374-Vokal-/Gestenentscheidungen und **vor** dem V370/V383-Rig-Mapping. Dadurch gelten die V383-Morph-Namen, manuellen Kanalzuordnungen und Gains weiterhin unverändert.

## Neu

- **B/P/M-Lippenschluss:** Auf der Basis des tatsächlichen, zeitsynchronisierten Wortfensters werden verschlussartige Gesten am Wortanfang und -ende verbessert. Währenddessen werden die Kieferöffnung und konkurrierende breite/runde Lippenformen begrenzt.
- **Sanfter Vokalübergang:** Kleine Proben innerhalb des aktiven Wortfensters helfen, abrupte Wechsel von Kieferöffnung und Vokalformen abzumildern. Die Verarbeitung mischt keine Verschlüsse als Vokale.
- **Ruhigere Rap-Kieferbewegungen:** Schnell aufeinanderfolgende Rap-Wörter werden bei Bedarf mit einer kleinen, einstellbaren Dämpfung beruhigt, ohne die Synchronisation der Gesten und Tanzbewegungen zu verändern.
- **Realistische Render-Übergänge:** Der GLB-Morph-Renderer lässt Lippenverschlüsse schneller einschwingen und begrenzt Kieferöffnungen auch **nach** der interpolierten Morph-Glättung. Vorhandene Animator-Overlays und V383-Einzel-Morph-Tests behalten Vorrang.
- **Vocal Sync Inspector:** Zeigt geschätzten Lippenschluss, Kieferberuhigung und Vokalverbindung anhand aktueller Lyrics-Wortzeitstempel.

Unter **Settings → Avatar & Tanz → V384 · Natural Vocal Articulation** lassen sich Aktivierung, Gesamtstärke, M/B/P-Lippenverschluss und Kieferberuhigung getrennt einstellen. V384 ist standardmäßig aktiviert; ohne Wort-Timing greift der zusätzliche Pass nicht ein. Eine deaktivierte V374-Qualitätsstufe deaktiviert auch den nachfolgenden V384-Pass.

## Grenzen

Dies ist **keine** Audio-Phonemerkennung, kein Speech-to-Text und keine Identifikation realer Sänger. Der Algorithmus nutzt orthografische Anhaltspunkte in vorhandenen echten Wort-Zeitstempeln; Untergliederungen innerhalb des Wortes sind stilisierte Näherungen. Songs mit ausschließlich Zeilen-Timing oder ohne synchronisierte Lyrics erhalten keine neuen Lippenverschluss-Cues. Die aufgezeichnete GLB-Animation kann weiterhin eigene Gesichtsbewegungen enthalten und erhält Vorrang vor den additiven V384-Overlays.

Bei pausierter Wiedergabe und aktivierter reduzierter Bewegung ist die zusätzliche Artikulationsstufe neutral. Die Verarbeitung ist vollständig seek-sicher und führt keine neuen Netzwerkanfragen aus.

## Prüfen

```bash
npm install
npm run test:v384
npm run verify:offline
npm run build
```

Die Offline-Tests können hier mit global installiertem TypeScript ausgeführt werden. Ein vollständiger Next.js-Produktionsbuild benötigt die im Projekt deklarierten npm-Abhängigkeiten.
