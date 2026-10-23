# Sonic Display V316 – Live Dance Comparison Studio

## Zweck
V316 ergänzt den **Visual Dance Improvement Assistant V315** um einen optionalen, echten, zweigeteilten React-Three-Fiber-WebGL-Vergleich. Die linke Bühne zeigt die unveränderten Werte, die rechte Bühne die ausgewählten Empfehlungen – ohne Änderung der tatsächlichen Einstellungen.

## Bedienung
1. Einen Song mit einem 3D-Avatar abspielen, damit **V314 Dance Performance Review** Messwerte aufzeichnet.
2. **Settings → Dynamic Stage → Smart Stage Director → Visual Dance Improvement Assistant V315** öffnen.
3. **Aufzeichnung analysieren** wählen (mindestens 8 Messpunkte und 12 Sekunden). Anschließend gewünschte Vorschläge ankreuzen.
4. **Live-3D-Vergleich öffnen · V316** wählen. Ein großes, responsives Dialogfenster zeigt **Bisher · Original** und **Vorschlag · Vorschau** parallel.
5. Einen synthetischen Beat wählen: **Hardtekk 165 BPM**, **Deutschrap 92 BPM** oder **Cinematic 118 BPM**. Beide Bühnen haben dieselbe Zeitbasis und denselben Genre-/Abschnittsverlauf.
6. Animation pausieren, neu starten oder direkt zu **Break** und **Drop** springen. Bei passend geriggten GLB-Modellen erscheint der ausgewählte Avatar in beiden Ansichten. Ansonsten nutzt die Vorschau eine eigens gerenderte 3D-Demofigur.
7. Vorschau schließen. Erst **Ausgewählte Änderungen übernehmen** aus V315 ändert echte Einstellungen. Die existierende konfliktbewusste Rückgängig-Funktion bleibt erhalten.

## Technische Integration
- `danceLiveComparisonV316.ts`: reiner Generator für synchronisierte Demo-Beat-/Songabschnittsdaten, Basis-Rigbewegung und conflict-aware vorläufige Vorschlagsprojektion.
- `DanceLiveComparisonV316.tsx`: erst nach Klick dynamisch geladene Client-Komponente. Zwei eigenständige `<Canvas>`-Instanzen, geklonte GLB-Skelette, ein gemeinsamer Playback-Clock, echte V307-/V311-Motion-Refinements und V306-/V310-Show-Cues. Eigene Zustandsobjekte pro Bühne verhindern A/B-Kontamination.
- Ein `Canvas` benutzt geringe DPR und das Dialogfenster ist nur bei Bedarf montiert. Bei geschlossenem Dialog läuft keine zusätzliche 3D-Render-Schleife.
- GLB-Humanoid-Rig-Erkennung über bestehende Avatar-Rig-Regeln; für nicht kompatible Modelle oder Ladefehler ist ein geometrisches Demo-Skelett vorgesehen.
- Modell-Clones und Rig-Overlays sind pro Bühne isoliert. Die Vorschau ist vom Haupt-Show-Renderer getrennt; sie verändert keine Motion-Dateien, Keyframes oder Show-State-Preferences.
- Pause bei verstecktem Browser-Tab; Reduced-Motion-Preference deaktiviert das Abspielen; Escape schließt den Dialog.

## Was der Vergleich wirklich zeigt – und was nicht
**Echte 3D-Live-Animation**: Links und rechts werden laufende Three.js-Szenen gerendert. Die Änderung bei V307-Tanzintensität und V311-Fluidität/Fußkontakt-Schutz folgt derselben bestehenden Additive-Motion-Berechnung. Kameraentscheidungen und automatische FX-Grenzen werden mit den tatsächlich vorhandenen V306-/V310-Berechnungen abgeleitet. Der Modus macht die Bewegung und die visuelle Inszenierung anschaulich, nicht nur einen Schiebereglervergleich.

**Limitationen**: Der Beat ist eine deterministische Simulation. Das ist kein Abspielen des aktuell aktiven Spotify-Titels und kein zweiter vollständiger Sonic-Display-Show-Renderer. Eingebettete oder extern importierte GLB-Motion-Clips werden nicht automatisch abgespielt/retargeted, die vollständige Fuß-IK, die Track-Lyrics und manuelle Kamera-Keyframes werden nicht verdoppelt. Glättung und Fußschutz betreffen nur die reaktive Zusatzbewegung, nicht das gesamte Bewegungsverhalten eines importierten Clips. Die Preview kann nicht voraussagen, wie ein konkreter Song nach Übernahme exakt aussehen wird. Manche Unterschiede – insbesondere Wechsel von Kamerahaltezeiten oder Abwechslung – werden erst an musikalischen Phrasengrenzen sichtbar. V315 dokumentiert weiterhin die Diagnoseschwellen und Evidenzgrenzen.

## Verifikation
- `npm run test:v316` testet die reine Vorher-/Nachher-Projektion, veraltete Vorschläge, doppelte Felder, deaktivierte Systeme, Genre-Demo-Signale und die Integration des WebGL-Vergleichs.
- `npm run verify:offline` prüft bestehende Regressionstests und TS-/TSX-Syntax, ohne npm-Abhängigkeiten zu benötigen.
- `npm install && npm run verify` führt – bei verfügbaren Dependencies – den vollständigen TypeScript-Check und Next.js-Produktionsbuild aus. In der Erstellungslaufzeit konnten diese nicht abgeschlossen werden, weil die npm-Pakete nicht installiert sind.

V316 führt keine neue Bibliothek und keinen externen Dienst ein.
