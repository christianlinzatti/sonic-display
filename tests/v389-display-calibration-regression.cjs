const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
function load(file){const p=path.resolve(file),source=fs.readFileSync(p,'utf8');const output=ts.transpileModule(source,{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});assert.equal(output.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0);const module=new Module(p);module.filename=p;module.paths=Module._nodeModulePaths(path.dirname(p));module._compile(output.outputText,p);return module.exports;}
const {CALIBRATION_WARMUP_V389,CALIBRATION_MEASURED_V389,CALIBRATION_KEY_V389,validReadingV389,summarizeCalibrationV389,deviceSignatureV389,comparableResultsV389,recommendDisplayV389,parseCalibrationResultsV389,DISPLAY_PROFILES_V389}=load('components/visualizer/displayCalibrationPolicyV389.ts');
assert.equal(CALIBRATION_WARMUP_V389,2);assert.equal(CALIBRATION_MEASURED_V389,10);
assert.equal(DISPLAY_PROFILES_V389.length,4);assert.ok(CALIBRATION_KEY_V389.includes('389'));
assert.equal(deviceSignatureV389(1024,600,1.5),'1024x600@1.5');
assert.equal(deviceSignatureV389(Infinity,0,NaN),'1x1@1');
const base={fps:58,p95FrameMs:19,slowPercent:4,drawCalls:40,triangles:9000,activeAvatars:2,updatedAt:10500};
assert.equal(validReadingV389(base,2,10000,10700),true);
for(const bad of [{...base,updatedAt:9999},{...base,updatedAt:9900},{...base,activeAvatars:1},{...base,triangles:0},{...base,fps:0},{...base,p95FrameMs:NaN},{...base,slowPercent:Infinity}])assert.equal(validReadingV389(bad,2,10000,10700),false,'never accept invalid or mislabelled WebGL samples');
const make=(profile='auto',avatars=2,fps=58,p95=19,slow=4,trackId='track-001',device='1024x600@1.5',at=10500)=>{
 const batch=Array.from({length:10},(_,i)=>({...base,fps:fps-(i%2)*2,p95FrameMs:p95+(i%2)*2,slowPercent:slow,activeAvatars:avatars,updatedAt:at+i*1000}));
 return summarizeCalibrationV389(batch,{id:`${at}-${profile}`,at,profile,device,trackId,avatars});
};
assert.equal(summarizeCalibrationV389([base],{id:'bad',at:1,profile:'auto',device:'1x1@1',trackId:'',avatars:2}),null);
assert.equal(summarizeCalibrationV389([...Array(10).fill(base),{...base,activeAvatars:1}].slice(1),{id:'mixed',at:1,profile:'auto',device:'x',trackId:'',avatars:2}),null);
const a=make('auto'),s=make('sharp',2,55,24,8),eco=make('eco',2,60,16,2),bad=make('off',2,22,49,40);
assert.ok(a&&s&&eco&&bad);
const group=comparableResultsV389([a,s,eco,bad,make('sharp',4),make('sharp',2,57,20,3,'other')],a.device,2,a.trackId);
assert.equal(group.length,4,'cast/device/track must match');
assert.equal(recommendDisplayV389(group).profile,'sharp','sharpest profile that clears smoothness targets');
assert.equal(recommendDisplayV389([bad]).profile,'off','single valid profile gives limited fallback');
assert.equal(recommendDisplayV389([bad]).confidence,'limited');
const lower=make('auto',2,36,45,22),lowerEco=make('eco',2,49,32,18);
assert.equal(recommendDisplayV389([lower,lowerEco]).profile,'eco','measured smoothness wins with no stable options');
assert.equal(recommendDisplayV389([]),null);
assert.equal(parseCalibrationResultsV389({}).length,0);
assert.equal(parseCalibrationResultsV389([a,s,{...a,id:'invalid',fps:NaN},{...a,profile:'untrusted'},{...a,count:2}]).length,2);
assert.equal(parseCalibrationResultsV389(Array(95).fill(a)).length,80,'bounded browser storage');
// UI integration checks: no artificial avatar / WebGL renderer instantiation, restore on abort/close/unmount,
// tests use actual render metrics and avatar profiler only, no audio timing modification.
const checks={
 'components/DisplayCalibrationStudioV389.tsx':['getRenderMetricsSnapshot','getAvatarFrameStats','snapshotReadingV389','validReadingV389','CALIBRATION_WARMUP_V389','CALIBRATION_MEASURED_V389','setDisplayProfileV388(s.previous)','setDisplayProfileV388(active.current.previous)','comparableResultsV389','recommendDisplayV389','localStorage','JSON','aria-modal="false"','active.current','document.hidden','profileRef.current','trackRef.current'],
 'components/TouchKioskControls.tsx':['DisplayCalibrationStudioV389','V389 · Kalibrieren','calibrationOpenV389','trackId'],
 'components/SonicDisplay.tsx':['trackId={track?.id??""}'],
 'app/globals.css':['.v389-calibration','max-height','touch-action:pan-y','prefers-reduced-motion'],
 'package.json':['test:v389','v389-display-calibration-regression'],
 'V389-SMART-DISPLAY-CALIBRATION.md':['echte','2 Aufwärmwerte','10 aktuelle'],
};
for(const [file,tokens] of Object.entries(checks))for(const token of tokens)assert.ok(fs.readFileSync(file,'utf8').includes(token),`${file}: missing ${token}`);
const ui=fs.readFileSync('components/DisplayCalibrationStudioV389.tsx','utf8');
assert.ok(!ui.includes('<Canvas')&&!ui.includes('requestFullscreen')&&!ui.includes('new WebGLRenderer'));
assert(Number(JSON.parse(fs.readFileSync('package.json','utf8')).version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=389);
console.log('PASS V389 real scene telemetry, profile restoration, cast validation, scoped recommendations, persistence, UX');
