const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const director=read("components/visualizer/stageCameraPoseHelpersV289.ts");const camera=read("components/visualizer/StageCameraDirectorV289.tsx");
const avatar=read("components/visualizer/ThreeAvatar.tsx");const mode=read("components/visualizer/VisualizerStage.tsx");const ctrl=read("components/visualizer/StageDirectorControlsV287.tsx");
for(const section of ["verse","break","build","hook","drop"])assert.ok(director.includes(section+":"),section);
for(const t of ["useFrame","camera.position.x","camera.fov","camera.updateProjectionMatrix()","reducedMotion"])assert.ok(camera.includes(t),t);
assert.ok(avatar.includes("props.cameraDirectorEnabled || (props.lipSync?.vocalCameraModeV401!==\"off\"") && avatar.includes("? <StageCameraDirectorV289"));assert.ok(mode.includes("cameraDirectorSection={directedSection}"));
assert.ok(ctrl.includes("Echte 3D-Kamerafahrten"));assert.ok(read("components/visualizer/stageDirectorV287.ts").includes("realCamera: false"));
assert.match(JSON.parse(read("package.json")).version,/^0\.1\.0-v(?:289|29\d|[3-9]\d\d|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352)$/);console.log("V289 real camera director regression passed");
