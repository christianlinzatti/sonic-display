# Sonic Display V561 – Real GLB Lip-Sync Preview (25.10.2026)

## Ziel

Die bisher statische V560-GLB-Porträtvorschau hat nun **optional** eine aktive Gesicht-/Mundanimation auf **dem tatsächlich gewählten GLB**. Sie verwendet `VocalRigV368` – den bereits im Live-GLB verwendeten Gesichts-Renderer – und keine separate, erfundene Geometrie. Die Bühne, Spotify-Steuerung und die gespeicherten Avatare bleiben unverändert.

## Bedienung

**Einstellungen → Konzert-Bühneneffekte → 3D-Effektvergleich öffnen → Echten GLB zeigen → Gesichts-Nahaufnahme**. Dann:

- **Lip-Sync aus:** unveränderte statische V560-Nahaufnahme.
- **Deutschrap-Demo:** synthetische Rap-Mundbewegung mit realen Morph-Targets/Kieferbone des GLB, ohne echte Song- oder Audioanalyse.
- **Gesangs-Demo:** entsprechend weichere synthetische Gesangsartikulation.
- **Aktueller Song:** Verwendet echte synchronisierte Lyrics des gerade verbundenen Songs und die aus `fetchedAt`/`progressMs` abgeleitete aktuelle Spotify-Uhr. Es wird der in Sonic Display eingestellte Lyrics-Offset berücksichtigt. Nur tatsächlich vorhandene Wortzeitmarken ergeben wortbasierte Artikulation; bei reinen Zeilen-Timestamps bleibt die Präzision geringer. Die Gesichtsform ist weiterhin **eine Approximation**, keine Phonemerkennung.

Die UI zeigt die erkannten Mund-/Kieferkanäle oder warnt bei fehlendem Mund-Rig. Ein vom Nutzer manuell gemapptes Mund-Morph zählt ebenfalls. Pausieren, Spotify-Stopp, reduzierte Bewegung und nicht mehr aktuelle Playback-Daten stoppen die Bewegung; fehlerhafte oder unsynchronisierte Lyrics erzeugen keine erfundenen Zeitmarken. Demo-Beats aus der Bühnenvorschau werden **nicht** als echten Spotify-Stimmpegel ausgegeben.

## Implementierung und Grenzen

- `components/visualizer/concertLipPreviewV561.ts`: geprüfte Quellenwahl, tatsächliche Wort-/Zeilen-Cues, Playback-Uhr mit 20-Sekunden-Frischegrenze und begrenztem Nutzer-Offset; ohne zusätzliche Timer.
- `components/visualizer/PreviewGlbPortraitV560.tsx`: eigene `SkeletonUtils`-Kopie, bestehende V560-Materialpflege, `scanFacialRigV370`, Profilzuordnung und optional `VocalRigV368` unter derselben realen GLB-Instanz. Die Main-/Live-Avatare teilen weder Modifikationen noch Morph-Arrays mit der Vorschau.
- `components/visualizer/VocalRigV368.tsx`: bestehende direkte manuelle Demo-/Studio-Artikulation erreicht auch nach den modernen Song-Refinern noch die endgültigen Morph-Kanäle; Song-Pfad bleibt unverändert.
- `components/visualizer/StagePreviewModal.tsx`: explizite Vorschau-Schalter, Live-Status und Offenlegung der Einschränkungen. Duette bleiben bislang synthetische Bühnenfiguren.

Die Preview setzt keine zusätzlichen Lichter, Schattenpässe, Netzwerkanfragen, Animationstimer oder externen API-Aufrufe ein. Der Opt-in-Gesichtsrenderer verursacht aber Rechenlast, wenn die Vorschau geöffnet und Lip-Sync aktiviert ist.

## Prüfungen

`npm run test:v561` (17+ Regressionen); `npm run test:v561:types` (gezielte Logik-Typprüfung); `npm run verify:v561` (zusätzlich vorherige Versionsketten). Kompletter Next.js-Produktionsbuild und WebGL-/Raspberry-Pi-Sicht- und FPS-Abnahme mit unterschiedlichen echten GLB-Dateien bleiben bis zur Zielgerätprüfung offen.
