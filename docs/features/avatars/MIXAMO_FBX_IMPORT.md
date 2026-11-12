# Mixamo-FBX-Integration in Sonic Display

Sonic Display kann selbst heruntergeladene Mixamo-Animationen **direkt als FBX**
in die vorhandene Character & Motion Library importieren. Eine manuelle
Zwischenkonvertierung in Blender ist für Animations-FBX nicht mehr nötig.

## Import

1. Auf [Adobe Mixamo](https://www.mixamo.com/) im eigenen Konto einloggen,
   eine Animation wählen und **FBX** herunterladen, nach Möglichkeit
   **Without Skin** (nur Animation, kleinere Datei).
2. Sonic Display → **Einstellungen → Avatare → Character & Motion Library**
   öffnen, als Administrator anmelden und unter **Mixamo · FBX-Animationen
   importieren** eine oder mehrere `.fbx` auswählen. Alternativ bietet der
   einfache Motion Installer denselben Import.
3. Die Datei wird **lokal im Browser** über Three.js FBXLoader zu einer GLB
   konvertiert (max. 25 MB FBX; max. 35 MB erzeugte GLB; max. 64 Clips).
   Die Konvertierung führt keine Netzwerkanfrage an Mixamo aus, verwendet
   keine Adobe-Zugangsdaten und wird erst bei einer FBX-Auswahl geladen.
4. **Ziel-Avatar** auswählen, **Clips und Rig prüfen** betätigen, den Clip
   sowie Fußkontakt und Gelenke **im 3D-Viewer** prüfen.
5. Im Batch Installer optional **Motions nur zur Bibliothek hinzufügen**
   aktivieren, damit die bisherige aktive Motion unverändert bleibt. Danach
   Installation bestätigen; die Clips werden in der bestehenden Motion Library
   für Genre-/Songabschnitt-Zuordnungen angeboten.

## Technik und Beschränkungen

- Importierte FBX-Daten bleiben auf dem Gerät, bis der Nutzer einen regulären
  GLB-Upload in die eigene Sonic-Display-Instanz auslöst.
- Die erzeugte GLB enthält weiterhin die Ausgangshierarchie/Restpose für das
  bereits implementierte namensbasierte Retargeting. Bei **Without Skin**
  können die Knochen als reine animierte GLB-Knoten vorliegen; diese werden
  beim Retargeting zur Quellrig-Erkennung berücksichtigt. Ziel-Avatare müssen
  weiter ein echtes Skelett besitzen.
- Beibehaltung der Sicherheitsregeln: Translationen/Root Motion und
  unbekannte Knochen-Spuren werden beim Retargeting verworfen.
  Mixamo-Motion-Capture ist nicht für beliebige andere Rigs garantiert passend.
- FBX mit umfangreichen eingebetteten Texturen oder Meshes kann das 35-MB-GLB-
  Limit überschreiten. Für Animationen **Without Skin** empfehlen. Für komplette
  **FBX-Charaktere** bleibt der bisherige lokale Blender-Import maßgeblich.
- Auf Vercel ist der **Upload einer erzeugten GLB** nur mit korrekt
  konfiguriertem Vercel Blob möglich. Ohne Blob ist der serverseitige GLB-
  Import weiterhin auf die lokale Entwicklungsumgebung beschränkt.
- Eine echte Mixamo-API/Adobe-Konto-Synchronisierung wird nicht angeboten.
  Es werden **keine** fremden Animationen mitgeliefert; für eigene Downloads,
  Nutzung und Weitergabe gelten die jeweils aktuellen Anbieterbedingungen.
- Auf Raspberry Pi und Smartphones kann das Konvertieren großer FBX-Dateien
  viel Speicher beanspruchen. Am besten einmal am Desktop importieren.

## Qualitätssicherung

Die bestehende CI-Pipeline `Production & Playwright` führt
`node tests/mixamo-fbx-import-regression.cjs` aus. Sie prüft die Einbindung,
Upload-Grenzen und Retargeting von Animation-only-Szenen auf echte Avatar-Bones.
Der normale TypeScript- und Production-Build bleibt ebenfalls aktiv.

Der Integrationstest ersetzt keine Sichtprobe mit einer realen, selbst
heruntergeladenen Mixamo-FBX auf dem jeweils gewählten Avatar.

## Automatische Musiksteuerung

Bei aktivierter automatischer Motion Library wertet die bestehende
V536-Genreregie die importierten, **bereits geladenen und geeigneten** Clips aus.
Zusätzliche Mixamo-Namenshinweise unterscheiden:

- **Deutschrap:** Groove, Bounce, Hip-Hop, Head Nod und Swagger;
- **Hardtekk:** Hakken, Footwork, Gabber, Stomp und Bounce;
- **Hardstyle:** Jumpstyle, Jump, Power, Stomp und Kick.

Explizit gewählte Avatar-/Genre-/Songabschnitt-Kennzeichnungen bleiben höher
priorisiert als Dateinamen-Heuristiken. Neue Dateien werden nur nach
Skelettprüfung und Installation berücksichtigt. Manuell aktivierte
Choreografien, Loops und Timelines bleiben unverändert.

Die vorhandene Song-Phrasensteuerung schaltet Clips an musikalischen Grenzen
um; die vorhandene V492/V537/V630/V799-Engine übernimmt Crossfade,
Pose-Matching und Fußkontakt. Neue Mixamo-Clips erhalten einen begrenzten
Mindest-Crossfade je Songabschnitt, aber keine zweite AnimationMixer-Instanz.

Ein automatischer Mixamo-Clip mit Originalgeschwindigkeit 1 kann auf eine
**2-, 4-, 8- oder 16-Beat-Schleife** angepasst werden, wenn das mit einer
Tempoänderung von maximal **12 Prozent** möglich ist. Die Synchronisation
verändert keine Keyframes. Unbekannte BPM, manuelles Speed-Tuning, reduzierter
Bewegungsmodus, eigene Timelines, Ensembles und ungeeignete Clip-Längen
verwenden die ursprüngliche Geschwindigkeit. Der Takt einer fremden
Motion-Capture-Aufnahme lässt sich damit nicht zuverlässig erkennen; die
Anpassung ist bewusst konservativ.

Der CI-Test `tests/mixamo-dance-director-regression.cjs` prüft Genre-Ranking,
manuellen Vorrang, Beat-Grenzen und die Integration in den Avatar-Renderer.

## Genre-Auswahl, Beat-Timing und Übergänge

Nach dem Import können in der **Character & Motion Library** für jeden Clip
**Genre**, **BPM min/max** und **Songabschnitt** gesetzt werden. Nur wenn
**Automatische Motion-Auswahl** aktiv ist, darf der Live-Genre-Director
entsprechende Library-Motions verwenden. Bei selbst zugewiesenen Grenzen
werden fremde Genre-Familien, BPM außerhalb des eingestellten Bereichs und
unpassende Songabschnitte aus der automatischen Auswahl ausgeschlossen.
Ohne Kennzeichnung behalten ältere Clips ihr bisheriges Verhalten.

Die bestehende Live-Bühne bevorzugt bei Deutschrap natürliche Rap-Grooves,
bei Hardtekk Footwork/Hakken und bei Hardstyle Jumpstyle/Stomp-Moves.
Dies sind nachvollziehbare **Namensheuristiken**, keine garantierte
Stilerkennung aus den tatsächlichen Keyframes. Nutzerdefinierte Auswahl,
Timeline/Loops, Pausen und `reducedMotion` haben Vorrang.

Für passende automatisch spielende Mixamo-Loops wird die Abspielrate nur
geringfügig verändert (maximal 12 Prozent), falls die Clip-Länge nahe an
2, 4, 8 oder 16 Beats liegt und ein gültiges BPM vorliegt. Beim Wechsel auf
manuelle Wiedergabe oder andere Clips wird diese Tempoanpassung zurückgenommen,
sofern keine andere Steuerung die Abspielrate inzwischen selbst verändert hat.
Die Übergänge erfolgen über die bestehenden Crossfade-, Pose-Matching-
und Foot-IK-Systeme; es wird kein zweiter Animationsmixer erzeugt.

Regressionen: `node tests/mixamo-dance-director-regression.cjs`.

## Mixamo-Genre-Vorschläge sicher übernehmen

Unter **Einstellungen → Avatare → Character & Motion Library** gibt es nach
der Avatar-Auswahl den Bereich **Mixamo · Genre-Zuordnung für Konzertshows**.
Er zeigt die Anzahl noch nicht zugeordneter Mixamo-Motions mit eindeutigen
Dateinamen-Hinweisen. Mit einem Klick werden passende Genres markiert:

- Rap/Hip-Hop, Swagger, Breakdance → `deutschrap`
- Hardtekk, Hakken, Gabber, Footwork → `hardtekk`
- Hardstyle, Rawstyle, Jumpstyle → `hardstyle`

Bei mehrdeutigen Bezeichnungen (z. B. *Hakken Hardstyle*) oder allgemeinen
Wörtern wie *Bounce, Stomp, Groove* wird **keine** automatische Zuordnung
vorgeschlagen. Ebenso werden Motion-Einträge anderer Avatare und bereits
manuell zugeordnete Genres **nicht überschrieben**. Individuell veränderte
Kategorien bleiben bestehen. BPM-Grenzen und Songabschnitte werden nie aus
einem Dateinamen erfunden.

Diese Zuordnung ist ein optionaler Metadatenvorgang, kein automatischer Upload,
keine erneute Konvertierung und kein Hinweis auf bewiesene Bewegungsqualität.
Der bereits vorhandene Genre-Director darf die gesetzten Tags bei aktivierter
Automatik für die Auswahl geeigneter, geladener Clips berücksichtigen.

Test: `node tests/mixamo-tag-suggestions-regression.cjs`.

## Mixamo Konzert-Choreografie – Strophe, Hook, Build und Drop

Die vorhandene **V536/V588/V615/V639-Choreografieregie** erhält zusätzliche,
deterministische Mixamo-Hinweise. Sie greift nur auf **vorab geladene und für
diesen Avatar gültige Library-Motions** zurück, wenn die automatische
Motion-Auswahl aktiviert ist. Keine weiteren AnimationMixer, Netzwerkanfragen
oder geänderten GLB-Keyframes:

- **Strophe:** Die Hauptfigur bevorzugt Rap-Gestik/Performance bzw. im
  Hardtekk-Kontext Footwork. Weitere Tänzer nutzen eher passende Grooves.
- **Hook:** Groove/Bounce und stimmige Gruppenenergie. Bei mehreren Instanzen
  **desselben Avatar-Modells mit kompatibler Library** wird dieselbe
  automatische Auswahlspur für die Phrase verwendet.
- **Build / Pre-Drop:** Vorbereitendes Shuffle, Step und Footwork statt zu
  früh einsetzender harter Jump-/Stomp-Akzente.
- **Drop:** Hardtekk bevorzugt Hakken/Gabber/Footwork, Hardstyle eher
  Jumpstyle/Stomp/Power. Die Phrase wird über gleiche Modelle hinweg abgestimmt.
- **Break/Intro:** Ruhige Clips werden gegenüber harten Moves bevorzugt.

Die Bewertung ist bewusst ein kleiner Bonus innerhalb der bereits geeigneten
Auswahl. Festgelegte Genres, BPM-Grenzen, Songabschnitte, manuelle Clips,
Timelines, Loops, Gruppen-Clocks, Pause und reduzierter Bewegungsmodus bleiben
vorrangig. Bei mehreren **verschiedenen** Avatar-Rigs oder unterschiedlich
verfügbaren Animationen wird keine Identität der Clips behauptet. Die
eigentliche Zeitsynchronisation der Avatare liegt weiterhin bei den vorhandenen
Gruppen- und Beat-Systemen (V327/V328); die Fußkontakte, Pose-Matches und
Crossfades bei V492/V537 und den nachfolgenden Qualitätsstufen.

CI-Regression:
`node tests/mixamo-show-choreography-regression.cjs`.
