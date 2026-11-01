# V686 – Vocal & Lip-Sync Precision

V686 verfeinert die **Reaktionsgeschwindigkeit** bereits vorhandener Gesichtsmorphs an tatsächlich gelieferten Wort-Zeitmarken. Keine zusätzlichen Phonem-, Silben- oder Sängerzeitmarken werden erfunden.

- In schnellen Deutschrap-Passagen reagiert das vorhandene Mundziel am **Beginn** belegter Wörter präziser; gegen Ende klingt die bestehende Mundanimation etwas kontrollierter aus.
- B/P/M-Verschlüsse werden nur dann schneller, wenn die bestehende V384/V415-Steuerung bereits ein *lipsClosed*-Ziel setzt. Die Präzisionsschicht erzeugt keine eigene Lippenform und ändert keine Lyrics.
- V385/V496-Sänger-Casting, V420-Bearbeitungen, V423 Audio, V644/V662 manuelle Viseme-Timelines samt stillen Lücken, V661 Vocal-Stems sowie Kalibrierung, Vorschau und GLB-Animationen bleiben vorrangig.
- Nur bei aktivem Song, synchronisierten **Wörtern** und autorisiertem Performer; Low-Quality, reduced-motion, unsynced Lyrics, Pause, fehlende Evidenz => neutral.
- Pure Berechnung pro bestehendem Render-Frame; keine neue Audio-Pipeline, kein Worker, kein Store, keine Render-Schleife.

### Validierung

`npm run test:v686`, `npm run test:v686:types`, `npm run test:quick`. Der reale `npm run build` benötigt wie in V680 dokumentiert installierte npm-Abhängigkeiten und ein Lockfile.
