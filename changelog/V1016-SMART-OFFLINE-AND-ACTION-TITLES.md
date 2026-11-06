# Sonic Display V1016 – Smart Offline Experience und versionierte GitHub-Action-Titel

- Kurze Spotify-/Netzwerkunterbrechungen: bereits bestätigter Track und Lyrics bleiben in der offenen Browser-Sitzung sichtbar, klar als **nicht live** markiert. Wiedergabefortschritt und Live-Animation werden nicht künstlich fortgesetzt.
- Lyrics nach wiederholtem Titelwechsel aus kontogebundenem, zeitlich begrenztem In-Memory-Cache (maximal 24 Tracks, maximal 3 Stunden Lyrics, 20 Minuten letzte Titelansicht). Keine zusätzlichen Internetanfragen.
- Bei 401, Abmelden oder Kontowechsel werden lokale Daten sicher gelöscht; Antworten früherer Requests werden durch Account-/Abort-Checks ignoriert. Kein persistentes Caching von Spotify-, Artwork- oder Lyrics-Daten im Service Worker oder localStorage; daher kein garantiertes Offline-Reload und keine garantierte Albumcover-Bildverfügbarkeit.
- Online-Event löst kontrollierte Wiederaufnahme aus, verhindert falschen Live-Status während Offline.
- **Alle GitHub-Actions-Workflows** erhalten `run-name` mit V1016; die Produktionspipeline verwendet bei manuellem Start die tatsächliche `inputs.release`-Version. Nach dem Import kann ein erlaubnisgeprüftes Skript nur die `run-name`-Zeilen der geschützten GitHub-Workflows für zukünftige Releases aktualisieren.
- Neuer V1016-Regressions- und Release-Gate in Vercel, Prebuild und GitHub.

## Freigabe

Node 24, `npm ci`, kompletter TypeScript-Check, Next.js-Produktionsbuild und Playwright müssen weiterhin im CI erfolgreich sein. Ein lokaler Syntax-/Regressionserfolg ist keine Produktionsfreigabe.
