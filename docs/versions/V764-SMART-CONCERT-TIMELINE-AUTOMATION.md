# V764 – Smart Concert Timeline Automation

## Einstieg

**Einstellungen → Dynamic Stage → V764 Smart Concert Timeline Automation**, direkt unter dem bisherigen V763-Editor. Der laufende Song wird über die V763-Brücke mit echter Song-ID, Dauer und V761-Szenen übernommen.

## Vorschläge mit expliziter Freigabe

Nur der **verifizierte V604-/V761-Szenenplan** darf Vorschläge auslösen. V764 erzeugt daraus höchstens 120 zeitlich begrenzte Kamera-, Licht-, Tanz- und Lyrics-Cues im vorhandenen V354-Format. Die Angaben sind **Regievorschläge**, keine tatsächliche Bild- oder Stimmerkennung. Ein Vorschlag kann ausgewählt und seine Aktion angepasst werden. Erst nach Klick auf **„Geprüfte Cues ausdrücklich übernehmen“** wird er in die aktuell geöffnete V354-Songtimeline geschrieben. Beim Import werden alle Überschneidungen mit bestehenden Cues **auf derselben Spur** sowie doppelte IDs ohne Überschreiben übersprungen; der Editor zeigt die Anzahl an. Anschließend können Start, Länge, Wert und Name im V763-Editor weiter bearbeitet werden. Die V354-Aktivierung bleibt unverändert.

V764 nutzt weiterhin den vorhandenen V354-Playbackpfad; keine zusätzlichen Kameras, Lichtquellen oder Render-Passes. Ohne verifizierte Szenen gibt es **keine erfundenen Vorschläge**.

## Mehrsong-Bibliothek

Die Songbibliothek ist mit maximal **32 Songshows** bewusst begrenzt und nutzt browserlokales `localStorage`. Über **„Offene Songshow in Bibliothek speichern“** lässt sich die V354-Show mit ihrer echten Song-ID sichern. Gespeicherte Shows können ausdrücklich geladen und nach Bestätigung gelöscht werden. Vor dem bewussten Wechsel zu einem anderen Song wird die aktuell offene songgebundene V354-Show gesichert. Ein erfolgloser Speicherversuch – Speicherkontingent, inkompatible Daten oder volle Bibliothek – verhindert den Wechsel, statt Inhalte zu löschen. Eine vorhandene V354-Show ist damit auch aus V763 heraus in die Bibliothek übernehmbar.

**Opt-in:** Nach Einschalten von „Gespeicherte Show beim echten Songwechsel automatisch laden“ prüft die Live-Bühne beim Trackwechsel, ob die Song-ID in der Bibliothek vorhanden ist. Fehlt sie, wird die laufende V354-Show nicht ersetzt; der trackgebundene Playback-Check verhindert ein Überspringen auf fremde Shows. Ist sie vorhanden, wird vor dem Laden der ausgehende V354-Stand gespeichert. Bei gleicher Song-ID überschreibt das automatische Laden niemals einen derzeit offenen Stand. Eine manuelle Wiederherstellung derselben Song-ID benötigt eine explizite Bestätigung im UI.

Der Bibliotheksschlüssel `sonic-concert-song-library-v764` ist in der bestehenden portablen Konfigurationssicherung enthalten. Zusätzlich lässt sich die gesamte Bibliothek als JSON exportieren. Browser-localStorage ist **nicht geräteübergreifend synchronisiert** und kann bei gelöschten Browserdaten verloren gehen; für Gerätewechsel regelmäßig exportieren. Der vorhandene V354-Editor speichert weiterhin genau **eine aktuell aktive** Show; die Bibliothek ist die Ablage für mehrere Shows.

## Grenzen und Kompatibilität

Keine automatische Stimme-zu-Avatar- oder Phonem-Erkennung, keine neuen Songabschnitts-Zeitstempel und keine eigenen Render-Pfade. V763, V756, V757, V758–V762 und manuelle Timelines behalten Vorrang. Reale GLB-/WebGL-Browserprüfung und vollständiger Next.js-Produktionsbuild sind in der Umgebung ohne installiertes `node_modules` noch ausstehend.
