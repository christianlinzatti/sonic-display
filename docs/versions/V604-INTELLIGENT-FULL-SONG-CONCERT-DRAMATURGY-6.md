# Sonic Display V604 – Intelligent Full-Song Concert Dramaturgy 6.0

## Ziel

Die **gesamte** Konzertshow erhält einen konsistenten Spannungsbogen: dichte Rap-Strophen mit kontrollierten Akzenten, nachgewiesene Build-ups als sanfte Steigerung, verschiedene Hooks mit unterschiedlichen Motiven, gemessene Pausen bzw. bezeichnete Breaks ruhiger und ein belegter Schlussabschnitt als Finale-**Dramaturgie**. Kein bloßes Aneinanderreihen gleicher Shots.

## Umsetzung

1. **Trackgebundener Gesamtablauf:** `planFullSongDramaturgyV604` verarbeitet nur die bereits hochkonfidenten, gültigen, nicht überlappenden V600-Akte. Keine eigenen Hook/Drop/Verse-Schätzungen, keine künstliche Sängererkennung, keine erfundenen Phoneme.
2. **Wiederholte Hooks:** Jede verlässlich als Hook oder Drop markierte Wiederholung erhält eine andere, deterministische Dramaturgie (`portrait`, `dialogue`, `ensemble`, `wide`, `breath`, `crescendo`). Diese Bezeichnungen sind **Regiemotive**, keine Anweisung zum Ändern einer Kamerapose.
3. **Sanfte Übergänge:** Die kleine, zusätzliche V604-Modulation von Tanz, Kamera und Licht wird über bis zu 2,4 Sekunden an Anfang und Ende jedes Abschnitts ein-/ausgeblendet. Das bestehende V600-Niveau bleibt die Basis; keine Szene verursacht durch V604 selbst einen plötzlichen Sprung. Andere Regiesysteme können weiterhin eigene Übergänge steuern.
4. **Echte Song-Endnähe:** Nur wenn mindestens vier belegte Akte vorliegen und der letzte erst in den letzten 25 % beginnt und bis höchstens 1,5 Sekunden vor Trackende reicht, wird ein `ending-arc` geplant. Das ist kein Nachweis, dass die Musik ein „Outro“ enthält.
5. **Auto-Formationen:** Zusätzliche Auswahl existierender V326-Gruppenlayouts nur an vorhandenen V442/V446-Auto-Cue-Zeitpunkten. Keine Änderungen an Sängerfokus, Drop-, Hook- und manuellen Cues, Clip-Dauer oder Übergangszeit. Drei und vier Avatare unterstützt.
6. **Priorität und Performance:** Nur bei laufender Musik, richtiger Track-ID, explizit bestätigtem V600-Akt/Label, nicht Low-Tier und ohne Reduced Motion. Manuelle Tänze, Kamera und Licht werden kanalweise nicht angefasst; bei lyricslastigen Szenen werden zusätzliche Akzente stark gedämpft. Kein neues Audio- oder GPU-System.

## Datenquelle und Grenzen

Abschnitte stammen von `services/musicAnalysis/trackAnalysisV318.ts` und benötigen Track-ID, plausible Dauer, label und Mindestkonfidenz gemäß V600. Ohne diese Daten bleibt der neue V604-Plan inaktiv. Es gibt weiterhin **keine direkte automatische Kameraposenwahl** durch V604; der bestehende Regisseur wählt die Shots, V604 moduliert nur Intensität und ausgewählte Auto-Gruppenformationen. Die Regiequalität kann nicht durch Unit-Tests als visuell schön bestätigt werden.

## Tests

```bash
npm run test:v604
npm run test:v604:types
npm run test:smoke:v604
npm run verify:v604
```

Für reale Vorher-/Nachher-Belege echte Chromium/Spotify/GLB-Aufnahmen mit dem existierenden `benchmark:v592:live`, `benchmark:v594:compare`, `benchmark:v595:regress` sowie `benchmark:v603:review` erstellen. Vollständiger Next.js-Build, echte Konzertaufnahmen und Raspberry-Pi-Messungen sind hier nur dann als durchgeführt dokumentiert, wenn sie tatsächlich gelaufen sind.
