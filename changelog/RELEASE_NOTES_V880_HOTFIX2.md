# Sonic Display V880 – Hotfix 2: Release-Gate-Korrektur

## Ursache
`scripts/release-integrity-v752.cjs` erkennt korrekt zwei inkonsistente Release-Gates: `check:fast` startet V873, während `package.json` V880 als Version führt; `prebuild` startet erst mit V879. Es wird **nicht** die alte Integritätsprüfung abgeschwächt.

## Änderungen
Der Installer ergänzt `npm run test:v880 && npm run test:v880:types && ` am Anfang der bestehenden Skripte `check:fast`, `check:release` und `prebuild` in `package.json`. Alle bisherigen Tests und Checks bleiben erhalten. `package-lock.json` muss nicht angepasst werden, da weder Name, Version noch Abhängigkeiten geändert werden.

## Installation – bestehende V880-Hotfix-1-Installation
1. Das Patch-ZIP direkt in das Sonic-Display-Projektverzeichnis entpacken (neben `package.json`).
2. Im Projektverzeichnis ausführen:

```powershell
node .\apply-v880-hotfix2.cjs
npm run check:lockfile:v752
npm run test:v752
npm run test:v880
npm run test:v880:types
npx tsc --noEmit
npm run build
```

Der Installer schreibt vor der Änderung ein Backup nach `hotfix-backups/`. Ein zweiter Aufruf ist wirkungslos. Er verändert keine Quellcode- oder Lockfile-Dateien.

## Alternativ: Vollständiges Projekt-ZIP
Das Full-ZIP `sonic-display-v880-hotfix2-full.zip` basiert auf V880 Hotfix 1 und enthält die Reparatur bereits in `package.json`. Für eine frische Installation entpacken, `npm ci`, danach die oben genannten Prüfkommandos (ohne Installer) ausführen.

## Prüfstatus
- Erfolgreich: V752 Release-Integrität mit `--ci`, V752 Negativtests, V865.9 Prebuild-Guard, V849, V880, V571, V680 und V831 Regressionen, gezielte V880/V849 Typprüfungen.
- Vollständiger Anwendungstypcheck und Next.js Produktionsbuild konnten in dieser Umgebung nicht verifiziert werden, da `node_modules` fehlt. Diese Prüfungen müssen lokal mit den installierten Abhängigkeiten erfolgen.
