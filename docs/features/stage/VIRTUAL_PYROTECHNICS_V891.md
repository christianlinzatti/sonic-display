# Sonic Display V891 – Virtual Pyrotechnics

## Neu

- **3D-Flammen:** Maximal sechs instanzierte, warme Flammen-Kegel links und rechts am Bühnenrand.
- **Virtuelle CO₂-Jets:** Maximal 14 dezente, aufsteigende Partikel. Wenn bereits die V844-CO₂-Show läuft, erzeugt V891 keine zweite Wolke.
- **Funkenfontänen:** Maximal 18 kleine virtuelle Funken im 3D-Raum.
- **Show-Regie:** Build-up → Jets, Drop → genreabhängig Flammen/Jets, Hook → Funken/Jets, Finale → Funken. Keine neuen Beats oder Gesangseinsätze werden erfunden.
- **LIVE FX DECK:** Master-Schalter (standardmäßig **aus**), Einzelschalter, Effektwahl, Cinematic/Balanced/Festival, Intensität, Lyrics-Schutz, JSON-Export.

## Verhalten und Prioritäten

Die automatische Auswahl benötigt eine gültige, **verified-v604**-Szenen-Timeline mit passender Track-ID und Songlänge. Pro bestätigtem Abschnitt entsteht höchstens ein kurzer Akzent von etwa 1,85–2,4 Sekunden. Freie Abschnitte bleiben ruhig. Manuell gewählter Stil ist eine *Vorgabe für bestätigte Momente*, kein unbegrenzter manueller Pyro-Trigger.

Bei Pause, Trackwechsel, Seek-Sperre, Blackout, manueller Beleuchtung, manuell ausgelösten FX, aktiver gespeicherter Partikel-/Schaum-Timeline, Low-Tier oder reduzierter Bewegung wird die virtuelle Pyro unmittelbar deaktiviert. Der Lyrics-Schutz ist standardmäßig aktiviert. CO₂ wird bei bereits aktiver V844-Emission nicht verdoppelt.

**Rein virtuelle Grafiken:** keine Pyrotechnik, kein Gas, kein Gerät, keine DMX-/USB-/Netzwerk-Befehle, kein Stroboskop und keine echten Flammen. Drei feste, schattenlose 3D-Emitter mit begrenzter Instanzanzahl; keine per-Frame-Objektallokation.

## Prüfen unter Windows

```powershell
npm ci
npm run verify:v891:focused
npm run typecheck
npm run build
npm run dev
```

Der isolierte TS-Check verwendet Test-Stubs **nur** in den Test-tsconfigs. Ein erfolgreiches `test:v891:ui-types` beweist keinen vollständigen Produktionsbuild. Ein echter Browser-/WebGL- und Performance-Test ist zusätzlich erforderlich.
