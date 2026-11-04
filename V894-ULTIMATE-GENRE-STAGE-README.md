# V894 – Ultimate Genre Stage

**Vier neue virtuelle Bühnenarchitekturen** als optionale Instancing-Akzente auf der bestehenden 3D-Konzertbühne. Kein Austausch oder Überschreiben der gespeicherten Bühnenumgebung.

| Musikgenre / Look | Virtuelle Architektur | Palette |
|---|---|---|
| Deutschrap · Noir Skyline | Dunkle Seitentürme und Skyline-Lichtachsen | Mitternachtsblau / Magenta |
| Hardtekk · Reactor Grid | Symmetrische, geneigte Energieachsen | Neon-Cyan / Violett |
| Deutschrock · Arena Truss | Große Traversen, seitliche Backline-Rahmen | Amber / Rot |
| Pop · Prism Stage | Diamantrahmen und elegante Lichtlinien | Hellblau / Pink |

## Bedienung

**✦ LIVE FX → V894 Ultimate Genre Stage**: Automatische Genreauswahl oder eine der vier Bühnenwelten, Intensität 0–100, Übergänge (sanft/cinematic/festival), separate Architektur- und Lichtfarben-Schalter, Lyrics-Schutz, Vorschau und JSON-Export. Die Konfiguration wird im Browser unter `sonic-ultimate-genre-stage-v894` gespeichert.

Der Regiekern `components/visualizer/ultimateGenreStageV894.ts` akzeptiert **ausschließlich** bestätigte V604/V885-Szenen des aktuellen Songs. Die Szene wird auf die vorhandene V882-Playback-Brücke übertragen und gegen Song-ID, Länge, Pausen, Seeks und manuell geschützte Effektkanäle geprüft. Es werden weder neue Audio-Einsätze noch Sängerzuordnungen behauptet.

Die 3D-Ebene `components/visualizer/GenreStageArchitectureV894.tsx` nutzt **ein InstancedMesh mit maximal 32 Box-Instanzen** hinter den Künstlern und dem vorhandenen LED-Schirm. Bei aktivem Look entstehen höchstens ein zusätzlicher Draw Call und keine zusätzlichen Scheinwerfer, Schatten, Postprocessing-Pässe, WebGL-Materialien pro Frame oder Asset-Downloads. Das Layout wird nur bei einem Lookwechsel aktualisiert; bei Pause oder Blackout verschwindet die Ebene sofort. V894 ergänzt maximal 14 % Farbmischung auf die bestehenden automatischen Scheinwerfer und höchstens 7,7 % auf die vorhandenen LED-Wall-Farben. Geschriebene Lichtfarben, manuelle LED-Lanes, eine manuell abgeschaltete Bühne oder die Minimalumgebung bleiben unverändert.

Die Low-Tier-/Reduced-Motion-Modi deaktivieren die V894-Dekoration. Bei gesangsfokussierten Lyrics-Passagen sinken die Akzente auf 28 %. Die bisherige V885-Farbwelt und ältere V893-Publikumsregie bleiben bestehen.

## Tests und Grenzen

`npm run test:v894`, `npm run test:v894:types`, `npm run test:v894:ui-types` sowie `npm run verify:v894:focused`. Windows-Schnellprüfungen: `scripts/verify-v894-windows.ps1`. Die neue V894-Prüfung ist auch in die V832-Continuous-Validation-Workflow-Datei aufgenommen.

Der isolierte Test prüft nicht das tatsächliche WebGL-Bild. Für eine Produktionsfreigabe müssen außerdem **vollständiger TypeScript-Check, Next.js-Build sowie Browser/WebGL-Prüfung** mit installierten Abhängigkeiten erfolgen. Den konkreten Stand siehe `V894-VERIFICATION.md`.
