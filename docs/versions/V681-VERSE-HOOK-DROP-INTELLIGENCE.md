# V681 – Verse–Hook–Drop Intelligence

## Inhalt

Die zusätzliche Abschnittsregie verwendet ausschließlich die **übereinstimmenden**
Songdaten der bestehenden V604-, V671- und V679-Planer. Sie erfindet keine
Abschnitte und ergänzt keine zusätzlichen Cuts, Rhythmusdetektoren, Singerslots
oder Kamerapfade. Die expliziten Rollen sind:

- **Verse**: kleine Rücknahme von Kamera/Licht zugunsten lesbarer Lyrics.
- **Hook**: verschiedene visuelle Akzente für erste und folgende Hooks; das ist
  noch keine automatische neue Kameraperspektive oder neue Gruppenformation.
- **Build**: sanfter Akzentanstieg **innerhalb** des bestätigten Builds.
- **Drop**: stärkster Licht-/Tanzakzent, priorisiert den bereits von V679
  bestimmten Haupt-Höhepunkt; kein erfundener Drop auf Basis von Beat-Energie.
- **Break**: dezente Entlastung bei belegter Songpause.

V681 ist **standardmäßig Teil der bestehenden eingeschalteten Smart-Show-Regie**,
kein weiterer Schalter ist nötig. Ist die Smart Show aus, die Wiedergabe pausiert,
Reduced Motion aktiviert, das Qualitätsprofil niedrig oder der Songabschnitt
nicht bestätigt, ist der Effekt genau neutral. Manueller Tanz, Kamera und Licht
sind unabhängig voneinander geschützt. Bei Lyrics-Priorität ist der Eingriff
stark gedämpft. V670 setzt weiterhin die abschließende Qualitätsgrenze.

## Daten/Performance

Ein deterministischer Plan pro bestätigter Song-Timeline. Die Laufzeitberechnung
verwendet denselben `progressMs`-Wert, keinen Timer, keinen zusätzlichen Render-
Loop, keine Mikrofon- oder Internetanforderung. Maximal **±2,2 %** extra
Abschnittsmultiplikator pro automatischem Kanal. An jedem Abschnittsrand wird
ein genau neutraler Multiplikator ausgegeben. Die Inspector-Vorschau ist nur
lesend. Es werden keine neuen User- oder Songdaten gespeichert.

## Tests

`npm run test:v681`, `npm run test:v681:types`, `npm run test:quick`,
`npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`.
`npm run build` erfordert vorher `npm install` und einen vorhandenen
`node_modules`-Ordner. Ohne erfolgreichen tatsächlichen `next build` ist V681
noch **nicht** produktionsvalidiert. Auf der Zielhardware zusätzlich reale
3D-Szenen, Schriftüberlagerungen und Mehrfach-Avatare visuell prüfen.
