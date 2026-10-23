# V467 – Intelligent Show Quality Advisor

## Bedienung

1. Starte den Avatar-Visualizer in Sonic Display mit laufender Musik und deinen GLB-Modellen.
2. Öffne **QA** oben rechts im Visualizer. Der bestehende V466-Inspektor misst weiterhin FPS, Framezeiten, Draw Calls, Kopfprojektion und den aktiven immersiven Lyrics-Bereich.
3. Darunter erscheinen die **V467-Qualitäts-Tipps** nach **drei aufeinanderfolgenden** verwertbaren Proben. Eine schlechte Einzelprobe genügt nicht. Maximal drei Hinweise werden priorisiert angezeigt.
4. Bei einem Songwechsel oder nach Schließen des QA-Panels wird der flüchtige Messverlauf verworfen. Es werden keine Daten gespeichert oder übertragen.

## Hinweise und deren Aussagegrenzen

| Erkannte Situation | Messbasis | Empfehlung, **keine automatische Aktion** |
| --- | --- | --- |
| Wiederholt unter 25 FPS | Frische FPS aus bestehenden V466-Rendermetriken; drei aufeinanderfolgende Proben | Grafikprofil prüfen; im Low-Modus GLB-Mesh-Komplexität und Effekte manuell vergleichen |
| Wiederholt unter 45 FPS | Dieselben FPS-Messungen | Zwischen zwei und vier Avataren vergleichen, vorhandene Draw Calls beobachten |
| GLB-Mesh fehlt in drei Proben | `isMesh`-Scan der bestehenden aktiven Szene | Modellimport und Dateipfad kontrollieren; nach Songwechsel sind kurze Ladevorgänge normal |
| Kopfpunkt wiederholt außerhalb der Projektionsfläche | Projektion der vorhandenen Three.js-Kamera | Kamera und Gruppenaufstellung im Live-Bild prüfen, keine Kameraänderung durch Advisor |
| Kopfpunkt wiederholt im Lyrics-Rechteck | Vorhandenes DOM-Rechteck + Kameraprojektion | Lyrics-Seite und Kamera prüfen; **keine bewiesene optische Verdeckung** |
| Überschreitender Lyrics-Bereich | DOM-Rechteck ohne Kopf-Treffer | Im Split-Screen möglicherweise beabsichtigt und daher nur informative Prüfung |
| Fehlende aktuelle FPS-Werte | Probe-Status | Laufende 3D-Bühne überprüfen; es werden keine FPS erfunden |

**Evidenz:** Die Hinweise tragen jeweils eine Quellenangabe (`gemessene FPS`, `Kameraprojektion`, `DOM + projizierter Kopfpunkt`, `DOM + geschätzter Kopfpunkt` oder `QA-Probenstatus`). Geschätzte Kopfpositionen werden nicht zu einer Gewissheit über Gesichtssichtbarkeit hochgestuft. Dieser Advisor misst weder GPU-Auslastung noch echte Gesichtsausleuchtung, Okklusion, Lip-Sync-Qualität oder Sängeridentitäten.

## Technische Umsetzung

- `services/show/concertQualityAdvisorV467.ts`: Reiner, deterministischer Bewertungsalgorithmus mit quellengetrennten, begrenzten Empfehlungen. **Drei aufeinanderfolgende** Proben innerhalb der letzten 3,5 Sekunden, mit maximal 2,5 Sekunden Abstand zwischen Proben; höchstens 3 Hinweise. Bei unterbrochenen oder veralteten Samples gibt es keine verfrühte Warnung.
- `components/visualizer/concertQualityStoreV466.ts`: Nutzt die bereits bestehende etwa sekündliche V466-Messung; nur **vier** flüchtige Observationen werden vorgehalten. Track-Reset und QA-Schließen löschen den Verlauf. Kein neuer Timer, kein weiterer WebGL-Readback, kein Cache im LocalStorage.
- `components/visualizer/ConcertQualityAdvisorV467.tsx`: Anzeige unter dem vorhandenen V466-QA-Panel, ausschließlich bei geöffnetem QA. Keine Änderung an Show-Rezepten, GLB-/Choreo-Konfiguration, Lyrics, Kamera, Licht oder manuellen Vorgaben.
- `app/globals.css`: Mobile-taugliche Styles im vorhandenen scrollbaren Panel.

## Lokale Prüfungen

```powershell
npm install
npm run test:v467
npm run verify:v467
npm run typecheck
npm run build
```

Optionaler statischer Layouttest (mit installiertem Python-Playwright und Chromium):

```powershell
python scripts/v467-show-quality-advisor-browser-smoke.py --fixture --seconds 0
```

Browsertest mit laufender lokaler Instanz (vorher Spotify/GLB initialisieren):

```powershell
python scripts/v467-show-quality-advisor-browser-smoke.py --url http://127.0.0.1:3000 --headed --seconds 30
```

**Vorsicht:** Der Fixture-Test benutzt absichtlich **simulierte FPS und Platzhalter**, keine echte GPU-Messung. Der Live-Test inspiziert DOM-Kontrollen und Layout; keine automatische echte FPS- oder optische 3D-Qualitätsabnahme. Ein vollständiger Next.js-Produktionsbuild und eine mehrstündige Raspberry-Pi-Wiedergabe bleiben als reale Abnahme offen.
