# Sonic Display V207 – Motion Quality Optimizer 2.0

## Neu
- Read-only Qualitätsscan für installierte GLB-Motions im Character & Motion Library Panel.
- Auswertung roher GLB-Keyframe-Kurven auf ungültige Kanäle, abrupte Quaternion-Sprünge, extreme Positionsgeschwindigkeit und lange Keyframe-Lücken.
- Vorsichtiger Hinweis auf **mögliche** Fußverschiebung, keine physikalisch gesicherte Foot-Sliding-Erkennung.
- Einzelberichte je Clip, aggregierter Score und konkrete Vorschläge; keine automatische Dateimanipulation.
- Bestehende V204 Foot IK, V205 Expression und V206 Multi-Avatar unverändert.

## Benutzung
Settings → Avatar → Character & Motion Library → Avatar wählen → V207 Motion Quality Optimizer → GLB wählen → GLB-Motion prüfen.

## Grenzen
Heuristiken basieren auf Rohtracks der GLB-Datei vor dem Retargeting. Die Positionsgeschwindigkeits-Schwelle setzt annähernd metrische Einheiten voraus; Ergebnisse können bei anderen Skalierungen abweichen. Diagnose prüft maximal 32 Clips, 240 Tracks pro Clip und 4096 Keyframes je Track. GLB-Dateien müssen vom Browser ladbar sein. Eine realitätsnahe Gelenkwinkelprüfung erfordert den konkreten Avatar und das Skelett. Der Score ist kein zertifizierter biomechanischer Qualitätswert.
