const fs=require("node:fs"),assert=require("node:assert/strict");
const studio=fs.readFileSync("components/visualizer/CameraPresetStudioV290.tsx","utf8");
const view=fs.readFileSync("components/visualizer/CameraLivePreviewV291.tsx","utf8");
for (const token of ["dynamic(","ssr:false","previewOpen","Perspektive speichern","setDraftPose","sanitizeCameraPose","Änderungen verwerfen"]) assert.ok(studio.includes(token),token);
for (const token of ["<Canvas", "OrbitControls", "enablePan", "onEnd={capture}", "camera.position.set", "camera.updateProjectionMatrix", "onPoseChange", "gridHelper"]) assert.ok(view.includes(token),token);
assert.ok(/^0\.1\.0-v\d+$/.test(require("../package.json").version));
console.log("V291 visual camera editor regression passed");
