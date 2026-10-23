# Sonic Display V480 – Concert Performance Diagnostics

**Basis:** V479 – Raspberry Pi Concert Performance. **Ziel:** sichtbare, nachvollziehbare Messwerte zu einer laufenden Konzertshow und deren automatischer Lastreduktion, ohne mehr Renderarbeit zu erzeugen.

## Bedienung

Unter **Einstellungen → Diagnose → V480 – Konzert-Performance-Diagnose** erscheinen bei laufender 3D-Bühne die vorhandenen, etwa einsekündigen Browser-Messfenster:

- Durchschnittliche Bildrate der letzten 30 gültigen Fenster und aktuell sichtbare Avatar-Anzahl.
- Der **höchste P95-Framezeitwert** dieser Fenster, mittlerer Anteil langsamer Frames und aktueller Draw-Call-Wert. Der höchste Fenster-P95 ist **nicht** der P95 über alle Einzelbilder.
- Aktuelle Browser-Renderqualitätsstufe und opt-in-Raspberry-Pi-Profil/Effektbudget.
- Zwei kleine Verlaufskurven (FPS und Fenster-P95) für bis zu 60 Messfenster, plus die letzten acht protokollierten **tatsächlichen** V479-Effektbudgetwechsel.
- Hinweise zu stabiler, schwankender oder deutlich belasteter Wiedergabe. Das sind **grobe Diagnoseschwellen**, kein Hardware-Leistungsversprechen und keine Ursachenanalyse.
- Einen **lokalen JSON-Export** der Diagnose mit Render-/Pi-Status, maximal 90 Messfenstern und maximal 24 Ereignissen. Ein Button löscht die Sitzungsdaten. Kein Versand, keine dauerhafte Speicherung und **keine** Spotify-Tokens oder Songdetails im Export.

Ist die Bühne inaktiv, zeigt die Oberfläche den veralteten Zustand als solchen an. Pausierte oder versteckte Fenster werden nicht als Lastbeweis erfasst. Die Beobachtung funktioniert auch bei deaktiviertem Pi-Profil (ohne dessen Effekte zu verändern).

## Technische Integration

1. `components/visualizer/adaptivePerformance.tsx` veröffentlicht weiterhin die **einzigen** gemessenen Frame-Fenster. Keine weitere `requestAnimationFrame`-, `setInterval`- oder GPU-Abfrage.
2. `components/visualizer/piConcertRuntimeV479.tsx` speist mit demselben V479-Sample, der bereits vorhandenen Render-Messung (`components/visualizer/renderDiagnostics.ts`) und dem V479-Vorher-/Nachherzustand den Session-Store.
3. `services/monitoring/concertPerformanceDiagnosticsV480.ts` validiert Quellenübereinstimmung, Zeitstempel, Frame-Metriken und Avatar-Anzahl; hält 90 Messfenster und 24 Budgetwechsel im Speicher, berechnet eine deterministische Zusammenfassung.
4. `components/visualizer/concertDiagnosticsRuntimeV480.tsx` veröffentlicht nur neue gültige **Ein-Sekunden**-Messungen über `useSyncExternalStore`; auf der 3D-Bühne selbst wird dadurch kein React-Render gestartet, wenn der Diagnose-Tab geschlossen ist.
5. `components/visualizer/ConcertPerformanceDiagnosticsV480.tsx` ist ausschließlich unter dem bereits dynamisch geladenen `components/visualizer/RenderDiagnosticsPanel.tsx` sichtbar.

**Bestehende Prioritäten bleiben:** Manuelle Grafik-/Shader-/Postprocess-Einstellungen, Lyrics, Lip-Sync, Musikzeiten, Tänze und die V479-Hysterese/Cooldown-Logik werden durch V480 nicht verändert. Keine neuen API-Routen und keine externen Abhängigkeiten.

## Verifikation

```powershell
npm run test:v480
npm run test:v480:types
npm run test:v479
npm run check:architecture
npm run build
```

`tests/v480-concert-performance-diagnostics-regression.cjs` deckt einen deterministischen 30-Minuten-Messlauf, Obergrenzen der Historie, Budgetwechsel, Anomalien, Dubletten, Pause, versteckte Tabs, Quellenmismatch, Pi-Off und die Verdrahtung der Darstellung ab. `tests/tsconfig.v480-core.json` prüft die reine Policy unabhängig von Next.js. Ältere V479-Tests sind versionsoffen, aber weiterhin verhaltensscharf.

**Grenzen:** Browser-Framezeit ist keine GPU-Ausführungszeit; VRAM, Temperatur, echte GPU-Auslastung und reale Raspberry-Pi-FPS werden nicht gemessen. Der vollständige `next build` braucht installierte npm-Abhängigkeiten und einen echten Gerätetest für belastbare Kiosk-Erfahrungen.
