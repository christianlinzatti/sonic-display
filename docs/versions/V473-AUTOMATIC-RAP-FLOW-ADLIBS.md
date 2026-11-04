# Sonic Display V473 — Automatic Rap Flow & Adlib Intelligence

## Überblick

Aufbauend auf V472 leitet Sonic Display **vorsichtige Rap-Bewegungshinweise** aus zeitlich synchronisierten Lyrics ab. V473 führt **keine Spracherkennung, Stem-Separation, automatische Sprecherzuordnung oder echte Betonungsanalyse** durch.

### Funktionsweise

- **Phrasenanfang:** Kurzer, gedämpfter Akzent zum Start einer tatsächlich synchronisierten Textzeile.
- **Dichte Rap-Passagen:** Nur bei mindestens drei plausiblen, echten Wort-Zeitstempeln innerhalb einer Zeile wird eine mittlere Wortdichte ermittelt. Ab etwa 4 Wörtern/s wird die bestehende Geste leicht verstärkt.
- **Langsamere Passagen:** Unter etwa 1,85 Wörtern/s wird die Geste leicht zurückgenommen.
- **Flow-Wechsel:** Wenn aufeinanderfolgende, ausreichend wortzeitgestempelte Zeilen deutlich unterschiedliche Raten aufweisen (mindestens Faktor 1,6 oder höchstens 0,625), erfolgt ein kurzer Wechselakzent. **Dies ist eine Schätzung der Textrate, keine Messung von Flow, Rhythmus oder Audio-Prosaik.**
- **Adlib-Hinweise:** Deutlich gekennzeichnete, kurze Einwürfe, etwa `(Yeah)`, `(Skrr)` oder `(adlib: ...)`, werden nur als *Textkandidaten* behandelt. Weder Sänger, Tonaufnahme noch eine zweite Stimme werden damit erkannt.
- **Zeilen ohne Wortzeitmarken:** Es gibt ausschließlich einen dezenten Zeilenbeginn-Akzent; es werden keine Wort-Timestamps, Flow-Geschwindigkeiten oder Adlib-Zeitmarken erfunden.

### Integration und Prioritäten

- `components/visualizer/rapFlowIntelligenceV473.ts` ist ein reines, deterministisches Modul ohne React- oder Three.js-Abhängigkeiten.
- `components/visualizer/ThreeAvatar.tsx` bindet die Zusatzschicht sowohl im **GLB-Knochenoverlay** als auch in der **prozeduralen Avatar-Darstellung** ein.
- Die bereits vorhandenen V472-Vocal-Cues einschließlich **trackgebundener Sängerrollen** werden nicht verändert oder neu zugewiesen. V473 passt lediglich die Winkel bestehender Gesten innerhalb kleiner Grenzen an (Kopf max. 0,055 rad, Brust max. 0,09 rad, Arme max. 0,11 rad).
- **Pause, fehlende Lyrics, nicht synchronisierte Lyrics, Instrumental, Nicht-Rap und Reduced Motion:** Keine V473-Zusatzeffekte.
- Bestehende **benutzerdefinierte Choreografien** bleiben führend; schwache V472-Akzente werden höchstens proportional angepasst, niemals hochskaliert zu einer eigenen Animation.
- Keine neue GLB-Datei, kein neuer Render-Pass, keine zusätzlichen Abhängigkeiten. Bei langen Lyrics werden maximal 120 Wörter je geprüfter Zeile betrachtet.

### Testen

```sh
npm run test:v473
npm run test:v473:types
npm run verify:v473
# nach npm install:
npm run typecheck
npm run build
```

`verify:v473` enthält V472–V467, Syntax-, Import- und Modul-Casing-Prüfungen. Im Offline-Arbeitsverzeichnis fehlen Next.js-/React-/Node-Abhängigkeiten; der vollständige TypeScript-Check wurde versucht, schlägt deswegen bei nicht auflösbaren externen Modulen fehl. Ein Next.js-Produktions-Build und echte Raspberry-Pi-GPU-Tests können daher hier nicht als bestanden ausgewiesen werden.

### Erweiterungsmöglichkeit

Für eine wirklich **audio-basierte** Flow-, Betonungs- und Adlib-Erkennung bräuchte es rechtmäßig zugängliche Audioanalyse oder separat gelieferte Vocal-/Wort-/Sprecher-Zeitmarken. Bis dahin bleibt das Verhalten bewusst konservativ.
