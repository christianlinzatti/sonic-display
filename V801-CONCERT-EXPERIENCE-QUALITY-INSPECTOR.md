# V801 – Concert Experience Quality Inspector

## Einstieg

Unter **Einstellungen → Concert Quality Dashboard** (auch im vorhandenen
System-/Service-Status-Dashboard) gibt es nun den Bereich
**„V801 · Concert Experience Quality Inspector“**. Damit die Analyse erscheint,
muss in der Avatar-Ansicht ein Song mit **bestätigter V790-Storyboard-Timeline**
vorliegen. Ein geschätzter Musikabschnitt reicht absichtlich nicht aus.

Die Song-Timeline stellt jede **tatsächlich bestätigte** Szene mit ihrer
Dauer proportional dar, markiert Lücken und hebt aktuelle Plan-Hinweise hervor.
Beim Antippen einer Szene erscheinen Start-/Endzeit, Songabschnitt, Kamera-Intent,
Regiemoment und die Zustände von Kamera, Tanz, Lyrics, Licht und Bühne.
Der Filter blendet konkrete Hinweise und Empfehlungen pro Prüfbereich ein.
„Auch Informationen“ kann ein- oder ausgeschaltet werden.

## Was wirklich bewertet wird

- V790/V800-Stammdaten: Szenengrenzen, Lücken, Dauer, Storyboard-Abdeckung,
  aufeinanderfolgende identische Kamera-Intents, Anteile verschiedener Einstellungen,
  ausgewiesene musikalische Atempausen und Neben-Höhepunkte.
- Lyrics-Evidenz: vorhandene Textzeilen und bestätigte Synchronisationsmarkierung.
- Einstellungen: manuelle Kontrolle von Kamera/Tanz/Licht, Reduced Motion,
  Avatar-Bühnenmodus und geplante Performer-Slots.
- Hinweise haben **exakte Start-/Endzeiten aus dem bestätigten Plan**, enthalten
  eine nachvollziehbare Erklärung und einen konkreten Lösungsvorschlag.

Der **Strukturindex (0–100)** ist nur eine Kennzahl für die *Plan-Konsistenz*.
Er ist ausdrücklich **keine** Messung tatsächlicher künstlerischer Qualität.
Eine 100 sagt nichts über sichtbare Tanzbewegungen, GLB-Rig-Qualität,
Lippensynchronität, Scheinwerferleistung oder Lesbarkeit auf dem Display aus.
„Plan vorhanden“ meint genau das und kein echtes Render-Ergebnis.

Tanz-/GLB-Ausführung, Lichtkontrast und visuelle Lyrics-Überlagerungen bleiben
„Nicht gemessen“, solange die dafür nötige 3D-Beobachtung fehlt. Für aktuelle
geometrische Hinweise lässt sich die bereits vorhandene freiwillige
**V754-WebGL-Bildprüfung** öffnen. Deren Momentaufnahme ist von der
V801-Planbewertung getrennt und ersetzt ebenfalls keine vollständige
visuelle Konzertabnahme.

## Architektur und Performance

`concertExperienceInspectorV801.ts` ist rein deterministisch. Eine Analyse
wird aus dem mit `useMemo` gecachten Songplan und einem kleinen Satz aktueller
Evidenz erstellt. `concertExperienceInspectorStoreV801.ts` publiziert den
lesenden Snapshot für das bereits existierende Qualitätsdashboard ungefähr
jede Sekunde und speichert weder Songtexte noch Verlauf dauerhaft.

Das Dashboard verändert keine Cues, kein Playback, keine GLB-Animationen,
keine GPU-Objekte, Kamera-, Licht- oder Qualitäts-Gains. Der V670-Guard bleibt
weiterhin die finale Grenze für die bestehende automatische Show.
