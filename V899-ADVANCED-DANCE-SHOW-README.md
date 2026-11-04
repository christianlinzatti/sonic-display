# Sonic Display V899 – Advanced Dance Show Director

V899 erweitert die V895-Konzertdramaturgie um zeitlich begrenzte, nachvollziehbare
Aufstellungswechsel in der vorhandenen V492- und V326-Bühne und eine dezente
Kameratempo-Koordination mit V898. Es werden keine künstlichen Beats,
Sängeridentitäten oder Tanzschritte erzeugt.

## Neue Funktionen

- **2-Personen-Formation:** engere Duett-Aufstellung in bestätigten Strophen,
  breiterer Bühnenabstand bei Hooks, Drops und Finales sowie vorsichtige
  diagonale Tiefe bei ausgewählten Übergängen.
- **3-/4-Personen-Ensemble:** nur für bereits automatisch geregelte V326-Gruppen
  und nur bei sicherer Spielsituation; bei Höhepunkten werden X-Lanes
  geringfügig nach außen erweitert. Keine zusätzliche Kompression der Gruppen.
- **Sanfte Szenengrenzen:** Fade-in/Fade-out über bestätigte V604/V895-Szenen;
  keine abrupten zufälligen Versetzungen.
- **Reale musikalische Energie:** gültige, frische V896-Messwerte können die
  vorhandene Formationsintensität leicht beeinflussen. Ohne Messwerte bleibt
  der Plan strikt szenengebunden; er erfindet keine Bass-Ereignisse.
- **Kameraabstimmung:** verwendet ausschließlich den bestehenden V898-/V351-
  Kamerapfad. Zusätzliche Übergangsdämpfung, keine neuen Kameraobjekte.
- **Bedienung:** Live-FX-Deck `V899 · Advanced Dance Show Director`, drei
  Regiestile, Intensität, separate Formations-/Übergangs-/Kameraschalter,
  Energiequelle und zwei Schutzoptionen. JSON-Export des verifizierten Plans.

## Vorrang und Ressourcen

Manuelle V325-Duett-Timelines, individuell gespeicherte V326-Gruppen-Cues,
Choreografie-Modus, Live-FX-Eingriffe, V322-Fußsperren, V494/V506/V508-
Kollisionsschutz, Blackouts, reduzierte Bewegung und Low-Quality bleiben
vorrangig. Bestehende GLB-Mixer, IK, Gesichts-/Vokalzuweisungen und Lyrics-
Kamerapositionen werden nicht neu geschrieben. Die Änderungen verwenden
vorhandene Render-/Frame-Loops ohne zusätzliche Draw Calls.

## Test und Installation

```powershell
npm ci
npm run verify:v899:focused
npm run typecheck
npm run build
npm run dev
```

Die fokussierte Testkette ist bestanden. **Nicht produktionsfreigegeben:**
In dieser Prüf-Umgebung schlägt `npm ci --offline` mangels gecachtem
`zustand@5.0.16` fehl. Dadurch fehlen React-/Three.js-/Next.js-Typen für
einen aussagekräftigen vollständigen TypeScript-Check und `next` für einen
Next.js-Produktionsbuild. Browser-/WebGL-Visuals und echtes Fußverhalten auf
verschiedenen GLB-Rigs müssen auf vollständig installierter Hardware separat
geprüft werden. Details in `V899-VERIFICATION.md`.
