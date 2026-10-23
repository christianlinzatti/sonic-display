# Sonic Display V189 – Motion Browser & Animated Preview

Auf Basis von V188. Die Installation von mehreren GLB-Charakteren und GLB-Motions bleibt erhalten.

## Bedienung

1. **Settings → Avatar → Character & Motion Library · V189** öffnen und als Administrator anmelden.
2. Mehrere GLB-Motions hinzufügen, eine Motion auswählen und einen Ziel-Avatar festlegen.
3. In der **animierten 3D-Vorschau** Wiedergabe, Clip-Auswahl, Geschwindigkeit und Timeline bedienen (V93-Player).
4. Auf **Clips und Rig prüfen** klicken. Das Ergebnis zeigt Anzahl der Animation-Clips, Laufzeit, Track-Zahl und eine namensbasierte Retargeting-Einschätzung.
5. Unter **Clip zur Installation** den gewünschten einzelnen Clip auswählen. Die Auswahl hier steuert, welcher Clip installiert wird; die Clip-Auswahl innerhalb des Preview-Players dient ausschließlich zur Vorschau.
6. **Dateien installieren**: Der gewählte Animationsclip wird als eigenständige GLB-Datei mit dem Quellrig exportiert, hochgeladen und dem ausgewählten Avatar zugeordnet. Charaktere können weiterhin gebündelt installiert werden.

## Einschränkungen

- Pro Avatar bleibt nur **ein aktiver Animations-GLB-Pfad** registriert. Der Installer erstellt keine dauerhafte Clip-Sammlung pro Avatar.
- Die Kompatibilitätsprüfung ist eine Heuristik anhand benannter Quaternion-Tracks und Rig-Knochen, keine Animation-Qualitätsgarantie. Fehlende Übereinstimmungen benötigen eine bewusste Bestätigung.
- Das Exportieren einzelner GLB-Clips erfolgt im Browser per GLTFExporter. Sehr große Rig-Modelle können viel Speicher beanspruchen.
- Manche Animation-Rigs benötigen weitere Retargeting-Kalibrierung.
- Bestehende Upload-Limits, Admin-Checks und das Hosting-Verhalten (Vercel Blob oder lokaler Entwicklungsmodus) gelten weiter.
- Ein vollständiger Produktions-Build ist ohne installierte npm-Abhängigkeiten nicht verifizierbar.

## Prüfung

`npm run test:motion-browser` und `npm run check:syntax`, danach `npm run verify:offline`, `npm run typecheck`, `npm run build`.
