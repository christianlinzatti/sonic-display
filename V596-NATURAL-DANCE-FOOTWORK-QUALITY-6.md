# Sonic Display V596 – Natural Dance & Footwork Quality 6.0

## Ziel

Bei schnell getaktetem Deutschrap sowie Hardstyle/Hardtekk sollen vorhandene Schritte beim Ablösen eines Standfußes sanfter wirken. V596 arbeitet bewusst **nicht** am importierten GLB-Material selbst, sondern an bereits existierenden, additiven automatischen Bewegungswerten.

## Umsetzung

- `naturalFootworkQualityV596.ts`: zwei getrennte endliche Zustandsmaschinen für automatische V486/V524/V587-Gruppenbewegungen und bestehende GLB-Rig-Addition.
- **Kontakt ist eine Beobachtung, keine Erfindung:** `support.tracked` aus der bestehenden IK-Pipeline. Links und rechts besitzen unabhängige Release-Hüllen, bekannte Pflanzen stoppen Lift unmittelbar. Unbekannter Kontakt hemmt keine Bewegung.
- **Genretempo:** Deutschrap wird leicht länger geglättet (145 ms), Hardstyle/Hardtekk kürzer (70 ms), sonst 115 ms. Es werden keinerlei Beats geschätzt.
- **Geometrieschutz:** Kein Anfassen von `rootSpeed`, `offsetX`, `offsetZ`, Gelenken, GLB-Mixern oder Foot-IK-Ankern; vorhandene positive und negative Impulse werden allenfalls reduziert, nie verstärkt.
- **GLB:** V545 → V587 → V596 → Rig-Controller → *einzige* V492-Fuß-IK; beim Stand wird Rest-Schrittimpuls direkt vermindert und beim Lösen begrenzt freigegeben.
- **Kontrollfälle:** Manuelle Choreografie, Low-Tier, Pause, reduced motion, kein Track, keine echte Fußbeobachtung, Time-Seek, Trackwechsel und Modellwechsel setzen den Zustand zurück bzw. deaktivieren die V596-Anpassung.
- Kein neuer useFrame-Callback, keine zusätzliche AnimationAction und kein neues GPU-Objekt. Die Erweiterung setzt auf das bestehende Framebudget.

## Lokale Tests

```bash
npm run test:v596
npm run test:v596:types
npm run test:smoke:v596
npm run verify:v596
```

Zum **echten Nachweis** von weniger sichtbarem Fußrutschen danach einen V592-Live-Lauf vor und nach dem Update mit *denselben eigenen GLBs* durchführen, mit V594 vergleichen und mit V595 die visuelle Regression beurteilen. Eine solche Abnahme ist hier mangels Browser-/GLB-Testressourcen nicht erfolgt.
