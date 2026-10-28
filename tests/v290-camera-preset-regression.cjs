const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const store=read("components/visualizer/cameraPresetLibraryV290.ts"),editor=read("components/visualizer/CameraPresetStudioV290.tsx"),cam=read("components/visualizer/StageCameraDirectorV289.tsx"),controls=read("components/visualizer/StageDirectorControlsV287.tsx");
for(const token of ["sanitizeCameraPose","normalizeCameraPresets","resolveCameraPose","readCameraPresets","writeCameraPresets","CAMERA_PRESET_EVENT","assignments","enabled"]) assert.ok(store.includes(token),token);
for(const token of ["CAMERA_SECTIONS","Preset löschen","Kamera hinzufügen","updatePose","Automatische Kamera (V289)"])assert.ok(editor.includes(token),token);
assert.ok(cam.includes("resolveCameraPose(library.current, section, progressMs, intensity, duo)"));assert.ok(controls.includes("<CameraPresetStudioV290 />"));
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(290);console.log("V290 interactive camera preset regression passed");
