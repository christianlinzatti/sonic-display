# Sonic Display V847 - Festival Finale FX

## Implementiert

- Metallischer Konfettiregen (Gold, Silber, gemischt) mit bis zu 80 GPU-Instanzen, beweglichen Spiegelungs-Imitationen durch wechselnde Farbwerte und sich drehenden Papierplaettchen.
- Zwei virtuelle Funkenraeder mit insgesamt bis zu 32 GPU-Instanzen, ohne echte Pyrotechnik, echte Funken, DMX oder Hardware-Steuerung.
- V844 waehlt den dominanten Effekt: Nur im bestaetigten Konfetti-Zeitfenster Metallregen; im bestaetigten Funken-Zeitfenster Raeder; im CO2-Zeitfenster beides aus. Kein unautorisierter neuer Zeitplan.
- Die vorhandenen V816-Konfetti-/Funkeninstanzen werden, soweit eingeschaltet, bei V847 gesenkt; abgeschaltete oder manuell abgeschaltete Effekte werden nicht reaktiviert.
- Neue Einstellungen im Concert FX Studio: Effekte separat ein/aus, Intensitaet, Metallic-Farbe.
- Bestehende V810/V823/V825-Konfiguration und portable Einstellungs-Sicherung bleiben zustaendig.

## Automatische Pruefungen (lokal)

| Pruefung | Ergebnis |
|---|---|
| `npm run test:v847` | PASS, 125 Testgruppen |
| Historische Tests `test:v800` bis `test:v846` | PASS, 47 von 47 Suiten |
| Alle durchgefuehrten Tests `test:v800` bis `test:v847` | PASS, 48 von 48 Suiten |
| `npm run test:v847:types` | PASS (isoliertes TS-Profil) |
| `npm run check:syntax` | PASS, 1224 TS/TSX Dateien |
| `npm run check:architecture` | PASS, 938 Quellcodeverweise |
| `npm run test:module-case` | PASS, 2077 Modulpfade |
| `npm run doctor:v831` | BLOCKED - fehlende lokale Projektabhaengigkeiten; Versions-/Lockfile-/Dateinamenpruefungen PASSED |
| `tsc -p tsconfig.json --noEmit --incremental false` | FAIL - u.a. next/server, React, R3F und Three-Typen fehlen (kein node_modules vorhanden) |
| Next.js-Produktionsbuild | NICHT ausgefuehrt, da next und node_modules fehlen |
| Reale GLB-/WebGL-/Browser-Pruefung | NICHT ausgefuehrt |

## Freigabe

**Nicht produktiv freigegeben.** Bitte in einer Umgebung mit Projektabhaengigkeiten `npm ci`,
`npm run test:v847`, `npm run test:v847:types`, `npm run typecheck` und anschliessend
`npm run build` durchfuehren. Danach reale 3D-Buehnensichtung mit 1-4 Avataren,
Pop/Hardtekk, manuellen Cues, pausierter Wiedergabe und Reduced Motion durchfuehren.
Die isolierte TS-Pruefung ersetzt nicht das vollstaendige Projekt-Typecheck.
