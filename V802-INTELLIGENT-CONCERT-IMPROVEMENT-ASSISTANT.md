# V802 – Intelligent Concert Improvement Assistant

## Bedienung

Im bestehenden **Einstellungen → Concert Quality Dashboard** liegt V802 unter dem
V801-Inspector. Eine verifizierte V790/V800-Song-Timeline ist Voraussetzung.
Die Liste priorisiert konkrete V801-Hinweise nach Schwere und zeigt ihre
**originalen Songzeitbereiche**. Bei wiederholten Kameraperspektiven können
geeignete **alternative Kamera-Intents** in einen temporären Entwurf
aufgenommen werden. Der Vorher-/Nachher-Index wird **neu** über
`auditConcertExperienceV800` und `inspectConcertExperienceV801` berechnet.
Diese Bewertung ist ausschließlich ein **Strukturindex**. Es werden weder
Pixel-, Audio-, GLB- noch echte 3D-Kamerafahrten simuliert.

**Ohne ausdrückliche Bestätigung verändert die Ansicht niemals die Show.**
Im Entwurf können mehrere Kameraänderungen nebeneinander angesehen oder mit
„Entwurf verwerfen“ vollständig zurückgenommen werden. Andere Kategorien
sind nur Prüfanleitungen: fehlende Szenen, Sänger, Lyrics-Timestamps,
Ruhephasen oder echte Lichteffekte werden nicht erfunden.

## Übernahme über den vorhandenen Timeline-Editor

Erst wenn im **V763-Editor** bereits eine **aktivierte, zum exakt gleichen
Song und zur gleichen Songdauer gehörige V354-Show** gespeichert wurde, ist
nach expliziter Checkbox-Bestätigung die Übernahme möglich. V802 erzeugt
für jede genehmigte Kameraszene einen kurzen manuellen V354-Kamera-Cue,
mit 1,2 Sekunden Abstand zu den Szenengrenzen und höchstens 5 Sekunden Länge.
Die Zuordnung von V790-Intent zu V354-Kamerawinkel ist **näherungsweise**;
die reale Kamera wird weiterhin von der V354-Regie und allen bestehenden
Kamera-/Lyrics-Schutzmechanismen behandelt.

V802 lehnt eine Übernahme **vollständig** ab, wenn die gespeicherte Timeline
ungültig, deaktiviert, einem anderen Titel zugeordnet, voll, bereits mit
einem gleichnamigen Cue bestückt oder zeitlich mit einem vorhandenen
Kamera-Cue überlappt ist. **Es erfolgt keine Teilübernahme und niemals ein
automatisches Überschreiben.** Vor dem Speichern wird der aktuelle
Timeline-Stand nochmals gelesen. Nach dem Schreiben wird die Persistenz
überprüft, sodass Browser-Speicherfehler im UI erscheinen.

Im V763-Editor können alle übernommenen Cues angepasst oder wieder entfernt
werden. Bereits vorhandene Licht-, Lyrics-, Tanz- und Kameracues bleiben
unverändert. Es werden keine Sängeridentitäten, Songabschnitte oder
neuen GPU-Ressourcen erzeugt. Reduced Motion und manuelle Kameraeinstellungen
sperren automatisierte Kameravorschläge.

## Wichtige Quelldateien

- `components/visualizer/concertImprovementAssistantV802.ts`: reiner, deterministischer Vorschlags- und Vorher-/Nachher-Algorithmus, sicherer V354-Cue-Adapter
- `components/visualizer/ConcertImprovementAssistantPanelV802.tsx`: UI mit Auswahl, Vergleich, Verwerfen und bestätigtem Anwenden
- `components/visualizer/ConcertQualityDashboardV751.tsx`: Integration unter den V801-Inspector
- `components/visualizer/concertExperienceInspectorStoreV801.ts`: übergibt zueinander passende V790/V800- und Evidenzdaten an das Dashboard
- `components/visualizer/VisualizerStage.tsx`: weiterhin nur lesender QA-Datenpublisher
- `tests/v802-concert-improvement-assistant-regression.cjs`: Funktionen, Sicherheits- und Regressionstests

## Nicht geleistet

Keine selbstständige Audio-/Phonemanalyse, kein KI-Videovergleich, keine
automatische Vergabe von Sängerrollen, kein automatisches Befüllen von
unbekannten Songzeitbereichen. Der Vorschau-Score ist kein künstlerisches
Qualitätsurteil; reale Kamera-/Avatar-/Lyrics-Abnahme im Browser bleibt nötig.
