require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const code=ts.transpileModule(read('components/visualizer/displayRecoveryPolicyV395.ts'),{fileName:'displayRecoveryPolicyV395.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('module','exports','require',code)(mod,mod.exports,require);
const {initialRecoveryV395:init,advanceRecoveryV395:step,MAX_RECOVERY_ATTEMPTS_V395:MAX,CONTEXT_LOSS_GRACE_MS_V395:GRACE,RECOVERY_RESET_AFTER_MS_V395:RESET}=mod.exports;
assert.equal(MAX,3);const event=(type,now,patch={})=>({type,now,enabled:true,visible:true,...patch});
let state=init();assert.equal(state.phase,'ready');
state=step(state,event('lost',100));assert.equal(state.phase,'lost');assert.equal(state.nextAttemptAt,100+GRACE);
assert.equal(step(state,event('tick',100+GRACE-1)).phase,'lost','browser context must get a restoration grace period');
assert.equal(step(state,event('tick',100+GRACE+1,{visible:false})).phase,'lost','hidden tab must not restart');
state=step(state,event('restored',500));assert.equal(state.phase,'waiting');assert.equal(state.cause,'context-loss');
assert.equal(step(state,event('tick',1000)).phase,'waiting');
state=step(state,event('tick',1251));assert.equal(state.phase,'restarting');assert.equal(state.attempts,1);
state=step(state,event('healthy',5000));assert.equal(state.phase,'ready');assert.equal(state.attempts,1,'short recovery retains retry history');
assert.equal(step(state,event('tick',5000+RESET-1)).attempts,1);
assert.equal(step(state,event('tick',5000+RESET+1)).attempts,0,'long healthy period resets error counter');
let errors=init();for(let i=0;i<MAX;i++){
 errors=step(errors,event('error',i*30000));assert.equal(errors.phase,'waiting');
 assert.equal(step(errors,event('tick',i*30000+100000,{visible:false})).attempts,i,'background pauses escalation');
 errors=step(errors,event('tick',i*30000+15000));assert.equal(errors.phase,'restarting');assert.equal(errors.attempts,i+1);
}
errors=step(errors,event('error',100000));assert.equal(errors.phase,'manual');assert.equal(errors.nextAttemptAt,null);
assert.equal(step(errors,event('tick',999999)).phase,'manual','never loop endlessly');
errors=step(errors,event('manual',100001));assert.equal(errors.phase,'restarting');assert.equal(errors.attempts,0);
assert.equal(step(init(),event('error',100,{enabled:false})).phase,'manual');
assert.equal(step(init(),event('lost',100,{enabled:false})).phase,'manual');
assert.equal(step(step(init(),event('error',100)),event('tick',1000,{enabled:false})).phase,'manual');
assert.equal(step(init(),event('restored',100)).phase,'ready','irrelevant context restoration must not reset stable stage');
assert.equal(step(init(),event('tick',NaN)).phase,'ready','bad clock cannot trigger retry');
for(const [file,needles] of Object.entries({
 'components/visualizer/ThreeAvatar.tsx':['advanceRecoveryV395','WebGLWatch onLost={onLost} onRestored={onRestored} onStable={onStableV395}','event.preventDefault()','document.hidden','graphicsFailure','manualRetryV395','setRetryKey(key=>key+1)'],
 'components/TouchKioskControls.tsx':['V395 · Stabilität','Automatische 3D-Wiederherstellung','useDisplayWakeLockV395'],
 'components/DisplayReliabilityPanelV395.tsx':['getRenderMetricsSnapshot','role="dialog"','events:status.events','URL.createObjectURL'],
 'components/DisplayProductionV395.ts':['useSyncExternalStore','sonic-display:v395:auto-recovery','slice(-18)','setProductionKioskV395'],
 'components/DisplayWakeLockV395.ts':['visibilitychange','wakeLock','release()','sonic-display:v395:keep-screen-on'],
 'app/globals.css':['.v395-production-panel','@media(max-height:650px)']
})) for(const needle of needles) assert.ok(read(file).includes(needle),file+': '+needle);
const pkg=JSON.parse(read('package.json'));assert.ok(Number(pkg.version.match(/v(\d+)$/)?.[1])>=395);assert.ok(pkg.scripts['verify:offline'].includes('test:v395'));
console.log('PASS V395 – bounded WebGL recovery, hidden-tab safety, manual fallback, wake lock, session diagnostics');
