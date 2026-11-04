# Sonic Display V882 – 3D Concert Sync & Live Performance Accents

Vollversion, direkt auf der bereitgestellten V881 aufgebaut. **Alle V881-Funktionen bleiben enthalten.**

## Neu in V882

1. **Live FX → echte 3D-Bühne:** Die V881-Bass-Welle erzeugt einen animierten
   Floor-Ring direkt im React-Three-Fiber-Konzert; die Konfetti-Taste startet
   zwölf kleine 3D-Elemente als *ein* instanziertes Mesh. Keine Geometrie- oder
   Material-Erzeugung im Frame-Loop. Ein bestätigter `drop` kann außerdem
   eine einzelne, deutlich schwächere Bodenwelle zum Szenenbeginn auslösen.
2. **Spotlight-Sync:** Der manuelle Arena-Sweep bewegt das **vorhandene**
   Schatten-freie Bühnen-Spotlight mit weichem Auslauf. Verifizierte Neon-,
   Arena- und Aurora-Szenen geben eine kleine zusätzliche Strahlintensität.
   Eine manuell gesetzte Licht-Timeline / Blackout, Sängerspot-Fokus oder
   geschützte Lyrics behalten Vorrang. Kein Strobo, kein Bildschirmblitz.
3. **Tänzer-Akzente:** In validierten Hooks/Drops und kurz bei manuellen
   Show-Akzenten wird die **bestehende automatische** Avatar-Animationsintensität
   maximal um 12% erhöht; kein neues Dance-Rig, keine erfundene Choreografie
   oder Sängererkennung. Manuelle Tanzpresets, Timeline, Clip-Blend und
   Tanz-Qualitäts-Overrides werden nicht verändert.
4. **Drei getrennte Schalter:** Im Live-FX-Deck das Fieldset **V882
   Konzert-Synchronisation** öffnen: `3D-Bühneneffekte`, `Lichtregie koppeln`,
   `Automatische Tänzer-Akzente`. Die Optionen werden unter
   `sonic-concert-sync-v882` unabhängig von V881 gespeichert.
5. **Sicheres Zusammenspiel:** Die V881-verifizierte V763/V604-Szenenquelle und
   die existierende Song-Uhr der Bühne sind Voraussetzung für Auto-Momente.
   Ohne diese Quelle können weiterhin die drei V881-Tasten manuell genutzt
   werden. Song-/Dauerfehler, Pause, Seek, ausgeschalteter Master, reduzierte
   Bewegung und Blackouts schalten die 3D-Zusatzkanäle ab. Die niedrige
   Render-Qualitätsstufe unterbindet sämtliche neuen 3D-Kanäle; das leichte
   2D-Deck funktioniert weiterhin.

### Wichtige Einschränkung

Die V882-Zusatzmodule sind nur auf der **3D-Avatar-Bühne** sichtbar. Andere
Visualizer-Modi behalten die bisherigen V881-2D-Effekte. V882 analysiert
keine Audio-Stems, verifiziert keine gesungenen Stimmen, ändert keine
Kamera-Timelines und greift nicht in die Spotify-Wiedergabe ein.

## Installation (PowerShell)

```powershell
npm ci
npm run verify:v882:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ als ein Windows-Gate mit Node-PATH-Absicherung:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-v882-windows.ps1
```

Bei erfolgreichem `npm run dev`: einen Song in Spotify starten, unter Einstellungen
als Visualizer-Modus die Avatar/3D-Bühne aktivieren, `✦ LIVE FX` öffnen und
Bass-Welle/Arena Sweep/Konfetti testen. Im selben Panel die drei V882-Schalter
getrennt aktivieren oder deaktivieren. Bei niedriger GPU-Stufe wird aus
Performance-Gründen nur das V881-Overlay dargestellt.

## Nachweisstatus

Siehe `V882-VERIFICATION.md`. Die fokussierten Unit-, Core- und isolierten
UI-Type-Checks sind bestanden. Der vollständige Next.js-Produktionsbuild
ist in dieser Entwicklungsumgebung **nicht bestätigt**, weil abhängige
npm-Pakete im Cache fehlen. Eine produktive Freigabe erfordert `npm ci`,
`npm run typecheck` und `npm run build` auf einem vollständig installierten PC
oder in CI sowie einen tatsächlichen Browser-/GPU-Showtest.
