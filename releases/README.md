# Sonic Display – versionsunabhängiger ZIP-Import

Lade eine vollständige ZIP-Datei unter **`releases/SonicDisplay-V<Nummer>.zip`** auf `master` hoch (z. B. `SonicDisplay-V969.zip` oder `SonicDisplay-V970.zip`) und bestätige **Commit changes**.

Der Workflow **Sonic Display - Versioned Project ZIP Import** erkennt die Versionsnummer automatisch. Du musst dafür **keine Workflow-Dateien und keine Python-Skripte pro Version kopieren**. Wichtig: `package.json` muss im ZIP unter `sonicRoadmapRelease` dieselbe Version nennen, z. B. `"v969"`. Die ältere Angabe `v965` in einer neueren ZIP muss vorher aktualisiert werden. `package.json` → `version` ist eine separate App-Paketversion und wird nicht für den Import verwendet.

Der Workflow kontrolliert ZIP-Integrität, vollständige Projektdateien, Pfadsicherheit, Dateinamen-Kollisionen, Größenlimit und Version. Er extrahiert die Quelldateien nach `master`, überspringt `.github/**` aus dem ZIP zum Schutz der Workflows, löscht die übernommene ZIP-Datei und startet den bestehenden Linux/Windows-Produktionscheck. Der letzte Schritt ist eine **separat laufende GitHub Action**; ein erfolgreicher Import bedeutet nicht automatisch, dass der Build grün ist.

**Manuelle Wiederholung:** Unter **Actions → Sonic Display - Versioned Project ZIP Import → Run workflow** den Dateinamen explizit eingeben. Das funktioniert nur, solange diese ZIP noch im Repository liegt. Bei mehreren gleichzeitig geänderten ZIPs in einem Commit verweigert der automatische Import die mehrdeutige Auswahl; Dateien daher einzeln hochladen.

**Hinweise:** Ein fehlgeschlagener Import commitet keine extrahierten Dateien. Bereits importierte Dateien, die in späteren ZIPs fehlen, werden nicht pauschal gelöscht. GitHub ist hier öffentlich: ZIPs niemals mit `.env`-Zugangsdaten, persönlichen Tokens oder Secrets erzeugen.
