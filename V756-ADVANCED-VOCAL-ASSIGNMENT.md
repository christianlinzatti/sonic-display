# V756 – Advanced Vocal Assignment

## Ziel

Bei Deutschrap, Feature-Songs, Duetten und gemeinsamen Hooks soll der sichtbare Performer zu den **explizit zugewiesenen** Sängerrollen passen. Es findet **keine akustische Stimmenerkennung und keine automatische Identifikation realer Sänger** statt. Künstler-Credits allein beweisen keine Sprechwechsel.

## Funktionen

- **Advanced Vocal Assignment** im vorhandenen **V547 Feature Vocal Assignment Studio** (V496-Editor): aufklappbares Prüfstudio unter den bisherigen V660-Vorschlägen.
- Quellen der **redaktionellen Vorschläge**: V385 manuelle Zeilenzuordnung, V416 Rap-Duett-Regeln und explizite `[vocal:...]`-Marker in synchronisierten Lyrics. Wie in V660 werden die Quellen nachvollziehbar angezeigt.
- Pro Vorschlag: Lead-Avatar (1–4), Rolle (Verse / Feature / Hook / Adlib), Solo / Duett, Duettpartner und auswählbare Hook-Sänger. Eine Rollen-Vorschau zeigt ausschließlich die erwartete visuelle Regie und verändert weder Spotify noch den laufenden Song.
- Die **Audit-Anzeige** zeigt bestehende gespeicherte Zeitmarken, Überschneidungen, für die gewählte Bühnenbesetzung ungültige Slots und Zeitbereiche ohne *zugewiesene* Hauptrolle. Das ist keine Aussage darüber, ob auf der Tonspur gesungen wird.
- **Konflikte sind standardmäßig geschützt**: ohne Override werden kollidierende Markierungen übersprungen; eine ausdrücklich aktivierte Ueberschreibung teilt alte Intervalle, sodass angrenzende nicht betroffene Teile erhalten bleiben. Getrennte Adlibs sind unabhängig von der Hauptrolle; identische Bestätigungen bleiben idempotent.
- Keine automatische Änderung von Präferenzen: Speichern erfordert einen bewussten Klick; danach werden die bestätigten Segmente über die vorhandene `vocalTimeSegmentsV496`-Bibliothek gespeichert und `vocalTimeEnabledV496` gesetzt.
- Die Live-Regie verwendet weiterhin **V385 > V496 > V416**. Dies respektiert die bestehenden manuellen Lyrics- und Kamera-/Show-Prioritäten. V756 verändert keine GLB-Animationsclips, Mund-Phoneme oder Foot-IK.

## Nutzung

1. Musik mit synchronisierten Lyrics auswählen, die V385-/V416-Rollen oder explizite Vocal-Tags enthalten. Für Songs ohne diese Hinweise lassen sich die V496-Zeitmarken weiterhin unmittelbar manuell anlegen.
2. Im **V547 Feature Vocal Assignment Studio** das **V756 Advanced Vocal Assignment** öffnen; Anzahl der tatsächlich dargestellten Avatare wählen.
3. Vorschläge prüfen, Rollen korrigieren, bei Bedarf in der rollenbasierten Vorschau testen, Auswahl markieren.
4. Bei konkurrierenden gespeicherten Zeitmarken gegebenenfalls die **explizite Ersetzen-Freigabe** aktivieren. Speichern. Die Freigabe ist anschließend wieder ausgeschaltet.
5. Bereits gesicherte Zeitmarken können wie bisher im V496-Timeline-Editor auf die Millisekunde angepasst werden.

## Grenzen

- Daten stammen aus manuellen Zeitmarken / ausdrücklich etikettierten Lyrics, nicht aus Vocals-Stems oder akustischer Speaker-Diarization.
- Die Auswahl *Bühnenbesetzung* ist eine vom Nutzer gewählte Planungsgröße; V756 erkennt nicht automatisch die tatsächlich geladenen GLB-Avatare.
- Es gibt keine zusätzliche Hintergrundberechnung oder GPU-Last. V756 wird erst geöffnet aufgerufen; laufende Choreografie/Kamera/Licht nutzen die bestehende V496-Pipeline.
- Ein Browser-Test der tatsächlichen Multi-GLB-Darstellung und der vollständige Next.js-Build sind weiterhin erforderlich.
