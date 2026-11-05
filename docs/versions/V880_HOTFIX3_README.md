# Sonic Display V880 – Hotfix 3: Last.fm Personal Insights

## Ursache

`tests/v722-personal-insights-regression.cjs` verlangt einen sichtbaren Header-Link
`href="#lastfm-personal-insights-v722"` im Last.fm-History-Panel.
Die Personal-Insights-Sektion war weiterhin vorhanden, aber ihr Direktlink fehlte.

## Änderung

Nur `components/LastFmHistoryPanelV706.tsx`: zusätzlicher Anker
`<a href="#lastfm-personal-insights-v722">Personal Insights ↓</a>`
vor dem bestehenden Artist-Dashboard-Link. Keine Änderungen an Last.fm-Daten, APIs oder Filtern.

## Installation des Patch-Pakets (Windows / PowerShell)

1. Patch-ZIP direkt im Root des installierten V880 entpacken.
2. `node .\apply-v880-hotfix3.cjs` ausführen.
3. `npm run test:v722` und `npx tsc --noEmit`, anschließend `npm run build`.

Der Installer ist idempotent, prüft `package.json` auf Version `0.1.0-v880`,
und legt vor Änderungen eine Sicherung unter `backups/v880-hotfix3/` an.

**Hinweis:** Bei einem frisch entpackten *vollständigen* Hotfix-3-ZIP ist der Fix
bereits enthalten; der Installer ist dort nicht erforderlich.

## Prüfung in der Erstellungsumgebung

- V722: 109/109 Tests bestanden.
- V720–V728 und V858–V863 erfolgreich.
- V880: 44/44 Regressionen erfolgreich.
- V752 Release-Integrity-Check erfolgreich.
- V729-Render-Test konnte mangels installiertem `react` nicht ausgeführt werden.
- V722-Core-TypeScript-Prüfung erfolgreich. V722-UI-/globaler TypeScript-Check
  sowie Next.js-Produktionsbuild sind ohne vollständig installierte
  npm-Abhängigkeiten nicht belastbar prüfbar.

**Wichtig:** Versionsnummer bleibt absichtlich `0.1.0-v880`, damit bestehende
Release-Integritätstests unverändert funktionieren.
