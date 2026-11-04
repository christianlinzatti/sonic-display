# Sonic Display V880 – Smart Concert Experience 5.0

**Vollständiges Projekt-ZIP** – keine Einzel-Upgrades oder V879-Installation nötig.
Enthält alle Projektdateien, Quellcode, Assets und die implementierten Versionen
bis V880, inklusive aktueller `package.json` / `package-lock.json`.

## Installation (Windows / PowerShell)

1. ZIP in einen **neuen Ordner** entpacken, vorhandene Installation vorher sichern.
2. Node.js 22 oder neuer und npm bereitstellen (mit Internetzugang für `npm ci`).
3. PowerShell im Ordner mit `package.json` öffnen:

```powershell
npm ci
npm run verify:v880:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ: `powershell -ExecutionPolicy Bypass -File scripts/verify-v880-windows.ps1`
startet `npm ci`, fokussierte Regressionen, vollen TypeScript-Check und
Next.js-Produktionsbuild; bei Fehlern bricht das Skript ab.
Für den produktiven Start nach erfolgreichem Build `npm run start` verwenden.
Spotify- und andere Zugangsdaten anhand von `.env.example` in einer
selbst angelegten `.env.local` konfigurieren – keine Secrets im ZIP.

**Achtung:** Die früheren Upgrade-Installer V874–V878 sind lediglich zur
Nachvollziehbarkeit enthalten und dürfen in der Vollversion nicht nochmals
ausgeführt werden. Das volle V879-Projekt ist bereits integriert.

## Neue Funktionen

- Gemeinsame, songabschnittsbasierte Dramaturgie aus Opening, Narrative,
  Singalong, Anticipation, Impact, Breathing und Finale.
- Schwerpunkt-Wechsel zwischen Publikum, LED-/Laser-Looks und Festival-FX,
  ohne unkontrolliertes Dauerfeuer. Die Wahl ist reproduzierbar und
  songpositionsbasiert – keine künstlichen Beats.
- Sanfte Glättung mit Seek- und Trackwechsel-Reset; Presets für
  Cinematisch, Ausgewogen und Festival.
- Bestehender Lyrics-Schutz und verifizierter Performer-Kamerafokus werden
  berücksichtigt. Manuelle Kamera-/Lichtsteuerung und manuell bearbeitete
  FX-Timelines haben Vorrang.
- Automatische Dämpfung bereits berechneter Publikums-, Partikel-, Festival-,
  Schaum-, LED- und Lasereffekte **nach** den bestehenden Performance-Gates.
  Keine neu erzeugten Bühnenobjekte, Draw Calls oder Lichtquellen.
- Concert FX Studio: Master-Schalter, Kontrast, Schwerpunkt-Rotation,
  Performer-/Lyrics-Schutz, Stärke 0–100 % und Stil. Simulierte Vorschau.

**Grenzen:** V880 ersetzt keinen Kamera- oder Tänzer-Regisseur; die bisherigen
Kamera- und Tanz-Bewegungen bleiben unverändert. Keine KI-Gestenerkennung,
keine verifizierte Vollsong-/Realhardware-Abnahme, kein echter Live-GPU-Test.

## Qualitätsstatus (3. November 2026)

**Bestanden:** 44/44 neue V880-Regressionstests, 12 fokussierte
Regressionstest-Suiten (V810, V815, V825, V868, V873–V880),
12 gezielte TypeScript-Prüfungen, TS/TSX-Syntax-/Importcheck und
Windows-/Linux-Modul-Dateinamencheck. Der Integrationsaufbau beginnt
mit der vollständigen V879-Projektdatei.

**Nicht bestanden / nicht verifiziert:** `npm ci --offline` scheitert wegen
fehlendem npm-Cache (`zustand@5.0.16`); Online-`npm ci` scheitert an
`EAI_AGAIN`/einer npm-Exit-Handler-Meldung. `npm run typecheck` kann deshalb
mangels Typdefinitionen/Dependencies nicht vollständig laufen, und ein
Next.js-Produktionsbuild ist hier nicht erfolgreich nachgewiesen.

**Freigabestatus:** Integrierte, gezielt geprüfte Vollversion als Quellcode;
**keine** Produktionsbuild-Freigabe. Die volle Prüfung muss nach
`npm ci` auf Windows oder GitHub Actions erfolgen.
