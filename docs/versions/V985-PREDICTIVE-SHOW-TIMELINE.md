# V985 – Predictive Show Timeline (V984 → V985)

## Zweck

Die kreative Fünf-Akt-Regie aus V984 wird jetzt **an wirklich verfügbare, bestätigte
V604/V763-Szenengrenzen gekoppelt**. Eine V983-KI-Idee oder V984-Story **enthält
keine Audiodaten und keine echten Abschnittszeiten**; sie liefert daher nur eine
visuelle Energiedramaturgie. Startzeiten stammen ausschließlich aus
`ConcertTimelineSnapshotV763` mit `source: "verified-v604"`.

## Bedienung

1. Spotify-Song spielen, Live FX Deck öffnen.
2. V983: Songidee erzeugen (KI auf Klick oder offline).
3. V984: Konzertgeschichte erzeugen (KI auf Klick oder offline).
4. Darunter **V985 Predictive Show Timeline** öffnen. Wenn keine bestätigte
   V604-Szenenquelle vorliegt, erscheint nur ein Hinweis – **keine Cues**.
5. Bei bestätigter V763-Timeline bietet V985 Kamera-, virtuelle Licht-, und
   in geeigneten bestätigten Szenen Tanz- bzw. begrenzte virtuelle FX-Cues.
6. Falls nötig **Songshow sicher anlegen (inaktiv)**: nutzt die V764-Sicherung,
   um keine bisherige Song-Timeline zu verlieren.
7. Vorschläge einzeln oder gesammelt markieren und bewusst **übernehmen**.
   Bestehende V354-Cues werden nie überschrieben. Für die Ausführung ist die
   bereits vorhandene V354-Aktivierung maßgeblich; V985 aktiviert sie nicht.

Im Vorschaufenster erscheint eine kommende Szene maximal zwei Sekunden vorher.
Das ist **nur eine Anzeige**. Gespeicherte Clips beginnen exakt an der
bestätigten Szenengrenze; die Vorschau löst keinerlei Effekt aus. Pause, Sprung
oder Titelwechsel folgen dem aktuellen V763-Zustand.

## Architektur & Schutz

- `lib/predictiveShowTimelineV985.ts`: reine Quellvalidierung, begrenzte
  V354-Clip-Vorschläge, deterministische Look-ahead-Anzeige und Konfliktprüfung.
- `components/visualizer/PredictiveShowTimelineV985.tsx`: read-only V763-Abo,
  Checkbox-Review, songgebundener V354-Import. Kein neues Polling, kein RAF.
- `ConcertStoryDirectorV984.tsx`: bindet V985 nach Story-Erstellung ein.
- Maximal 96 Vorschläge, maximal 400 V354-Clips, nur bekannte Camera/Lighting/
  Dance/Effects-Lanes. Dance nur bei bestätigtem Hook+Ensemble, Effects nur
  bei bestätigtem Drop+Pulse. FX-Gain maximal 1,25.
- Das angezeigte Story-Akt-Motiv folgt **relativer Songposition**. Es behauptet
  keine nachgewiesene Übereinstimmung der fünf Ideen mit tatsächlichen Songakten.
- Keine AI-generierten Zeitstempel, keine BPM-Behauptungen, kein Spotify-Audio,
  keine Hardwarebefehle, keine veränderte aktive Timeline bei bloßer Vorschau.
- Das V354-Persistieren wird mit erneutem Lesen geprüft. Ein Song-/Dauerwechsel
  oder Verlust der bestätigten Quelle verhindert das Übernehmen.
- Die bisherige V354-Wiedergabelogik, V764-Bibliothek und manuellen Overrides
  bleiben zuständig.

## Tests / Release-Gate

- `npm run test:v985` – neun Gruppen für Evidenz, Zeitmarken, Preview,
  Konflikte, Offline-Sicherheit, Songwechsel und CI-Integration.
- `npm run test:v985:types` – isolierter TypeScript-Check (Projekt-Dependencies nötig).
- `npm run verify:v985:focused` – V985–V981 + Syntax und Architektur.
- `V832 Continuous Technical Validation` ist im ZIP um einen V985-Schritt erweitert;
  **Achtung:** Der ZIP-Importer schützt `.github/workflows` und übernimmt die
  Workflow-Datei nicht automatisch. Der GitHub-Workflow-Schritt muss separat
  committed werden. Die neuen `prebuild`-Prüfungen und das importierbare
  `vercel-production-build.cjs` enthalten V985 bereits.
- Produktionsfreigabe erst nach vollständigem TypeScript-/Next.js-Build und
  GitHub Actions / Vercel, nicht allein aufgrund lokaler Syntax-/Regressionstests.

## V986

AI Atmosphere Designer: aus freigegebenem Storybogen und bestätigten Szenen
visuelle Farb-, Nebel- und LED-Motive anbieten, mit explizitem Review und
Performance-/Photosensitivitäts-Gates.
