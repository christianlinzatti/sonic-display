# Sonic Display V661 – Vocal Analysis Studio

## Umfang

- Baut auf **V643 Real Vocal Stem Analysis** auf. Vorhandene 80-ms-Merkmale einer **vom Nutzer bereitgestellten, bereits isolierten** Vocal-Stem-Datei werden wiederverwendet; keine zweite Dekodierung oder Netzwerk-/Spotify-Audio-Schnittstelle.
- Zeigt pro **manuell gewähltem Avatar-Slot** die Anzahl längerer Signalphrasen, **mögliche** Einsatzimpulse mit 160-ms-Mindestabstand und Pausen ab 240 ms. Das sind Signalereignisse und **keine** erkannten Silben, Wörter, Phoneme, Sängerwechsel oder echte Voice-Activity-Erkennung. Qualitätswarnungen für Clipping/ungewöhnlich geringe oder fast permanente Aktivität.
- Mit expliziter Checkbox kann die lokal analysierte Kurve **nur im aktuellen Browser-Arbeitsspeicher** für die vorhandene GLB-Mundregie aktiviert werden. Vorbedingung: derselbe Track, derselbe Sänger-Slot, laufende Wiedergabe, **wortgenaue Lyrics und autorisierte Sängerrolle**. Die Ergänzung beträgt höchstens ca. 0,1 am Kieferziel pro Frame und muss die vorhandenen Lippenverschlüsse respektieren.
- V644-Visemmarker, manuell editierte V420-Mundkeyframes, eigene Animationen, kalibrierte Rig-Begrenzungen, Reduced Motion, Preview und vorhandene Rap-Audio-Korrekturen haben Vorrang. Das bestehende `useFrame` bleibt unverändert; kein zweiter Animationstimer, kein serverseitiger Persistenz- oder Audio-Upload.
- Der Store wird beim Wechsel auf einen anderen Song/Disconnect gelöscht. Das Schließen des Settings-Dialogs beendet die Show nicht; die optionale aktive Analyse kann auch ohne erneut geöffneten Bericht im V643-Fenster deaktiviert werden. Für einen neuen Song müssen neue Stems analysiert/importiert und ausdrücklich aktiviert werden.

## Grenzen

- Nicht mit Spotify-PCM oder Streaming-Audio verwechseln. Es erfolgt keine Separation, Transkription, automatische Sänger- oder Phonemerkennung. Ohne bereits isolierten Stem kann das Studio **keinen** verlässlichen Vokalverlauf liefern. Die V643-Zeitauflösung ist 80 ms, nicht silbengenau.
- Die Analyse ist eine Darstellung/kleine optionale Dynamikmodulation, **kein Ersatz** für V660 manuell geprüfte Sängerrollen, V644 autorisierte Viseme oder kommende V662-Verfeinerungen.
- Die Analyse wird nicht automatisch dauerhaft gespeichert. Der vorhandene V643-JSON-Export/-Import bleibt der Weg für wiederverwendbare Merkmale.

## Nachweise

`npm run test:v661`, `npm run test:v661:types`, `npm run test:v643`, `npm run test:v644`, `npm run test:v631`, `npm run test:v632`, `npm run test:v645`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:smoke:v661`.

Die Projektfreigabe benötigt zusätzlich `npm run typecheck` sowie `npm run build` mit installierten Next.js-/React-/Node-Abhängigkeiten; browserbasiertes 3D-Verhalten und echtes Audio sind nicht durch die isolierten Tests bewiesen.
