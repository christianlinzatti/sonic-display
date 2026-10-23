const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve('.');
function load(file){const p=path.resolve(root,file),src=fs.readFileSync(p,'utf8');const result=ts.transpileModule(src,{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});assert.equal(result.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0);const m=new Module(p);m.filename=p;m.paths=Module._nodeModulePaths(path.dirname(p));m._compile(result.outputText,p);return m.exports;}
const {resolveDisplayBudgetV388,limitDisplayDprV388}=load('components/visualizer/displayPerformancePolicyV388.ts');
const device={width:1024,height:600,pixelRatio:2,cores:8,memoryGb:8,avatarCount:1,saveData:false};
let b=resolveDisplayBudgetV388('off',true,device);
assert.equal(b.enabled,false);assert.equal(limitDisplayDprV388(1.5,b),1.5);
b=resolveDisplayBudgetV388('eco',false,device);assert.equal(b.enabled,false,'no kiosk => no change');
b=resolveDisplayBudgetV388('auto',true,device);assert.equal(b.enabled,true);assert.equal(b.compact,true);assert.equal(b.dprCap,1.05);assert.equal(limitDisplayDprV388(1.5,b),1.05);
assert.equal(limitDisplayDprV388(.7,b),.7,'never upscale');
const crowded=resolveDisplayBudgetV388('auto',true,{...device,avatarCount:4});assert.equal(crowded.dprCap,.9,'protect dense scene');
const weak=resolveDisplayBudgetV388('auto',true,{...device,cores:2,memoryGb:2});assert.equal(weak.dprCap,.9);
assert.equal(resolveDisplayBudgetV388('auto',true,{...device,saveData:true}).dprCap,.9);
assert.equal(resolveDisplayBudgetV388('eco',true,device).dprCap,.75);
assert.equal(resolveDisplayBudgetV388('eco',true,{...device,pixelRatio:.65}).dprCap,.65);
assert.equal(resolveDisplayBudgetV388('sharp',true,device).dprCap,1.45);
assert.equal(resolveDisplayBudgetV388('sharp',true,{...device,avatarCount:4}).dprCap,1.15);
assert.equal(resolveDisplayBudgetV388('auto',true,{width:1920,height:1200,pixelRatio:2}).compact,false);
assert.equal(resolveDisplayBudgetV388('auto',true,{width:1920,height:1200,pixelRatio:2}).dprCap,1.2);
for(const profile of ['off','auto','eco','sharp'])for(const ratio of [-5,0,1,2,Infinity,NaN]){
 const value=resolveDisplayBudgetV388(profile,true,{...device,pixelRatio:ratio});
 assert.ok(Number.isFinite(value.dprCap)&&value.dprCap>=.5&&value.dprCap<=3,`${profile} ${ratio}`);
 assert.ok(Number.isFinite(value.previewDprCap));
}
const checks={
'components/DisplayPerformanceV388.ts':['useSyncExternalStore','setKioskActiveV388','sonic-display:v388:display-profile','"storage"','"off"'],
'components/TouchKioskControls.tsx':['kiosk-extra-v388','aria-expanded={expandedV388}','aria-label="Display-Profil V388"','setDisplayProfile','setKioskActiveV388','requestFullscreen','kiosk-wake'],
'components/SonicDisplay.tsx':['touch-v388','kiosk.displayProfile','<TouchKioskControls'],
'components/visualizer/adaptivePerformance.tsx':['resolveDisplayBudgetV388','limitDisplayDprV388','displayBudgetV388.dprCap','renderBudget.current.tier','stabilityDprCapV355'],
'components/visualizer/ThreeAvatar.tsx':['AdaptivePerformanceController avatarCount=','effectiveGroupSettingsV442.count'],
'components/visualizer/RealLyricsStagePreviewV380.tsx':['IntersectionObserver','previewVisibleV388','previewDprCap','frameloop={playing&&previewVisibleV388'],
'app/globals.css':['touch-v388','kiosk-extra-v388','orientation:landscape','orientation:portrait','prefers-reduced-motion:reduce'],
'package.json':['test:v388'],
};
for(const [file,tokens] of Object.entries(checks))for(const token of tokens)assert.ok(fs.readFileSync(file,'utf8').includes(token),`${file}: missing ${token}`);
assert(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=388,'V388 regression supported on newer releases');
console.log('PASS V388 opt-in policy, DPR caps, hardware/ensemble safety, touch UI, preview visibility, old pipelines');
