const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const settings=read("components/visualizer/stageDirectorV287.ts");const ctrl=read("components/visualizer/StageDirectorControlsV287.tsx");const visual=read("components/visualizer/VisualizerStage.tsx");const fx=read("components/visualizer/CinematicStageTransitionV288.tsx");const css=read("app/globals.css");
for(const token of ["cinematic: true","cameraMotion: true","dropFlash: true","data.cinematic !== false","data.cameraMotion !== false","data.dropFlash !== false"])assert.ok(settings.includes(token),token);
for(const token of ["Filmische Bühnenübergänge","Sanfte Kamerafahrt","Lichtakzent bei Drops"])assert.ok(ctrl.includes(token),token);
for(const token of ["CinematicStageTransitionV288","directorSettings.cinematic","preferences.reducedMotion","stageDirectorRef.current.lastChangeMs > 0"])assert.ok(visual.includes(token),token);
for(const token of ["stageColors","aria-hidden","cinematic-drop-v288","cinematic-camera-v288"])assert.ok(fx.includes(token),token);
for(const token of ["@keyframes cinematic-glint-v288","@media(prefers-reduced-motion:reduce)","cinematic-beam-left-v288"])assert.ok(css.includes(token),token);
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(288);console.log("V288 cinematic stage regression passed");
