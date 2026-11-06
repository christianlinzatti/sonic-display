# Sonic Display V1017 – Intelligent Cache Manager

## Neu
- **LRU + Speicherbudget** für Browser-Antwortcache: maximal 120 Antworten, insgesamt ca. 2 MiB geschätzter Arbeitsspeicher und pro Antwort höchstens 256 KiB. Abgelaufene Einträge werden vor der Verdrängung entfernt; häufig gelesene Einträge überleben länger.
- **Provider-spezifische Obergrenzen** für TTL und Stale-While-Revalidate: Live-Playback niemals zwischenspeichern, Follow- und Geräteinformationen nur kurz, Lyrics/Bühneninhalte mit abgestuften Maximalwerten. TTL wird nie künstlich verlängert.
- **Hot-Entry Warmup**: Häufig genutzte optionale GET-Daten können kurz vor Ablauf einmalig aufgefrischt werden. Kein Warmup für Benutzeraktionen, Wiedergabe, Offline-Modus, Hintergrund-Tabs, blockierte Anbieter oder überlastete Warteschlangen. Keine zusätzlichen Diagnose-Pings.
- **Privates Dashboard** zeigt nur Zahl, geschätzten Speicherbedarf, Treffer, Verdrängungen, abgelaufene und zu große Einträge sowie Warmups – keine Kontonamen, Request-Schlüssel, URLs oder Inhalte.
- **Kontowechsel** setzt Cache und alle Cache-Statistiken zurück. Es wird nichts in Browser Storage, IndexedDB oder Service Worker gespeichert.

## Qualität und Freigabe
- V1017-Regression und TypeScript-Prüfung in prebuild, Vercel und GitHub-Produktionsmatrix; manueller V1017-Validierungsworkflow.
- Versionierte GitHub-Action-Lauftitel für aktuelle V1017 (bestehender ZIP-Import-Mechanismus aktualisiert sie beim nächsten Import, falls ausreichend Berechtigungen).
- Der vollständige Node-24-/Next.js-Build mit installierten Paketen ist erst nach GitHub CI/Vercel bestätigt.
