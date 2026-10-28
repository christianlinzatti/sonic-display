const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const lib=read('components/visualizer/cameraKeyframesV295.ts');
const ui=read('components/visualizer/CameraPresetStudioV290.tsx');
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(295);
for(const v of ['normalizeCameraKeyframes','readCameraKeyframes','writeCameraKeyframes','cameraPoseAtTime','smooth(', 'Math.min(3600']) assert.ok(lib.includes(v),v);
for(const v of ['Camera Keyframe Editor','Keyframe hier setzen','Pose ersetzen','Kamerafahrt vorschauen','cameraPoseAtTime(keyframes,motionTime)']) assert.ok(ui.includes(v),v);
console.log('V295 camera keyframe regression OK');
