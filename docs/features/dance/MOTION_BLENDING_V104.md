# Sonic Display V104 — Intelligent Motion Blending Studio

Basis: V103 (alle vorhandenen Projektdateien beibehalten).

## Funktionen
- Bestehender Zweitclip-Overlay mit Bone-Masking.
- Energieabhängiges Overlay-Gewicht (optional) mit vier Easing-Kurven.
- Delta-Zeit-basierte Gewichtsglättung (Halbwertszeit 0–1,2 s).
- Optionale BPM-Synchronisation der Overlay-Geschwindigkeit zur eingestellten Clip-Original-BPM; Fallback bei ungültigen BPM.
- Einstellungen unter Settings → Animation Blending; persistiert über bestehende UI Preferences.
- Choreografie-Sequenzen haben wie zuvor Vorrang, bei ausgeschalteter Musik kein Overlay.

## Grenzen
Audioenergie wird aus dem vorhandenen Feature `energyEnvelope` gelesen und ist kein studio-grade Beat-Tracking. Die BPM-Option passt das *Tempo* des zweiten Clips an und synchronisiert nicht dessen absolute Beat-Phase. Es gibt kein neues Keyframe-basiertes Motion-Timeline-Editing.

## Prüfungen
`npm install && npm run typecheck && npm run build` (Node 20.9+). Die Abhängigkeiten müssen für eine tatsächliche Build-Prüfung verfügbar sein.
