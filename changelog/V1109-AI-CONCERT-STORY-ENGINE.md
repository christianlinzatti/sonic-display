# V1109 – AI Concert Story Engine

## Umfang

- Vier wählbare Erzählbögen und drei Spannungsverteilungen für die **gesamte** siebenaktige 360°-Show.
- Echte dramaturgische Kontraste: bewusst reduzierte Intros und Atempause, variierende Kameraführung,
  versetzte Höhepunkte und abschließendes Finale.
- Die vorhandene V1040-Timeline bleibt *einzige* Wiedergabe-Engine; manuell angepasste Abschnittsgrenzen,
  IDs, Songdauer und Showtitel bleiben unverändert.
- Expliziter lokaler Storyentwurf mit nachvollziehbarer Vorschau; optionales Kuratieren von
  Offline- und OpenAI-Remixes. Keine automatische Aktivierung und rückgängig machbar.
- Jede neue Story wird gegen V1106/V1107-Grenzen validiert: virtueller Intensitätsdeckel 30–85%,
  maximale Pegeldifferenz 45 Punkte, nur bekannte Kameras/Bühnen-/Tanz-/Laserlooks.
- V1108-Daten bleiben lokal, flüchtig und unabhängig: **keine Audiodaten in KI-Anfragen**.
- Reduzierte Bewegungen, Pause, bestehende manuelle Vorränge, Govee-/Pyro-Sicherheitsregeln bleiben unberührt.

## Verwendung

In der 360°-Bühne die **V1109 Concert Story Engine** aufklappen, Storybogen und Verteilung wählen,
**Storybogen lokal entwerfen** klicken, die sieben Szenen prüfen und ggf. **übernehmen**.
Die Checkbox erlaubt die Story-Regie auch bei neuen V1106-Remix-Vorschlägen; standardmäßig bleibt
sie für bestehende Abläufe ausgeschaltet. **Letzten Remix rückgängig machen** stellt den
vorherigen Showplan wieder her, falls er zwischenzeitlich nicht manuell geändert wurde.

## Qualität

`npm run test:v1109` prüft 288 Kombinationen, fehlerhafte Inputs, zeitliche Kontinuität,
Sicherheitsgrenzen, Offline-Berechnung und reale UI-Verdrahtung. `npm run test:v1109:types`
prüft die produktiven TypeScript-Module. Die zusätzlichen Playwright-Szenarien auf Desktop
und Touch kontrollieren sichere Vorschau, Zustimmung, Speichern, Undo und Screenshots.

**Keine automatische Echtzeit-Erkennung musikalischer Phrasen.** Der Storybogen nutzt
vorhandene Segment-Templates als Zeitachse und steuert keine echten Geräte direkt.
