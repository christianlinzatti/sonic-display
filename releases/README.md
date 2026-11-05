## Automatische Produktionsprüfung

Nach dem Import startet **Sonic Display · Production & Playwright** genau eine
Linux-/Windows-Matrix. Der Lauf erhält automatisch die importierte Version, z. B.
**Sonic Display · V1005 · Production & Playwright**, und prüft den zugehörigen Commit.
Alte versionsspezifische Produktions-Workflows sind weiterhin manuell verfügbar.
HTML-Berichte und Fehler-Screenshots/Traces gehören jetzt zu den Produktionsartefakten.
Details: [Produktionsworkflow](../docs/setup/PRODUCTION_WORKFLOW.md).

# Sonic Display – versionsunabhängiger ZIP-Import

Lade eine vollständige ZIP-Datei unter **`releases/SonicDisplay-V<Nummer>.zip`** auf `master` hoch (z. B. `SonicDisplay-V969.zip` oder `SonicDisplay-V970.zip`) und bestätige **Commit changes**.

Der Workflow **Sonic Display - Versioned Project ZIP Import** erkennt die Versionsnummer automatisch. Du musst dafür **keine Workflow-Dateien und keine Python-Skripte pro Version kopieren**. Wichtig: `package.json` muss im ZIP unter `sonicRoadmapRelease` dieselbe Version nennen, z. B. `"v969"`. Die ältere Angabe `v965` in einer neueren ZIP muss vorher aktualisiert werden. `package.json` → `version` ist eine separate App-Paketversion und wird nicht für den Import verwendet.

Der Workflow kontrolliert ZIP-Integrität, vollständige Projektdateien, Pfadsicherheit, Dateinamen-Kollisionen, Größenlimit und Version. Er extrahiert die Quelldateien nach `master`, überspringt `.github/**` aus dem ZIP zum Schutz der Workflows, löscht die übernommene ZIP-Datei und startet den bestehenden Linux/Windows-Produktionscheck. Der letzte Schritt ist eine **separat laufende GitHub Action**; ein erfolgreicher Import bedeutet nicht automatisch, dass der Build grün ist.

**Manuelle Wiederholung:** Unter **Actions → Sonic Display - Versioned Project ZIP Import → Run workflow** den Dateinamen explizit eingeben. Das funktioniert nur, solange diese ZIP noch im Repository liegt. Bei mehreren gleichzeitig geänderten ZIPs in einem Commit verweigert der automatische Import die mehrdeutige Auswahl; Dateien daher einzeln hochladen.

**Automatische Bereinigung (V974):** Vor dem Import erstellt der Workflow eine Vorschau der von Git verwalteten Quelldateien, die in der neuen **vollständigen** ZIP fehlen. Nach erfolgreicher ZIP-Prüfung und Extraktion entfernt er ausschließlich diese veralteten Projektdateien aus `app/`, `components/`, `lib/`, `services/`, `integrations/`, `config/`, `context/`, `hooks/`, `public/`, `scripts/`, `tests/`, `types/` und alten `v<Nummer>/`-Verzeichnissen. GitHub-Workflows, `releases/`, der Importer, historische Dokumente/Archive, `data/`, `reports/` und nicht getrackte Benutzerdateien sind **geschützt**. Ein unerwarteter Projekt-Schrumpf von mehr als 10 % stoppt den Import. Der vollständige Löschplan ist als GitHub-Actions-Artefakt `sonic-zip-sync-plan-<run-id>` verfügbar. Der bestehende Struktur-Organizer räumt danach gegebenenfalls noch veraltete Root-Dokumente auf.

**Hinweise:** Ein fehlgeschlagener Import commitet weder extrahierte noch gelöschte Dateien. Der Löschabgleich wird ausschließlich in GitHub Actions mit `--sync-tracked` ausgeführt; lokale Direktaufrufe ohne diesen Schalter bleiben bei der alten Overlay-Funktion. GitHub ist hier öffentlich: ZIPs niemals mit `.env`-Zugangsdaten, persönlichen Tokens oder Secrets erzeugen.
