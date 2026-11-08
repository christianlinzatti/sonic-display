# V1109 · Test & Release Notes

## Reproduzierbare lokale Tests

```bash
npm ci --include=dev --no-audit --no-fund
npm run test:v1109
npm run test:v1109:types
npm run test:v1108
npm run test:v1107
npm run test:v1106
node scripts/v959-source-preflight.cjs
```

## Browser-Prüfung (Next.js-Produktionsserver)

Die vollständige GitHub-Actions-Pipeline lässt den realen Next.js-Produktionsbuild,
90+ Playwright-Fälle (Desktop + Touch), Bilder und Ressourcen-Soak prüfen. Zusätzlich liegen
zwei neue V1109-Browserfälle in `tests/e2e/ai-concert-story-v1109.spec.cjs`.
Die neue Version muss bei Import in die Repo-Workflows auf Ubuntu und Windows bestehen;
lokale Unit-Tests allein sind **kein** Beleg für die vollständige Produktionsfreigabe.

## Funktionsumfang & Grenzen

- Rein lokaler Storybogen über sieben vorgegebene Zeitfenster; **keine** behauptete
  Live-Erkennung von Verse, Hook, Drop oder tatsächlichen Gefühlen.
- Vier Erzählbögen, drei Spannungsverteilungen, unterschiedliche Kamera-, Tanz-,
  Laser- und Bühnenstile, begrenzte Intensität, sanfte Übergänge und Atempause.
- Storyvorschau zeigt 0–100%-Fortschritt aus dem aktuellen V1040-Plan. Vorhandene
  Zeitgrenzen, Songtitel und IDs bleiben beim Übernehmen erhalten.
- Story-Integration bei neuen OpenAI-/Offline-Vorschlägen ist ausdrücklich optional.
- Kein automatisches Aktivieren einer Bühne oder von Govee/LED-Geräten, keine
  Mikrofondatenübertragung und keine Erweiterung der vorhandenen Authentifizierung.
- Alle ZIPs bleiben bewusst ohne `node_modules`, `.next`, generierte Logs und
  Playwright-Berichte; sie sind nach Installation der Abhängigkeiten reproduzierbar.

## Bekannte Einschränkung

Die Timeline ist eine Gestaltungsvorlage, keine exakte Analyse der musikalischen
Form des Songs. Playwright und der vollständige Next.js-Build müssen nach dem
Import in GitHub Actions separat bestätigt werden.
