# Sonic Display V881 – Live FX Deck & Show-Moment Studio

**Vollversion auf Basis der bereitgestellten V880 Hotfix 3**, inkl. Quellcode,
Assets, bestehender Features und zusätzlicher V881-Funktionen. Kein früheres Patch-ZIP erforderlich.

## Neu

1. **Live FX Deck:** Über den Schalter **✦ LIVE FX** im oberen rechten Bereich
   öffnen und mit den drei echten Bedienelementen *Bass-Welle*, *Arena Sweep*
   und *Konfetti* temporäre 2D-Bühneneffekte starten. Mehrfachauslösung ist
   möglich. Effekte sind auf maximal 6 Sekunden Showzeit begrenzt.
2. **Auto-Looks aus der vorhandenen Konzert-Timeline:** V881 nutzt ausschließlich
   als `verified-v604` gekennzeichnete Songabschnitte aus der V763-Timeline.
   Fehlt eine gültige Timeline, wird **kein** Songabschnitt erfunden und
   die Automatik bleibt aus; manuelle Live-Tasten bleiben verfügbar.
3. **Vier Genre-Welten:** Deutschrap (Cinematic/Spotlight), Hardtekk
   (Neon-Horizon), Deutschrock (Arena-Strahlen) und Pop (Aurora). Das Genre
   kann automatisch ausgewertet oder als Look-Profil fest eingestellt werden.
4. **Show-Mini-Timeline:** Dezente, sparsame Song-Fortschrittsanzeige mit
   aktueller verifizierter Szene und Marker; bei Bedarf deaktivierbar.
5. **Live-FX-Studio:** Intensität 0–100 %, Master-Schalter,
   Auto-Regie-Schalter und Genre-Preset. Einstellungen werden im lokalen
   Browser-Speicher gesichert (Speicherfehler werden angezeigt).
6. **Szenenplan als JSON:** Exportiert ausschließlich echte Zeitfenster der
   V763-Timeline sowie die vorgeschlagenen visuellen Looks. Kein Export,
   wenn die Szenenquellen nicht verifiziert sind. Keine Spotify-Tokens.

### Rücksicht auf die vorhandene Show

- Keine Modifikation bestehender Kamera-, Licht- und Tänzerregie.
- Keine Stroboskop-Blitze, neuen WebGL-Canvas-/Material-/Textur-Objekte.
- Effekte pausieren mit Spotify, reagieren auf Songwechsel und Seek.
- `prefers-reduced-motion` des Betriebssystems und die App-Einstellung
  „Bewegung reduzieren“ deaktivieren die neuen animierten Effekte.
- Effekte sind rein visuelle CSS-Overlays; der Bass-Schockring ist **manuell**,
  keine Behauptung über gemessene Bass-Schläge/Beat-Erkennung.
- Das Mini-HUD zeigt maximal eine Szenenmarkierung pro Frame statt
  Hunderte neuer DOM-Elemente.

## Installation (Windows PowerShell)

```powershell
# In einem neuen Ordner entpacken, dann im Projektordner mit package.json:
npm ci
npm run verify:v881:focused
npm run typecheck
npm run build
npm run dev
```

Für eine automatische Prüfung aller wichtigen Schritte inklusive Node-PATH-Absicherung
unter Windows: `powershell -ExecutionPolicy Bypass -File scripts/verify-v881-windows.ps1`.

Auf der Hauptseite einen Spotify-Track abspielen und rechts oben
**✦ LIVE FX** öffnen. Für automatisierte Szenen muss die bestehende
V604/V761/V763-Regie valide Songabschnitte liefern; sie ist keine
unabhängige Musikstrukturerkennung.

## Überprüfung und Freigabestatus

- V881: **40/40** Regressionen erfolgreich.
- V881 Core: isolierter strikter TypeScript-Check erfolgreich.
- V881 UI: isolierter strikter TSX-Check mit **nur in Tests** eingebundenen
  JSX-/React-Deklarationen erfolgreich; Testtypen beeinflussen nicht die App.
- V880: **44/44** Regressionen erfolgreich.
- Die bisherige V880-Fokus-Checksuite einschließlich V810, V815, V825, V868,
  V873–V880, Module-Case und Syntax lief ebenfalls erfolgreich.
- **Nicht bestanden / nicht durchführbar in dieser Umgebung:** `npm ci --offline`
  (`ENOTCACHED`, fehlendes `zustand@5.0.16`), vollständiger TypeScript-Check
  (fehlende Bibliothekstypen) und `next build` (Next.js-Paket nicht vorhanden).
  **Keine Produktionsbuild-Freigabe**; die beiden Gates sind auf einem Rechner
  mit vollständig installierten Dependencies oder in CI nachzuholen.
