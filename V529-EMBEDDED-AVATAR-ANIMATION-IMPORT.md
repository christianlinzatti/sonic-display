# Sonic Display V529 – Avatar + Animationen in einer einzigen GLB

## Neuer Importablauf

1. **Settings → Character & Motion Library** öffnen, als Administrator anmelden.
2. Unter **Charaktere (.glb) auswählen** eine oder mehrere GLB-Dateien wählen. Der V529-Inspector prüft den GLB-Header und liest nur den JSON-Chunk, **ohne** Bilder, Meshes oder Animationen beim Scan zu dekodieren.
3. Anzahl, Name, Länge, Kanalzahl, Gelenke und Morph-Target-Namen werden angezeigt. Über **Animation in der 3D-Vorschau testen** etwa `Dance_RapTwoStep`, `Idle_Groove` oder `Rap_Gesture` auswählen und mit **Tanz testen** ansehen.
4. **Dateien installieren** speichert die *Original-GLB unverändert*, inklusive **aller** Animationen und Blendshapes. Nur die Vorschau-Auswahl wechselt den getesteten Clip.
5. Beim nächsten Bibliotheks-Refresh erscheint der Avatar als eigenes Modell. Animationen sind als **eingebettete GLB-Clips** der bestehenden Bühnen-/Preview-Pipeline verfügbar; es ist keine zusätzliche Datei und keine manuelle Konfigurationsbearbeitung nötig.

Der separate **Motions (.glb)**-Import ist nicht verändert: Er kann Animationen auch aus anderen GLBs einem vorhandenen Avatar zuordnen, exportiert aber bewusst einen explizit gewählten Einzelclip. Er ist für fremde Rigs weiterhin von der namensbasierten Retargeting-Heuristik abhängig.

## Geprüfte Benutzerbeispiele

| Datei | Größe in Bytes | Animationsclips | Skelett-Joints | Morph-Targets |
|---|---:|---:|---:|---:|
| sonic-performer-v3.glb | 1863344 | 20 | 55 | 5 |
| sonic-pulsebot-v1.glb | 2016084 | 20 | 55 | 5 |
| sonic-nova-v1.glb | 2014348 | 20 | 55 | 5 |
| sonic-rae-v1.glb | 2343300 | 20 | 55 | 5 |
| sonic-jax-v1.glb | 2056344 | 20 | 55 | 5 |

Alle fünf enthalten denselben Satz aus 20 eingebetteten Motion-Namen: `Arms_Up`, `Body_Roll`, `Clap_Hands`, `Dance_ArmWave`, `Dance_ClubGroove`, `Dance_DiscoPoint`, `Dance_Groove`, `Dance_HeelTap`, `Dance_RapTwoStep`, `Dance_SideStep`, `Dance_StepTouch`, `Finger_Flow`, `Greeting_Wave`, `Head_Nod`, `Hip_Bounce`, `Hip_Circle`, `Hip_Sway`, `Idle_Groove`, `Rap_Gesture`, `Shoulder_Roll`. Jeder Clip besitzt 165 GLB-Animation-Channels, die auf 55 Nodes zielen. Die fünf Morph-Targets heißen `jawOpen`, `mouthSmile`, `eyeBlinkLeft`, `eyeBlinkRight`, `browInnerUp`.

**Wichtig:** Die fünf Morph-Targets sind vorhanden, aber kein geladener Clip enthält einen `weights`-Animationspfad. Lip-Sync wird dadurch nicht automatisch geliefert; die bestehende Facial-Steuerung kann passende Channels bei Live-Shows separat benutzen. Keine visuelle GPU- oder Raspberry-Pi-Prüfung durchgeführt.

## Technische Grenzen

- Maximal 30 GLBs pro Auswahldurchlauf, 35 MiB pro Datei; die JSON-Chunk-Inspektion ist auf 8 MiB begrenzt. Das Upload-Backend prüft zusätzlich Signatur/Dateilänge und setzt bestehende Admin-/Same-Origin-Regeln durch.
- **V529 installiert nicht 20 separate Motion-GLBs**, sondern **ein Avatar-GLB mit 20 eingebetteten Clips**. Das ist ressourcenschonender und wahrt Skelett- und Dateiintegrität. Animationen bleiben mit dem jeweiligen Avatar verknüpft.
- Auto-Dance/Genre-Regeln sind die **bestehende** Runtime-Funktionalität. Die Metadateninspektion erfindet keine neuen Genres, Finger-IK- oder Lip-Sync-Animationen.
- Ein Projekt-ZIP enthält die **Code-Änderungen**, nicht erneut die privat bereitgestellten Original-Beispiel-GLBs.
- Ohne Vercel Blob ist lokales Speichern weiterhin nur in der Entwicklungsumgebung möglich. Die benötigten Abhängigkeiten müssen für einen vollständigen `next build` installiert sein.

## Tests

- `npm run test:v529`: fünf echte GLBs (wenn vorhanden; alternativ mit `SONIC_V529_SAMPLES=/pfad`), Header-Grenzen, doppelter Name, kein Mesh, Morph-Kanäle und Clip-Laufzeiten.
- `npm run test:v529:types`: isolierter Dependency-freier TypeScript-Kerntypentest.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:v528` und vorherige Regressionen.
- Benutzerabnahme: GLBs im Browser auf dem Raspberry Pi mit allen 20 ausgewählten Clips gegen tatsächliche Model/Three.js Ladezeiten und Morph-Target-Kompatibilität prüfen.
