# V693 – Concert Quality Improvement Studio

## Zweck

Ein **lokaler, vom Nutzer gesteuerter Verbesserungsprozess** für die im V692-Inspektor bereits belegten Auffälligkeiten. Kein neues Bewertungsmodell, keine erfundene Tanzqualität, keine automatischen Preset-Änderungen.

## Bedienung

1. In der laufenden 3D-Bühne **QA** öffnen und unter V641 freiwillig **Neue Song-Aufzeichnung** starten. Den Song abspielen und **Aufzeichnung beenden**.
2. Unter V693 erscheinen bis zu fünf nach Beleglage priorisierte Prüfschritte. Bei jeder Aufgabe gibt es optional eine tatsächlich beobachtete **Song-Zeitmarke** und einen nächsten Prüfschritt. Nur **du** kannst den Bearbeitungsstatus auf **Offen / In Prüfung / Von mir geprüft** ändern; „geprüft“ bedeutet weder „behoben“ noch Freigabe.
3. **Aktuelle Aufnahme als Vorher merken** klicken. Danach mit denselben Avataren/GLB-Modellen **eine neue V641-Songaufzeichnung** starten und beenden.
4. **Aktuelle Aufnahme als Nachher merken** klicken. Der Vergleich zeigt vorher/nachher wiederholte Warnhinweise und (sofern messbar) die Differenzen der Browser-Medianwerte für FPS und P95-Framezeit.
5. Bei Bedarf **Vergleich zurücksetzen**. Der vorhandene V641-JSON-Export bleibt unverändert und exportiert weiterhin nur den aktuellen Bericht.

## Belege und Schutzmaßnahmen

- Priorität **Hoch** ausschließlich bei wiederholter Auffälligkeit aus realen Browser-Performancewerten; geometrische und Regiehinweise sind **gezielt prüfen**, Licht **Sichtprüfung**, fehlende Belege **Messdaten ergänzen**.
- Kein Vergleich bei fehlender/zu kurzer Aufzeichnung (weniger als 30 Proben oder 60 % Abdeckung), stark unterschiedlicher Abdeckung (mehr als 15 Prozentpunkte), anderen Song-IDs/Songdauern, anderer Avatar-Slot-/verifizierter GLB-Zahl oder denselben Aufzeichnungs-IDs.
- Je Bereich ausschließlich `Warnhinweis nicht wiederholt`, `neuer Warnhinweis`, `weiter prüfen` oder `keine vergleichbare Beleglage`. Der Inspektor erkennt keine optische Verbesserung der Tänze, des Lip-Syncs, der Schriftlesbarkeit oder der Beleuchtung.
- Vorher-/Nachher-Snapshots enthalten ausschließlich Metadaten, Kategorien, Prüfschritte, Abdeckung und Medianwerte, **keine Rohstichproben, Lyrics-Texte, Audio- oder Video-Daten**.
- Kein `localStorage`, Netzwerkaufruf, Hintergrundtimer oder neues Renderobjekt. Der UI-Status und beide Snapshots verschwinden beim Schließen/Entladen des QA-Widgets. Keine automatischen Choreografie-/Licht-/Kamera-Änderungen.

## Dateien

- `components/visualizer/concertQualityImprovementV693.ts`: reine Task-/Snapshot-/Vergleichsfunktionen.
- `components/visualizer/ConcertQualityImprovementStudioV693.tsx`: Aufgabenliste und Vergleichssteuerung.
- `components/visualizer/FullConcertQualityAuditPanelV641.tsx`: Einbindung, ausdrückliches Capture/Status.
- `app/globals.css`: minimale Styles innerhalb des bisherigen QA-Panels.
- `tests/v693-concert-quality-improvement-regression.cjs` und `tests/tsconfig.v693-core.json`.

**Offen:** Vollständiger `npm run typecheck`/Next.js-Produktionsbuild und Sichtabnahme mit echten 3D-GLBs auf der Zielhardware; die Aufgabenliste selbst ist keine automatische Qualitätszertifizierung.
