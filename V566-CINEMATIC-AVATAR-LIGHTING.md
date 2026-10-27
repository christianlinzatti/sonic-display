# V566 · Cinematic Avatar Lighting 2.0

## Implementierung
- `cinematicAvatarLightingV566.ts`: reine, testbare Regel für Kamera-Abstand, Blickausrichtung und belegten Avatar-Fokus. Kameradaten stammen aus der tatsächlichen Three.js-Kamera (nicht aus festen Shot-Namen).
- `DynamicStage.tsx`: nutzt ausschließlich vorhandene Key-/Fill-Pointlights. Mit gecachten `Vector3`-Objekten wird ein sichtbarer `v377-vocal-stage-slot-*` ermittelt und seine Position relativ zur Kamera geprüft. Oberkörper-/Gesichtslicht wird nur geringfügig nachgeführt; kein neues Licht, keine Shadows, Shader, Timer oder Geometry.
- Geschützte Modi: Pause, reduzierte Bewegung, Low-Tier, gespeicherte Licht-Cues, Blackouts, unbestätigte Sängerzuordnung und unsichtbare/fehlende GLB-Roots.
- Settings: Gesichtslicht-Toggle + Akzentstärke; Vorher/Nachher-Umschalter in der großen 3D-Bühnenvorschau.

## Einschränkungen
- Ein sichtbarer Root und eine ausgerichtete Kamera sind **keine Augen-, Gesichts- oder Lippen-Erkennung**. Der Kopfmittelpunkt wird nur über einen konservativen vertikalen Offset angenähert; Modelle mit ungewöhnlichen Größen können abweichen.
- Für Duette ist die Bühnenlicht-Fokusrolle nur gültig, wenn bereits eine track-gebundene, verifizierte V528-Performer-Zuordnung vorliegt; Demo-Szenen werden ausschließlich im Bühnenstudio verwendet.
- Die Lichtkorrektur ersetzt keine echte Messung von Gesichtsschatten oder verdeckten Lippen. Für diese Aussagen braucht es WebGL-Sichttests mit Original-GLBs und aktuellen Kameraschnitten.
- Weiterhin ausstehend: vollständiger Next.js-Produktionsbuild und Raspberry-Pi-Gerätetest (im aktuellen Paket ohne installierte `node_modules`).
