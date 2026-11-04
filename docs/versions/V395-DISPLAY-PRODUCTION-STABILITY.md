# V395 – Display Production & Stability Edition

Basis: Sonic Display V394. Eine opt-in (nur Touch-/Kioskmodus) WebGL-Rettung, reale Geräte-Diagnostik und optionaler Screen Wake Lock. Es gibt **keine neue Render-Engine** und keine Änderung an den Audio-, Rap-, Lyrics-, Foot-IK- oder Choreografie-Uhren.

## Bedienung

Touchmodus einschalten → **Mehr · Display → V395 · Stabilität**.

- **Automatische 3D-Wiederherstellung** (beim Touchmodus standardmäßig an): Bei einem WebGL-Kontextverlust wartet V395 zunächst bis zu 12 Sekunden auf die Browser-Wiederherstellung. Wenn diese früher eintrifft, wird die Bühne schonend neu initialisiert. Bei einem Renderfehler erfolgen Wiederholungsversuche mit 2 / 5 / 12 Sekunden Verzögerung. Die maximale Anzahl beträgt drei Versuche pro Fehlerfolge; danach bleibt der 2D-Fallback und der manuelle Knopf **3D erneut versuchen**. Nach zwei Minuten stabiler Bühnenwiedergabe wird der Zähler zurückgesetzt. Ein Tab im Hintergrund darf den Wiederholungszähler nicht erhöhen. Abschalten der Funktion unterbindet automatische Neustarts. Keine Seitenneuladung und keine erzwungene Spotify-Neuanmeldung.
- **Diagnostik:** Zeigt Laufzeitstatus, FPS und P95-Framezeiten aus der bestehenden V253/V254-Telemetrie an. Veraltete Messwerte sind als solche gekennzeichnet. Maximal 18 Ereignisse werden ausschließlich im Sitzungsspeicher vorgehalten. Über einen manuellen Export lässt sich ein JSON-Diagnosebericht für Fehleranalysen herunterladen. Der Bericht enthält keine OAuth-Tokens, Track-ID oder Lyrics und wird nicht automatisch versandt. Die Browserkennung kann technische Gerätedetails enthalten: vor dem Teilen prüfen.
- **Bildschirm wach halten** (standardmäßig **aus**): Optionaler offizieller Screen Wake Lock für lange Displaysitzungen. Benötigt einen unterstützten Browser und normalerweise HTTPS/localhost. Das Betriebssystem darf ablehnen oder die Sperre jederzeit lösen. V395 respektiert das und meldet den Status. Beim Verlassen des Touchmodus oder beim Wechsel in einen Hintergrund-Tab wird die Sperre freigegeben; auf sichtbar gewordenen Tabs kann sie erneut angefordert werden. Kein Video-Loop und keine künstlichen Eingaben.

## Implementierung

- `components/visualizer/displayRecoveryPolicyV395.ts` – reine, deterministische Zustandsmaschine mit Grenzen, Wartezeit und Sichtbarkeitsprüfung.
- `components/visualizer/ThreeAvatar.tsx` – Integration in die vorhandene `Canvas`/`SceneErrorBoundary`/`WebGLWatch`; stabile Darstellung wird erst nach 2,5 Sekunden tatsächlich gerenderter Frames bestätigt.
- `components/DisplayProductionV395.ts` – sehr kleines gemeinsames Zustands- und Ereignisregister (kein Browser-Polling), nur für Anzeige und lokale Einstellung.
- `components/DisplayReliabilityPanelV395.tsx` – Touch-Diagnose, lokal erzeugtes JSON.
- `components/DisplayWakeLockV395.ts` – optionaler Browser Screen Wake Lock, ordentliche Freigabe beim Verstecken/Unmount.
- `components/TouchKioskControls.tsx`, `app/globals.css` – Bedienung und Layout.
- `tests/v395-display-production-regression.cjs` – Grenzen und Verkabelung.

## Schutzmechanismen und bewusste Grenzen

- **Kein Neustart durch einen pausierten Titel, niedrige FPS oder veraltete Telemetrie.** Diese Situationen lösen keine WebGL-Wiederherstellung aus. V355/DPR-Autotuning können separat die Renderlast reduzieren.
- Eine dauerhaft defekte WebGL-/Treiberumgebung wird nicht unbegrenzt neu geladen; V395 ist kein Ersatz für Treiberupdates oder ein Hardware-Watchdog auf Betriebssystemebene.
- Ein Browser kann die Wiederherstellung eines WebGL-Kontexts verzögern oder ganz verhindern. Der sichtbare 2D-Modus bleibt in diesen Fällen erhalten.
- Der Screen Wake Lock garantiert kein dauerhaft eingeschaltetes Display, wenn der Nutzer das Gerät sperrt oder das Betriebssystem ihn widerruft.
- Der komplette Next.js-Produktionsbuild und ein realer 24-Stunden-Soak-Test auf Zielhardware benötigen installierte npm-Abhängigkeiten und ein entsprechendes Testgerät.

## Prüfung auf dem eigenen Computer

```sh
npm install
npm run test:v395
npm run verify
```

Empfohlen: zehn Minuten 3D-Wiedergabe mit einem, zwei und vier Avataren; minimieren und wiederherstellen; auf einem Testgerät einen WebGL-Kontextverlust simulieren (z. B. Browser-DevTools mit `WEBGL_lose_context`), aber nicht in einer laufenden öffentlichen Show; Wake Lock prüfen und den 2D-Fallback sowie den Export durchspielen.
