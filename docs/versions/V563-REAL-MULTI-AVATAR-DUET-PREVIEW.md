# V563 – Real Multi-Avatar Duet Preview (25.10.2026)

## Ergebnis

Die bisherige V556–V562-Bühnenvorschau kann im **Duett** optional zwei echte GLB-/GLTF-Avatare als **getrennte** `SkeletonUtils.clone()`-Szenen anzeigen. Jede Instanz erhält separat erkannte Morph-Targets/Kiefer-Bones, eigene V370/V562-Gesichtsprofile, getrennte Materialkopien und eigene `VocalRigV368`-Animation. Die bestehenden dynamischen Key-/Fill-Lichter steuern den demonstrierten oder trackgebunden bestätigten Performer-Fokus, ohne weitere Schattenpässe. Die Änderungen betreffen **nur die Vorschau**.

## Bedienung

1. Unter **Einstellungen → Konzert-Bühneneffekte → 3D-Effekte & echtes GLB-Duett ansehen · V563** die große Vorschau öffnen.
2. **Duett (Demo)** wählen, **Echten GLB zeigen** aktivieren. Im Feld **Zweiter GLB** aus der vorhandenen Modellbibliothek ein zweites Modell wählen. Es ist zulässig, dass beide Slots denselben Dateipfad wählen: die GLB-Instanzen und Materialien bleiben dennoch getrennt.
3. **Deutschrap-Demo** oder **Gesangs-Demo** aktivieren, dann zwischen **Sängerwechsel (Demo)** und **Gemeinsamer Hook (Demo)** umschalten. Die Beispiele sind synthetisch, keine automatisch erkannten Original-Sänger.
4. **Aktueller Song** darf im Duett nur gewählt werden, wenn Spotify verbunden ist, synchronisierte Lyrics vorliegen **und** unter V385 die manuellen Sänger-Zuordnungen für exakt diese Track-ID aktiviert/gespeichert wurden. Für nicht zugeordnete Zeilen bleiben **beide Münder still**, statt einen Sänger zu erraten.
5. **GLB-Hautmaterial**, **V562-Kalibrierung**, **Gesichts-Nahaufnahme**, **Porträtlicht** und **Beat-Licht** lassen sich zum Vergleich einstellen. Nur die gespeicherten Studio-Profile (nicht die Vorschau-Schalter) betreffen die Live-Bühne.

## Schutzgrenzen

- Bei fehlendem zweitem GLB, ausgeschaltetem Echt-GLB-Modus oder Low-Tier/Pi werden die alten leichten Demofiguren gezeigt. Keine neue automatische Suche, Uploads oder Netzwerkendpunkte.
- Sängerwechsel wird im Demomodus ausdrücklich simuliert. Bei Song-Modus wird `resolveManualVocalCueV385` auf den bestätigten Track/Zeilen aufgerufen. `planRealDuetPreviewV563` verwirft inkonsistente Rollen, unbekannte Track-IDs, veraltete Wiedergabezeiten, ungültige Slots und nicht bestätigte Hooks.
- Passive Avatare wenden ihren **gesamten Oberkörper** geringfügig zum anderen Avatar. Das ist keine echte Augen-IK, keine Mimik-Vorhersage oder automatische Sängererkennung.
- Bisherige V560-Materialkorrektur, V561-Zeitquelle und V562-Mundkalibrierung bleiben erhalten. Andere Einstellungen/Dateien/GLB-Assets werden nicht überschrieben. Material- und VocalRig-Cleanup bleiben auf die einzelne Modellinstanz beschränkt.
- Für beide echten GLBs werden ausschließlich die vorhandenen Lichtquellen benutzt. Demomodus hat keinen echten Spotify-Audioanalysestrom. `reducedMotion`, manuelle Licht-Timelines, Pausen, Blackouts und Low-Tier-Einschränkungen bleiben bestehen.

## Technischer Pfad

- `components/visualizer/realDuetPreviewV563.ts` – deterministischer Modell-/Rollen-/Szenenplaner, fail-closed bei unbestätigter Stimme.
- `components/visualizer/PreviewGlbPortraitV560.tsx` – neue Slot-Position/ID, getrennte Morph-/Kiefersteuerung, leichtes partnerbezogenes Rumpf-Drehen; Fallback pro Slot.
- `components/visualizer/StagePreviewModal.tsx` – gemeinsamer 3D-Duett-Renderer und Bedienoberfläche; die V385-Manuallogik wird **nur für aktuelle Track-ID** abgefragt.
- `components/visualizer/ConcertDetailPreviewLauncherV556.tsx`, `components/SettingsPanel.tsx` – Modellbibliothek und Vorschauöffnung; keine neue Persistenz.
- `tests/v563-real-glb-duet-preview-regression.cjs`, `tests/tsconfig.v563-core.json` – deterministische Tests und begrenzter TS-Check.

**Offene Abnahme:** vollständiger Next.js-Produktionsbuild mit installierten Abhängigkeiten, visuelle WebGL-Prüfung mit den eigenen beiden GLBs, insbesondere Morph-Kompatibilität und Rollenzuordnung, sowie Raspberry-Pi-/10-Zoll-/Langzeittest. Quell- und Regressionstests allein beweisen keine GPU-Qualität.
