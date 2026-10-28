require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(297);
const rig=read('components/visualizer/StageCameraDirectorV289.tsx'), model=read('components/visualizer/ThreeAvatar.tsx'),panel=read('components/visualizer/CameraPresetStudioV290.tsx'),engine=read('components/visualizer/smartCameraTrackingV297.ts');
for(const feature of ['setFromObject(avatars, true)','sampleDelay.current = .2','frameTrackedAvatar','playing && !reducedMotion','SMART_CAMERA_TRACKING_EVENT'])assert.ok(rig.includes(feature),feature);
assert.ok(model.includes('name={TRACKING_ROOT_NAME}'));assert.ok(panel.includes('Smart Camera Tracking'));assert.ok(engine.includes('readSmartCameraTrackingEnabled'));assert.ok(engine.includes('Math.tan(halfAngle)'));
console.log('V297 Smart Camera Tracking regression OK');
