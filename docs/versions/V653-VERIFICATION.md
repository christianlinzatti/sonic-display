# Sonic Display V653 – Prüfprotokoll

## Erfolgreich in der Arbeitsumgebung

- `npm run test:v653` – deterministische Regie, Lyrics-/Lip-Sync-Priorität, manuelle V350-Regie, reduzierte Bewegung, Foto-/Biografie-Regie, Renderer-Integration.
- `npm run test:v653:types` – isolierter V653-TypeScript-Check.
- `npm run test:smoke:v653` – durchgehend erfolgreich bis einschließlich V616, inklusive Metadaten und Bühnenregressionen.
- `npm run verify:offline:fast` – Exit-Code **0**, inklusive **180 isolierter historischer Regressionstest-Aufrufe**.
- Gezielte historische `test:v330` und `test:v338` bis `test:v358`, `test:v461`, `test:v477` – erfolgreich.
- `npm run test:module-case` – erfolgreich, keine Windows-/Linux-Dateinamenkollisionen unter TS/TSX.
- `npm run check:test-types` – erfolgreich, test-only Typen vom Produktiv-Typcheck isoliert.
- `npm run test:env:spotify-build` – erfolgreich.
- `npm run check:syntax`, `npm run check:architecture` – erfolgreich.

## Noch offen

- **Gesamter `tsc --noEmit` und echter Next.js-Produktionsbuild nicht bestätigt.** In der Arbeitsumgebung fehlen installierte React-/Next.js-/Node-Abhängigkeiten; `npm install` konnte hier nicht abgeschlossen werden. Ein `tsc --noEmit` ohne diese Abhängigkeiten liefert deshalb erwartungsgemäß nicht auflösbare Module und Typdefinitionen. Dieser Befund darf nicht als bestandener Gesamt-Typecheck ausgegeben werden.
- **Live-Browser- und Performance-Test** mit echten Spotify-Sessions, Künstlerbildern, lippensynchronen GLBs und der gewählten Zielauflösung noch erforderlich.
- **GitHub Actions Windows und Ubuntu** müssen nach Commit/Push der V653-Dateien die verbindliche Freigabe bestätigen.

## Lokaler Freigabebefehl

```powershell
npm install
npm run verify
```

`npm run verify` führt historische Tests, den vollständigen TypeScript-Check und den Next.js-Produktionsbuild aus. `npm run build` führt zudem den aktualisierten V653-Preflight aus.
