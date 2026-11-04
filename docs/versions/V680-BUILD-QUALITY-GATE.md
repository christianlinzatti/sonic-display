# V680 – Build & Quality Gate

## Was ist neu?

Bis V679 wurde `npm run build` **vor** `next build` durch `prebuild` →
`check:release` → **vollständige historische** V671/V670/V669/V668/…-Smoke-Kette
blockiert. Eine Zeitüberschreitung vor `next build` war deshalb nicht
mit einem erfolgreich oder fehlerhaft kompilierten Next.js-Projekt gleichzusetzen.

In V680 sind die Verantwortungen sauber getrennt:

| Befehl | Zweck | Häufigkeit |
|---|---|---|
| `npm run check:dependencies` | Read-only Node-/Paket-/Lockfile-Diagnose | nach Installation, bei Problemen |
| `npm run test:quick` | V669–V680 + aktuelle Struktur-/Sicherheitsregressionen, **ohne** Node-Abhängigkeiten | jederzeit, auch offline |
| `npm run check:fast` | Abhängigkeiten → Quick-Tests → **vollständiger** TypeScript-Check | automatischer `prebuild` |
| `npm run build` | `check:fast` → tatsächlicher `next build` | lokal und CI |
| `npm run check:release` | explizite vollständige historische V671-Kette + neue Tests + TypeScript | vor größeren Releases |
| `npm run verify:historical` | besonders breite alte Suite | separater CI-Wochenlauf |
| `npm run verify:v680` | volle Release-Regression **und** Produktionsbuild | vollständige Freigabeprüfung |

## Schutzbedingungen

- `prebuild` führt nur `check:fast` aus. Es gibt keine rekursive Build-/Release-Abhängigkeit.
- Der Next.js-Build läuft **erst** nach erfolgreicher Fast-Suite und `tsc --noEmit`.
- Der vollständige Release-Gate bleibt mit denselben historischen Tests erhalten,
  aber wird nicht mehr automatisch bei jedem Build angestoßen.
- Die Diagnose behandelt fehlende Pakete, fehlende Node-Unterstützung und
  `--require-lock` als Fehler; ein fehlendes Lockfile ohne Strict-Flag ist eine
  deutliche Warnung (keine Scheinaussage über reproduzierbare Builds).
- In beiden CI-Betriebssystemen bleibt genau ein normaler Next.js-Build aktiv.
  Die breite historische Regression wird nicht nochmals auf jeden Push gelegt.
- Die Änderungen betreffen ausschließlich Paket-/Test-/CI-Infrastruktur;
  Bühne, Lyrics, Renderloop, Audio, Tanz und die Konzertregie bleiben unberührt.

## Lokale Windows- und CI-Schritte

1. Node.js 22 verwenden und im Projektverzeichnis `npm install` ausführen.
2. Das so erzeugte **`package-lock.json` einchecken**. In V680 kann es hier
   mangels Verbindung zu `registry.npmjs.org` nicht zuverlässig erzeugt werden.
3. `npm run test:quick` für reine Quellcode-/Regressionstests.
4. `npm run build` für schnellen Prebuild mit tatsächlichem Next.js-Compile.
5. `npm run check:release` für umfassende historische Regression.
6. `npm run verify:v680` kombiniert beides für eine vollständige Freigabe.

**Wichtig:** Ohne `node_modules` kann weder die vollständige Anwendungstypprüfung
noch der tatsächliche Next.js-Build bestanden werden. Ein erfolgreicher
`test:quick` ist kein Ersatz für diese Prüfungen.

## CLI-Checks

`node scripts/build-dependencies-v680.cjs --require-lock` prüft zusätzlich,
ob ein Lockfile vorhanden ist (sinnvoll für reproduzierbare CI-Releases).
Die Diagnose zeigt keine Secrets und verändert keine Projektdateien.
