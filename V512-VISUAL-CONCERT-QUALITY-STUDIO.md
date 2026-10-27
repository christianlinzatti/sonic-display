# V512 – Visual Concert Quality Studio

## Funktion

Das neue `VisualConcertQualityStudioV512` im Bereich **3D-Renderdiagnose** zeigt einen responsiven, per Touch bedienbaren **schematischen Bühnenplan in Draufsicht** für zwei, drei oder vier Avatare. V512 behauptet **keine vollständige 3D-GLB-Vorschau**: Es zeigt explizit vereinfachte Positionen/Risikobereiche, nicht animierte Körper-Meshes. Diesen Unterschied kennzeichnen sämtliche Ansichten.

- **Live-Sitzung:** Reale Bühnen-Root-Positionen werden direkt aus den bereits vorhandenen Duo- und Group-Framepfaden mit den von V511 akzeptierten maximal 1-Hz-Messfenstern erfasst. Die vorhandenen V508-Risikowerte werden nur als Näherung **pro Avatar**, nicht als identifizierte kollidierende Körperteile, gezeigt. Bei unvollständig geprüften Paaren bedeuten leere Risikowerte *unbekannt*, nicht *sicher*. Maximal 45 flüchtige Einträge; kein Upload oder Langzeitspeicher.
- **Demo:** Zwei bis vier schematische Avatare, manuell scrubbbarer Zeitverlauf für Duett, kreuzende Wege und Formationswechsel. Risiken stammen aus einer klar gekennzeichneten einfachen Distanz-**Simulation**, nicht aus GLB-Knochen.
- **Vergleich:** Für High, Balanced und Low die rein mathematischen Obergrenzen der **optionalen** Knochenabtastung gemäß V511, mit wählbarem hypothetischem Pi-Profil aus/Balanced/Eco. Kein FPS-Versprechen; die tatsächlichen Quality-/Pi-Einstellungen ändern sich nicht.

## Datenfluss und Priorität

`DanceFormationActorsV492.tsx` und `GroupDancersV326SceneV492.tsx` reichen aktuelle Bühnenpositionen **zusätzlich** an `recordStageSafetyV511` weiter. `concertStageQualityRuntimeV511.ts` veröffentlicht einen V512-Eintrag **nur, wenn V511 bereits einen gültigen 1-Hz-Eintrag akzeptiert hat**. Der neue Store `visualConcertQualityRuntimeV512.ts` enthält ausschließlich endliche, begrenzte Messwerte. `visualConcertQualityV512.ts` validiert, speichert und transformiert höchstens 45 Einträge; SVG-Darstellung und UI-Regler laufen ausschließlich beim Betrachten des Diagnose-Tabs. Keine neuen `useFrame`-Loops, Audio-/Render-Worker oder GLB-Klon-Animationen.

**Nicht betroffen:** importierte Motions, Lippen- und Gesichts-Rigs, Fuß-IK, Körperkapseln, Root-Translationen, manuelle Choreografien, Sängerzuweisung, Kamera und Beleuchtung. Insbesondere sind die 3 Qualitätsstufen in V512 ausschließlich eine **Anschauungsrechnung**; V511/V508 behalten die Kontrolle über die echte Kollisionsabtastung. Unter Low erfolgen keine optionalen Kapselprüfungen. „Nicht geprüft“ darf nie zu „keine Kollision“ werden.

## Tests

`npm run test:v512` testet 36.000 deterministische Live-History/Storyboard-Abläufe, Validierung ungültiger Positionen/Zeiten, 2–4 Figuren, vollständige/teilweise/fehlende Messungen, Demo-Bewegungen, UI-Verbindung und Pi-Qualitätsvergleich. `npm run test:v512:types` prüft den reinen Kern. `npm run check:syntax`, `npm run check:architecture`, ältere Tests und `npm run build` sind getrennte Prüfungen. Für den vollständigen Produktionsbuild sind installierte Projektabhängigkeiten erforderlich.
