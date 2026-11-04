# V645 – Expressive Artist Performance

## Umsetzung

- Gemeinsame, rein deterministische Mikro-Performance für bereits verifizierte
  Deutschrap-Wörter und zugewiesene Sänger; vier langsam wechselnde Motive.
- Kleine additive Augenbrauen-, Wangen- und Squint-Akzente. Das bestehende
  Kopf-Bone-Overlay (V581) und V574-verifizierte Augen-Bones werden wiederverwendet.
- Dezente asymmetrische Armbewegungen ausschließlich bei von V618 bereits
  bestätigtem echtem Fußkontakt. Keine Änderungen an Hüfte oder Beinen.
- Begrenzung: zusätzliche Kopfneigung höchstens 0,006 rad, Augenbewegung
  höchstens 0,003 rad, Arme höchstens 0,0018 rad je Seite.
- Pausen, Song-/Rollenunsicherheit, manuelles Authoring, Low Tier und Reduced
  Motion schalten die Zusatzregie sofort aus. Keine zusätzliche Frame-Schleife.
- Mund-, Kiefer-, Bilabial- und Blinkkanäle werden durch V645 nicht geändert;
  die V644-Timeline und die bestehende V562-Kalibrierung bleiben maßgeblich.

## Grenzen

V645 erkennt weder Sänger noch Phoneme, Emotionen oder Hände automatisch.
Die musikalische Evidenz stammt aus vorhandenen, bestätigten Lyrics-/Sängercues.
Die Modifikation betrifft ausschließlich Rig-Bones/Morphs, die das geladene GLB
bereits hat. Ob die subtilen Bewegungen wirklich natürlich aussehen, muss im
Browser mit echten GLB-Avataren visuell geprüft werden. Die Simulation ist
keine visuelle Abnahme und ersetzt keinen Next.js-Build.

## Lokale Prüfung

```powershell
npm install
npm run test:v645
npm run test:v645:types
npm run verify:v645
npx tsc --noEmit
npm run build
```
