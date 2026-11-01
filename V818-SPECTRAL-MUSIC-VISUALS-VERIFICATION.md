# Sonic Display V818 — Spectral Music Visuals

## Ausgangsbasis

V817 (`sonic-display-v817-kinetic-stage-foam-cannon.zip`). Alle Funktionen V810–V817 bleiben enthalten, inklusive virtueller Schaumkanone. Version und Lockfile wurden auf `0.1.0-v818` erhöht.

## Umsetzung

- `components/visualizer/spectralMusicPlannerV818.ts`: unabhängige, deterministische, durch V810 geprüfte Spektral-Effekt-Cues aus vorhandenen `bass`, `mids`, `highs` und `energyEnvelope` Werten. Keine erfundenen Kick-/Drop-Trigger, keine eigene Zeituhr.
- `components/visualizer/SpectralMusicVisualsV818.tsx`: drei GPU-instanzierte 3D-Meshes: maximal 12 liegende Basswellen, 20 vertikale Frequenzringe und 48 dynamische Audio-Säulen. Maximal drei zusätzliche Draw-Calls; Instanzdaten im aktiven Zustand höchstens alle 50 ms aktualisiert. Keine neuen Echtzeitlichter, Schatten, 3D-Modelle oder dynamischen Geometrieallokationen je Frame.
- `components/visualizer/DynamicStage.tsx`: Anbindung an die vorhandene verifizierte V810/V604/V761-Konzertraumregie und das V640-LED-Performancebudget. Automatische Abschaltung bei Pause, Blackout, manueller Lichtübernahme, Reduced Motion, unbestätigtem Songabschnitt oder Low-Performance-Tier.
- Concert FX Studio: einzelne Schalter für Basswellen, Frequenzringe, 3D-Audio-Säulen sowie eine Intensitätsregelung (0–100 %) und klar als Simulation gekennzeichnete Preview. Migration alter Einstellungen via V810-Normalisierung, ohne Reset der übrigen FX-Werte.
- Genre-Stimmung: Hardtekk/Hardstyle kräftig, Deutschrock dynamisch, Deutschrap zurückhaltend. Reale gemessene Signalwerte steuern die Bewegung und Helligkeit. Reduzierte Helligkeit bei Lyrics, Nahaufnahmen und Gruppenaufstellungen. Die Bühnenmitte bleibt geometrisch frei.
- Behoben: bereits vorhandene Windows-/Linux-Dateinamenkollision von `ConcertFxStudioV810.tsx` und `concertFxStudioV810.ts`. Die UI-Datei heißt nun `ConcertFxStudioPanelV810.tsx`. Einstellungen, Tests und Architekturverweise wurden entsprechend angepasst; der exportierte Komponentenname bleibt identisch.

## Erfolgreich geprüfte Schritte

- `npm run test:v818`: 20 Gruppen, **PASS**.
- `npm run test:v818:types`: strikte isolierte TypeScript-Prüfung der V810/V818-Planer, **PASS**.
- V800–V811 Regressionen: **PASS** nach Erweiterung historischer, hartkodierter Versionsprüfungen (nur das erlaubte Release-Suffix, keine produktiven Test-Assertions verändert).
- V812–V818 FX-Regressionen: **PASS**, einschließlich nach der UI-Dateiumbenennung für V812 sowie V815–V818. Für V813–V814 wurden die unveränderten produktiven Tests vor der Umbenennung ebenfalls erfolgreich durchgeführt.
- Weitere isolierte TypeScript-Prüfungen: V809/V810/V815/V816/V817 **PASS**.
- `npm run check:syntax`: **PASS**, 1.177 TS-/TSX-Dateien.
- `npm run check:architecture`: **PASS**, 876 referenzierte Dateien.
- Geprüft: keine case-insensitiven `.ts`/`.tsx`-Basename-Kollisionen im `components`-Baum.
- `package.json` und `package-lock.json` sind auf dieselbe Version gesetzt. V818 ist an den schnellen, obligatorischen und Produktionsvorlauf-Prüfketten beteiligt.

## Nicht erfolgreich abschließbar — kein produktiv freigegebenes Release

- Vollständiges `npm run typecheck` (`tsc --noEmit`): **nicht abgeschlossen**, der Versuch überschritt die Ausführungszeit. Es liegt daher kein vollständiger Projekt-Typnachweis vor.
- Produktionsbuild `npm run build`: **nicht ausgeführt / nicht bestätigt**, da in dieser Umgebung `next`/die Projekt-`node_modules` nicht installiert sind und der vorherige vollständige TypeScript-Lauf nicht abgeschlossen werden konnte.
- Reale WebGL-/GPU-Sichtung mit GLB-Avataren, Lippenanimationen, Lyrics, Zoomkameras und echtem Audiostream: **offen**. Die FX-Studio-Vorschau verwendet künstliche *Vorschaudaten*, nicht tatsächliche Audio-/Spotify-Messungen.
- Ein Gesamtprofil der GPU-Last aller parallel aktivierten FX-Layer ist ebenfalls **offen**. Die dreifache Instanzierung ist eine theoretische Lastobergrenze, keine gemessene FPS-Garantie.

## Lokale Freigabechecks (Windows 11)

```powershell
npm ci
npm run test:v818
npm run test:v818:types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Anschließend ganze Songs in Deutschrap, Hardtekk und Deutschrock visuell kontrollieren, insbesondere vier Sänger gleichzeitig, lange Lyrics, Schaum-/Laser-/LED-Kombinationen, Performance/Balanced/Ultra, pausierte Wiedergabe, Seek, Blackout und benutzerdefinierte Licht-Timelines.
