# Sonic Display V517 – Advanced Group Performance Director

## Ziel und Implementierung

V517 verfeinert Duette und Gruppen von **2–4 Charakteren** mit versetzten Reaktionen auf musikalische Phrasen statt jeder Rap-Silbe. Die Modulgrenze liegt in `components/visualizer/advancedGroupPerformanceV517.ts` und nutzt den bestehenden V452-Look-/Gesture-Pfad in `components/visualizer/GroupDancersV326SceneV492.tsx` und `components/visualizer/DanceFormationActorsV492.tsx`.

- **Deutschrap-Verses:** Visuell führende Figuren und Begleiter erhalten unterschiedliche, zeitversetzte Gesten. Bei Rap-Features helfen kurze Blicke zum **ausdrücklich zugewiesenen** aktuellen Sänger, ohne diesen durch Audioanalyse zu erraten.
- **Hooks:** Bei einer explizit verifizierten Hook-Rolle zeigt der Cast zurückhaltende, zeitlich abgestufte Akzente, alle schauen nach vorne. Visual-only Gruppen können einen V495-Hook/dropping Moment übernehmen, ohne Vocal-Identität zu behaupten.
- **Bestätigtes Handoff:** Nur ein vorhandenes, zum Track passendes V385/V416/V496-Zeitsegment darf den vorherigen Sänger mit einer kurzen Antwortgeste markieren.
- **Sicherheit:** Nur aktive Wiedergabe, gültiger Track, gültige Sänger-/V495-Rollen, Qualität `balanced` oder `high`, ohne Reduced Motion oder übergeordnete manuelle Choreografie. V506/V508-Risiko skaliert jeden Zusatzakzent herunter. Ausschließlich bei **automatischen** 3/4er-Gruppen werden minimale zusätzliche V495-abgeleitete `rotation.y`-Akzente berechnet (maximal 0,029 rad). Kein Root-Travel, keine neuen Positionsänderungen, keine eigene Bone-/Clip-/IK-/Hand-/Gesichts-/Lip-Sync-Steuerung.
- **Performance:** Der Planer ist rein, seek-reproduzierbar, und verwendet nur die bereits vorhandenen Frame- und Zeitquellen. Kein zusätzlicher Renderloop, keine Netzwerkzugriffe, keine npm-Abhängigkeiten. Ein aktueller vollständiger Next.js-Build ist ohne installierte npm-Abhängigkeiten nicht nachgewiesen.

## Tests und Grenzen

`npm run test:v517`: 38.000 deterministic 2–4 Avatar Frames mit authored/visual Lead, Deutschrap-Features, Handoffs, gemeinsamem Hook, Pausen, ungültigem Cast und Risiko-/Tier-Gates. `npm run test:v517:types` für den TypeScript-Kern. Historische Tests bleiben Teil von `build:preflight`.

**Keine automatische Sprecher- oder Reimerkennung.** Fehlen belastbare, trackgebundene Sprecherzuweisungen, kann nur der bereits bestehende rein visuelle automatische Gruppenlead verwendet werden; Duo-Vocal-Reaktionen bleiben aus. Die Qualität ist eine Begrenzung zusätzlicher Animationsoverlays, kein Nachweis physisch perfekter Choreografie. Die Raspberry-Pi-Performance und echte GLB-Bildqualität müssen lokal gemessen werden.
