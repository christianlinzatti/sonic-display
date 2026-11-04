# Sonic Display V653 – Smart Artist Visual Director

## Verhalten

- Eine neue reine Steuerungsfunktion `planSmartArtistVisualV653` entscheidet **ohne weitere API-Abfragen** anhand von Songabschnitt, aktiven Lyrics, Lip-Sync, Wiedergabe, Beat und bestehenden Fotos, ob Portraits, ausgewogene Motive oder Konzertbilder gezeigt werden.
- In Verse mit Lyrics nur maximal ein zurückhaltendes Bild; bei Hooks/Drops mit Vocals maximal zwei und weiter abgesenkte Deckkraft. Instrumentalpassagen dürfen bis zu vier Fotos mit stärkeren Bewegungen zeigen. Pausen und `prefers-reduced-motion` (via bestehendes `reducedMotion`-Prop) setzen Foto-Bewegung auf 0.
- Bestehende V652-Auswahlen mit Quellennachweisen und Bildlizenz-Filtern werden verwendet; es gibt keine weitere Flickr-, Last.fm- oder MusicBrainz-Abfrage, keine Timer und keinen zusätzlichen Frame-Loop.
- Die V350-Manuell-Regie geht vor. V351/V352 können Deckkraft, Fotomenge und Bewegung weiter **reduzieren**, aber nicht über die Limits der V653-Vocal-Schutzlogik hinaus erhöhen.
- Künstlertexte (`source=text`) werden bei aktiven Lyrics oder Lip-Sync im Umfang auf einen kurzen Teaser gekürzt; in ruhigeren Passagen bleibt der volle von der bestehenden API gelieferte Text erhalten. Keine automatisch erfundenen Fakten.
- Einstellungen (Aktivierung, Lyrics-Schutz, Hook-Energie, max. Fotoanzahl, Übergänge) werden lokal gespeichert und im bestehenden Gallery Preview Editor inklusive verschiedener Songabschnitte zugänglich gemacht.
- Die bestehende Kamera-, Avatar-, Lip-Sync- und Lyrics-Engine wird nicht manipuliert; Bildrechte, Credits und manuelle Bühnenvorgaben bleiben erhalten.

## Prüfungen

```powershell
npm run test:v653
npm run test:v653:types
npm run test:smoke:v653
npm run verify
```

Ein vollständiger TypeScript-Projektcheck und Next.js-Produktionsbuild erfordern installierte npm-Pakete; die GitHub-Actions-Jobs prüfen sie. Browser-/Hardwaretests für Bildästhetik und Performance sind separat nötig.
