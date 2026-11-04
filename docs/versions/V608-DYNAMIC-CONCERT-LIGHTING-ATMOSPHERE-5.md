# V608 – Dynamic Concert Lighting & Atmosphere 5.0

**Grundlage:** V607. **Datum:** 26.10.2026. **Status:** Echt in die Licht-Runtime integriert; Offline-Regression. Visuelle Abnahme offen.

## Ziel

Sonic Display soll einen ganzen Track mit bewusst komponierten Lichtstimmungen begleiten – nicht nur zufällig beatreaktiv flackern. Deutschrap erhält klare, zurückhaltende Strophen; bei ausdrücklich bestätigten Sängerübergaben wandert der vorhandene Spotlight-Fokus; Hooks werden im Verlauf des Songs abwechslungsreicher. Bei Hardstyle-/Hardtekk-Drops steigern sich die vorhandenen Lichtanteile nur, wenn ein echter Kick/Energie-Messwert vorliegt. Lyrics bleiben jederzeit besser lesbar als die Effekte.

## Tatsächliche Integration

1. Neue reine Funktion `planDynamicConcertLightingV608` in `components/visualizer/dynamicConcertLightingV608.ts`. Sie nimmt die vom bestehenden V604-/V600-System abgeleitete **verifizierte** Aktfolge samt aktuellem Cue, das geteilte `lightingPlayback`-Snapshot, die bestätigte Live-Sektion und den bereits von V551 validierten Sängerfokus entgegen. Ein fremder Track, falsche Dauer, fehlender Akt, abschnittsfremde Section oder undefinierte Zeit ergibt exakt neutrale Multiplikatoren.
2. `components/visualizer/ThreeAvatar.tsx` reicht den schon vorhandenen `cameraNarrativeV605` und den `cameraDirectorSection` an `components/visualizer/DynamicStage.tsx` weiter. Keine neue Zeitschätzung.
3. `DynamicStage.tsx` berechnet während des **bereits vorhandenen** Renderloops den V608-Plan und moduliert konservativ die bestehenden Key-/Fill-/Beam-/Sweep-Werte. Obergrenzen und bisherige Licht-Timeline-Priorität bleiben maßgeblich.
4. `components/visualizer/ConcertAtmosphereRendererV308.tsx` verwendet denselben Plan für seine existierenden Beam-/Spotlight-/Haze-Shader-Intensitäten, die bestehende Fog-Sichtweite sowie die bereits bestätigte V551-Spotlight-Ausrichtung auf echte sichtbare Performer-World-Positionen. Kein neuer Renderpass, Shader, Fog-Controller, Schatten oder Spot.

## Ausdruck und Schutz

- Verse: ruhige Beams und Sweeps, leicht verbessertes Gesichtslicht, zurückgenommener Haze.
- Build: kleine, an vorhandene Audioenergie gekoppelte Steigerung.
- Hooks: erste Wiederholung bevorzugt Bühnen-Weite, nächste stärker bestätigte Spotlights; das wiederholt sich kontrolliert, ohne neue Sängerrollen.
- Drop: explizite Abschnittsmarke **plus** gemessener Kick und Energie, nie nur Genre allein. Keine Stroboskop- oder Laser-Erzeugung.
- Duett/Sängerwechsel: nur über den alten, bereits geprüften V551-Cast. Fehlt einer der bestätigten Slots, gibt es keine neue Fokusbehauptung.
- Finale: zusätzlich nur, wenn V604 die Ending-Struktur explizit absichert.
- Dichte Lyrics: Haze, Sweep und zusätzliche Spots werden zurückgenommen, die Key/Fill-Lesbarkeit wird priorisiert.
- Manuelle Timelines, Blackouts, reduzierte Bewegung, Pause, Pi-Low-Tier, deaktivierte Reaktivität, ungültige Track-IDs und Zeitpositionen bewahren das alte Verhalten.

## Prüfen

```bash
npm run test:v608
npm run test:v608:types
npm run test:smoke:v608
npm run verify:v608
```

**Grenzen:** Der TypeScript-Core-Test überprüft die neue reine Regielogik; Offline-Tests und Syntaxscan ersetzen nicht den kompletten Next.js-Produktionsbuild. Spotify-Vocal-Detection, reale GLB-Wahrnehmung, Lichtstärken in physischer Hardware, FPS/Temperatur und tatsächliche Gesamtsong-Qualität wurden hier nicht empirisch gemessen. Für diese Abnahme die V592-/V603-Benchmark-Tools in einem echten Browser nutzen.
