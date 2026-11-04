# V658 – Reliable Configuration & Recovery

## Umgesetzt

- **Konflikterkennung:** Die Admin-API liefert pro Avatar eine inhaltsbasierte Revision. Die Avatar-Bearbeitung lädt Metadaten und Revision in einem GET und sendet `expectedRevision` beim PATCH. Ein inzwischen geänderter Datensatz ergibt **HTTP 409**, ohne den Editor zurückzusetzen. Ältere API-Aufrufer ohne Revision bleiben abwärtskompatibel.
- **Lokale Integrität:** Atomare `.tmp`-Datei mit `sync`, letzte valide `.bak`-Kopie vor Ersetzung; bei beschädigter/fehlender Hauptdatei Fallback auf den gesicherten Stand. Sind beide Dateien beschädigt, wird der Schreibzugriff gesperrt statt eine leere Konfiguration zu erzeugen. Die lokale Kopie kann nach ausdrücklicher Bestätigung wiederhergestellt werden.
- **Vercel Blob:** Append-only Ereignisse behalten Änderungen an verschiedenen Modellen; konkurrierende versionierte Änderungen am selben Modell werden anhand der kanonischen Journal-Reihenfolge nachvollziehbar aufgelöst. Snapshot-Lesen fällt bei defekter jüngster Version auf einen gültigen Vorgänger zurück. Defekte/unlesbare Journaleinträge sind ein Diagnose- und Schreibschutzproblem, keine stillschweigend ignorierte Datenänderung. Keine blinde Neuinitialisierung bei Fehlern.
- **Oberfläche:** Einstellungen → Avatar-Bibliothek: Statusprüfung, Konfliktmeldungen und lokale Wiederherstellung (nur Admin). Das Überschreiben ist eine bewusste Aktion.

## Grenzen und Betrieb

Die Blob-API unterstützt hier keine echte **serverübergreifende compare-and-swap-Transaktion**. Bei parallelen Updates auf getrennten Vercel-Instanzen kann eine Antwort die endgültige Konfliktauflösung noch nicht kennen. Die konvergente Projektion verwirft konkurrierende Events statt sie still zu überschreiben und listet die Konflikte in den Diagnosen. Absolute Sofort-Garantien erfordern eine transaktionale Datenbank. Alte unversionierte Clients werden zur Kompatibilität weiter akzeptiert.

Die lokale Sicherung enthält eine vorherige **Metadaten-Datei**, keine GLB-Binärdateien; dafür V657-Gerätebackup verwenden. Die Blob-Journalhistorie wächst weiter und wird in dieser Version **nicht** bereinigt. Eine manuelle Blob-Rollback-Funktion wurde ausdrücklich nicht hinzugefügt, um den Auditverlauf nicht zu zerstören.

## Tests

`npm run test:v658`, `npm run test:v658:types`, `npm run test:smoke:v658`, `npm run check:release`, `npm run verify`. Tests simulieren doppelte stale revisions, parallele Updates an mehreren Modellen, 1000+ Snapshot-Einträge, defekte Snapshots, beschädigtes Journal, beschädigte lokale Datei und Wiederherstellung. Ein vollständiger Next.js Build ist nur nach tatsächlich installiertem `node_modules` bestätigt.
