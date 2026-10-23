# V301 – Live Stage Preview

The Visual Camera Director Dashboard now offers **Echte Live-Bühne** and **Schematische Ansicht**. The live view captures the existing WebGL canvas through `HTMLCanvasElement.captureStream(8)` and attaches the resulting `MediaStream` to a muted inline video. It uses the running avatar, active animation, lighting, stage and actual camera; no second Three.js scene or WebGL context is created.

The stream is created only when the view is opened and the live option is selected, and its tracks are stopped upon closing/unmounting. The connection tracks stage mounting/unmounting. This is a preview only, not a recording or export. Browser canvas-capture compatibility and cross-origin resources may restrict availability; the pre-existing schematic view is offered as fallback. Capturing may still impose some GPU/compositing overhead. Live preview does not modify camera or render state.

Run `npm run verify:offline` and `npm run build` with installed dependencies to validate production build.
