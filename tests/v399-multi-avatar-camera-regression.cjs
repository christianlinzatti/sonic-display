'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file){const code=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,require);return module.exports;}
const {demoPositionsV399:demo,sanitizePreviewCastV399:sanitize,previewShotV399:shot,updateStudioFromCastPoseV399:save,
 transitionDurationV399:duration}=load('components/visualizer/multiAvatarCameraV399.ts');
const profile={enabled:true,holdMs:1150,scenes:{verse:{shot:'auto',distance:50,pan:0},hook:{shot:'group',distance:50,pan:0},drop:{shot:'two-shot',distance:50,pan:0}}};
for(let count=1;count<=4;count++){const pts=demo(count);assert.equal(pts.length,count);assert.ok(pts.every(p=>p.length===3&&p.every(Number.isFinite)))}
assert.equal(demo(100).length,4);assert.equal(demo(-5).length,1);
assert.deepEqual(sanitize(2,[[999,400,-999],[NaN,Infinity,3]]),[[4.5,0,-2],[-4.5,0,2]]);
assert.deepEqual(sanitize(4,[[0,0,0]]),demo(4),'malformed cast must fall back to a bounded demo');
const a=shot({scene:'verse',choice:'auto',positions:demo(4),lead:2,profile});
assert.equal(a.shot,'lead');assert.deepEqual(a.actors,[2]);assert.equal(a.anchorX,demo(4)[2][0]);
const b=shot({scene:'hook',choice:'two-shot',positions:demo(4),lead:0,partner:3,profile});
assert.equal(b.shot,'two-shot');assert.deepEqual(b.actors,[0,3]);
const c=shot({scene:'drop',choice:'group',positions:demo(4),profile});
assert.equal(c.shot,'group');assert.deepEqual(c.actors,[0,1,2,3]);assert.ok(c.pose.z>b.pose.z,'group should keep all avatars in view');
const solo=shot({scene:'verse',choice:'two-shot',positions:demo(1),lead:0,partner:0,profile});
assert.equal(solo.shot,'lead','missing duet partners must not be invented');
const duplicate=shot({scene:'verse',choice:'two-shot',positions:demo(2),lead:1,partner:1,profile});
assert.equal(duplicate.shot,'lead','duplicate lead and partner cannot form duet');
const saved=shot({scene:'drop',choice:'group',positions:[[-4,0,-1],[-2,0,0],[2,0,.1],[4,0,1]],profile,fromSavedFormation:true});
assert.equal(saved.source,'saved-formation');assert.ok(saved.pose.z>c.pose.z);
for(const plan of [a,b,c,saved]){
 const next=save(profile,plan.shot==='lead'?'verse':plan.shot==='two-shot'?'drop':'hook',plan,plan.pose);
 const key=plan.shot==='lead'?'verse':plan.shot==='two-shot'?'drop':'hook';
 assert.equal(next.scenes[key].distance,50,'saving unchanged orbit must retain neutral distance');
 assert.equal(next.scenes[key].pan,0);
}
const zoomPose={...a.pose,z:a.pose.z-.64,targetX:a.pose.targetX+.45};
const updated=save(profile,'verse',a,zoomPose);
assert.ok(updated.scenes.verse.distance>50,'zooming inward should tighten the live section');
assert.ok(updated.scenes.verse.pan>0);
const corrupted=save(profile,'verse',a,{...a.pose,z:NaN,targetX:Infinity});
assert.ok(Number.isFinite(corrupted.scenes.verse.distance)&&Number.isFinite(corrupted.scenes.verse.pan));
assert.equal(duration(true,1150),0);assert.equal(duration(false,1150),782);assert.ok(duration(false,10000)<=1100);
const required={
 'components/visualizer/LiveMultiAvatarCameraStudioV399.tsx':['readGroupV326','evaluateGroupV326','MultiAvatarCameraCanvasV399','setInterval','updateStudioFromCastPoseV399','profile.enabled'],
 'components/visualizer/MultiAvatarCameraCanvasV399.tsx':['Canvas','cloneSkinnedScene','OrbitControls','DancerV399','onStart','reducedMotion'],
 'components/SettingsPanel.tsx':['LiveMultiAvatarCameraStudioV399','cameraStudioOpenV399','activeAvatar={currentAvatar}'],
 'app/globals.css':['.v399-multi-avatar-camera-studio'],
 'V399-LIVE-MULTI-AVATAR-CAMERA-STUDIO.md':['V399'],
};
for(const [file,parts] of Object.entries(required))for(const part of parts)assert.ok(read(file).includes(part),`${file}: missing ${part}`);
const pkg=JSON.parse(read('package.json'));require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(399);assert.ok(pkg.scripts['verify:offline'].includes('test:v399'));
console.log('PASS V399 – 1–4 camera cast, saved group anchors, solo/duo/group framing, bounded orbital zoom/pan, reduced motion and UI wiring');
