# Sonic Display V761 – Cinematic Concert Director 4.0

## Grundlage

V761 basiert auf V760. Die neue Regie verwendet **ausschließlich V604-Songakte, die aus V600-validierten, importierten Songabschnitten stammen**. Auch der aktuell aktive V604-Cue muss den gesuchten Akt und Abschnitt unabhängig bestätigen. Ohne diese Evidenz oder während Pausen, Reduced Motion und Low-Tier bleibt V761 vollständig passiv; die bisherigen Regiepfade laufen unverändert.

## Was ist implementiert?

- Ein **deterministischer Szenenplan** für den ganzen belegten Songverlauf. Die visuellen Regieintentionen *Porträt, Dialog, Gruppe, Weitwinkel, Aufbau, Puls, Ruhe* wechseln ohne direkt benachbarte Wiederholungen; wiederkehrende Hooks erhalten verschiedene Intentionen.
- Längere verifizierte Verse/Hooks/Drops können je nach eingestellter **Motivwechsel-Stärke** eine, zwei oder drei interne Szenen erhalten. Der Slider ist damit eine echte Frequenzsteuerung; keine zusätzlichen künstlichen Songabschnitte werden behauptet.
- Bisherige Konzertdynamiken werden vor V654 über `directedDynamicsV761` in **kleinen, begrenzten** Tanz-, Kamera-, Licht- und dekorativen Lyrics-Anpassungen weitergereicht. Die wirksamen Kameraposen/Lichtquellen stammen weiterhin von der existierenden Bühne; der Szenenname ist **kein separater Kamera- oder Lichtbefehl**.
- Am Anfang und Ende **jeder** Teilszene blendet die Zusatzwirkung auf den unveränderten Basiscue zurück. Der Songzeitstempel ist die einzige Uhr, sodass Seek/Wiederholen deterministisch sind.
- Vorhandene V654/V669/V670/V750-Qualitäts- und Kollisions-/Lesbarkeitsschutzregeln greifen weiterhin nach V761. V761 schaltet keine deaktivierten Effekte ein und ändert keine GLB-Clips, Fuß-IK, Lyrics-Wortzeiten, Vocal-Zuordnungen oder gespeicherten Timelines.
- Für manuelle Tanz-, Kamera-, Licht- oder Lyrics-Einstellungen bleibt die jeweilige Intensität **identisch**. Bei aktivem Lyrics-Schutz werden keine neuen dekorativen Lyrics-Akzente oder positiven Lichtzuschläge aufgebracht. Der bestätigte V528-Status darf lediglich zusätzliche Kameraakzente zurücknehmen; **keine Sänger werden erfunden**.

## Einstellungen und Diagnose

`Einstellungen → Dynamic Stage → V761 Cinematic Concert Director 4.0`

- An/Aus, Regiestärke (0–100), Motivwechsel (0–100), Überblendung (400–3000 ms), Lyrics-Schutz.
- Gespeichert im vorhandenen `sonic-display-ui-preferences-v1`-Objekt und somit in der portablen UI-Konfigurationssicherung enthalten.
- Die Bühne stellt `data-v761-scene`, `data-v761-act` und `data-v761-evidence` für Entwicklerdiagnosen bereit. **Dies ist eine Planungsinformation, keine visuelle Bildprüfung.**

## Technisch

- `components/visualizer/cinematicConcertDirectorV761.ts` – reiner Planner/Sampler; keine Netzwerkzugriffe, Browser-Timer, WebGL-Ressourcen oder persistierten Daten.
- `components/visualizer/VisualizerStage.tsx` – V604 → V761 → V654, danach die bestehenden Regie- und Qualitätsschichten.
- `context/UiPreferencesContext.tsx`, `types/music.ts`, `components/SettingsPanel.tsx` – typisierte Einstellungen und Oberfläche.
- `tests/v761-cinematic-concert-director-regression.cjs`, `tests/tsconfig.v761-core.json` – 77.264 gezielte deterministische Prüfungen und isolierter TypeScript-Check.
- CI-Job auf Windows/Linux und `check:fast` führen V761-Tests vor der npm-Abhängigkeitsprüfung aus.

## Grenzen

Automatische Songabschnitte werden nicht künstlich ergänzt. Der Effekt variiert **die vorhandene Regie**, nicht tatsächlich neue Kameraschnitte, besondere Lichtgeräte oder importierte Animationsclips. Auch wird keine vollständige Bilderkennung oder echte Sängertrennung geleistet. Noch erforderlich sind `npm ci`, vollständiger TypeScript-/Next.js-Produktionsbuild sowie reale Browser-/GLB-Tests.
