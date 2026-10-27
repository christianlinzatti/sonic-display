# Sonic Display V502 – Smart Concert Dynamics

## Neu in V502

Eine neue **gemeinsame, reine Regiefunktion** `components/visualizer/smartConcertDynamicsV502.ts` verknüpft die bereits vorhandene V318-Songstruktur mit den bestehenden Bühnen-Komponenten. Sie erzeugt **keine** Musik-/Sprecher- oder Phonem-Erkennung und verändert keine Spotify-Cues, synchronisierten Lyrics, GLB-Animationsdateien oder gespeicherten Presets.

- **Deutschrap:** etwas mehr Dynamik bei Hooks, ruhigerer Fluss bei Verse und Break; die bestehenden Gesten- und Sängerzuordnungen bleiben unverändert.
- **Hardstyle:** zurückhaltender Verse und stärkerer Drop; es werden keine Drops erdacht, die nicht bereits von V318/Live-Analyse geliefert wurden.
- **Hardtekk:** rhythmischerer Grundfluss und etwas stärkere Build-/Drop-Akzente.
- **Gemeinsamer Playback-Takt:** Dance-Ranking-Energie/Animationsintensität, vorhandene Kamera-Direktor-Stärke, aktiviertes reaktives Bühnenlicht und dezenter 2D-/3D-Lyrics-Kontrast folgen einer gemeinsamen Entscheidung.
- **Übergang:** Bei *explizit beschrifteten importierten Abschnittsmarken* beginnt der zusätzliche Effekt neutral und wächst über 750 ms per Smoothstep. Live geschätzte Abschnitte werden schwächer (40 % der vorgesehenen Accent-Stärke) behandelt.

## Sicheres Verhalten

- Ohne Track, ohne Wiedergabe, bei Reduced Motion, bei fremden Genres und ungültiger Zeit werden keine Zusatzakzente ausgegeben.
- Bei autorisierten manuellen Dance-/Kamera-Eingriffen oder ausgeschalteten Lichtern werden entsprechende Multiplikatoren 1 zurückgegeben. Es wird nichts automatisch aktiviert.
- Vorhandene Mikrofonberechtigungen, Kamera-Locks/Editoren, V498-/V499-Sängerwechsel, V500-Duette, V501-Karaoke-Fill und Text-Timestamps bleiben unverändert.
- Die Qualitätseinstufung aus `getActivePerformanceTier()` verringert Zusatzakzente auf schwachen Geräten; im Low-Modus werden zusätzliche Lyrics-Akzente ganz abgeschaltet.
- Effekte sind gedeckelt: Dance 0,88–1,12; Camera 0,91–1,095; Light 0,90–1,11 und Lyrics-Accent 0–0,12.
- `Lyrics3DScene.tsx` fügt keine weiteren Textmeshes oder Render-Loops hinzu. V502 benötigt keinen neuen Speicher, keine API-Aufrufe und keinen externen Cloud-Dienst.

## Tests und Grenzen

```powershell
npm run test:v502
npm run test:v502:types
npm run test:v501
npm run test:v500
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

`npm run test:v502` prüft deterministische Genre-/Section-Prioritäten, manuelle Guards, Pausen, Seek-Anfänge, Performance-Tiers, Grenzen, tatsächliche Integration in 2D-/3D-Lyrics und **18.000** deterministische Zeitpunkte. Das ist kein Ersatz für einen echten Next.js-Produktionsbuild oder visuelle Tests auf Raspberry Pi und GLB-Avataren. Auch die Echtzeit-Abschnittsschätzung ist keine autoritative Künstler-/Songanalyse.
