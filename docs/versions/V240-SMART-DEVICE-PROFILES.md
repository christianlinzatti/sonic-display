# Sonic Display V240 – Smart Device Profiles & Persistent Calibration

V240 builds on V239. The calibration wizard can save its recommended graphic tier, scene effects, measured FPS and sample count to browser localStorage using a device fingerprint based on platform, core count, optional memory, screen size and pixel density.

- Calibrate the running avatar scene and choose **Kalibrierung für dieses Gerät speichern**.
- On a subsequent app start, the profile appears in the wizard; click **Gespeichertes Profil anwenden** to restore it. User settings are **never overwritten automatically** at page load.
- **Geräteprofil löschen** removes the stored record; **Zurücksetzen** reverts applied settings in the current session.
- Profiles do not sync between browsers or devices, and do not provide reliable hardware identification. Changing screen/zoom or browser fingerprint can invalidate the match.
- Private browsing or disabled storage may prevent saving. Only the latest calibration profile is stored locally.
- The existing performance Auto-Pilot and renderer adaptations remain independent; users can choose one to avoid conflicting controls.
- Tests: `npm run verify:offline`, then `npm install && npm run verify` when dependencies available.
