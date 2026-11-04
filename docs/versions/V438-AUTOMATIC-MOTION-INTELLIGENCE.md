# Sonic Display V438 – Automatic Motion Intelligence & Rap Show Composer

**Basis:** Sonic Display V437 (`0.1.0-v437`). **Version:** `0.1.0-v438`.

## Ziel und Verhalten

Für Deutschrap-/Hip-Hop-Songs werden bereits **installierte** Tanzclips automatisch nach musikalischem Abschnitt, Energie, Tempo, Genre und Abwechslung ausgesucht. V438 integriert sich in den bestehenden Motion-Store und die gemeinsame V242/V437-Bühnensteuerung. Es legt keine neue Animation- oder Rendering-Engine an.

- Die Vorschlagsengine `automaticMotionIntelligenceV438.ts` klassifiziert vorhandene Clips **offline**. Explizit im Motion-Store hinterlegte Abschnitte (`verse`, `hook`, `build`, `drop`) genießen höhere Priorität. Ansonsten dienen Clipname und Dateiname lediglich als **unverbindliche Hinweise** für Verse, Hook, Duett/Antwort, Ruhephase und hohe Energie.
- Die V437-Lyrics-Performance liefert nach Möglichkeit Verse-/Hook-/Antwort-/Duett-Abschnitte. Mit Musikenergie und optionalen BPM-Daten entsteht für jeden **Phrase-/Szenenwechsel** eine reproduzierbare Clipauswahl. Bei fehlenden Verse-/Hook-Daten gibt die vorherige V242-Regie den Ersatzclip vor.
- Der Auswahlalgorithmus bevorzugt zum Genre und BPM kompatible Clips, berücksichtigt Energie und reduziert kurze Wiederholungen. Ein Regler steuert die Bedeutung der Abwechslung. Innerhalb derselben Phrase/Szene bleibt die Auswahl stabil, selbst wenn die Live-Energie schwankt. Bei neuem Track oder Avatar wird die Historie zurückgesetzt.
- Bereits in der Motion-Library installierte Dateien bleiben unverändert; V438 erstellt **keine GLB-Dateien**, schreibt kein Clip-Metadatum um und sendet kein externes Analyse-Request.
- V438 lässt manuelle Choreografien, manuelle Clip-Timelines, explizite Blend-Steuerung, Smart-Dance-Overrides, ausgewählte Dance-Presets und reduzierte Bewegung unangetastet. Der übergeordnete `motionStore.automatic`-Schalter muss eingeschaltet sein. Bei bekannten Nicht-Rap-Genres bleibt die bisherige Motion-Auswahl aktiv.
- Ein neuer, eigenständiger Einstellbereich im **Rap Performance Editor → Expressive Rap Director → V438** erlaubt, die Automatik und Vielfalt zu steuern, die Motion-Library-Automatik einzuschalten, die erkannte Clip-Kategorie zu sehen und einen Abschnitt als **rein rechnerischen Vorschlag** zu testen. Die Vorschau ist keine gerenderte Animation und löst keinen Spotify-Seek aus.

## Voreinstellungen

`rapAutoMotionEnabledV438 = true`, `rapAutoMotionVarietyV438 = 70`. Vorhandene `motionStore.automatic = false`-Einstellungen werden **nicht automatisch** aktiviert oder überschrieben. Um reale Clipwechsel zu ermöglichen, müssen Motion-Dateien zum gewählten Avatar installiert sein und die automatische Motion-Library eingeschaltet werden. Ohne passende Clips erfolgt ein Rückfall auf die bisherige Auswahl.

## Technische Einschränkungen

Das Wort „Analyse“ meint **Metadaten- und Dateinamen-Auswertung**, **keine echte Inspektion von GLB-Skeletten, Bewegungsqualität, Fußkontakt, Kollisionsgeometrie oder Clip-Audio**. Die Zuordnung zu Verse/Hook und musikalischer Energie ist heuristisch. BPM- und Genre-Metadaten stammen aus vorhandenen Daten; aus Musik-Streams werden keine Audioinhalte heruntergeladen. Clipwechsel erfolgen bei musikalischen Zeitmarken der vorhandenen Runtime, nicht durch präzise Live-Beat-/Stimmerkennung. Der Core scannt maximal die bereits vom Motion-Store gehaltenen 250 Einträge; es werden keine zusätzlichen Browser-Renderloops erzeugt.

## Tests und Integration

- `npm run test:v438` – neue Unit-/Integrations-Regression und strenge, isolierte TypeScript-Prüfung der Kernlogik.
- `npm run verify:v438` – zusätzlich Syntax, Importintegrität, case-sensitive Modulnamen sowie V435–V437 Regressionen.
- `npm run typecheck` und `npm run build` – vollständige Projektprüfungen auf einem Rechner **mit** installierten Next.js/React-Abhängigkeiten.

Siehe auch `V438-VERIFICATION.md` für den tatsächlich ausgeführten Prüfstand.
