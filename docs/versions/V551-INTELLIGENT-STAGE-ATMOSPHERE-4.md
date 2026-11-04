# Sonic Display V551 – Intelligent Stage Atmosphere 4.0

## Umsetzung

- **Neue rein deterministische Atmosphärenregie** `components/visualizer/intelligentStageAtmosphereV551.ts`: ergänzt die existierenden V462- und V542-Lichtbudgets ohne neue Lichtquellen, Materialobjekte, Shader oder Render-Schleifen. Die Verstärkungen sind absichtlich klein und auf Low-/Balanced-/High-Tier abgestimmt.
- **Deutschrap-Solo und Feature-Übergabe:** vorhandenes Key-/Fill-Licht bleibt ruhig; bei einer V528-bestätigten Sängerübergabe zielen die zwei bestehenden V308-Spots (auf High-Tier) auf die tatsächlich gemessenen Bühnenpositionen des vorherigen und neuen Sängers. Die Körperpositionen werden aus den vorhandenen `v377-vocal-stage-slot-*`-Objekten gelesen. Fehlende/unsichtbare Objekte werden nicht erraten; die bisherige Bewegung bleibt erhalten.
- **Gemeinsame Hooks:** auf V528-bestätigte singende Gruppenrollen verteilt, nicht einfach auf jeden sichtbaren Tänzer. Selektive V547-Hooks bleiben korrekt: es werden keine Sänger erfunden, wenn V528 für die konkrete Konstellation keinen verifizierten Cue liefert.
- **Hardstyle / Hardtekk:** Drop-Atmosphäre wird nur bei vorhandener Kick-/Energie-Evidenz intensiver. Ohne valide Kick-Evidenz keine künstlichen Drop-Impulse.
- **Nebel-Evolution:** die vorhandene `THREE.Fog`-Instanz wird innerhalb ihrer Eigentümer-Komponente behutsam über `near/far` angepasst. Bei Pause oder Wegfall der Evidenz nähert sie sich der normalen V308-Dichte. Nur die eigene Fog-Instanz wird verändert, fremde Szenen-Fog bleibt unangetastet.
- **Lyrics-/Gesichtsschutz:** Lyrics erhalten Vorrang gegenüber Nebel, Beam-Helligkeit und Schwenks. Manuelle Licht-Szenen/Timelines, Blackouts, Reduced Motion, pausierte/nicht-reaktive Shows und der Low-Tier deaktivieren V551. Keine Laser, Strobes, Flash-Synchronisation oder zusätzliche Postprocessing-Pipeline.

## Verifizieren

`npm run verify:v551`, unabhängig `npm run test:v551 && npm run test:v551:types`; mit lokal installierten Abhängigkeiten `npm install && npm run typecheck && npm run build`.

Der deterministische Test prüft 12.150 Kombinationen von Genre, Abschnitt, Cast, Performance-Tier, Lyrics und Energie sowie bewusste Deaktivierungen und ungültige Sängerzuordnungen. **Kein Ersatz** für den Next.js-Produktionsbuild, die echte visuelle Browser-Prüfung, GPU-Leistungswerte oder die Prüfung auf einem Raspberry Pi.

Die bisherigen GLB-Modelle und gespeicherten Choreografien werden nicht geändert; Original-GLBs sind weiterhin nicht im Quell-ZIP enthalten.
