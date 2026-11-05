# V977 – Smart Concert Storytelling

## Idee und Umsetzung

Sonic Display erhält einen dramaturgischen Bogen **über die tatsächliche Position eines Songs**. Die virtuelle Regie verbindet den vorhandenen **V975 Adaptive Concert Energy Director** und die **V976 Intelligent Concert Transitions**, ohne die Songanalyse oder die Kamera-Regie zu ersetzen.

Die reine Funktion `lib/concertStorytellingV977.ts` (`applyConcertStorytellingV977`) verarbeitet ausschließlich die aktuelle, bestätigte V318-Songsektion. Sie erzeugt **keine** prognostizierten Verse, Hooks oder Drops und verwendet weder Netzwerk- noch Audio-Polling.

- **Opening:** ein zurückhaltender Einstieg in den ersten ca. 18 % des Songs.
- **Journey:** langsame Energieentwicklung über den Songverlauf; bereits identifizierte Verse bleiben fokussiert.
- **Rising:** vorhandene Build-Abschnitte erhalten einen langsamen Spannungsanstieg.
- **Crest:** vorhandene Hooks und Drops werden stärker gewichtet. Nur bestätigte, bereits aufgetretene Hooks sorgen für leichte Refrain-Varianten.
- **Breather:** verifizierte Break-Abschnitte werden ruhiger, ohne neue Abschnitte zu erfinden.
- **Finale:** ausschließlich in einem verifizierten Outro, wenn der bestehende Szenen-Composer den tatsächlichen Song-Endbereich bestätigt hat.

Ein weicher Anfangs-/End-Envelope pro bestätigter Sektion verhindert harte Lichtwechsel. V976 kann weiterhin den tatsächlichen Wechsel zwischen angrenzenden Abschnitten glätten. Die normale Kamera, vorhandene V354-Timeline, Avatar-Choreografie und der Genre-Preset bleiben maßgeblich. Lichtintensität, Spotlight und virtuelle Light-Gain bleiben streng begrenzt; die Effektliste darf höchstens drei Einträge enthalten.

Optionale Akzente ergänzen für den kurzen Mittelteil passender realer Hooks, Drops oder eines Outros **nur bereits existierende, preiswerte virtuelle Sweep-/Fog-Effekte**. Keine neuen Shader, Draw-Loops, Stroboskope oder Befehle an physische Laser. Bei sichtbaren Lyrics und bei aktiviertem V960-Kompatkt-FX werden keine zusätzlichen Akzente gesetzt.

## Konfiguration

Im **Ultimate Concert Experience Studio**:

- `storytellingV977` – standardmäßig aus, damit alte Konfigurationen unverändert funktionieren.
- `storytellingModeV977`: *Dezent*, *Filmisch*, *Festival*; standardmäßig *Filmisch*.
- `storytellingStrengthV977`: 0–100 %, standardmäßig 60 %.
- `storytellingAccentsV977`: optionale kurze, ruhige Akzente; standardmäßig an, aber nur wirksam, wenn Storytelling explizit eingeschaltet wurde.

Die bestehenden V958-LocalStorage-Keys und das Schema bleiben unverändert; neue Einstellungen werden beim Laden validiert und normalisiert.

## Sicherheits- und Performance-Prinzipien

Die Funktion ist **nur** für laufende Wiedergabe mit einer bestätigten V318-Sektion (Konfidenz ≥ 0,5) aktiviert. Gespeicherte manuelle Bühnen-Cues, manuelle V958-Timeline-Overrides, Low-Performance-/Raspberry-Pi-Eco-Profil, reduzierte Bewegung, angehaltene Wiedergabe und ungültige Metadaten deaktivieren die Storytelling-Stufe. Govee-LAN, Alexa, Spotify und Raspberry-Pi-Bridges bleiben unverändert.

Kein eigener Timer, keine zusätzliche R3F-Render-Schleife, kein `requestAnimationFrame`, keine neuen Mesh-Typen und keine I/O-Seiteneffekte. Das Ergebnis hängt ausschließlich von denselben analysierten Eingaben ab und bleibt beim Suchen/Zurückspulen reproduzierbar.

## Tests und Freigabe

```bash
npm run test:v977
npm run test:v977:types
npm run verify:v977:focused
```

Die Prüfgates `scripts/v931-production-gate.cjs` und `scripts/vercel-production-build.cjs` führen die neue Regression und den isolierten TypeScript-Check mit aus. Die vollständige Produktionsfreigabe verlangt zusätzlich **Node 24**, `npm ci`, `tsc --noEmit` und einen echten `next build` in GitHub Actions/Vercel. Die lokale isolierte Typprüfung und die Regressionen allein ersetzen den vollständigen Produktionsbuild nicht.

### Installation

`releases/SonicDisplay-V977.zip` in `master` hochladen. Der gemergte V974-Importer validiert den Marker `v977`, übernimmt Projektdateien, entfernt nur entsprechende veraltete Git-Quellpfade und schützt `.github/`, `docs/` und Nutzerdaten. Die ZIP enthält weiterhin Alexa und die Windows-/Raspberry-Pi-Govee-Bridge.
