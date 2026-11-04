# Sonic Display V370 — Advanced Facial Animation Studio

**Basis:** vollständiger Quellstand V369, Version `0.1.0-v370`.

## Verwendung

1. Einstellungen → **Avatar & Tanz** → **V370 · Gesichtsanimation-Studio öffnen**.
2. Avatar wählen. Bei einem GLB wird die Szene ausschließlich für die Vorschau geklont (kein Editieren der importierten Quelldatei).
3. In der Vorschau mit A/AH, E/I, O/U, M/B/P, Lächeln, Blinzeln und Neutral einzelne Mundformen testen. Alternativ **Rap-Demo** oder **Gesang-Demo** (simulierte Sprechfolgen, keine echte Phonemanalyse).
4. Nach dem Laden listet der Editor alle Morph-Targets samt automatischer Erkennung auf. Zuordnungen je Gesichtsbereich können manuell auf ein bestimmtes Morph-Target geändert, auf **Automatisch** gesetzt oder deaktiviert werden. Individuelle Intensität von 0–200 %. Mehrere links/rechts benannte Targets werden in Automatik gemeinsam verwendet.
5. Die Änderungen werden über den bestehenden `UiPreferencesContext` lokal pro **Avatar-Bibliotheks-ID** gespeichert und ohne Neustart bei den 3D-Tänzern aktiv. Durch **Profil für diesen Avatar zurücksetzen** wird nur das ausgewählte Profil entfernt.

## Technische Architektur

- `components/visualizer/facialRigStudioV370.ts`: Namensheuristik (ARKit, Oculus/ReadyPlayerMe und einige VRM-Namen), Morph-Suche mit stabiler Mesh-Vorkommensnummer statt Three.js-UUID, definierte Auto-/manuelle Bindings mit expliziter Priorität, begrenzte Kanalmultiplikatoren, Demo-Artikulation.
- `FacialAnimationStudioV370.tsx`: On-demand, lazy-loaded editor mit `Canvas`, `OrbitControls`, isoliert geklonter GLTF-Szene und Rig-Kompatibilitätsdiagnose. Anzuwendende Muster und Intensitäten werden vom gleichen `VocalRigV368` dargestellt, der in der eigentlichen Show verwendet wird.
- `VocalRigV368.tsx`: verwendet nun denselben Scanner und pro-Avatar-Overrides. Animations-Overlay zieht seinen eigenen vorigen Anteil von den Animations-Morphs ab. Ein erkannter Kieferknochen bleibt als Fallback erhalten; `none` deaktiviert diesen für den Kieferkanal explizit.
- `VisualizerStage.tsx` → `registry.tsx` → `ThreeAvatar.tsx`: gibt die gespeicherten Face-Profile über die bereits existierenden VisualizerProps weiter. `avatarModelId` wird für Haupt-, Neben- und Gruppenavatare verwendet, um die richtigen Profile auszuwählen.
- `types/music.ts`, `UiPreferencesContext.tsx`: `avatarFacialProfilesV370?: Record<string, FacialProfileV370>`, mit leerem Default. Die bisherigen Spotify-, Lyrics-, Dance- und Kamera-Module bleiben erhalten.

## Grenzen

- Die automatische Erkennung nutzt **Morph-Namen** und einfache Muster; Modelle ohne Face-Morphs oder Kieferknochen können nicht vollständig lippensynchron animiert werden. Nicht-standardisierte Namen lassen sich manuell auswählen.
- Keine Extraktion echter Phoneme aus Spotify-Audio; die Demosequenzen sind künstlich und der Live-Lip-Sync baut weiterhin auf getakteten Lyrics/Annäherungen aus V367–V369 auf.
- Der prozedurale Avatar hat keine importierten GLB-Morph-Targets, deshalb wird die Vorschau als schematisches Gesicht angezeigt.
- Die lokale Bibliotheks-ID muss beim Import stabil bleiben, damit das gespeicherte Profil wiedererkannt wird. Ein Asset-Update mit anderer Mesh-Reihenfolge kann manuelle Morph-Zuordnungen ungültig machen; Automatik ist der Fallback für unkonfigurierte Kanäle.
- Verfügbare Browser-/GPU-Leistung und ein funktionierendes GLB (inklusive Zugriff/CORS) sind Voraussetzung für die WebGL-Vorschau. Reduced Motion deaktiviert die automatische Demo.

## Prüfungen

- `npm run check:syntax`: **PASS**, 493 TS-/TSX-Dateien.
- `npm run test:v370`: **PASS**, Autodetection, stable IDs, manual override precedence, multiple Morphs, deaktivierbare Kanäle, Gain-Grenzen, Demo und Integrationsstellen.
- `npm run test:v369`, `test:v368`, `test:v367`: **PASS**.
- Zusätzliche Tests für Spotify-Lyrics (V366), Lyrics-Komposition (V350/V351), Kamera (V289/V292), Multi-Avatar (V326), Plugin-Stage (V330), Stability (V355), Spotify-Discovery/Release (V359–V362) und Push (V365): **PASS**.
- `npm run build:preflight`: **BLOCKED**, `node_modules`/Lockfile fehlen im Ausgangsarchiv. **Keine Bestätigung eines vollständigen TypeScript-Checks oder Next.js-Produktionsbuilds.** Lokal `npm install` und `npm run verify` ausführen.
