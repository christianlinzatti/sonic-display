# Sonic Display V420 – Visual Syllable Articulation Editor

## Inhalt
- Visueller Editor im Rap Performance Editor unter dem V418 Quality Inspector.
- Songgebundene manuelle Mundform-Keyframes für synchronisierte **Wörter**: relative Position im Wort, Kieferöffnung, Lippenbreite und Lippenrundung; ein bis acht Keyframes pro Wort.
- Interpolierte Vorschau mit dem bestehenden V374/V415/V419-System und optional am aktiven GLB-Avatar; die Spotify-Wiedergabe wird nicht verändert.
- Speichert einen geprüften Satz Keyframes in den vorhandenen UI-Einstellungen (Browser `localStorage`). Text und Wortzeit werden zur Kollisionsvermeidung abgeglichen. Gespeichert wird nur die Wortidentität und die Korrektur – keine vollständigen Lyrics-Texte.
- Nur bei ausdrücklich aktivierter V420-Live-Schaltung **und** aktivierter V419-Artikulation erfolgt eine Live-Wirkung. Alle alten Funktionen bleiben wie gehabt.
- Der V420-Pass wirkt ausschließlich auf `face.jaw`, `face.wide` und `face.round`. Bilabiale Verschlüsse (B/P/M), Pausen, die V374-Sängerrollen, Bühnenkamera und Tanz bleiben geschützt.

## Einschränkungen
Die Zeitpunkte innerhalb eines Wortes sind manuell festgelegte, **relative** Keyframes. Die Engine erkennt keine echten Audio-Phoneme/Silben und misst keine Latenz. Ohne echte Wortzeitstempel gibt es bewusst keine V420-Bearbeitung.

## Prüfung auf Windows

```powershell
npm install
npx tsc --noEmit
npm run build
```

Die vollständige Produktion-Kompilierung muss auf dem Windows-Rechner mit installierten Abhängigkeiten ausgeführt werden; in der Arbeitsumgebung fehlen diese Pakete.
