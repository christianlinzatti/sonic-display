# V1125 – Test- und Releasehinweise

## Wirklicher Live-Umfang

Der neue Acht-Sektoren-Sampler wird auf dem bestehenden gedrosselten
`ArenaAudienceV1032`-Tick benutzt und setzt Farben bzw. Transform-Matrizen
vorhandener Instanzen. Kein zusätzlicher `useFrame`, Mesh, Audio-/Govee-Befehl.
Die sieben Planungsphasen werden nicht automatisch aus Musik erkannt.
Die drei Performer-Slots sind rein dramaturgische Fokusrollen.

## Lokal

```bash
npm run test:v1125
npm run test:v1125:types
node scripts/v959-source-preflight.cjs
node tests/check-architecture.cjs
node tests/check-source-syntax.cjs
```

Die V1124-Basis und alle Vorgänger müssen weiterhin geprüft werden.
Die vollständig reproduzierbare Node-24-Produktion mit Windows,
Ubuntu, Next.js, Desktop-/Touch-Playwright und Soak muss GitHub Actions
nach dem ZIP-Import bestätigen. Ein lokaler Typ-Test ist keine Freigabe.
