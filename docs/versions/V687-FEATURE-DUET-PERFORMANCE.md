# V687 – Feature & Duet Performance

V687 ergänzt bestehende V517-/V527-/V539-/V548-/V638-Ensemble-Animationen durch **kurze, geprüfte und begrenzte Reaktionen** – ohne Sänger automatisch zu erraten.

- **Sängerwechsel (Handoff):** Das von V385/V416/V496 ausdrücklich bezeichnete abgebende Bühnenmitglied reagiert für maximal rund eine Sekunde auf den bestätigten neuen Sänger. Dessen Blick richtet sich nach einer kurzen Bestätigung wieder zum Publikum.
- **Duett:** Bei exakt zwei bestätigten aktiven Sängern werden kleine, alternierende **visuelle** Blickakzente verteilt. Diese sind keine zusätzlich erkannten Gesangseinsätze.
- **Feature und Gruppen-Hook:** Nebenfiguren reagieren zurückhaltend; beim vollständig bestätigten Hook bleibt die Gruppe nach vorn ausgerichtet.
- **Zweierduette:** Die vorhandene `DanceFormationActorsV492`-Pipeline erhält dieselbe V687-Gestenebene. Nach den optionalen Akzenten wird der bestehende V506/V508-Risikofilter für das Duo erneut angewandt.
- **Sicherheitsgrenzen:** Kein neuer Animationsclip, keine Änderung der Lippen-/Vocal- oder Lyrics-Timing-Daten, kein Root-Travel, keine IK-Eingriffe. Bestehende V452-Clamps und V506/V508-Kollisionsdämpfung bleiben nachgeschaltet.
- **Keine unbelegten Rollen:** Nur aktiver, zur Song-ID passender autorisierter V517-Cue; keine Künstler-Credits, Genre, Klangenergie, unsynchronisierte Lyrics oder visueller Lead als Sängerbeweis. Pausiert, reduced-motion, low-tier, manuelle Bühne/Choreografie oder ungültiges Cue => keine neuen Effekte.
- **Keine zusätzliche Render-Schleife:** Reine deterministische Abfrage im bereits vorhandenen Gruppen-Frame. Kein Netz, Speicher, Dateiupload oder neues Audio-Analyseverfahren.

Testbefehle: `npm run test:v687`, `npm run test:v687:types`, `npm run test:quick`. Vollständiger Next.js-Produktionsbuild benötigt installierte npm-Pakete.
