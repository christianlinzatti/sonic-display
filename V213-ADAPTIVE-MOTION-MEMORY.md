# Sonic Display V213 – Adaptive Motion Memory & Performance Manager

Basis: V212. Opt-in bei **Predictive Dance Transitions → Intelligent Motion Prefetch → Adaptive Motion Memory**.

## Funktion
- Hardwareprofile **Automatisch**, **Desktop**, **Raspberry Pi**. Automatik verwendet (falls verfügbar) `navigator.deviceMemory`, `navigator.hardwareConcurrency` und die Reduced-Motion-Präferenz; bei fehlenden Hardwareinformationen moderate Cache-Grenze.
- Gekapselte, pure Auswahlfunktion bestimmt Kapazität zwischen Minimum und Maximum. Der aktuelle Clip und alle unmittelbar vorgeladenen Clips sind geschützt, selbst wenn sie zusammen die Kapazität überschreiten.
- Häufig genutzte Clips werden bevorzugt im Arbeitsspeicher behalten; bei gleicher Häufigkeit entscheidet die letzte Nutzung. Nutzungszähler sind nur flüchtig pro Avatar-Instanz und werden beim Rig-/Style-Wechsel geleert.
- Keine neue oder parallele Animation Engine und kein Eingriff in Retargeting, Crossfade oder Beat-Logik.
- Bei ausgeschalteter V213-Funktion bleibt V212 unverändert. V213 funktioniert nur bei aktivem V212-Prefetch mit eingeschalteter Timeline und V211.

## Grenzen
Clipanzahl ist nur ein **Proxy** für RAM/VRAM-Verbrauch. Die tatsächliche Speichernutzung der GLTFLoader-Assets und drei.js-Ressourcen wird nicht gemessen. Einstellungen werden lokal gespeichert, Nutzungsstatistiken nicht. Vor einer Aussage zur Performance auf einem Raspberry Pi sind Browsermessungen und ein echter Build erforderlich.
