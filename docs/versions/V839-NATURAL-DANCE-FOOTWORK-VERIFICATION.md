# Sonic Display V839 – Natural Dance & Footwork 4.0

## Funktionsumfang

- Kontaktspezifische, release-geglättete Abschwächung von **bereits vorhandenen** GLB-Rig-Kanälen (Fußschritt, Bein-Groove, Gewichtsverlagerung, Hüftschwingen und Hip-Counter).
- Bestehende automatische V486-Gruppenschritte werden pro nachgewiesenem Fußkontakt geschützt, ohne Bühnenwurzeln, IK-Anker, Animationsclips oder Rollen/Regie zu verändern.
- Genrefarbige, songzeitgebundene Modulationen für Deutschrap und Hardtekk; keine synthetischen Fußkontakte oder Audio-Phonemerkennung.
- Einstellungen unter Natürlicher Tanz: Ein/Aus, Genre-Rhythmus und Intensität; lokale Persistenz mit Fehlerbehandlung. Standardwert aktiv, aber nur mit tatsächlichem IK-Nachweis und ohne manuelle Priorität.
- Beim Song-/Modellwechsel, Seek, unbekannten Kontakten, deaktivierter IK oder reduzierter Bewegung wird die Zustandsmaschine zurückgesetzt.
- Weiterhin nur der vorhandene `useFrame`-Pfad, ohne zusätzliche Renderobjekte.

## Freigaberegel

Die Version darf erst nach vollständigem `tsc --noEmit`, Next.js `next build` und realen GLB-/GPU-Abnahmen als produktionsreif gelten. Neue Node-Tests verwenden künstliche Eingaben; sie ersetzen keine visuelle Validierung.

## Prüfergebnisse (01.11.2026, isolierte Ausführungsumgebung)

| Prüfschritt | Ergebnis |
|---|---|
| `npm run test:v839` | **Bestanden – 68 Gruppen** |
| `npm run test:v839:types` | **Bestanden** (isolierter TypeScript-Check) |
| Regressionen `test:v800` bis `test:v838` und `test:v735/v596/v665/v738/v744/v745/v758` (existierende Skripte) | **46/46 bestanden** |
| `node tests/check-source-syntax.cjs` | **Bestanden** (1.210 geprüfte Dateien laut Prüfer) |
| `node tests/check-architecture.cjs` | **Bestanden** (937 Referenzen) |
| Build Doctor `node scripts/v831-build-readiness.cjs --audit` | **Blockiert** (lokale `node_modules` fehlen); Lockfile, Node und case-sensitive Pfade bestanden |
| Vollständiges `tsc --noEmit --incremental false` | **Nicht abgeschlossen** (Zeitlimit 20 s / exit 124) |
| Next.js `next build` | **Nicht ausführbar** (Next.js nicht installiert; kein `npm ci` in dieser Umgebung) |
| Realer GLB-/GPU-Konzerttest | **Nicht durchgeführt** |

Diese Ergebnisse sind keine Produktivfreigabe. Das numerische Kontaktverhalten wird mit synthetischen, kontrollierten Eingaben geprüft. Die wahrgenommene Tanzqualität, Fußgleiten, 1–4 reale Avatare sowie FPS müssen noch auf echter Hardware abgenommen werden.
