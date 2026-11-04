# V185 – Backup Manager & Device Migration Assistant

Die Einstellungen aus V184 bleiben unverändert und werden für den Export/Import wiederverwendet. V185 ergänzt im Display-Tab einen lokalen Manager für bis zu **sechs** benannte, versionierte Snapshots.

## Gerätewechsel

1. Unter **Settings → Display → Backup Manager** eine benannte Sicherung anlegen.
2. Mit **Sicherung als JSON exportieren** eine übertragbare Datei herunterladen.
3. Asset-Vollständigkeit prüfen. Der Scanner untersucht nur in Browser-Einstellungen vorkommende Pfade zu Avataren/Animationen. Lokale `/avatars`, `/animations`, `/models`, `/uploads` und `/assets`-URLs werden per HEAD-Anfrage überprüft. CORS, HEAD-Sperren und Offline-Verbindungen können das Ergebnis unklar machen. Externe URLs und `blob:`-URLs sind nicht auf ein anderes Gerät übertragbar, ohne die Originaldateien separat zu sichern.
4. Die JSON-Datei auf den Raspberry Pi kopieren und mit dem V184-Importer importieren; bei Bedarf Konflikte bestätigen.
5. Externe Avatar- und Animationsdateien separat übertragen und deren URLs prüfen. Spotify-Token und binäre Assets sind **nicht** in der Sicherung enthalten.

## Vergleich und Wiederherstellung

Jede Sicherung wird gegenüber aktuellen Browser-Einstellungen verglichen: nur im Backup, abweichend, identisch und nur auf dem aktuellen Gerät. Der Manager erlaubt das lokale Wiederherstellen nach Rückfrage; Überschreiben ist standardmäßig deaktiviert. Die bisherige V184-Rollback-Logik bleibt erhalten.

## Grenzen

Snapshots liegen nur in `localStorage` desselben Browsers. Die Zahl ist auf sechs begrenzt, lokale Speicherlimits gelten weiterhin. Kein Cloud-Backup, keine Verschlüsselung und keine garantierte Erkennung nicht referenzierter Binärdateien. Vor einem Gerätewechsel immer eine externe JSON-Datei exportieren und die Asset-Dateien getrennt übertragen.

## Tests

`npm run test:backup-manager`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
