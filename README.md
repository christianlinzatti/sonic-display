**V473.3 – Next.js Client Directive Build-Hotfix:** korrigiert die Platzierung von `"use client"` in `StageCameraDirectorV289.tsx`, ergänzt die SWC-konforme Prüfung in `npm run check:syntax` und einen gezielten Regressionstest `npm run test:v4733`. Details: `V473.3-WEBPACK-CLIENT-DIRECTIVE-HOTFIX.md`.

# Sonic Display V473 — Automatic Rap Flow & Adlib Intelligence

**Neu V473:** zusätzliche, begrenzte Rap-Gesten für synchronisierte Phrasenanfänge,
Wortdichte, deutliche Zeitraten-Wechsel und *textuelle* Adlib-Kandidaten.
Keine automatische Sängererkennung oder Audio-Stimmanalyse.
Details: [V473-AUTOMATIC-RAP-FLOW-ADLIBS.md](V473-AUTOMATIC-RAP-FLOW-ADLIBS.md).

**Vorversion V472:** [Vocal-Aware Choreography](V472-VOCAL-AWARE-CHOREOGRAPHY.md).

V471: [Genre-Aware Dance](V471-GENRE-AWARE-DANCE.md): Deutschrap-/Rock-/Pop-spezifische Verse/Hook-Motions, Genre-Fusion und additive GLB-Bewegungen.

> **Neu in V470:** 34 Genres inklusive Pop-Rock, Indie-Rock, Punk-Rock, Indie-Pop, Electro-Pop und Dance-Pop; automatische Genre-Fusion für Bühne und Adaptive Dance. Siehe [V470-ROCK-POP-GENRE-FUSION.md](V470-ROCK-POP-GENRE-FUSION.md).

> **V467 – Intelligent Show Quality Advisor:** Der V466-Live-Inspektor erhält automatisch priorisierte **Handlungshinweise** für mehrmals gemessene FPS-Einbrüche, fehlende GLB-Meshes, Kopfpunkte außerhalb der Kamera und Überschneidungen mit Lyrics. Drei aktuelle Proben verhindern voreilige Warnungen. Alle Empfehlungen sind quellenmarkiert, nur lokal, rein informativ und ohne automatische Änderungen an Show, GLB-Clips oder manuellen Einstellungen. Siehe [V467-INTELLIGENT-SHOW-QUALITY-ADVISOR.md](V467-INTELLIGENT-SHOW-QUALITY-ADVISOR.md) und [V467-VERIFICATION.md](V467-VERIFICATION.md).

> **V466 – Real GLB Concert Quality Inspector:** Zuschaltbares **QA** direkt auf der 3D-Bühne; zeigt echte FPS-/Renderzähler, Kopfknochen-Projektion bzw. sichtbar markierte Schätzpunkte und Überschneidungen mit aktiven immersiven Lyrics. Keine neuen Grafikressourcen, keine Änderungen an manueller Choreografie oder Sängerrollen. Ergänzt durch einen lokalen Playwright-Browsertest (Fixture ≠ echtes GLB). Details: [V466-REAL-GLB-CONCERT-QUALITY-INSPECTOR.md](V466-REAL-GLB-CONCERT-QUALITY-INSPECTOR.md) und [V466-VERIFICATION.md](V466-VERIFICATION.md).

> **V465 – Visual Show Quality & Real-World Validation:** Bei drei bis vier automatisch eingerichteten Avataren werden während aktiver, synchronisierter immersiver Lyrics höchstens zwei automatisch eingeblendete Künstlernamen gezeigt. Manuelle Bühnenzuordnungen und „Immer anzeigen“ behalten Vorrang. Zusätzlich gibt es einen reproduzierbaren Chromium-/Playwright-Layouttest für beide Lyrics-Seiten und mehrere Displaygrößen. Die erfolgreich getestete Browser-Figur ist ausdrücklich nur ein **statisches Layout-Testmodell**, keine echte GLB-/Raspberry-Pi-Performance-Prüfung. Details: [V465-VISUAL-SHOW-QUALITY-VALIDATION.md](V465-VISUAL-SHOW-QUALITY-VALIDATION.md) und [V465-VERIFICATION.md](V465-VERIFICATION.md).

> **V464 – Automatic Concert Experience 3.0:** Langfristige visuelle Dramaturgie aus dem vorhandenen V446-Showplan: zurückhaltender Einstieg, ruhige Zwischenteile und begrenzt stärkere späte Gruppenmomente. Die gemeinsame V456/V457/V460-Regie bleibt für Tänze, Kamera, Künstler-Credits und Lyrics zuständig. V464 dosiert nur zusätzliche automatische Licht-, Gesten- und Bewegungsakzente und fügt keine neue Klang-/Sängererkennung, Einstellungen oder Render-Timer hinzu. Details: [V464-AUTOMATIC-CONCERT-EXPERIENCE-3.md](V464-AUTOMATIC-CONCERT-EXPERIENCE-3.md) und [V464-VERIFICATION.md](V464-VERIFICATION.md).

> **V463 – Raspberry Pi Performance & Stability:** V463 schützt die bereits vorhandenen V253/V254/V355-Regler vor Fehlentscheidungen direkt nach Songwechsel, Tab-Rückkehr, Pause/Fortsetzung und WebGL-Wiederherstellung. Eine einzige Session-Regie unterdrückt nur vorübergehende automatische Qualitätsanpassungen; die Renderdiagnose bleibt aktiv. Im manuellen Qualitätsmodus begrenzt der Langzeitschutz nicht länger die Auflösung. Mikrofonbetrieb bleibt berücksichtigt. Kein zusätzlicher Canvas, kein zusätzlicher Intervall pro Avatar und keine Änderung an Beat, GLB-Clips oder Spotify-Zeit. Details: [V463-RASPBERRY-PI-PERFORMANCE-STABILITY.md](V463-RASPBERRY-PI-PERFORMANCE-STABILITY.md) und [V463-VERIFICATION.md](V463-VERIFICATION.md).

> **V460 – Intelligent Feature Performance:** Gemeinsame visuelle Regie für Solo, kurze Duo-Antworten und Gruppen-Hooks mit 2–4 Avataren. Automatische Tanzrollen, Rapper-Sprechblasen, Spotlight und V454-Kamera bleiben synchron; manuelle Vocal-/Kamera-Zuordnungen und importierte GLB-Animationen haben Vorrang. Keine echte Sängererkennung und keine zusätzlichen Einstellungen. Details: [V460-INTELLIGENT-FEATURE-PERFORMANCE.md](V460-INTELLIGENT-FEATURE-PERFORMANCE.md) und [V460-VERIFICATION.md](V460-VERIFICATION.md).

> **V459 – Advanced Vocal Performance 3.0:** Wortzeitmarkenbasierte Koartikulation und dezente Gesichts-/Kopfakzente für Deutschrap und Gesang. Die bestehenden V453/V420/V423-Prioritäten bleiben geschützt: Keine erdachten Phonem-Zeitpunkte, keine Sprechererkennung und kein neues Setup. Details: [V459-ADVANCED-VOCAL-PERFORMANCE-3.md](V459-ADVANCED-VOCAL-PERFORMANCE-3.md) und [V459-VERIFICATION.md](V459-VERIFICATION.md).

> **V458 – Natural Dance & Stage Interaction 2.0:** Verfeinerte Gruppen-Hooks, versetzte Rap-Antwortgesten und kleine Schulter-/Kopfakzente für 2–4 Avatare. Enge Bühnenabstände und Foot-/Contact-IK schützen die importierten GLB-Tänze; die bestehende High/Balanced/Low-Qualität begrenzt Zusatzakzente. Keine neuen Einstellungen. Details: [V458-NATURAL-DANCE-STAGE-INTERACTION.md](V458-NATURAL-DANCE-STAGE-INTERACTION.md) und [V458-VERIFICATION.md](V458-VERIFICATION.md).

> **V457 – Show Quality & Performance:** Sanftere Übergänge der automatisch erzeugten Rap-Show zwischen Verse/Hook und visuellen Performer-Wechseln. Die bestehende GPU-/Render-Qualitätsstufe (High/Balanced/Low) begrenzt ausschließlich zusätzliche Auto-Show-Akzente; starke echte Audio-Energie und manuelle Choreografien bleiben erhalten. Keine neuen Einstellungen, keine zweite Audio-Engine. Details: [V457-SHOW-QUALITY-PERFORMANCE.md](V457-SHOW-QUALITY-PERFORMANCE.md) und [V457-VERIFICATION.md](V457-VERIFICATION.md).

> **V456 – Ultimate Automatic Show Director:** Ein gemeinsamer, rein lokaler Regieplan koordiniert V446-Rap-Szenen, V452-Gruppenbewegungen, V454-Kamera, die vorhandene Bühnenbeleuchtung und V451/V447–V450-Genius-Einblendungen. Bei Hooks stehen Tänzer und Gruppenaufnahme im Vordergrund, bei Lyrics bleibt Text gut lesbar, und Songinformationen erscheinen nur in geeigneten Zeitfenstern. Kein neuer Dienst, kein Upload, keine neue Einstellung. Gespeicherte Kamera-, Vocal- und Tanzvorgaben bleiben geschützt. Siehe [V456-ULTIMATE-AUTOMATIC-SHOW-DIRECTOR.md](V456-ULTIMATE-AUTOMATIC-SHOW-DIRECTOR.md) und [V456-VERIFICATION.md](V456-VERIFICATION.md).

> **V455 – Beautiful Lyrics Experience:** Ruhigere Wortanimationen bei schnellem Rap und bessere Zeilenlängen-Anpassung bei langen Lyrics, ohne vorhandene Styles zu ersetzen. Siehe [V455-BEAUTIFUL-LYRICS-EXPERIENCE.md](V455-BEAUTIFUL-LYRICS-EXPERIENCE.md).

> **V454 – Cinematic Concert Camera 2.0:** Ruhigere Verse-Portraits, breitere Hook-Gruppenaufnahmen für 2–4 Tänzer und weiche Übergänge auf Basis der vorhandenen automatischen V446-Show. Saved Kamera-Keyframes, manuelle Vocal-Rollen und Lyrics-Schutz bleiben maßgeblich; keine neuen Einstellungen. Mehr: [V454-CINEMATIC-CONCERT-CAMERA-2.md](V454-CINEMATIC-CONCERT-CAMERA-2.md).

> **V453 – Expressive Lip-Sync 2.0:** Optimierte Wort-Anschläge, Lippenverschlüsse und dezente Rap-Gesichts-/Kopfakzente für prozedurale und GLB-Avatare. Keine neue Einrichtung, keine behauptete Stimmerkennung, gespeicherte Mouth-Edits und Audio-Analysen bleiben maßgeblich. Details: [V453-EXPRESSIVE-LIP-SYNC-2.md](V453-EXPRESSIVE-LIP-SYNC-2.md).

> **V452 – Advanced Multi-Avatar Performance:** Automatische Hooks mit gemeinsamer Crew-Geste, leicht versetzte Rap-Antworten und sanfte Bühnengesten für 2–4 Avatare, ohne neue Einstellungen. Details: [V452-ADVANCED-MULTI-AVATAR-PERFORMANCE.md](V452-ADVANCED-MULTI-AVATAR-PERFORMANCE.md).

> **V451 – Smart Visual Show Balance:** Automatische Genius-Karten folgen jetzt dem Lyrics-Vorrang und einem gemeinsamen Ein-Karten-Budget; V449-Musikentdeckung bleibt manuell aufklappbar. Details: [V451-SMART-VISUAL-SHOW-BALANCE.md](V451-SMART-VISUAL-SHOW-BALANCE.md).

# Sonic Display V450 – Smart Music Connections & Artist Spotlight

V450 ergänzt den bestehenden Genius-Bereich um 10 Sekunden lange, automatisch rotierende Musikverbindungen (Sample, Remix, Produzent oder Feature) mit sicherem Genius-Link und direkter Spotify-Suchfunktion. Keine zusätzlichen API-Schlüssel oder Dienste. Einstellungen → Anzeige → V450. Weitere Details: `V450-SMART-MUSIC-CONNECTIONS.md`.

# Sonic Display V449 – Smart Artist & Music Discovery

**Neu in V449:** Verifizierte Genius-Sample-/Remix-/Cover-Verbindungen, Produzenten und Feature-Künstler unter der Songanzeige entdecken; per Klick in die bestehende Spotify-Suche übernehmen. Alles optional, eingeklappt, ohne neue API und ohne fiktive Stimmzuordnung. Details: [`V449-SMART-ARTIST-MUSIC-DISCOVERY.md`](V449-SMART-ARTIST-MUSIC-DISCOVERY.md). Prüfprotokoll: [`V449-VERIFICATION.md`](V449-VERIFICATION.md).

# Sonic Display V448 – Cinematic Genius Insights

**Neu:** Automatisch animierte Credits, ehrliche Sample-/Remix-Beziehungsliste und ein kurzer Wechsel zwischen Genius-Künstlerfoto (nur erlaubte Genius-Bilddomain), Spotify-Albumcover und Songinformationen. V447s ruhige Zeitfenster, sichere Lyrics-Annotationen, Trackwechsel-Schutz und die komplette 3D-Show bleiben erhalten. **Kein zusätzlicher Dienst und keine neue Konfiguration.** Optionaler V448-Schalter unter Anzeige/Lyrics; Reduced Motion wird respektiert. Siehe `V448-CINEMATIC-GENIUS-INSIGHTS.md` und `V448-VERIFICATION.md`.

# Sonic Display V447 – Smart Genius Song Insights

Automatische Songinformationen von Genius: kurze Hintergründe, Produzenten-/Songwriting-Credits, Featured Artists, Samples/Interpolationen und zeitlich **nur über vorhandene synchronisierte Lyrics abgeglichene** Annotationen. Serverseitiger `GENIUS_ACCESS_TOKEN`, strenger Song-Abgleich, optionale Anzeige ohne Eingriffe in Tanz, Kamera oder Lip-Sync. Siehe `V447-SMART-GENIUS-SONG-INSIGHTS.md` und `V447-VERIFICATION.md`.

# Sonic Display V446 – Smart Automatic Rap Show

**Neu:** Ein einziger standardmäßig aktivierter Show-Autopilot erzeugt stabile Szenen aus vorhandenen synchronisierten Lyrics, ersatzweise Tempo und Songdauer. Vorhandene Motion-Auswahl, 1–4 Feature-Avatare, Hook-Gruppenaufstellungen und **inferenzbasierte** Kameraansichten folgen demselben Szenenplan. Keine Python-Dienste, Uploads oder zusätzliche Setup-Schritte. Manuelle Zuordnungen und Choreografien behalten Vorrang; keine echte Stimmerkennung. Einstellungen: Rap Performance Editor → Automatic Motion Intelligence → V446. Siehe [`V446-SMART-AUTOMATIC-RAP-SHOW.md`](V446-SMART-AUTOMATIC-RAP-SHOW.md) und [`V446-VERIFICATION.md`](V446-VERIFICATION.md).

# Sonic Display V445 – Automatic Vocal Change Evidence

**Neu in V445:** Eine vorsichtige, lokale Erkennung **möglicher** Klang-/Sprecherwechsel aus **aktivem Mikrofon** und synchronisierten Lyrics. Größere Änderungen des groben Bass-/Mitten-/Höhen-Verhältnisses an Lyrics-Zeilengrenzen können eine kurze **anonyme, dezente Gruppenreaktion** auslösen. Ein sichtbarer Zeit-/Sicherheits-Hinweis erscheint im Rap Performance Editor → Automatic Motion Intelligence → V445; die Automatik und Empfindlichkeit sind einstellbar. **Wichtig: Das ist keine echte Sprechererkennung, keine Trennung von Instrumenten und Stimmen und keine Zuordnung eines Rappers zu einem Künstler-Slot.** V385-/V416-Rollen, GLB-Motions, Lip-Sync und Kamera-Edits bleiben geschützt. Ohne aktives Mikrofon oder ohne synchronisierte Lyrics bleibt die Analyse inaktiv. Mehr: [`V445-AUTOMATIC-VOCAL-CHANGE-EVIDENCE.md`](V445-AUTOMATIC-VOCAL-CHANGE-EVIDENCE.md); Tests: [`V445-VERIFICATION.md`](V445-VERIFICATION.md).

# Sonic Display V444 – Smart Multi-Artist Interaction & Vocal Focus

**Neu in V444:** Die automatisch erzeugte V442-Gruppenbühne (3–4 Künstler) nutzt jetzt die bestehenden V144-Kopf-/Augen- und V145-Armgesten-Engines für kleine, musikalisch motivierte Reaktionen. Eine ausdrücklich für den Track gespeicherte V385- oder V416-Rapper-Rolle steuert den Fokus der Interaktion; ohne solche Daten bleibt es eine **visuelle Bühnenchoreografie, keine Stimmerkennung**. Bei gemeinsamer Hook reagieren die Künstler gleichzeitig. Alle neuen Bewegungen sind abschaltbar und passen sich dem Reduced-Motion-Modus an.

- Standard: V444 aktiviert mit **60 %** Interaktionsintensität, änderbar im **Rap Performance Editor → Automatic Motion Intelligence → V444**.
- Die bestehende GLB-/Motion-Library, Vocal-Regie, Gesichts- und Lip-Sync-Engines bleiben unverändert. Die Interaktion nutzt ausschließlich kleine additive Look-/Gesture-Cues im 3D-Renderer.
- Nur auf der automatisch generierten V442-Gruppenbühne mit drei oder vier Avataren. Keine automatische Audio-Diarisierung, kein Umbenennen von Künstlern und keine gespeicherten Choreografie-Änderungen.
- Details: `V444-SMART-MULTI-ARTIST-INTERACTION.md`; Prüfungen: `V444-VERIFICATION.md`.

## V443 – Automatic Artist Spotlight & Stage Interaction

Die automatische V442-Gruppenbühne unterstützt jetzt dezente Künstler-Spotlights und gemeinsame Hook-Bewegungen. Andere Avatare richten sich leicht zum visuell fokussierten Bühnenplatz aus, dessen bestehende V441-Namensblase beim Cue-Wechsel animiert werden kann. Standardmäßig an, Intensität 65 %, im Rap Performance Editor einstellbar. Die automatische Regie greift nur bei aktivem 3-/4-Avatar-V442-Modus; eigene V416-Rollen, Gruppen-Timelines, Choreografien, reduzierte Bewegung und pausiertes Playback bleiben geschützt. Keine automatische Stimmen-/Rappererkennung. Details: `V443-AUTOMATIC-ARTIST-SPOTLIGHT.md`; Tests: `V443-VERIFICATION.md`.

## V442 – Multi-Artist Stage Director (3–4 Künstler)

Mehr als zwei unterschiedliche Spotify-Künstler auf einem Track? V442 kann automatisch **drei oder vier 3D-Avatare** besetzen, mit V441-Namensblasen, wechselnder Verse-Aufmerksamkeit, gemeinsamer Hook-Regie und unabhängiger V438-Motion-Auswahl je Bühnenplatz. Die bereits vorhandene V326-Gruppenbühne wird verwendet und nicht durch einen zweiten Renderer ersetzt. Optional lassen sich für Avatar 3 und 4 eigene Modelle auswählen.

Die Automatik ist standardmäßig aktiviert, benötigt die bisherige V440-Feature-Automatik und überschreibt keine manuell gewählten Formationen, Choreografien oder Rapper-Zuordnungen. Credits sind **keine** Stimmerkennung. Details: [`V442-MULTI-ARTIST-STAGE-DIRECTOR.md`](V442-MULTI-ARTIST-STAGE-DIRECTOR.md) und [`V442-VERIFICATION.md`](V442-VERIFICATION.md).

# V441 · Multi-Avatar Artist Name Bubbles

**Künstlernamen direkt auf der 3D-Bühne:** Basierend auf Spotify-Track-Credits hängen V441-Namens-Sprechblasen über den vorhandenen Avatar-Bühnenplätzen und folgen Formations- und Kamerabewegungen. Es gibt Comic-, Neon- und dezente Tags sowie die Modi Fokus/Verse/Hook, Songstart+Abschnittswechsel und dauerhaft. Eigene V416-Zuordnungen übersteuern den automatisch wechselnden visuellen Fokus, V385-Vocal-Priorität verhindert eine erfundene Sprecherzuordnung. Solo-Tags sind optional, alle Optionen sind im bisherigen Rap Performance Editor integriert. Die Sprechblasen steuern weder Audio noch Kamera und weisen **nicht** nach, welche Stimme singt. Die automatische Feature-Besetzung aus V440 bleibt auf zwei Avatare begrenzt. Siehe [V441-MULTI-AVATAR-ARTIST-NAME-BUBBLES.md](V441-MULTI-AVATAR-ARTIST-NAME-BUBBLES.md) und [V441-VERIFICATION.md](V441-VERIFICATION.md).

# V440 · Automatic Feature Motion Director

Neu: Zwei Avatare bei Feature-Songs mit mehreren Spotify-Künstler-Credits; unabhängige V438/V439-Motion-Sequenzen, wechselnder visueller Bühnen-/Kamerafokus, gemeinsame Hook-Bewegungen und separate Ein-/Ausschalter. Keine Singer- oder Stimmenzuordnung. Siehe [V440-AUTOMATIC-FEATURE-MOTION-DIRECTOR.md](V440-AUTOMATIC-FEATURE-MOTION-DIRECTOR.md) und [V440-VERIFICATION.md](V440-VERIFICATION.md).

## V439 – Automatic GLB Motion Analyzer

**Echte GLB-Keyframes statt nur Dateinamen:** V439 ergänzt die V438-Tanzautomatik um eine lokale, begrenzte Auswertung bereits installierter `.glb`-Motions. Der Browser misst Arm-/Beinaktivität, Gesamtbewegung und approximative Loop-Eignung und kombiniert diese mit Songabschnitt, Musikenergie und den vorhandenen Metadaten. Im Rap Performance Editor sind Messwerte und ein Vollscan verfügbar. Bis zu 12 noch nicht analysierte Clips für den aktiven Avatar werden bei aktiver Avatar-Automatik sequenziell ausgewertet; Ergebnisse bleiben browserlokal zwischengespeichert. **Deine manuellen Clip-Kategorien und Choreografien behalten Vorrang.** Die Analyse erkennt weder exakte Beat-Raster noch Fußkontakt; nicht auswertbare GLBs fallen auf V438 zurück. Details: [V439-AUTOMATIC-GLB-MOTION-ANALYZER.md](V439-AUTOMATIC-GLB-MOTION-ANALYZER.md) und [V439-VERIFICATION.md](V439-VERIFICATION.md).

## V438 – Automatic Motion Intelligence & Rap Show Composer

**Noch weniger Konfiguration:** V438 kombiniert automatisch **installierte** Tanzclips anhand von expliziten Clip-Kategorien, Dateinamen-Hinweisen, Genre, Tempo, Musikenergie und Songabschnitt. Wiederholungen werden vermieden und Clipwechsel an Phrasen-/Szenengrenzen vorgenommen. Mit aktivierter Motion-Library geschieht dies selbstständig; manuelle Choreografien, Timelines und Blend-Modi behalten Vorrang. Im Rap Performance Editor können Automatik, Motion-Library und Abwechslung eingestellt werden. **Wichtig:** Es ist eine Metadatenheuristik, keine echte GLB-/Skelettinspektion; ohne installierte Clips bleibt der bestehende Fallback aktiv. Details: [V438-AUTOMATIC-MOTION-INTELLIGENCE.md](V438-AUTOMATIC-MOTION-INTELLIGENCE.md) und [V438-VERIFICATION.md](V438-VERIFICATION.md).

## V437 – Automatic Rap Performance Director

**Möglichst automatisch:** Mit synchronisierten Lyrics steuert V437 jetzt zusätzlich zur V436-Kameraregie die Rap-Performance der vorhandenen Avatare: Verse-/Hook-Grundstruktur, Musikenergie, Bewegungsintensität/Variation, Mimik, Gesten und die vorhandene Rap-Lip-Sync-Funktion. Auch für einen Solo-Avatar. Standardmäßig eingeschaltet; ohne eigene Motion-Library bleiben reale Clipwechsel von den bisher installierten Animationen abhängig. Manuelle Tanz- und Vocal-Einstellungen behalten Vorrang; bekannte Nicht-Rap-Genres werden ausgenommen. Siehe [V437-AUTOMATIC-RAP-PERFORMANCE-DIRECTOR.md](V437-AUTOMATIC-RAP-PERFORMANCE-DIRECTOR.md) und [V437-VERIFICATION.md](V437-VERIFICATION.md).

## V436 – Automatischer Rap Camera Director & Auto-Fix Studio

**Weniger Handarbeit:** V436 erstellt bei aktiviertem V429 und mindestens zwei Avataren automatisch Verse-/Hook-Grundszenen aus synchronisierten Lyrics, wenn manuelle V416-Zuordnungen fehlen. Der ganze Song wird auf zu schnelle Shot-Folgen analysiert; daraus entstehen nicht-destructive per-line Korrekturen und ein songbezogenes V433-Übergangsprofil. V436 ist standardmäßig an, aktiviert die V429-Live-Kamera aber **nicht** selbst. Manuelle V416-/V430-Entscheidungen, V432-Keyframes, bestehende Kameraregie-Prioritäten und reduzierte Bewegung bleiben geschützt. Die Textstruktur erlaubt keine echte Stimm-/Rapper-Identifikation. Details: [V436-AUTOMATIC-RAP-CAMERA-DIRECTOR.md](V436-AUTOMATIC-RAP-CAMERA-DIRECTOR.md) und [V436-VERIFICATION.md](V436-VERIFICATION.md).

## V435 – Intelligent Rap Camera Quality Optimizer

In der vorhandenen V434-A/B-Vorschau gibt es jetzt eine begrenzte, **heuristische Qualitätsbewertung** mit Warnungen zu Kameratempo, zu kurzen Übergangs-/Haltezeiten und häufigen Shot-Wechseln. V435 kann die vorhandenen V433-Parameter als **unverbindlichen Entwurf für Variante B** optimieren; die bestehende manuelle Bestätigung bleibt zwingend. Keine zweite Live-Kamera, kein Spotify-Seek, keine tatsächliche Avatar-/Kollisionserkennung. Details: [V435-INTELLIGENT-RAP-CAMERA-QUALITY-OPTIMIZER.md](V435-INTELLIGENT-RAP-CAMERA-QUALITY-OPTIMIZER.md) und [V435-VERIFICATION.md](V435-VERIFICATION.md).

## V434 – Rap Camera Preview & Transition Studio

V434 erweitert die V433-Kameraregie um **einen editierbaren A/B-Vergleich mit gemeinsamer Lyrics-Zeitposition**, zwei visualisierten Übergangskurven und einer **on-demand 3D-Avatar-Vorschau**. A verwendet die gespeicherte V433-Weichheit/BPM-Raster-Einstellung, B ist ein separater Entwurf. Erst **„Variante B übernehmen“** speichert die zwei Werte in den bestehenden V433-Einstellungen; die Live-Aktivierung bleibt unverändert. Keine neue Bühnenkamera, keine Spotify-Seeks, keine Änderung an V432-Keyframes. Die Vorschau ist eine Annäherung auf Grundlage einer neutralen Verse-Kamera, V416-/V430-Szenen und der originalen V433-Interpolation. Sie ersetzt keinen Live-GPU-Sichttest. Siehe [V434-RAP-CAMERA-PREVIEW-TRANSITION-STUDIO.md](V434-RAP-CAMERA-PREVIEW-TRANSITION-STUDIO.md) und [V434-VERIFICATION.md](V434-VERIFICATION.md).


## V433 – Smart Rap Camera Transition Director

V433 ergänzt die automatische V429-/V430-Rap-Kameraregie um optional aktivierbare, sanfte Übergänge bei Rapper-/Shot-Wechseln. Vorhandene BPM-Werte und Kick-Akzente können als heuristische musikalische Startpunkte dienen; höchstens 160 ms Wartezeit. Die Live-Verwendung ist standardmäßig aus. V432-Keyframes und alle manuellen Kameramodi behalten Vorrang. Mehr dazu in [`V433-SMART-RAP-CAMERA-TRANSITIONS.md`](./V433-SMART-RAP-CAMERA-TRANSITIONS.md); Prüfung: [`V433-VERIFICATION.md`](./V433-VERIFICATION.md).

## V431 – Visual Rap Camera Timeline

Neu im bestehenden V429/V430-Kamerabereich: eine anklickbare Timeline mit synchronisierten Lyrics-Zeilen, schematischen Kamera-Perspektivvorschauen, Live-/Vorschau-Markierung, gespeicherten Shot-Anpassungen und direkter Weiterbearbeitung im V430-Editor. **Keine Spotify-Seeks oder Eingriffe in den Live-Kamera-Renderer.** Siehe [V431-VISUAL-RAP-CAMERA-TIMELINE.md](V431-VISUAL-RAP-CAMERA-TIMELINE.md) und [V431-VERIFICATION.md](V431-VERIFICATION.md).

## V430 – Rap Camera Shot Studio

Neu im V429-Kamerabereich: Pro synchronisierter, manuell zugeordneter Rap-Lyrics-Zeile eine Kameraperspektive wählen, Intensität einstellen oder V429 für diese Zeile aussetzen. Nur ausdrückliches Speichern übernimmt Änderungen; pro Spotify-Titel im Browser gespeichert. **Keine zusätzlichen Kameras, Spotify-Seeks oder Eingriffe in manuelle Keyframes.** Siehe [V430-RAP-CAMERA-SHOT-STUDIO.md](V430-RAP-CAMERA-SHOT-STUDIO.md) und [V430-VERIFICATION.md](V430-VERIFICATION.md).

## V429 – Cinematic Rap Camera Director

Optionale, sanfte Kamerabewegungen für die manuell zugeordneten V416-Rap-Szenen: Solo, Antwort, Duett und Hook. Mit Shot-Hold, eigener Intensität, Lyrics-Schutz und strenger Priorität für manuelle Kamera-Presets, V400-Zeitachsen sowie bestehende Duett-/Vocal-/Show-Kameras. Standardmäßig aus; **keine zweite Kamera und keine Spotify-Steuerung**. Einstellungen im V425-Ausdrucksregie-Panel im Rap Performance Editor. Siehe [V429-CINEMATIC-RAP-CAMERA-DIRECTOR.md](V429-CINEMATIC-RAP-CAMERA-DIRECTOR.md) und [V429-VERIFICATION.md](V429-VERIFICATION.md).

Hinweis: Die Versionsnummer folgt dem bereits angekündigten Kamera-Meilenstein V429; V427 und V428 wurden durch diesen Schritt nicht eigenständig umgesetzt.

## V426 – Smart Performance Quality Inspector

Neu im Rap Performance Editor: gemeinsame Lyrics-/Mund-/Artikulations-/Gesten-/Ausdrucks-/Rapper-Zeitachse, heuristische Auffälligkeiten, bearbeitbare Vorschläge und isolierte A/B-3D-Vorschau. **Keine automatische Übernahme oder Spotify-Seeks.** Siehe [V426-SMART-PERFORMANCE-QUALITY-INSPECTOR.md](V426-SMART-PERFORMANCE-QUALITY-INSPECTOR.md) und [V426-VERIFICATION.md](V426-VERIFICATION.md).

## V425 – Expressive Rap Performance Director

Optionale, szeneabhängige Rap-Ausdrucksregie für die bestehenden V416-Rollen; siehe `V425-EXPRESSIVE-RAP-PERFORMANCE-DIRECTOR.md`.

## V424 – Avatar Facial Calibration Studio

Geometriegestützte, vorsichtige Morph-Target-Intensitätsvorschläge für GLB-Avatare in der vorhandenen V370/V383-Gesichtsanimationsoberfläche. Standardmäßig bleiben alle manuellen Gains erhalten. Siehe [V424-AVATAR-FACIAL-CALIBRATION-STUDIO.md](V424-AVATAR-FACIAL-CALIBRATION-STUDIO.md) und [V424-VERIFICATION.md](V424-VERIFICATION.md).

# Sonic Display V423 – Audio-Aware Rap Lip-Sync

Neu: freiwillige lokale Audioanalyse (Datei-Import) und behutsame Audio-Merkmals-Unterstützung für Rap-Mundanimationen. Kein Spotify-Audiostream-Zugriff, keine automatische Phonemerkennung und keine Übertragung der Audiodatei. V420-Keyframes haben Vorrang. Siehe [`V423-AUDIO-AWARE-RAP-LIP-SYNC.md`](V423-AUDIO-AWARE-RAP-LIP-SYNC.md).

# Sonic Display V422 – Smart Articulation Assistant

Neu: Vorschläge für geglättete oder zurückhaltendere Mundform-Keyframes aus V419/V421-Vorhersagen, angezeigt im bestehenden V420-Editor. Nur ausdrückliche Übernahme als Entwurf, kein Autosave und kein Überschreiben gespeicherter Korrekturen. Details: [`V422-SMART-ARTICULATION-ASSISTANT.md`](V422-SMART-ARTICULATION-ASSISTANT.md).

# Sonic Display V421 – Articulation Comparison Studio

Neu in V421: A/B-Vergleich von automatisch geschätzten V419-Mundbewegungen und aktuellen V420-Keyframes (inklusive ungespeicherter Änderungen) pro Lyrics-Wort. Zwei Mundschemata, drei überlagerte Kurven, Zeitpunkt-Slider, A/B-Umschalter für die bestehende 3D-Kiefer-Vorschau und tabellarische Differenzen. Die Vergleichsansicht verändert die Live-Show nicht. Technische Details: `V421-ARTICULATION-COMPARISON-STUDIO.md`.

> **V420 Visual Syllable Articulation Editor:** Pro Song speicherbare, manuelle Mundform-Keyframes für echte Wortzeitstempel im Rap Performance Editor. Details in `V420-VISUAL-SYLLABLE-ARTICULATION-EDITOR.md`.

# V419 – Advanced Rap Syllable Articulation

Neu: optionale textgeschätzte Silben-/Vokal-Mundübergänge für wortgetakteten Deutschrap mit geschützten B/P/M-Verschlüssen. Siehe `V419-ADVANCED-RAP-SYLLABLE-ARTICULATION.md`.

## Neu in V418 – Rap Performance Quality Inspector

Die synchronisierten Lyrics, V414-Gesten, V415-Mundschätzung und V416-/V417-Rapper-Szenen werden in einer klickbaren gemeinsamen Zeitachse dargestellt. Mund-, Gesten- und Rollenversatz lassen sich unabhängig testen; Live-Korrekturen werden **nur nach ausdrücklicher Aktivierung** angewendet. Einzelheiten: [`V418-RAP-PERFORMANCE-QUALITY-INSPECTOR.md`](V418-RAP-PERFORMANCE-QUALITY-INSPECTOR.md).

# Sonic Display V417 – Smart Rap Performance Director

**Neue Version:** Lyrics-basierte, bearbeitbare Vorschläge für Solo-, Hook- und visuelle Antwort-Szenen. Jeder Vorschlag wird erst nach ausdrücklicher Bestätigung als V416-Szene gespeichert; die Live-Steuerung bleibt separat deaktivierbar. Keine automatische Sprechererkennung. Siehe [V417-SMART-RAP-PERFORMANCE-DIRECTOR.md](V417-SMART-RAP-PERFORMANCE-DIRECTOR.md).

# Sonic Display V416 – Multi-Avatar Rap Duet Studio

Neu: visuelle Lyrics-basierte Rapper-Rollen mit Solo, Call & Response, Duett und gemeinsamer Hook für zwei bis vier Avatare. Pro Spotify-Track gespeicherte, ausdrücklich aktivierbare Regie-Cues; bereits vorhandene Singer-Masks, Rap-Gesten und die automatische Kamera werden sicher wiederverwendet.

**Hinweis:** Die Zuordnung der Stimmen ist künstlerisch und manuell, keine automatische Erkennung echter Sprecher. Die neuen Live-Funktionen sind standardmäßig deaktiviert. Siehe [V416-MULTI-AVATAR-RAP-DUET-STUDIO.md](V416-MULTI-AVATAR-RAP-DUET-STUDIO.md) und [V416-VERIFICATION.md](V416-VERIFICATION.md).

# Sonic Display V415 – Advanced Rap Lip-Sync

Neu: schnellere, **textbasierte** Mundübergänge für Deutschrap, optionaler B/P/M-Verschluss und separater Mundversatz sowie zusätzliche Diagnosekanäle. Siehe [V415-ADVANCED-RAP-LIP-SYNC.md](V415-ADVANCED-RAP-LIP-SYNC.md) und [V415-VERIFICATION.md](V415-VERIFICATION.md).

# Sonic Display V414 – Visual Lyrics & Gesture Timeline

Neu: pro Wort/Zeile manuell zugeordnete Gesten und optional autorisierte Tanz-Cues, mit realen Lyrics-Zeitstempeln und lokalem Editor. Siehe [V414-VISUAL-LYRICS-GESTURE-TIMELINE.md](V414-VISUAL-LYRICS-GESTURE-TIMELINE.md).

## V413: Lyrics-Aware Choreography

Siehe [V413-LYRICS-AWARE-CHOREOGRAPHY.md](V413-LYRICS-AWARE-CHOREOGRAPHY.md).

> V412-Hotfix: `V412-TYPESCRIPT-LIVE-EDITOR-HOTFIX.md` behebt TS2322 im Live-Rap-Editor.

## Neu in V412: Rap-Choreografie-Presets für die Live-Show

Mehrere V411-Motion-Clips zu benannten, pro Avatar gespeicherten Presets zusammenfassen, im Editor laden oder **ausdrücklich** für den passenden Live-Avatar aktivieren. Wählbar sind zeitgesteuerte Sequenzen und heuristische Verse/Hook-Übergänge mit weichen Crossfades; manuelle Choreografien behalten Vorrang. Details: [V412-RAP-CHOREOGRAPHY-PRESETS.md](V412-RAP-CHOREOGRAPHY-PRESETS.md).

## Neu in V410 – Tanz-Motions + Rap-Performance im selben Avatar

Unter **Einstellungen → Anzeige → V410 Rap Performance Editor** wählst du einen echten GLB-/GLTF-Avatar und anschließend unter **Vorschau-Motion** eine eingebettete Animation, eine bereits am Avatar konfigurierte Animation oder eine Motion aus der installierten Charakter-Motion-Bibliothek. Mit **Motion-Tempo** (0,5× bis 1,5×), Verse/Hook und den bisherigen sieben Reglern prüfst du Tanz, Kopf-/Oberkörperakzente und Mundanimation zusammen.

Die Vorschau animiert eine **isolierte Kopie** des GLB-Modells. Sie nutzt keinen Spotify-Audiostream; Beat- und Rap-Demoimpulse sind simuliert. GLB-Retargeting ist rigabhängig. Weitere Details: `V410-RAP-MOTION-PREVIEW.md`.

# Sonic Display V409 – Real Avatar Rap Preview

Siehe [V409-REAL-AVATAR-PREVIEW.md](V409-REAL-AVATAR-PREVIEW.md) für die Erweiterungen in der V408-Rap-Performance-Einstellungsoberfläche.

# Sonic Display V408 – Interactive Rap Performance Editor

**Neu:** Interaktiver Editor unter Einstellungen → Anzeige mit 3D-Demovorschau und sieben live anwendbaren Reglern für Deutschrap. Siehe [V408-RAP-PERFORMANCE-EDITOR.md](V408-RAP-PERFORMANCE-EDITOR.md) und [V408-VERIFICATION.md](V408-VERIFICATION.md).

# Sonic Display V406 – Coordinated Rap Performance

Neu: sichtbare Wortakzente für Gesicht, Kopf, Schultern und Oberkörper auf derselben Lyrics-Zeitbasis. Details in `V406-COORDINATED-RAP-PERFORMANCE.md`.

> **V405 – Rap Lip-Sync & Visual Articulation:** siehe [V405-RAP-LIP-SYNC.md](V405-RAP-LIP-SYNC.md).

> **V404 – Production Stability & Quality Assurance:** siehe [V404-PRODUCTION-QUALITY-ASSURANCE.md](V404-PRODUCTION-QUALITY-ASSURANCE.md).

# Sonic Display V403 – Production Quality & Display Optimization

Die V403-Display-Optimierung ergänzt V402 um ein optionales, größen- und avatarabhängiges Pixelbudget, versteckte-Tab-Sampling-Sicherheit, eine Live-Produktionsdiagnose und einen unabhängigen Offline-Produktions-Vorcheck. Bestehende Einstellungen bleiben erhalten.

Siehe [V403-PRODUCTION-QUALITY.md](V403-PRODUCTION-QUALITY.md).

## V402 – Unified Concert Show Director

Optional coordinated Verse/Hook/Build/Drop cues for existing V387/V392/V393/V394 stage systems; per-channel switches, genre- and performance-sensitive intensity; manual timelines and lyrics zones are preserved. See `V402-UNIFIED-CONCERT-SHOW.md`.

## V401 – Vocal Camera Intelligence 4.0

Vocal-Kamera-Akzente auf Basis vorhandener Wort-Zeitmarken und V368-Gesichtsanimation. Einstellungen unter Avatar tuning. V400-Kameramarken und manuelle Regie haben Vorrang. Details: `V401-VOCAL-CAMERA-INTELLIGENCE.md`.

## V400 – Cinematic Camera Timeline (neu)

Die neue songbezogene Kamerazeitachse ergänzt das V399-Studio um manuelle Schnittmarken für Solo, Duett und Gruppenbilder, frei einstellbare Zoom- und Pan-Werte sowie direkte Schnitte oder sanfte Übergänge. Ein eigener 3D-Probelauf nutzt die V399-Mehrfach-Avatar-Vorschau. Gespeicherte Marken werden nur bei aktivierter Option auf den aktuellen Spotify-Song angewendet und respektieren bestehende Kamera-Timelines, manuelle Regie und Lyrics-Schutzzonen. Dokumentation: `V400-CINEMATIC-CAMERA-TIMELINE.md`. Offline-Test: `npm run test:v400`.

# Sonic Display V399 – Live Multi-Avatar Camera Studio

Neu: Eine nur bei Bedarf geladene 3D-Kameraprobe für 1–4 Tänzer mit gespeicherten V326-Formationen, Solo-/Duett-/Gruppenaufnahmen, Kamera-Orbit und Verse→Hook→Drop-Übergängen. V398-Abschnitts-Perspektiven lassen sich explizit übernehmen; alle bisherigen Features bleiben erhalten. Siehe [V399-LIVE-MULTI-AVATAR-CAMERA-STUDIO.md](V399-LIVE-MULTI-AVATAR-CAMERA-STUDIO.md).

# V398 – Camera Performance Studio

V398 adds a lazy-loaded interactive 3D camera preview, per-section framing and minimal shot hold tuning over the existing V397 show director. Disabled by default; see `V398-CAMERA-PERFORMANCE-STUDIO.md`.

## Sonic Display V397 – Intelligent Performance Experience

Neue optionale, abschnittssynchrone Show-/Vocal-/Ensemble-Regie. Details: `V396-INTELLIGENT-PERFORMANCE-EXPERIENCE.md`.

# Sonic Display V395 – Display Production & Stability Edition

Neu: begrenzte automatische WebGL-Wiederherstellung im Touchmodus, optionale Bildschirm-Wachhaltung und ein lokales Laufzeit-Diagnosepanel. Dokumentation: `V395-DISPLAY-PRODUCTION-STABILITY.md`. Alle V394-Funktionen bleiben erhalten.

# Sonic Display V394 – Cinematic Festival Show 3.0

**Neu:** Optionale, timeline- und genreabhängige Festivalregie für Rap-Verse, Builds, Hooks und Drops. Sanfte automatische Kamera, dynamischere vorhandene Spotlights/Lichtkegel, optionaler High-Tier-Laserfächer ohne Stroboskop. Standardmäßig aus. Details: [V394-CINEMATIC-FESTIVAL-SHOW.md](V394-CINEMATIC-FESTIVAL-SHOW.md).

# Sonic Display V393 – Vocal Performance Intelligence 3.0

**Neu:** Optionale Rap-/Gesangs-Gesten auf einer gemeinsamen, wortgenauen Lyrics-Zeitbasis. Kleine Kopf-, Blick-, Brust- und Armakzente ergänzen die bestehende Mund-/Gesichtsanimation, ohne gespeicherte Choreografien oder importierte Clips zu überschreiben. Details: `V393-VOCAL-PERFORMANCE-INTELLIGENCE.md`.

# Sonic Display V392 – Multi-Avatar Performance 3.0

**Neu:** Optionale, musikalisch phrasengebundene Lead-/Backing-/Tänzer-Rollen für Duos und 3–4er-Gruppen, mit sanfter Blickführung und reaktiven Dynamik-Abstufungen. Details: `V392-MULTI-AVATAR-PERFORMANCE.md`.

## V391 – Natural Dance Intelligence 3.0

Siehe [V391-NATURAL-DANCE-INTELLIGENCE.md](V391-NATURAL-DANCE-INTELLIGENCE.md).

## V390 – Expressive Facial Animation 2.0

Siehe `V390-EXPRESSIVE-FACIAL-ANIMATION.md`.

# V389 Windows Build Hotfix

Siehe `V389.1-WINDOWS-BUILD-HOTFIX.md` für den Fix der Dateinamenkollisionen und des Ably-Imports.

## V389 – Smart Display Calibration Studio

Live WebGL Messungen, device-/track-/cast-scoped Profilauswahl, lokaler Export und Touch-Bedienung. Siehe `V389-SMART-DISPLAY-CALIBRATION.md`.

# Sonic Display V388 – Display Performance & Touch Edition

Die optionale Touch-/Kiosk-Darstellung hat jetzt eine kompakte Bedienleiste mit Display-Profilen. Adaptive DPR-Grenzen wirken auf die Hauptbühne und die 3D-Lyrics-Studiovorschau, ohne Animationen oder Musikzeitstempel zu verändern. V387-Shows bleiben erhalten. Details: [V388-DISPLAY-PERFORMANCE-TOUCH.md](V388-DISPLAY-PERFORMANCE-TOUCH.md).

> **V387 – Intelligent Concert Show 2.0:** Musikstruktur-abhängige, abgestimmte Tanz-, Kamera-, Licht- und Nebel-Regie (Standard: aus). Details: [V387-INTELLIGENT-CONCERT-SHOW.md](V387-INTELLIGENT-CONCERT-SHOW.md).

# V386 – Expressive Concert Director

Mehr Ausdruck in mehrstimmigen 3D-Shows: visuelle Gesangsrollen, dezente Reaktionen der Begleittänzer, Lead-Übergaben, Gruppen-Hooks und optionale automatische Kamera- und Lichtakzente. Standardmäßig deaktiviert; gespeicherte Choreografien haben Vorrang. Details: [V386-EXPRESSIVE-CONCERT-DIRECTOR.md](V386-EXPRESSIVE-CONCERT-DIRECTOR.md).

# V385 – Multi-Vocal Performance Studio

Songbezogene, manuell zugeordnete Hauptstimmen, Feature-Parts und gemeinsame Hooks für 2–4 Avatare. Mit editierbarer Lyrics-Zeilenkarte, rollenbasierter Lippenanimation, visuellen Übergaben und automatischer Kamera (optional). Details: [V385-MULTI-VOCAL-PERFORMANCE-STUDIO.md](V385-MULTI-VOCAL-PERFORMANCE-STUDIO.md).

# Sonic Display V384 – Natural Vocal Articulation

V384 verbessert die auf zeitgestützten Lyrics basierenden Mundbewegungen, schützt B/P/M-Lippenverschlüsse, stabilisiert Rap-Kieferbewegungen und integriert die V383-Avatar-Kalibrierung. Siehe `V384-NATURAL-VOCAL-ARTICULATION.md`.

## V383 · Advanced Facial Rig

- Weitere VRM/Oculus-Blendshape-Namen erkennen, Rig-Kanalabdeckung und Warnungen anzeigen.
- Auch unbekannte Morph-Targets isoliert am echten GLB testen.
- Sichere Startkalibrierung ohne Überschreiben gültiger manueller Zuordnungen.
- Gesichtsprofile als validiertes JSON kopieren, übertragen und importieren.
- Dokumentation: [V383-ADVANCED-FACIAL-RIG.md](V383-ADVANCED-FACIAL-RIG.md).

## V382 · Advanced Kinetic Lyrics

Neu: wortgenaue, zeitbasierte Rap-/Festival-/Cinematic-Akzente in **2D und 3D**, weichere Troika-Farbübergänge, begrenzte Wortimpulse, optionaler Drop-Glow bei vorhandener Audioanalyse und dieselben Optionen im Visual Lyrics Studio. Siehe [V382-ADVANCED-KINETIC-LYRICS.md](V382-ADVANCED-KINETIC-LYRICS.md). Kein Audio-Download oder automatische Sänger-/Phonemerkennung.

## V381 – Visual 3D Lyrics Editor

Die 3D-Lyrics können jetzt im Visual Lyrics Studio per Maus oder Touch auf der Bühne verschoben und mit einem Eckgriff skaliert werden. Räumliche Positionen wirken über die persistenten Anzeigeeinstellungen auch auf der Hauptbühne. Geschätzte Gesichts-Schutzzonen, Auto-Platzierung und lokale benannte Layoutvorlagen sind enthalten. Siehe [V381-VISUAL-3D-LYRICS-EDITOR.md](V381-VISUAL-3D-LYRICS-EDITOR.md).

## V380 — Real 3D Lyrics Studio

Neuer optionaler WebGL-Vorschaumodus im Visual Lyrics Studio mit echten installierten GLB-Avataren, isolierter Clip-Abtastung, 3D-Lyrics und Bühnenlicht. Siehe [V380-REAL-3D-LYRICS-STUDIO.md](./V380-REAL-3D-LYRICS-STUDIO.md).

## V379 – Visual Lyrics Studio

Zentrale Live-Vorschau für Karaoke, Schrift, Animation und Kamera. [Details](V379-VISUAL-LYRICS-STUDIO.md).

# Sonic Display V378 – Cinematic Lyrics Composition

Neue optionale Lyrics-sichere Kamera-Komposition mit Kontrastplatte, Wörter-/Zeilen-Timing und gezieltem Lyrics-Fokus; Details siehe [V378-CINEMATIC-LYRICS-COMPOSITION.md](V378-CINEMATIC-LYRICS-COMPOSITION.md).

# Sonic Display V377 – Cinematic Duet Camera

Neue Funktion: synchronisierte Vocal-Kameraregie für Rap-Dialoge, Rollenwechsel und Hooks. Bestehende Einstellungen und Choreografien bleiben erhalten; **V377 ist standardmäßig aus**.

- Dokumentation: [V377-CINEMATIC-DUET-CAMERA.md](V377-CINEMATIC-DUET-CAMERA.md)
- Test: `npm run test:v377` / `npm run check:syntax` / nach `npm install`: `npm run verify`.

# Sonic Display V376 – Interactive Vocal Duets

See [V376-INTERACTIVE-VOCAL-DUETS.md](V376-INTERACTIVE-VOCAL-DUETS.md).

# Sonic Display V374 – Vocal Performance Quality Engine

**Aktuelle Version: `0.1.0-v374`.** Neu unter **Settings → Avatar & Tanz → V374 · Vocal Performance Quality Engine**: weichere geschätzte Lippenübergänge, beruhigte Rap-Gesten und visuelle Lead-/Backing-/Phrasenwechsel für mehrere Tänzer. Die V372-Koordination und der V373-Sync-Inspector bleiben vorhanden und werden weiterverwendet. Die visuelle Lead-Rolle ist keine Erkennung der tatsächlichen Gesangsstimme.

**[V374-Dokumentation und Prüfstatus](V374-VOCAL-PERFORMANCE-QUALITY.md)**

---

# Sonic Display V373 – Vocal Sync Inspector

**Aktuelle Version: `0.1.0-v373`.** Neues Diagnose- und Timingstudio unter **Settings → Avatar & Tanz → V373 · Vocal Sync Inspector öffnen**. Zwischen echtem Spotify-Song und klar gekennzeichneten Test-Lyrics wechseln, Zeitpunkte vorab prüfen, vorhandene Wort-/Zeilenmarken nachvollziehen, berechnete Mund-, Mimik-, Kopf- und Gestenwerte live betrachten und Lyrics-/Avatar-Versatz einstellen. Keine Audiotranskription und keine Messung echter Synchronpräzision.

**[V373-Dokumentation und Prüfstatus](V373-VOCAL-SYNC-INSPECTOR.md)**

## Versionshistorie

### V372 – Unified Vocal Performance Director

Die nächste Version integriert Lipsync, Mimik, Kopf und Gesten auf einer gemeinsamen Spotify-/Lyrics-Zeitbasis. Neues Konfigurationsfeld **V372 · Unified Vocal Performance Director** mit Kopplungsstärke und gemeinsamem Timingversatz. Ausführliche Informationen: **[V372-UNIFIED-VOCAL-PERFORMANCE.md](V372-UNIFIED-VOCAL-PERFORMANCE.md)**.

Die vollständige Historie und alle bisherigen Funktionen der V371 bleiben im Projekt erhalten. Bei wortlosen Passagen greift die neutrale Fallback-Logik, manuelle V370-Demos sind unverändert.

**V371 – Expressive Vocal Performance (Historie).** Siehe [V371-Dokumentation](V371-EXPRESSIVE-VOCAL-PERFORMANCE.md).

## V370 — Advanced Facial Animation Studio

Neu: erweiterbares Studio unter **Settings → Avatar & Tanz → Gesichtsanimation-Studio**; automatische GLB-Morph-Erkennung, manuelle per-Avatar-Zuordnung, Intensitätsregler und isolierte 3D-Live-Vorschau mit Rap-/Gesangs-Demos. Das Studio übernimmt vorhandene V367–V369-Lipsync-Controller, Spotify-/Lyrics-Funktionen und Kameraautomatik unverändert. Details: [`V370-ADVANCED-FACIAL-ANIMATION-STUDIO.md`](V370-ADVANCED-FACIAL-ANIMATION-STUDIO.md).

## V369 – Facial Performance & Vocal Camera

- Natürlichere Kiefer- und Lippenkoordination, optional sanfte Face-Close-ups bei markanten Rap-/Gesangsstellen, abhängig von echten Wortzeitstempeln.
- Manuelle Kamerapresets und Lyrics-Schutz bleiben maßgeblich. Neue Einstellungen bei den Avataren.
- Details: [V369-FACIAL-PERFORMANCE-CAMERA.md](V369-FACIAL-PERFORMANCE-CAMERA.md).

> **Historische Projektversion: V368 – Vocal Performance Engine & Focus Karaoke.** Neue Rap-/Gesangs-Artikulation, Silben-/Vokalformen, Lippenverschluss, optionales Blinzeln/Mimik, GLB-Morph-/Kiefer-Overlay sowie die dezente Lyrics-Fortschrittsleiste. Einstellungen unter Avatar; die bisherige Spotify-Lyrics-Anbindung bleibt bestehen. Details und Prüfstatus: [V368-VOCAL-PERFORMANCE-ENGINE.md](V368-VOCAL-PERFORMANCE-ENGINE.md).

> **V367 – Vocal Performance & Focus Karaoke:** Lippensynchrone Tänzer (GLB-Visemes/Kiefer oder prozedural), zeilen-/wortbasierte Artikulation, zuschaltbare Audio-Hybridreaktion, fokussierte responsive Lyrics-Ansicht. Details: [V367-VOCAL-LIP-SYNC-AND-LYRICS.md](V367-VOCAL-LIP-SYNC-AND-LYRICS.md).

> **V365 – Web Push mit VAPID, Upstash Redis und Vercel Cron.** Einrichtung: [V365-REAL-WEB-PUSH.md](V365-REAL-WEB-PUSH.md).

# Sonic Display V363 – Smart Release Notifications

**Neu:** Beim Öffnen der verbundenen App automatisch neue Alben und Singles gefolgter Spotify-Künstler prüfen (höchstens alle 6 Stunden; begrenzte rotierende Stichprobe von bis zu 8 Künstlern) und als **🔔 Neuheiten** mit lokalem Ungelesen-Zähler, Cover, Datum und Spotify-Link anzeigen. Bereits bekannte Album-IDs nicht erneut melden; gelesen/angesehen mit V362 synchronisieren. Kein Hintergrund-Push, keine Vollständigkeitsgarantie. Vollständige Beschreibung: [V363-SMART-RELEASE-NOTIFICATIONS.md](V363-SMART-RELEASE-NOTIFICATIONS.md); Tests: [V363-VALIDATION.txt](V363-VALIDATION.txt).

---

# Sonic Display V362 – Personal Release Radar

Neu: **✦ Release Radar** für gefolgte Künstler und Genre-Neuheiten (manuell und mit klaren Spotify-API-Grenzen). Siehe [`V362-PERSONAL-RELEASE-RADAR.md`](V362-PERSONAL-RELEASE-RADAR.md) und [`V362-VALIDATION.txt`](V362-VALIDATION.txt).

# Sonic Display V361 — Smart Music Discovery

**Neu in V361:** „♫ Musik entdecken“ mit Genres, Spotify-Neuheiten (`tag:new`, Alben/Singles), Songsuche, „Meine Songs“, Erscheinungsdaten, optionalen Spotify-Hörproben sowie Speichern/Entfernen über die neue Spotify-Library-API mit abschließender Statuskontrolle. Alle Funktionen von V360 bleiben erhalten.

**Details und API-Grenzen:** [V361-SMART-MUSIC-DISCOVERY.md](V361-SMART-MUSIC-DISCOVERY.md). **Tests:** [V361-VALIDATION.txt](V361-VALIDATION.txt). Neue Spotify-Bibliotheksrechte erfordern nach dem Update eine erneute Anmeldung.

---

## V360 – Smart Artist Discovery (NEU)

Über **✦ Künstler entdecken** lassen sich Spotify-Künstler über Genres oder Freitext suchen, die eigenen Top-Künstler aufrufen und Spotify-Follow-Status direkt prüfen bzw. ändern. Bilder, Genre-Angaben (wenn von Spotify geliefert) und eine Such-Titelauswahl sind enthalten. Login erfordert für die Favoriten nach erneuter Anmeldung `user-top-read`; die V359-Follow-Scopes bleiben erhalten. Künstler-Suche ist keine personalisierte Empfehlung und die Titelauswahl keine Popularitätsrangliste. Vollständige Hinweise: [V360-SMART-ARTIST-DISCOVERY.md](V360-SMART-ARTIST-DISCOVERY.md).

# Sonic Display V359 – Spotify Artist Follow

Version `0.1.0-v359`, basierend auf dem vollständigen V358-Release. Beim aktuellen Spotify-Titel werden alle verfügbaren Künstler einzeln mit ihrem Follow-Status angezeigt; per Button können sie über Spotifys **2026 Library API** gefolgt bzw. entfolgt werden. Der Status wird nach Schreibzugriff erneut serverseitig bestätigt. OAuth-Neuverbindung mit Follow-Rechten erforderlich. Details, Einschränkungen der Spotify-Dokumentation, Tests: [V359-SPOTIFY-ARTIST-FOLLOW.md](V359-SPOTIFY-ARTIST-FOLLOW.md).

**Validierung:** 102/102 Offline-Prüfkommandos, 464 TS-/TSX-Syntaxprüfungen, strenge isolierte Typprüfung der API-Helfer. Der vollständige Next.js-Build benötigt lokal installierte npm-Pakete. Lokal `npm install && npm run verify`.

---

# Sonic Display V358 – Adaptive Show Learning

Version `0.1.0-v358`, basierend auf dem vollständigen V357-Release. Optionale lokale Lernhistorie für **tatsächlich abgespielte** automatische Kamera-/Formationskombinationen mit frischen V355-FPS/P95-Messwerten und klar gekennzeichnetem heuristischen V357-Show-Score. Aktivierung nur nach Opt-in; keine Speicherung von Song-IDs, Lyrics oder Bildern; begrenzte Datensätze, nachvollziehbare Statistik, Löschfunktion und manuelle Regie mit Vorrang. Siehe [V358-ADAPTIVE-SHOW-LEARNING.md](V358-ADAPTIVE-SHOW-LEARNING.md).

**Validierung:** 101/101 Offline-Prüfkommandos, 461 TS-/TSX-Syntaxprüfungen, strenge isolierte Typprüfung der V354/V356/V357/V358-Planungsservices. Der vollständige Next.js-Build bleibt ohne npm-Pakete ungeprüft. Lokal `npm install && npm run verify` ausführen. Details: `V358-VALIDATION.txt`.

---

# Sonic Display V357 – Show Quality Intelligence

Version `0.1.0-v357`, based on the full V356 release. A deterministic, bounded quality balancer improves automatically generated camera/formation variety and caps joint FX/light intensity when lyrics or multi-photo screens are visible. Independent opt-in settings, song-time-stable shot decisions and an honest heuristic quality-preview; manually authored V354 timelines and the V355 performance safeguards remain authoritative. See [V357-SHOW-QUALITY-INTELLIGENCE.md](V357-SHOW-QUALITY-INTELLIGENCE.md).

**Verification:** 100/100 offline verification commands passed; 459 TS/TSX syntax files checked; isolated V354/V356/V357 planner strict TypeScript type check passed. Complete Next.js build / project-wide semantic type check **not verified** without npm dependencies. To finish locally: `npm install && npm run verify`.

---

# Sonic Display V356 – Autonomous Show Intelligence 2.0

Version `0.1.0-v356`, based on the full V355 project. V356 adds deterministic, song-time-aligned multi-phrase show planning for camera, formation, lighting, visual effects and eligible GLB dance motion variety. It preserves V351 lyrics safety and V354 authored show priorities, as well as V355 performance protection. See [V356-AUTONOMOUS-SHOW-INTELLIGENCE.md](V356-AUTONOMOUS-SHOW-INTELLIGENCE.md) for settings, supported overrides and known limits.

**Verification:** 99/99 offline test commands passed, 457 TS/TSX syntax checks passed, and the isolated V356 planner TypeScript semantic check passed. Complete `next build` / project-wide `tsc` need installed npm dependencies and are not verified here. Run `npm install` then `npm run verify` on your machine.

---

# Sonic Display V355 – Performance & Stability

Version `0.1.0-v355`, based on the complete V354 release. The new long-session guard coordinates existing render diagnostics, adaptive DPR, optional DanceFX/VisualFX limits and touchscreen/Raspberry Pi device profiles. It uses a 5-second sampler, hysteresis and a cooldown to avoid oscillation while preserving lyrics, beat timing and authored show cues. Settings: **Diagnostics → V355 Performance & Stability**. Details: [V355-PERFORMANCE-AND-STABILITY.md](V355-PERFORMANCE-AND-STABILITY.md).

**Verification:** 98/98 offline regression commands passed; 455 TS/TSX syntax checks passed. Production Next.js build and full TypeScript semantic verification remain blocked by unavailable npm dependencies. Install locally with `npm install`, then run `npm run verify`.

---

# Sonic Display V354 – Show Timeline Editor

Version `0.1.0-v354`, based on complete V353. Multi-track show composition with dance formation, camera, lighting, effects, photo opacity and lyrics focus. Touch-friendly clip editing, scoped song-time playback, bounded local persistence, JSON import/export. See [V354-SHOW-TIMELINE-EDITOR.md](V354-SHOW-TIMELINE-EDITOR.md).

**Build status:** 97/97 offline regression steps passed; Next.js build and full TypeScript check blocked by missing dependencies in this environment. Install dependencies with `npm install` and run `npm run verify` locally.

---

## V353 – Visual Effects Studio

Visueller Editor für Partikel, Glow, Hintergrund-Shader und 2D-/3D-Fotoübergänge; fünf Genre-Presets, bis zu acht eigene Presets und CSS-Live-Simulator. Die Effektsteuerung verwendet den bestehenden R3F-Canvas, respektiert V351-Lyrics-Schutz sowie manuelle V352-Regie und reduziert GPU-Aufwand im Low-Power-Modus. Einstellungen unter `Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V353 – Visual Effects Studio`. Details: [V353-VISUAL-EFFECTS-STUDIO.md](V353-VISUAL-EFFECTS-STUDIO.md). **Wichtig:** Für Änderungen der Fotoübergänge muss V347 aktiviert sein; der Produktionsbuild bleibt in diesem Paket ungeprüft, solange die npm-Abhängigkeiten fehlen.

## V352 – Genre Visual Director

Automatische Bühnenstile für Deutschrap, Hardstyle, Hardtekk, Techno, Rock, Ambient und Pop. Die vorhandene Smart Stage Composition (V351) koordiniert die Inhalte weiterhin; V352 ergänzt passende Farbszenarien, Licht-, Kamera-, Effekt- und Fotobewegungsprofile. Manuelle Kameraeinstellungen und Bühnen-Presets bleiben standardmäßig erhalten. Einstellung und Live-Cue-Simulator: `Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V352 – Genre Visual Director`. Details: [V352-GENRE-VISUAL-DIRECTOR.md](V352-GENRE-VISUAL-DIRECTOR.md).

## V351 – Smart Stage Composition

V351 koordiniert Avatare, Bühnenfotos, 3D-Lyrics, Beleuchtung, DanceFX und automatische Kamerafahrten in einer gemeinsamen Regie mit Inhaltsprioritäten und Schutzabständen. Einstellungen und interaktiver Szenensimulator: `Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor`. Details und die Roadmap V352–V355: [V351-SMART-STAGE-COMPOSITION.md](V351-SMART-STAGE-COMPOSITION.md).

## V350 – Lyrics & Photo Choreography

Die Lyrics-Foto-Choreografie bleibt weiterhin verfügbar und wird von V351 bei Bedarf ergänzt. Details: [V350-LYRICS-PHOTO-CHOREOGRAPHY.md](V350-LYRICS-PHOTO-CHOREOGRAPHY.md).

## V349 – Intelligent Photo Selection

Die optionale neue Bildauswahl passt Künstlerfotos individuell an 2D- und 3D-Bildrahmen an, bevorzugt brauchbare Auflösungen, reduziert Wiederholungen und zeigt eine Bewertungs-Vorschau im Gallery Preview Editor. Details: [V349-INTELLIGENT-PHOTO-SELECTION.md](V349-INTELLIGENT-PHOTO-SELECTION.md).

## V338 – Mehrere Bilder auf der 3D-Leinwand (ohne QR-Codes)

Diashow, Collage und Einzelfoto für Künstlerbilder und Konzertplakate. Siehe [V338-MULTI-IMAGE-GALLERIES.md](V338-MULTI-IMAGE-GALLERIES.md).

## V337 – Interactive Concert Display

Details in `V337-INTERACTIVE-CONCERT-DISPLAY.md`.

## V335 – Artist Information & Concert API Plugins

Siehe [V335-ARTIST-INFORMATION-CONCERT-PLUGINS.md](V335-ARTIST-INFORMATION-CONCERT-PLUGINS.md).

## V334 – Intelligent Content Scheduling

Per-screen scheduled Stage Content sources with priorities, durations and music-section filters. V333 layout and V331/V332 live-push rules are preserved. See `V334-INTELLIGENT-CONTENT-SCHEDULING.md`.

# V333 – Visual Stage Content Composer

Neu: bis zu fünf konfigurierbare 3D-Leinwände mit visueller Bühnenübersicht, eigenen Content-Plugins und Push-Prioritäten. Dokumentation: [V333-VISUAL-STAGE-CONTENT-COMPOSER.md](V333-VISUAL-STAGE-CONTENT-COMPOSER.md).

## V332 — Vercel Realtime Stage Push

Optionaler zentraler Ably-Kanal für sofortige Textnachrichten auf mehreren Displays und Serverinstanzen. Siehe [V332-VERCEL-REALTIME-STAGE-PUSH.md](V332-VERCEL-REALTIME-STAGE-PUSH.md).

## Neu: V330 – Stage Content Plugins (Spotify Canvas, Artist-Fotos, Texte, Konzerte)

Konfigurierbare 3D-Leinwand auf der Avatar-Bühne mit Quellen-Rotation, optionalen Coverfarben und erweiterbaren lokalen JSON-API-Adaptern. Die Funktion bleibt standardmäßig ausgeschaltet. Siehe [V330-STAGE-CONTENT-PLUGINS.md](V330-STAGE-CONTENT-PLUGINS.md).

## V329 — Intelligent Motion Phrase Matching

Neue optionale Analyse vorhandener GLB-Animationsclips für drei bis vier Tänzer: gewichtetes Matching von Fuß-/Beinbewegungen, Körperhaltung, Root-Bewegung und zeitlichem Bewegungsverlauf. Passende Clips können per Gruppenregie ausgewählt werden. V328-Phasenversätze sind optional. Die Vorschau zeigt vorgeschlagene Clips und deren heuristischen Ähnlichkeitswert. Manuelle Clip-Auswahl und Choreografien behalten Vorrang. Details: [V329-INTELLIGENT-MOTION-PHRASE-MATCHING.md](V329-INTELLIGENT-MOTION-PHRASE-MATCHING.md).

## V328 – Advanced Motion Synchronization Studio

Die optionale V328-Gruppenregie steuert nun **tatsächliche GLB-Clip-Phasen** für drei oder vier Tänzer: gemeinsame Beat-Zykluslängen (1/2/4/8/16 Beats), individuellen Beat-Versatz, eine gemeinsame Startposition, Clip-Auswahl je Slot und 3D-Vorschau. V318-Beatmarker kommen live nur bei expliziter Songbindung zum Einsatz; ansonsten nutzt V328 das BPM-Raster. Manuelle Motion-Timelines, Loop-Presets und Animation-Layer behalten Priorität. Alle ursprünglichen Clip-Keyframes bleiben unverändert. **Standardmäßig deaktiviert.** Einzelheiten und Einschränkungen: [V328-ADVANCED-MOTION-SYNCHRONIZATION-STUDIO.md](V328-ADVANCED-MOTION-SYNCHRONIZATION-STUDIO.md).

## V327 – Intelligent Group Dance Synchronization

Aufbauend auf V326 koordiniert V327 die **musikreaktiven Zusatzakzente** von drei oder vier Avataren über Unison, versetzte Akzente, Call & Response oder alternierende Tänzer. Ein neuer opt-in-Schalter, einstellbare Stärke/Beat-Verzögerung und ein pulsierender 3D-Vorschauindikator sind in das bisherige Gruppenstudio integriert. Importierte Beatmarker stehen bei aktiver Songbindung zur Verfügung; ohne sie wird das BPM-Raster verwendet. **GLB-Keyframe-Zeiten und Foot-IK bleiben unverändert.** Details: `V327-INTELLIGENT-GROUP-DANCE-SYNCHRONIZATION.md`.

## V326 – Advanced Multi-Avatar Stage Director

Optionaler Gruppenmodus für drei oder vier getrennt animierte 3D-Avatare. Neue Formations-Timeline mit Solo-Cues, Abstandsregelung, Beat-/Takt-Raster (V318-Fallback), anpassbaren Bühnenpositionen, synchronisierter 3D-Vorschau, Auswahl weiterer Modelle, JSON-Export/Import und optionaler Songbindung. Die ältere Zwei-Avatar-Bühne und sämtliche V325-Choreografien bleiben ohne Aktivierung unangetastet. **Settings → Avatar → Multi-Avatar Choreography → Advanced Multi-Avatar Stage Director V326.** [Ausführliche Anleitung](V326-ADVANCED-MULTI-AVATAR-STAGE-DIRECTOR.md).

## V324 — Adaptive Ensemble Balance

Optional two-dancer stage-space formation coordinator: conservative spacing/lane preservation, smoothly paced role transitions, solo focus and drop expansion. Own controls are available inside Multi-Avatar Choreography settings. V322 world foot-lock reduces V324 travel speed. The underlying GLB clips, foot IK, V323 full-body balance and legacy solo/manual behavior remain intact. Detailed documentation: [V324-ADAPTIVE-ENSEMBLE-BALANCE.md](V324-ADAPTIVE-ENSEMBLE-BALANCE.md).

## V323 – Advanced Full-Body Balance

Neue optionale Ganzkörper-Gegenbalance anhand der vorhandenen Fußkontakt-Erkennung: weicher Standbeinwechsel, gedämpfte Drehungen aus der animierten Hüftausrichtung und dezente Landungsabfederung. Bleibt standardmäßig deaktiviert, verändert keine GLB-Keyframes oder Foot-IK-Regeln und erfordert einen kompatiblen GLB-Avatar mit aktivierter Foot-IK. **Settings → Dynamic Stage → Smart Stage Director → Advanced Full-Body Balance V323.** Details und Einschränkungen: [V323-ADVANCED-FULL-BODY-BALANCE.md](V323-ADVANCED-FULL-BODY-BALANCE.md).

## V322 – Intelligent Foot Lock & Ground Contact

Die bestehende Foot-IK bekommt optional begrenzte Fußanker in Weltkoordinaten, sanftes Loslösen beim Abheben, vorsichtige Bodenhöhen-Nachführung und live anzeigbare Standphasen. Standardmäßig ausgeschaltet, um bisherige GLB-Tänze unverändert zu lassen. Einstellungen: **Settings → Dynamic Stage → Smart Stage Director → Intelligent Foot Lock V322**; die Vorher/Nachher-Vorschau in Avatar Preview kann weiter genutzt werden. Die vollständige Anleitung und Einschränkungen: [V322-INTELLIGENT-FOOT-LOCK.md](V322-INTELLIGENT-FOOT-LOCK.md).

## V321 – Advanced Motion Quality Studio

Im Avatar-Motion-Bibliotheksbereich ergänzt V321 die bestehende GLB-Diagnose um zeitgestempelte Auffälligkeiten, optionale Kopie-basierte Quaternion-Glättung und zwei synchronisierte 3D-Vorschauen. Eine Korrektur auf der Live-Bühne muss explizit aktiviert werden; Root-/Fußtranslaten und Originaldateien bleiben unangetastet. Möglicher Foot-Sliding wird nur als Hinweis erkannt. Siehe [V321-ADVANCED-MOTION-QUALITY.md](V321-ADVANCED-MOTION-QUALITY.md).

# Sonic Display V319 — Advanced Motion Timeline Studio

Der vorhandene Motion Timeline Studio-Sequencer zeigt jetzt trackbezogene importierte Beat-/Taktmarkierungen aus V318. Clips lassen sich im selben Editor verschieben, kürzen, ein- und ausblenden sowie zur gemeinsamen Zeitposition in 3D betrachten. Die neue absolute Songzeit-Bindung ist optional und wird nur für den zugeordneten Titel verwendet; alle bisherigen Funktionen bleiben bestehen. Ausführliche Informationen: [V319-ADVANCED-MOTION-TIMELINE.md](V319-ADVANCED-MOTION-TIMELINE.md).

---

# Sonic Display V318 – Unified Track Analysis Engine

Neu: Optionale, sichere JSON-Trackanalyse (Beats, Bars, BPM, Sections) mit Live-Fallback und trackbezogenem lokalem Cache. Siehe `V318-UNIFIED-TRACK-ANALYSIS.md`. Es wird keine private Spotify-API aufgerufen.

## V316 – Live Dance Comparison Studio

Echter, optionaler Side-by-Side-WebGL-Vergleich der V315-Verbesserungsvorschläge: synchronisierte 3D-Bühnen mit dem vorhandenen additiven Dance Engine und den automatischen Show-Cues; Benutzerwerte bleiben vor dem Übernehmen unberührt. Siehe [`V316-LIVE-DANCE-COMPARISON.md`](V316-LIVE-DANCE-COMPARISON.md).

## V315 – Visual Dance Improvement Assistant

V314-Auswertung → begründete Reglerempfehlungen, konkrete Vorher/Nachher-Vorschau, ausgewählte Anwendung und konfliktbewusstes Zurücksetzen. Anleitung: `V315-VISUAL-DANCE-IMPROVEMENT.md`.

## V314 – Dance Performance Review Studio

Neue Live-Diagnose in Settings → Dynamic Stage → Smart Stage Director: Verlauf von Energie, real berechneter additiver Avatar-Bewegung und Show-FX, Hinweise zu Kamerawechseln, Peak-Reaktionen und Fußkontakt-Impulsen. Session-intern, sparsame 1,25s Samples, maximal 480 Messpunkte, CSV/JSON Export. Kein objektiver Timing-Messwert; siehe `V314-DANCE-PERFORMANCE-REVIEW.md`.

# Sonic Display V313 — Dance Show Evolution

Neu: Song-Dramaturgie für Intro, Groove, Rise, Peak und Finale auf Basis von V312. Dynamik für reaktiven Tanz, Kamera, Licht und bestehende Duo-Choreografie; V310-Budgets, Pausen und manuelle Prioritäten bleiben erhalten. Details in [`V313-DANCE-SHOW-EVOLUTION.md`](V313-DANCE-SHOW-EVOLUTION.md).

---

# Sonic Display V312 – Intelligent Dance Choreography Director

**Neu in V312:** Phrasengenaue Solo-/Duo-Wechsel, Call-and-Response, geteilte Drop-Formationen und dezente Partnertanz-Interaktionen. Integriert in die One-Click-Show-Presets, mit separaten Reglern und Vorrang für manuelle Choreografien. [Dokumentation](V312-INTELLIGENT-DANCE-CHOREOGRAPHY.md).

# Sonic Display V311 – Advanced Dance Performance

**Neu in V311:** Sanftere reaktive Ganzkörperbewegungen, dezente Gegenbalance, kontaktbewusster Schutz zusätzlicher Fußbewegungen und verbesserte automatische Clip-Überblendungen – mit eigenen Reglern und Integration in alle vier Show-Presets. Die bisherigen GLB-Clips und IK-Systeme bleiben unverändert. [Dokumentation](V311-ADVANCED-DANCE-PERFORMANCE.md).

# Sonic Display V310 – Smart Show Quality Director

**Neu in V310:** Weniger wiederholte Kameraperspektiven und Formationen, phrasengenaue Rhythmik, sanftere Breaks, Tänzer-Fokus und maximale automatische Dance FX. Per Schalter und Regler in den bestehenden Einstellungen steuerbar und in die vier V309-Show-Presets integriert. [Details, Einstellungen und Tests](V310-SMART-SHOW-QUALITY-DIRECTOR.md).

# Sonic Display V309 – One-Click Show Presets

**New in V309:** Four coordinated, one-click show presets for Hardtekk, Deutschrap, cinematic concerts and ambient listening, plus CSS stage preview, custom show saving and one-step restore. [Details and tests](V309-ONE-CLICK-SHOW-PRESETS.md).

# Sonic Display V308 – Concert Lighting & Atmosphere

**New in V308:** low-poly volumetric-looking concert spotlights, subtle stage floor haze, section-aware light sweeps and a tunable, performance-adaptive concert atmosphere. See [V308-CONCERT-LIGHTING-ATMOSPHERE.md](V308-CONCERT-LIGHTING-ATMOSPHERE.md).

> **V307 — Dance Quality & Expression:** Musikphrasiert variierende Gesten, asymmetrische Arme, natürlichere Kopf-/Oberkörperbewegung und kontaktbewusstes Footwork. Für GLB und prozedurale Avatare, ohne importierte Clips zu verändern. Anleitung: [V307-DANCE-QUALITY-EXPRESSION.md](V307-DANCE-QUALITY-EXPRESSION.md).

> **V306 — Ultimate Show Director:** Eine gemeinsame, abschaltbare Show-Regie synchronisiert Kamera, Bühne, Licht, FX und Solo-/Duo-Formationen. Anleitung: [V306-ULTIMATE-SHOW-DIRECTOR.md](V306-ULTIMATE-SHOW-DIRECTOR.md).

# V305 – Cinematic Camera Paths

**Neu:** Geschwungene 3D-Kamerawege über gespeicherte Keyframes, einstellbare Geschwindigkeit, Beschleunigung und Kurvenspannung, nahtloses Loop-Segment sowie eine 3D-Pfadvorschau im vorhandenen Avatar-Canvas. Optional pro Kamera-Preset; alte Presets bleiben kompatibel. Details in [`V305-CINEMATIC-CAMERA-PATHS.md`](V305-CINEMATIC-CAMERA-PATHS.md).

# V304 – Advanced Camera Orbit & Pan

**Neu:** Vollständige 360°-Orbit-Steuerung, freie Blickpunktverschiebung (Pan) per Maus/Touch, speicherbare 3D-Kameraposen und sichere räumliche Keyframe-Kamerafahrten. Details in [`V304-ADVANCED-CAMERA-ORBIT-AND-PAN.md`](V304-ADVANCED-CAMERA-ORBIT-AND-PAN.md).

> **V303 – Visual Camera Orbit Editor:** Dreh die echte Bühnenkamera durch Ziehen über der Live-Vorschau (Maus oder Finger), zoome mit Mausrad/Zwei-Finger-Geste und speichere die neue Sicht als Preset oder Keyframe. Siehe [V303-VISUAL-CAMERA-ORBIT-EDITOR.md](V303-VISUAL-CAMERA-ORBIT-EDITOR.md).

> **V302 – Live Camera Editing Studio:** Echte Bühnenkamera im Camera Director Dashboard vorübergehend einstellen und als Kamera-Preset bzw. Keyframe speichern. Siehe [V302-LIVE-CAMERA-EDITING-STUDIO.md](V302-LIVE-CAMERA-EDITING-STUDIO.md).

> **Aktuelle Version V300**: Grafisches Camera Director Dashboard mit fünf Keyframe-Spuren, Navigation in den Kameraeditor und schematischer 3D-Orientierungsvorschau der echten Live-Kamerapose. Details in [V300-VISUAL-CAMERA-DIRECTOR-DASHBOARD.md](V300-VISUAL-CAMERA-DIRECTOR-DASHBOARD.md).

# V246 – TypeScript Build Stability

Siehe [V246-TYPESCRIPT-BUILD-STABILITY.md](V246-TYPESCRIPT-BUILD-STABILITY.md).

## V241 – Natural Choreography Variations

See [V241-NATURAL-CHOREOGRAPHY-VARIATIONS.md](V241-NATURAL-CHOREOGRAPHY-VARIATIONS.md).

## V230 – Multi-Avatar Dance Director 2.0

See [V230 documentation](V230-MULTI-AVATAR-DANCE-DIRECTOR.md).

## V228 — Natural Dance Intelligence 2.0

Siehe [V228-Dokumentation](V228-NATURAL-DANCE-INTELLIGENCE.md).

## V225 – Automatic Benchmark Profile Optimizer

Siehe [V224-AUTOMATIC-PROFILE-OPTIMIZER.md](V224-AUTOMATIC-PROFILE-OPTIMIZER.md).

> **V221 – Adaptive Motion Quality Dashboard:** Live-Übersicht für vorhandene FPS-, Frame-, Motion- und CPU-Phasen-Telemetrie. Details siehe `V221-ADAPTIVE-MOTION-QUALITY-DASHBOARD.md`.

# Sonic Display V175 – Adaptive Lighting Learning Engine

Neu: genreabhängige lokale Feedback-Gewichtung für Licht-Cue-Vorschläge. Siehe [`V175-ADAPTIVE-LIGHTING-LEARNING.md`](V175-ADAPTIVE-LIGHTING-LEARNING.md).

# Sonic Display V174 – Smart Lighting Timeline Analyzer

See `V174-SMART-LIGHTING-TIMELINE-ANALYZER.md` for measured live playback cue proposals and confidence scores.

## V169 Dynamic Stage Lighting

Siehe `V169-DYNAMIC-MUSIC-LIGHTING.md`.

## Sonic Display V164

Neue CPU-P95-gesteuerte adaptive Berechnungsintervalle für nichtkritische Animationsaufgaben. Details: `V164-ADAPTIVE-BOTTLENECK-SCHEDULER.md`.

## V163 – Real-Time Performance Profiler

Siehe [V163-RUNTIME-PROFILER.md](V163-RUNTIME-PROFILER.md).

# Sonic Display V159 – Intelligent Partner Motion Synchronization

## V155 — Automatic Joint Axis Detection & Anatomical IK Limits

See [V155-AUTOMATIC-JOINT-AXES.md](V155-AUTOMATIC-JOINT-AXES.md).

# Sonic Display V38

A Raspberry Pi-friendly Next.js/React starter for a Spotify now-playing display with album artwork and lyrics. It uses a central React `MusicContext` and normalized app types so later modules (e.g. Three.js/React Three Fiber visualization, clock, weather, or other metadata) can consume the same current context.

## Included

- Spotify OAuth Authorization Code flow with `state` validation
- Spotify Client Secret stays on the server
- Encrypted AES-256-GCM `HttpOnly` session cookie (access + refresh token)
- Access-token refresh when near expiry
- Current track, artist, album, cover, playback state and progress
- Lyrics provider chain: LRCLIB (synced when available), then lyrics.ovh, then optional Genius (plain text); all normalize to the app-owned `Lyrics` type
- Responsive fullscreen UI suitable for Chromium kiosk mode
- No database required

**Lyrics/policy:** Review Spotify's current Developer Terms/Policy and the lyrics provider's terms before using playback-synchronized lyrics or synchronizing Spotify recordings with visual media. This starter displays LRCLIB timestamps against playback position; disable/remove that behavior if your use case is not permitted or licensed. It does not stream audio.

## 1. Spotify Developer Dashboard

1. Visit https://developer.spotify.com/dashboard and create an app for the Spotify Web API.
2. Copy the **Client ID** and **Client Secret**.
3. In the app settings, add an exact Redirect URI:
   - Local: `http://localhost:3000/api/spotify/callback`
   - Vercel: `https://YOUR-PROJECT.vercel.app/api/spotify/callback`
   - Custom domain: `https://music.example.com/api/spotify/callback`
4. The redirect URI must exactly match `SPOTIFY_REDIRECT_URI` (scheme, host, path).
5. Scopes requested by the app: `user-read-currently-playing user-read-playback-state`.

Spotify references:
- Authorization: https://developer.spotify.com/documentation/web-api/concepts/authorization
- Authorization Code flow: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- Currently playing: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
- Scopes: https://developer.spotify.com/documentation/web-api/concepts/scopes
- Refreshing tokens: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

## 2. Run locally

Requirements: Node.js 20.9+ and npm.

```bash
cp .env.example .env.local
```

Set values in `.env.local`:

```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
SESSION_SECRET=generate-a-long-random-secret
LRCLIB_USER_AGENT=SonicDisplay/0.1.0 (https://your-domain.example)
```

Generate a session secret, e.g.:

```bash
openssl rand -base64 32
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and press **CONNECT SPOTIFY**.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**. Set `SPOTIFY_REDIRECT_URI` to your exact production callback URL.
4. Deploy (or redeploy after changing environment variables).
5. Add the production callback URL to the Spotify app's Redirect URIs.
6. Open the deployed site and connect Spotify.

Do not commit `.env.local` or expose `SPOTIFY_CLIENT_SECRET` in any `NEXT_PUBLIC_*` variable.

## 4. Raspberry Pi kiosk

Open the deployed URL in Chromium. Example kiosk launch:

```bash
chromium --kiosk --noerrdialogs --disable-infobars --start-fullscreen https://YOUR-PROJECT.vercel.app
```

The display polls the app API every few seconds. The browser receives only normalized playback data and never receives the Spotify client secret or refresh token as JavaScript-readable data.

## 5. Architecture and extension points

```text
Raspberry Pi / Chromium
        │ HTTPS
        ▼
Next.js on Vercel
  ├─ /api/spotify/login
  ├─ /api/spotify/callback
  ├─ /api/spotify/current
  ├─ /api/spotify/disconnect
  └─ /api/lyrics
        │
        ▼
MusicContext (normalized shared state)
  ├─ Track: title, artists, album, cover, duration
  ├─ Playback: playing, progress, fetchedAt
  └─ Lyrics: provider, synced, timestamped lines
        │
        ├─ Now Playing UI
        ├─ Lyrics UI
        └─ Future visualizer / other widgets
```

Key files:
- `context/MusicContext.tsx` — single client-side state provider and polling
- `types/music.ts` — extensible app-owned data model
- `lib/spotify.ts` — server-side token exchange/refresh
- `lib/session.ts` — encrypted cookie helpers
- `services/lyrics/server.ts` — provider orchestration and normalized `Lyrics` result
- `services/lyrics/providers/lrclib.ts` — LRCLIB adapter and LRC parser
- `services/lyrics/providers/lyricsOvh.ts` — plain-text fallback adapter
- `components/SonicDisplay.tsx` — presentation only

## Notes / troubleshooting

- **Invalid redirect URI:** exact mismatch between dashboard URI and `SPOTIFY_REDIRECT_URI`.
- **No current track:** start playback on Spotify and verify the account authorized the app.
- **No lyrics:** the app tries LRCLIB by title, artist, album and duration, then lyrics.ovh by title and artist. lyrics.ovh provides unsynchronized plain text; provider availability and catalog coverage can vary.
- **Session not retained:** verify HTTPS in production and that `SESSION_SECRET` is configured consistently across deployments.
- **Token refresh failure:** reconnect Spotify; the app clears the session on an API 401.

LRCLIB docs: https://www.lrclib.net/docs

## Robuste Spotify-Verbindung

Die aktuelle Version erneuert Tokens 90 Sekunden vor Ablauf. Bei einem Spotify-401 wird einmalig ein Refresh versucht und die API-Anfrage wiederholt. Ein ungültiger Refresh-Token führt zu einer erneuten Anmeldung; vorübergehende Netzwerk-/Spotify-Fehler lassen die Session bestehen. API-Aufrufe haben ein 12-Sekunden-Timeout. Bei HTTP 429 wird `Retry-After` berücksichtigt, bei anderen Fehlern steigt das Polling-Intervall schrittweise bis maximal 60 Sekunden. Nach erfolgreicher Antwort wird auf 4 Sekunden zurückgestellt. Der letzte bekannte Track bleibt bei temporären Fehlern sichtbar.

Hinweis: Auf Vercel sind einzelne Serverless-Aufrufe nicht garantiert seriell. Die Anwendung vermeidet parallele Refresh-Aufrufe innerhalb eines Browser-Tabs; mehrere gleichzeitig geöffnete Tabs/Geräte können weiterhin konkurrierende Refreshes auslösen. Für einen einzelnen Raspberry-Pi-Kiosk sollte daher nur ein Display-Tab laufen.


## Erweiterbare Architektur (v3)

Die Anwendung trennt API-Adapter (`services/`), Polling/Retry (`hooks/`), globalen Musikzustand (`context/`), Datenverträge (`types/`) und Darstellung (`components/`). Spotify-Tokens bleiben serverseitig. Details und Erweiterungspunkte stehen in `ARCHITECTURE.md`. Neue Lyrics-Anbieter sollen auf den app-eigenen `Lyrics`-Typ normalisieren; Visualizer erhalten Daten als Props und führen keine eigenen API-Aufrufe aus.

## Lyrics providers

Lyrics lookup is server-side and runs through `services/lyrics/server.ts`. LRCLIB is preferred because it can return timestamped lines. If it has no usable result or is temporarily unavailable, the app tries lyrics.ovh. Both adapters normalize results to the app-owned `Lyrics` shape (`provider`, `synced`, `lines`, `plainText`); lyrics.ovh results are marked `synced: false`. To add another source, implement an adapter under `services/lyrics/providers/` and return the normalized type. Review each provider's terms and usage limits before deployment.

## Optional microphone audio analysis

The display includes an opt-in browser microphone analyzer. Click **Mikrofon aktivieren** and grant microphone permission. The signal is analyzed locally with the Web Audio API; raw audio is not uploaded to Vercel. It exposes normalized bass, mids, highs, volume and a heuristic beat impulse through `AudioAnalysisContext`, ready to be passed as props to visualizer modules. Disable the microphone to stop the media tracks and close the AudioContext.

Microphone access requires a secure context (HTTPS; localhost is generally allowed). On a Raspberry Pi kiosk, grant/allow the site's microphone permission in Chromium. Room noise and speaker placement affect results; beat detection is heuristic, not guaranteed musical beat tracking. Use a USB microphone for a first setup. No microphone permission is requested until the user enables it.


### Automatic avatar genre detection (Last.fm)
Create a Last.fm API key at https://www.last.fm/api/account/create and set `LASTFM_API_KEY` in `.env.local` and Vercel Project Settings → Environment Variables. The key is used only by the server route `/api/genre`; it is never sent to the browser. The route checks Last.fm track top tags first, then artist top tags if the track has no tags, and maps recognized tags to the avatar genres. Results are cached for one day. Unknown tags leave the current/manual genre selection intact.


### Genre state in MusicContext
Last.fm genre lookup now runs in `MusicProvider` whenever the current track changes. Components can read `genre`, `detectedGenre`, `genreStatus`, `genreSource`, `genreMatchedTag`, `genreError`, and `genreOverride` through `useMusic()`. Use `setGenreOverride(genre)` to choose a genre manually, or `setGenreOverride(null)` to return to Last.fm detection. The animation controller only renders this context state and does not call the genre endpoint itself.


### Genius lyrics provider
Set `GENIUS_ACCESS_TOKEN` from your Genius developer account in `.env.local` and Vercel environment variables. It is only read server-side. Provider order is LRCLIB, lyrics.ovh, then Genius; Genius results are unsynchronized plain text. The `genius-lyrics-api` package searches Genius and extracts lyrics from the Genius page, so it depends on the site's markup and applicable terms; treat it as a best-effort fallback. Do not expose the token in `NEXT_PUBLIC_*` variables.

### Music source boundary and UI preferences
`MusicSource` is the adapter contract in `types/music.ts`. A source adapter fetches its provider-specific data and maps it into the app-owned `CurrentTrackResponse`/`MusicState` shape before React context sees it. `services/musicSource.ts` currently implements Spotify. UI preferences are kept separately in `UiPreferencesContext` and persisted to browser localStorage; playback/connection state remains transient in `MusicContext`.

### MusicProvider organization
`MusicProvider` composes playback polling with `useGenreDetection` and owns only cross-feature orchestration (manual genre override and disconnect). Keep future independent features in focused hooks/contexts rather than adding unrelated state/effects directly to the provider.

### Visualizer state
Visual components can consume `useVisualizer()` from `context/VisualizerContext.tsx`. It combines track/playback state, genre selection, audio metrics, and persisted UI preferences while keeping the underlying providers separate.

### Visualizer modes
Visual modes are registered in `components/visualizer/registry.tsx` (`wave`, `particles`, `album-glow`, `avatar`). The selected mode is read from persisted UI preferences by `VisualizerStage`. Add a mode by implementing `VisualizerProps` and adding a registry entry.

### 3D Avatar (v14)
The Avatar visualizer uses React Three Fiber and a procedural, stylized 3D character. Bass drives a gentle head pulse, volume affects torso width, and beat strength adds a subtle rotation impulse. This is a procedural placeholder character; replace its geometry/materials in `components/visualizer/ThreeAvatar.tsx` with a GLTF avatar when ready. Install dependencies with `npm install` before running the app.

### Optional custom GLTF avatar (v15)
You can use your own `.glb`/`.gltf` character without changing the visualizer registry. Put the model in a publicly reachable location (for example `public/models/avatar.glb`) and set `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` in `.env.local`. Restart Next.js after changing the variable. When no model URL is configured, Sonic Display uses the built-in procedural avatar. The GLTF scene receives subtle beat/bobbing motion; rigged skeletal dance animations are not yet mapped.

#### Rigged avatar animation clips
For animated `.glb`/`.gltf` avatars, include animation clips in the model. Sonic Display automatically prefers clip names containing `dance`, `move`, or `groove` during playback and `idle`, `stand`, or `rest` while paused. Clips cross-fade when playback changes. Models without matching clips continue to use procedural movement. Reduced Motion suppresses dance clips.

### Avatar animation mapping (v17)

Edit `components/visualizer/animationMapping.ts` to map your model's animation clip names to genre-specific playback and idle behavior. Matching is case-insensitive and uses regular expressions. For example, a Hardstyle model can expose clips named `Headbang_Loop` and `Idle`; the `hardstyle` mapping will select them automatically. If no genre-specific clip matches, generic dance/move/groove and idle/stand/rest names are used as fallback. Add a `default` mapping for other genres.

### Avatar-Auswahl
Unter Settings kannst du zwischen dem prozeduralen Avatar und einem konfigurierten GLTF-Modell wechseln. Für ein eigenes Modell setze `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` und lege die Datei unter `public/models/avatar.glb` ab. Weitere Modelle können in `components/visualizer/avatarModels.ts` ergänzt werden; dort jeweils eine eindeutige `id`, ein Label und eine URL eintragen. Die Auswahl wird als UI-Präferenz lokal gespeichert.

### Avatar library (v19)
Choose an avatar card in Settings. Register additional entries in `components/visualizer/avatarModels.ts`; set the corresponding model URL in environment variables. Optional preview images belong in `public/avatars/`.

```env
NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb
NEXT_PUBLIC_AVATAR_NEON_URL=/models/neon.glb
NEXT_PUBLIC_AVATAR_FESTIVAL_URL=/models/festival.glb
```
Models without a configured URL are disabled in the library. The built-in procedural avatar is always available.

## Version 20 – Avatar controls
The Settings panel now includes avatar scale, vertical offset, animation intensity, and optional genre-based model selection. Genre auto-selection uses a small editable mapping in `components/visualizer/VisualizerStage.tsx`; unavailable model URLs fall back through `getAvatarModel` to the procedural avatar. These preferences are persisted with the existing UI preferences.

## Version 21 – Avatar Editor

The Avatar settings now include a live React Three Fiber preview. For GLB/GLTF models, available animation clips are detected and can be selected and tested directly. The preview also reacts to live AudioFeatures and includes a temporary beat-test button. Procedural avatars use the same preview area and expose their audio reaction without authored clips.

### Audio analysis (V23)
Microphone analysis exposes normalized bass/mids/highs, kick/snare/hi-hat bands, attack/decay and an energy envelope. A lightweight onset-interval estimate reports BPM after repeated detected beats; it is an approximate live estimate, not Spotify track metadata or a guaranteed tempo detector. Microphone access requires user permission and a secure context (HTTPS/localhost).

### Live audio debug
Enable microphone analysis in Settings to inspect live kick/snare/hi-hat estimates, frequency-band levels, energy envelope, attack/decay, beat detection, and estimated BPM. These are heuristic microphone-derived signals; use headphones or route playback to the microphone input for testing.

### Beat calibration assistant (v26)
In Settings → Beat calibration, enable microphone analysis and play representative music. The assistant samples the kick-band level for eight seconds, estimates a starting sensitivity, and lets you apply it manually. This is a heuristic starting point; room acoustics, microphone gain, and music style affect the result.


## Version 27: Beat timeline
The audio debug panel shows recent detected beat impulses over a rolling five-second window, with marker height representing beat strength. Events are generated by microphone beat detection and cleared when analysis is disabled.

### BPM / Beat Grid

The audio debug panel includes a rolling beat grid. Detected microphone beats are shown against an extrapolated grid derived from the current BPM estimate, with an approximate timing-error indicator for tuning sensitivity and cooldown settings.

## Version 29 – Music-reactive avatar

The avatar now uses a pure `getAvatarAnimationState()` engine to map normalized audio features, playback state, genre, reduced-motion preference, and user intensity into animation targets. The procedural and GLTF avatar paths consume the same targets. Genre profiles are defined in `components/visualizer/avatarAnimationEngine.ts` and can be extended there.


## Version 30 – GLTF rig bone/node control

V30 adds a small additive rig controller for custom GLTF avatars. When a model exposes recognisable nodes/bones, Sonic Display automatically finds head, neck, spine/chest and left/right arm nodes and overlays music-reactive motion on top of authored dance/idle clips.

Supported node-name patterns are intentionally broad (for example `Head`, `Neck`, `Spine`, `Chest`, `LeftArm`, `RightArm` and common variants). The controller tracks its own overlay deltas, so it does not replace the rotations produced by the GLTF animation mixer. Models without matching rig nodes continue to work normally with the existing root-level motion.

The mapping implementation lives in `components/visualizer/avatarRigController.ts`. This is deliberately separate from the audio engine so future versions can add per-model rig profiles without coupling them to beat detection.


## V32 – Avatar Rig Profiles

V32 adds configurable GLTF rig profiles (`auto`, generic humanoid, Mixamo, Ready Player Me, robot). Profiles control node/bone aliases and per-part music-reaction multipliers. The selected profile is persisted with UI preferences and applied additively on top of authored GLTF animation clips.


## V32 – Avatar Dance Presets

V32 separates the avatar rig profile from the dance style. Dance presets can be selected independently and combine with Auto/Generic/Mixamo/Ready Player Me/Robot rig profiles. Presets affect kick response, head movement, sway, body bounce, chest pulse and arm swing. Auto selects a style from the detected genre. Preferences are persisted locally.


## V33 Dance Intelligence

V33 adds a stateful dance-intelligence layer that detects beat accents, energy build-ups and drops, then introduces controlled phrase variation. The layer sits above the audio animation engine and below rig/preset application, so existing profiles remain reusable.


## V35 – Full-Body Music Performance

Adds lower-body music-reactive dance: leg groove, alternating weight shift and foot-step impulses. These targets are applied through the existing GLTF rig overlay and remain independent from authored animation clips, dance presets and rig profiles.


## V36 – Emotion & Expression

V36 adds a separate avatar expression engine. It derives a stable expression from playback, audio energy and genre, with profiles such as neutral, cool, euphoric, aggressive and relaxed. GLTF avatars can use detected jaw and eye nodes plus subtle head tilt; avatars without facial rig nodes safely keep their existing dance motion. The expression layer is intentionally independent from dance presets and rig profiles.

### V37 – Performance Director

The avatar now has a lightweight performance director that acts like a choreographer above the existing dance systems. It infers coarse musical phases such as intro, verse, chorus, drop and break from normalized audio energy, then changes between phrase-aware movement patterns with smooth transitions.

The director is deliberately heuristic: it does not pretend to know exact Spotify song sections when those timings are not present in the normalized playback model. It coordinates existing Dance Intelligence, Dance Presets, Full Body Dance and the V36 Expression Engine rather than replacing them.

### V38 – Musical Structure & Dramaturgy

V38 adds `musicalStructureEngine.ts` above the Performance Director. It detects coarse musical phases from the existing normalized energy/attack/bass/BPM model, including build-ups, drops and post-drop release. Phrase position is deterministic and is used for controlled variation rather than per-frame randomness. This is intentionally heuristic; exact song arrangement metadata is not assumed.


## V40 – Advanced Dance Choreography

`components/visualizer/advancedDanceChoreography.ts` selects short, genre-aware movement combinations at stable 8-beat phrase boundaries. It blends between combinations and layers arm, leg, hip, head and pose accents onto the existing GLTF rig controller. Patterns adapt to the Performance Director section (for example, stronger kick/headbang combinations during a drop and softer flow combinations during a break). The engine uses the app's normalized audio features; it does not claim access to exact Spotify song-section timestamps.


## V41 – Avatar Personality & Signature Moves

`avatarPersonalityEngine.ts` selects a stable avatar personality from model ID, genre, and dance preset, then chooses a signature move per musical phrase. Signature accents are blended into the existing full-body choreography; no per-frame randomization is used. These are heuristic movements derived from the available audio features, not authored Spotify song-section metadata.


## V42 – Adaptive Dance Intelligence

V42 makes phrase-level choreography adaptive. The selector tracks a smoothed energy trend, prefers stronger moves during rising energy and calmer moves as energy falls, and penalizes combinations used in the recent phrase history. Choices are made at phrase boundaries rather than every animation frame, preserving stability. `adaptiveIntensity` and `novelty` are exposed in the choreography output for tuning/debugging. This remains a heuristic over normalized audio features, not machine learning or access to Spotify's unavailable arrangement labels.


## V43 – Dance Memory & Long-Term Variety

V43 extends phrase-level selection with playback-session memory. It tracks move frequency across the song session, applies a bounded long-term repetition penalty, and records recent choices separately for short-term avoidance. Re-entering a drop increments a section counter so recurring drops can retain an energetic character while selecting a different compatible accent when available. History is bounded to avoid unbounded growth during long playback. This is deterministic heuristic variation; it does not claim to identify official Spotify song sections.


## V44 – Live Dance Tuning

Dance intensity (existing 0–2× control), aggression (0–100%), variation (0–100%) and Smooth/Balanced/Sharp motion style are editable live in Settings. They are persisted in the existing local UI preferences and passed to the avatar renderer without replacing dance presets or rig profiles. Aggression biases choreography selection and boosts rig accents; variation changes repeat avoidance and phrase tie-breaks; style adjusts transition/interpolation responsiveness. Procedural fallback supports intensity, aggression and style, while detailed phrase variation requires a GLTF rig. No microphone input is required.


## V45 — Dance Preset Studio

Create, save, select, apply and delete custom dance profiles in Settings → Dance Preset Studio. A profile snapshots the selected built-in dance preset, rig profile, animation intensity, aggression, variation and motion style. Four built-in starter profiles cover Hardstyle, Hardtekk, Metal and Smooth Flow. Custom profiles persist in browser localStorage (up to 40); starter profiles cannot be deleted. Applying a profile updates existing UI preferences and therefore the active avatar without replacing the underlying dance engine. No microphone is required for this feature.


## V46 – Optional microphone / estimated rhythm

The microphone analyzer is still available as an explicit opt-in in Settings and the audio panel. When it is off, a synthetic visual rhythm is derived from the current Spotify playback position and a genre-based *assumed* BPM. This is not genuine Spotify beat detection and cannot identify real kicks, tempo changes, or drops. When microphone capture is active, the measured frequency bands and beat events drive the visualizers instead. If capture is denied or still starting, estimated data is shown with beat impulses suppressed. Microphone processing stays local and stops when disabled.


## V47 — Microphone / playback phase alignment

Optional synchronization settings: Off, Auto (phase estimate against synthetic genre BPM), and Manual. Manual positive offsets delay microphone-driven animation by up to 500 ms using a local sample history. Negative offsets are shown but cannot predict incoming audio. Auto measures circular phase consistency of recent microphone kick transients against the estimated track grid; it reports a phase estimate and confidence, **without automatically applying it**, since the genre BPM is not authoritative Spotify beat data and incorrect alignment would degrade live responsiveness. No microphone audio is uploaded.


## V48 – Automatic microphone BPM detection

Microphone kick onset timestamps feed `BeatTempoTracker`, which evaluates 70–200 BPM candidates, beat subdivisions and skipped beats, temporal phase coherence and confidence. A confidence of at least 0.55 is required before exposing live BPM to the animation engine; otherwise BPM is `null` (the existing synthetic mode remains available when the microphone is off). The Audio Debug Panel displays BPM confidence. Microphone permission remains opt-in. Tempo estimates are heuristic and can be ambiguous at half/double time.


## V49 — Microphone Beat Phase Lock

An optional microphone-derived phase-locked beat clock (`hooks/beatPhaseTracker.ts`) anchors to detected kicks, accepts only onsets close to the predicted grid, and gently corrects drift. When BPM confidence is at least 55% and phase lock is stable, predicted beat pulses supplement real onset pulses in the existing dance engine. Phase and lock confidence appear in the audio debug panel. Loss of tempo confidence or long silence disables phase lock; no Spotify audio analysis is claimed. Manual sync offset remains available.


## V50 — Kick Prediction Engine

`hooks/kickPrediction.ts` creates a confidence-gated, smooth pre-kick envelope from the microphone phase-locked beat grid. When the phase lock is reliable, the avatar prepares for the next predicted beat by slightly lowering its body/head and shifting its weight; on the beat the existing accent logic takes over. The Audio Debug Panel displays time until the next predicted kick and pre-kick intensity. Predictions are disabled without microphone phase lock, during silence or at low confidence; they do not detect or forecast actual song drops.


## V51 – Adaptive Kick Choreography
Optional microphone-onset classifier tracks a moving baseline of detected bass transients and labels measured accents soft/normal/strong. A decaying accent envelope drives stronger avatar head, arm and chest motion on comparatively strong kicks. Predicted phase pulses are not classified as real microphone kicks. Audio Debug shows accent class and envelope. This is relative transient detection, not instrument identification; it depends on microphone quality and loudspeaker placement.

## V52 – Kick Pattern Recognition

`hooks/kickPatternTracker.ts` classifies **measured microphone kick-onset intervals** as `steady`, `double`, `syncopated` or `unknown` relative to the microphone-derived BPM. Classification is confidence-gated and expires after silence; predicted beats are excluded. The Audio Debug Panel shows pattern and confidence. In the 3D avatar, double kicks add a short leg/beat accent and syncopated patterns add a small lateral accent; these effects are disabled without reliable microphone data or when reduced motion is enabled. This is a heuristic rhythmic classifier, not instrument separation, reliable genre recognition or full song structure detection.


## V53 – Rhythm Learning Engine
`hooks/rhythmLearningEngine.ts` groups **measured microphone kick onsets** into four-beat phrases using the microphone-derived BPM. It compares up to six completed phrases, estimates repeatability, and classifies four-on-floor, double-accent, offbeat-accent or variable patterns. Confidence gates a subtle additional beat accent in both 3D avatar paths; the debug panel shows learned rhythm, confidence and phrase count. State is session-only, expires on silence and is reset when microphone capture stops. No microphone permission is requested when microphone mode is off. This is a heuristic classifier, not audio transcription, predictive knowledge of future song sections, or verified kick separation.


## V54 – Rhythm-Aware Choreography

The GLTF avatar now chooses a choreography move vocabulary based on the microphone-derived learned rhythm: four-on-floor, double-accent, offbeat-accent or variable. Switching happens at eight-beat phrase boundaries, with confidence (>= 0.62) and repeated-phrase (>= 2) gating and a three-second dropout grace period. Break/drop dramaturgy still takes precedence. Without reliable microphone learning, existing genre and dance-preset choreography remains in control. The detector is heuristic; it does not transcribe individual instruments.


## V55 – Dance Performance Preview

The microphone Audio Debug Panel includes a read-only Dance Performance Preview. It reports the currently active GLTF choreography sequence and move, estimated song section, learned rhythm/confidence, transition progress and the next *possible* eight-beat switch boundary. The preview reads telemetry from the existing R3F animation loop through a throttled external store (about 6.7 updates/s); it does not independently choose dances. For the procedural avatar it explicitly reports baseline/procedural groove. The switch countdown is a BPM-based estimate, **not** a prediction that a change will occur. The preview appears when microphone analysis is enabled, including when the mic is inactive.


## V56 – Dance Engine Diagnostics & Render Sampling
- Added a lightweight `danceDiagnosticsStore` sampled approximately once per second from the R3F `useFrame` loop (no per-frame React state updates).
- The Audio Debug Panel now shows sampled canvas FPS, mean frame interval, frames slower than 33 ms, active avatar renderer, microphone/estimated source, phase lock and choreography sequence. Diagnostics remain visible when the microphone is off.
- Beat age is shown explicitly as an event-age indicator; it is **not** end-to-end beat/audio/display latency.
- Existing rhythm learning, beat prediction and dance modules retain their previous behavior. This release adds instrumentation, not an unverified claim of better FPS or automatic engine conflict resolution.


## V57 – Adaptive Performance Mode

The 3D avatar Canvas now has an adaptive pixel-ratio controller with Auto, High, Balanced and Low modes. Auto drops one quality tier after three consecutive slow one-second windows (<42 FPS or >30% slow frames), waits eight seconds after a change, and raises quality after twelve consecutive healthy windows (>56 FPS and <8% slow frames). Quality settings persist locally and appear in Dance Engine Diagnostics, even with the microphone off. Only the render pixel ratio changes; animation and audio processing stay intact. FPS is measured from frame intervals and may be limited by browser throttling or device refresh rate.


## V58 — Adaptive Animation Quality

The V57 quality tier now also controls the update cadence of costly GLTF choreography, personality and full-body pattern calculations: High evaluates each frame, Balanced up to 30 Hz, Low up to 20 Hz. Cached motion is reused between evaluations; beat accents, microphone processing, rig interpolation and rendering continue on every frame. The diagnostics panel shows the active cadence and cumulative evaluation/reuse counts. This is a targeted CPU optimization, not a measured Raspberry Pi performance guarantee.


## V59 – GLTF render-path optimization

- Memoizes the loaded GLTF scene instance so ordinary React rerenders no longer clone the model.
- Uses SkeletonUtils.clone for correct skinned-mesh / bone bindings. The cloned hierarchy shares cached geometry and materials; it does not dispose shared GLTF resources.
- Disables shadow-map rendering explicitly for the music stage and its avatar meshes. The stage previously did not enable shadows, so this is a safeguard, **not** a measured FPS improvement.
- Retains V57 adaptive device pixel ratio and V58 animation cadence without changing beat timing.
- No automatic polygon reduction, material simplification or hardware benchmark is claimed.


## V178 – Lighting Preset Library
Details: [V178-PRESET-LIBRARY.md](V178-PRESET-LIBRARY.md).


## V183 – Genre Insights & Safe Snapshots
Siehe `V183-GENRE-INSIGHTS-SNAPSHOTS.md`.


## V222 – Performance History & Intelligent Recommendations
Siehe `V222-PERFORMANCE-HISTORY.md`.

## V223 – Performance Benchmark Studio
Messläufe und FPS-Vergleiche direkt im Adaptive Motion Quality Dashboard. Siehe `V223-PERFORMANCE-BENCHMARK-STUDIO.md`.


## V225 – Performance Auto-Tuning Assistant
Siehe [V225-PERFORMANCE-AUTO-TUNER.md](V225-PERFORMANCE-AUTO-TUNER.md).


## V236 – Smart Stage Director 2.0
Siehe `V236-SMART-STAGE-DIRECTOR.md`: dezente Live-Kamera und Lichtakzente nach musikalischer Energie, ohne neue Konfiguration.

## V239
Adaptive Performance Auto-Pilot: opt-in FPS-governed stage FX, reversible and session-only. See `V239-ADAPTIVE-PERFORMANCE-AUTO-PILOT.md`.


## V272 – Performance Stability Guard
Siehe `V272-PERFORMANCE-STABILITY-GUARD.md` für den zuschaltbaren Schutz bei anhaltenden FPS-Einbrüchen.


## V274 Multi-Avatar Interaction Studio
Siehe `V274-MULTI-AVATAR-INTERACTION-STUDIO.md`.

## V317 – Real Motion Comparison Studio

Der A/B-3D-Vergleich kann jetzt eingebettete und installierte **GLB-Animationsclips synchron auf beiden Avataren abspielen**. Auswahl über **Visual Dance Improvement Assistant V315 → Real-Motion-Vergleich öffnen · V317**. Mit Clip-Auswahl, optionaler Zweitclip-Überblendung, konservativem Retargeting, Fußkontakt-Heuristik und weiterhin getrenntem synthetischen Rhythmus. Die bestehenden Show-/Benutzereinstellungen werden in der Vorschau **nicht geändert**. Siehe `V317-REAL-MOTION-COMPARISON.md`.

## V320 – Natural Dance Intelligence 3.0

Dezente, genreabhängige Gewichtsverlagerung, federndes Nachschwingen und natürlichere Beat-Akzente für Hardtekk/Hardstyle und Deutschrap. Auf importierte GLB-Keyframes und Fuß-IK wird nicht geschrieben. Regler unter **Settings → Dynamic Stage → Smart Stage Director → Natural Dance Intelligence 3.0**. V320 wirkt in prozeduralen und GLB-Avataren; eingebaute V309-Presets enthalten passende Werte, ältere individuelle Presets behalten ihren bisherigen Zustand. Siehe `V320-NATURAL-DANCE-INTELLIGENCE.md`.

## V331 – Live-Text-Push

Externe Systeme senden per authentifiziertem `POST /api/stage-content/push` unmittelbar Text an die aktivierte Bühnenleinwand. Ein SSE-Stream `/api/stage-content/live` aktualisiert die Anzeige ohne Trackwechsel. Erklärung und PowerShell-Beispiel: `V331-LIVE-TEXT-PUSH.md`. Der In-Memory-Broadcast ist **nicht Vercel-/Multi-Instanz-tauglich**; für produktive Verteilung benötigt er einen externen Realtime-Broker.


## V336 öTicket
Optionale österreichische Konzertprovider mit striktem Künstlerabgleich, Deduplizierung und API-Key-Schutz: siehe `V336-OETICKET-CONCERT-PLUGIN.md`.


## V339 – Wikimedia Commons Künstlerfotos
Die Künstlerbildergalerie kann zusätzliche unterschiedliche Fotos über Wikimedia Commons anzeigen, inklusive Autor-/Lizenzangaben. Details in `V339-WIKIMEDIA-ARTIST-GALLERY.md`. `STAGE_WIKIMEDIA_ENABLED=false` deaktiviert die externe Quelle.


## V340 – Smart Image Selection
Automatische Motiv-Rangfolge nach Format und Bildabmessungen mit Einstellungen; siehe V340-SMART-IMAGE-SELECTION.md.


## V341 – Music-Synced Photo Gallery
Optional tempo-adaptive slideshows and beat-gated transitions; see `V341-MUSIC-SYNCED-PHOTO-GALLERY.md`.


V342: Cinematic Photo Transitions – siehe `V342-CINEMATIC-PHOTO-TRANSITIONS.md`.


## V343 – Visual Gallery Preview Editor
Künstlerfotos und filmische Galerieeffekte direkt in den Plugin-Einstellungen ausprobieren, ohne den 3D-Visualizer zu starten. Siehe `V343-VISUAL-GALLERY-PREVIEW-EDITOR.md`.


## V344 – Visual Gallery Layout Editor
Bildrahmen in der V343-Vorschau ziehen/skalieren, Fotos zoomen und deren Ausschnitt festlegen. Je Leinwandformat bleiben die Einstellungen gespeichert; mehrere benannte Vorlagen sind möglich. Details in `V344-VISUAL-GALLERY-LAYOUT-EDITOR.md`.


## V345 – Multi-Photo Layout Studio

Mehrere Fotos mit individuellen Rahmen, Fotozoom, Fokus und Animation frei auf einer Leinwand anordnen, per Maus/Touch editieren und als browserlokale Komposition je Bildschirmformat speichern. Siehe `V345-MULTI-PHOTO-LAYOUT-STUDIO.md`.

## V346 – Intelligent Photo Layout Director

Siehe [V346-INTELLIGENT-PHOTO-LAYOUT-DIRECTOR.md](V346-INTELLIGENT-PHOTO-LAYOUT-DIRECTOR.md).


## V347 – Smart Photo Transitions
Weiche musikgesteuerte Übergänge für V345/V346. Details in `V347-SMART-PHOTO-TRANSITIONS.md`.


## V348 – 3D Photo Gallery
Räumliche Fotokarten mit eigener Tiefe, Perspektive und musikreaktiven Bewegungen auf der echten Three.js-Bühne. Anleitung: `V348-3D-PHOTO-GALLERY.md`.

## V350 – Lyrics & Photo Choreography

Optional koordinieren Textpriorität und Songabschnitt jetzt die vorhandenen 2D-/3D-Künstlergalerien. In Strophen werden Fotos zurückgenommen, bei Hook und Drop erhalten sie mehr Raum; die V346-Manuellsteuerung wird respektiert. Konfiguration und Songabschnitt-Simulator: **Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V350 – Lyrics & Photo Choreography**. Siehe [`V350-LYRICS-PHOTO-CHOREOGRAPHY.md`](V350-LYRICS-PHOTO-CHOREOGRAPHY.md). Aktivierung standardmäßig **aus**.


## V366 – Spotify Color Lyrics (optional)

See `V366-SPOTIFY-COLOR-LYRICS.md`. The undocumented Spotify client endpoint is disabled by default; set `SPOTIFY_INTERNAL_LYRICS_ENABLED=true` to try it. Any authorization failure automatically falls back to LRCLIB, lyrics.ovh, and Genius. No Musixmatch API key is required.


## V389.2 – Ably Browser Build Hotfix

Webpack no longer parses the Ably SDK. See `V389.2-ABLY-BROWSER-BUILD-HOTFIX.md`.


### V397 – Visual Performance Director

Neue opt-in Kamera-Regie mit Solo-, Duett- und Gruppenaufnahmen auf Basis zeitmarkierter Lyrics und vorhandener Bühne. Siehe `V397-VISUAL-PERFORMANCE-DIRECTOR.md`.

## V407 – Rhythm-Aware Rap Performance

Dezente Kick- und Snare-Akzente ergänzen die koordinierte V406-Rap-Performance; Verse und Hooks erhalten unterschiedliche Wort-/Armgesten. Die Mikrofonanalyse liefert die realen Onset-Heuristiken. Bei Spotify-geschätztem Beat gibt es nur die klar als wortbasiert behandelten Gesten – keine erfundene Schlagzeugerkennung. Alle bisherigen Lip-Sync- und Choreografie-Funktionen bleiben erhalten. Siehe [`V407-RHYTHM-AWARE-RAP-PERFORMANCE.md`](V407-RHYTHM-AWARE-RAP-PERFORMANCE.md).

## Neu in V411: visueller Rap-/Tanz-Motion-Timeline-Editor

Unter **Einstellungen → Anzeige → V411 Rap Performance Editor** kannst du für jeden installierten GLB-Avatar eine eigene Vorschau-Timeline aus bis zu zwölf Tanz-Motions zusammenstellen. Unterstützt werden Dauer, Crossfades, Reihenfolge, Verse/Hook, eigene Rap-Gestenstärke, Scrubbing, Loop und Wiedergabetempo. Vorhandene Tanz-Motions, Retargeting, Mund- und Körperanimation werden wiederverwendet. Die Timeline ist **nur eine Vorschau**; sie verändert nicht die Live-Choreografie. Details: [`V411-RAP-MOTION-TIMELINE.md`](./V411-RAP-MOTION-TIMELINE.md) und [`V411-VERIFICATION.md`](./V411-VERIFICATION.md).

## V432 – Interactive Rap Camera Keyframe Studio

Die synchronisierte V431-Rap-Kameratimeline besitzt jetzt eine lokale Keyframe-Bearbeitung mit sanften Kamera-Übergängen und optionaler isolierter 3D-Vorschau. Keyframes werden pro Spotify-Titel/Lyrics-Zeile gespeichert; Live-Anwendung ist standardmäßig deaktiviert und wird von allen bestehenden Kameraprioritäten abgesichert. Details und Befehle: [V432-INTERACTIVE-RAP-CAMERA-KEYFRAME-STUDIO.md](./V432-INTERACTIVE-RAP-CAMERA-KEYFRAME-STUDIO.md).

## V455 – Beautiful Lyrics Experience

Siehe `V455-BEAUTIFUL-LYRICS-EXPERIENCE.md`. Automatische Lesbarkeit und reduzierte Wortbewegung bei schnellen Rap-Zeilen.


## V461 – Cinematic Lyrics 3.0

Automatischer Bühnen-Lyrics-Fokus, Textbreitenbegrenzung und ruhigere Wortanimationen bei schnellem Rap. Dokumentation: [`V461-CINEMATIC-LYRICS-3.md`](./V461-CINEMATIC-LYRICS-3.md). Prüfstatus: [`V461-VERIFICATION.md`](./V461-VERIFICATION.md).

## V472 — Vocal-Aware Choreography (Deutschrap)

Synchronisierte Wort-/Zeilenakzente steuern additive, bounded Rap-Gesten; manuelle Feature- und Duett-Rollen können den Fokus pro Avatar festlegen. Unterbricht weder GLB-Tänze noch die Lippensynchronisation. Siehe [`V472-VOCAL-AWARE-CHOREOGRAPHY.md`](V472-VOCAL-AWARE-CHOREOGRAPHY.md).
