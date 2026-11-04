# Sonic Display V509 – Natural Ensemble Choreography

## Implementierung

V509 baut bewusst auf der vorhandenen automatischen V495-Formationsregie auf, statt neue Motion-Clips, einen zweiten `useFrame` oder einen IK-Solver einzuführen. Der reine Planer `components/visualizer/naturalEnsembleChoreographyV509.ts` erzeugt pro Bühnen-Slot kleine, zueinander versetzte musikalische Gesten und Blickakzente. Die Phase hängt vom Playback-Takt mit ca. acht Beats pro Bewegungsbogen ab, nicht von einzelnen Silben. Die vorhandene V495-Regie bestimmt den **visuellen** Lead, ohne ihn als tatsächlich singenden Künstler auszugeben.

- **Automatische 3-/4er-Bühnen:** Lead-/Begleiter-Reaktionen bei Versen, dezente gemeinsame Hook-Akzente und stärkere Drop-Phase; keine X-Lane-Wechsel. Bis zu ca. 5 cm angeforderter Tiefenakzent (Z) wird erst durch `safeEnsembleTravelV509` begrenzt und kann **maximal 2 cm** betragen; die effektiven Bewegungen sind mit gewöhnlichen Fußkontaktfaktoren noch kleiner. Das gespeicherte V326-Formationsziel bleibt unverändert.
- **Duo:** Nur wenn V504 über ausdrücklich vorhandene, passende V416/V496-Sänger-Timestamps aktiv ist, gibt es zusätzliche zeitversetzte Arm-/Blickreaktionen. V509 verändert **keine Duo-Wurzelposition**. Die bestehenden V506-/V508-Kollisionsregeln verarbeiten diese Gesten danach.
- **Sicherheit:** Gruppengesten werden bereits vom fusionierten V506-/V508-Risiko abgeschwächt. Ist Risiko ≥ 0,12, kann V509 keinen Zusatz-Tiefenversatz auslösen. Auch manuelle Regie, abweichende/fehlende Track-ID, Pause, Reduced Motion, Low-Tier, unplausible Positions-/Audiodaten oder ungültige Foot-IK-Signale sperren die jeweilige Ergänzung. Kein Überschreiben von GLB-Mixer, Knochen, Lip-Sync, Handkontakt, Import-Choreografien oder V494-IK.
- **Leistung:** Deterministischer O(n) Plan pro bestehendem Gruppen-Frame für maximal vier Slots, keine neuen Timer/Worker, Abhängigkeiten oder React-State-Updates. Auch bei V509 ist keine vollständige Mesh-Kollisionsgarantie möglich.

## Prüfungen

```powershell
npm run test:v509
npm run test:v509:types
npm run test:v508
npm run test:gltf-hook-split
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Der V509-Test deckt 36.000 deterministische Drei-/Vierer-Abläufe, Rollenkohärenz, Duo-Trackbindung, Intensitätsstufen, Kollisionsrisiko, Fußkontaktfreigabe, manuelle Sperren und die tatsächlichen Renderpfade ab. Isolierte TypeScript-Tests ersetzen nicht den vollständigen Produktionsbuild mit installierten Next.js-/React-/Three-Paketen. Visuelle Prüfung mit zwei und vier echten GLB-Avataren wird empfohlen.
