'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(f,deps={}){
 const out=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(out.diagnostics?.length??0,0);const m={exports:{}};
 new Function('module','exports','require',out.outputText)(m,m.exports,name=>deps[name]??{});return m.exports;
}
const {MOUTH_CALIBRATION_PRESETS_V562:presets,normalizeMouthCalibrationV562:normalize,calibrateMouthPoseV562:calibrate,mouthCalibrationCoverageV562:coverage}=load('components/visualizer/advancedFacialCalibrationV562.ts');
let n=0;const t=(name,test)=>{test();console.log('PASS V562',name);n++};
const base={jaw:.87,wide:.77,round:.72,lipsClosed:0,brow:.49,blink:.22};
t('default no-op keeps reference and original animation',()=>{assert.equal(calibrate(base),base);assert.equal(calibrate(base,{enabled:false}),base)});
t('no source input mutation',()=>{const input=Object.freeze({...base});calibrate(input,presets.deutschrap);assert.deepEqual(input,base)});
t('Deutschrap jaw ceiling limited',()=>{assert.equal(calibrate({...base,jaw:1},presets.deutschrap).jaw,.78)});
t('vowel competition reduces weaker form only',()=>{const x=calibrate(base,presets.deutschrap);assert.equal(x.wide,.77);assert.ok(x.round<.72)});
t('round vowel dominates when stronger',()=>{const x=calibrate({...base,wide:.3,round:.9},presets.deutschrap);assert.equal(x.round,.9);assert.ok(x.wide<.3)});
t('no conflict for isolated wide vowel',()=>{assert.equal(calibrate({...base,round:0},presets.singing).wide,.77)});
t('lip closure suppresses jaw opening',()=>{const x=calibrate({...base,jaw:.8,lipsClosed:1},presets.deutschrap);assert.ok(x.jaw<.2)});
t('lip closure keeps mouth-closed morph untouched',()=>{assert.equal(calibrate({...base,lipsClosed:1},presets.deutschrap).lipsClosed,1)});
t('bilabial closure dims wide and round without affecting blink or brow',()=>{const x=calibrate({...base,lipsClosed:1},presets.singing);assert.ok(x.wide<base.wide);assert.equal(x.blink,base.blink);assert.equal(x.brow,base.brow)});
t('quiet face remains quiet',()=>{const x=calibrate({jaw:0,wide:0,round:0,lipsClosed:0},presets.deutschrap);assert.equal(x.jaw,0);assert.equal(x.wide,0)});
t('valid settings clamped and invalid non-finite fallback',()=>{const x=normalize({enabled:true,jawCeiling:-10,lipSeal:Infinity,vowelSeparation:2});assert.deepEqual(x,{enabled:true,jawCeiling:.45,lipSeal:.85,vowelSeparation:1})});
t('disabled/undefined values do not accidentally opt in',()=>{assert.equal(normalize({jawCeiling:.5}).enabled,false)});
t('all presets are opt-in and bounded',()=>{for(const k of Object.keys(presets)){const p=normalize(presets[k]);assert.equal(p.enabled,true);assert.ok(p.jawCeiling>=.45);assert.ok(p.lipSeal>=.5)}});
t('unknown mouth-rig warns instead of pretending to calibrate',()=>{const c=coverage([],false);assert.equal(c.count,0);assert.ok(c.warning)});
t('jaw bone counts as jaw but not disabled jaw',()=>{assert.equal(coverage([],true).count,1);assert.equal(coverage([],true,true).count,0)});
t('all mapped channels have full coverage',()=>{assert.equal(coverage(['jaw','wide','round','lipsClosed'],false).complete,true)});
t('partial mapping provides incomplete but usable calibration',()=>{assert.equal(coverage(['jaw','wide'],false).count,2)});
t('duplicate target channel names never overcount',()=>{assert.equal(coverage(['jaw','jaw','wide'],false).count,2)});
t('existing avatar facial profile carries opt-in field',()=>{assert.match(read('components/visualizer/facialRigStudioV370.ts'),/mouthCalibrationV562\?:MouthCalibrationV562/)});
t('live and preview reuse same calibrated existing VocalRig',()=>{const rig=read('components/visualizer/VocalRigV368.tsx');const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');assert.match(rig,/calibrateMouthPoseV562\(current\.current,profileV370\.mouthCalibrationV562\)/);assert.match(glb,/<VocalRigV368/)});
t('individual target audition bypasses calibration',()=>{assert.match(read('components/visualizer/VocalRigV368.tsx'),/!previewTargetV383 && profileV370\?\.mouthCalibrationV562\?\.enabled/)});
t('manual mapping studio offers presets and explicit activation',()=>{const studio=read('components/visualizer/FacialAnimationStudioV370.tsx');assert.match(studio,/MOUTH_CALIBRATION_PRESETS_V562\.deutschrap/);assert.match(studio,/patchMouthV562\(\{enabled:e\.target\.checked\}\)/)});
t('stage preview switch affects temporary copy only',()=>{const s=read('components/visualizer/StagePreviewModal.tsx');assert.match(s,/compareCalibrationV562/);assert.match(s,/mouthCalibrationV562:\{\.\.\.mouthProfileV562,enabled:mouthProfileV562\.enabled&&compareCalibrationV562\}/)});
t('avatar profile export includes calibration and import validates it',()=>{const s=read('components/visualizer/advancedFacialRigV383.ts');assert.match(s,/mouthCalibrationV562:normalizeMouthCalibrationV562/);assert.match(s,/Ungültige V562-Mundkalibrierung/)});
const legacyRig=load('components/visualizer/facialRigStudioV370.ts');
const advancedRig=load('components/visualizer/advancedFacialRigV383.ts',{'./facialRigStudioV370':legacyRig,'./advancedFacialCalibrationV562':load('components/visualizer/advancedFacialCalibrationV562.ts')});
t('portable V383 profile exports/imports V562 calibration losslessly',()=>{
 const initial={mapping:{jaw:'none'},gains:{jaw:1.35},mouthCalibrationV562:presets.deutschrap};
 const json=advancedRig.exportFacialProfileV383(initial);
 const loaded=advancedRig.importFacialProfileV383(json,[]);
 assert.deepEqual(loaded.profile,initial);
});
t('legacy V383 exports remain readable without an automatic V562 activation',()=>{
 const json=JSON.stringify({format:'sonic-facial-rig-v383',version:1,mapping:{jaw:'none'},gains:{jaw:.9}});
 assert.equal(advancedRig.importFacialProfileV383(json,[]).profile.mouthCalibrationV562,undefined);
});
t('malformed V562 JSON is rejected or normalized safely',()=>{
 const raw={format:'sonic-facial-rig-v383',version:1,mouthCalibrationV562:{...presets.singing,jawCeiling:999}};
 assert.equal(advancedRig.importFacialProfileV383(JSON.stringify(raw),[]).profile.mouthCalibrationV562.jawCeiling,1);
 raw.mouthCalibrationV562.enabled='invalid';
 assert.throws(()=>advancedRig.importFacialProfileV383(JSON.stringify(raw),[]),/boolean/);
});
t('V383 safe profile retains existing V562 opt-in even when gains are repaired',()=>{
 const result=advancedRig.suggestSafeFacialProfileV383([],{mouthCalibrationV562:presets.singing,gains:{jaw:5}});
 assert.deepEqual(result.mouthCalibrationV562,presets.singing);
 assert.equal(result.gains.jaw,2);
});
t('preset controls are not dependent on new external services, lights or timers',()=>{const s=read('components/visualizer/advancedFacialCalibrationV562.ts');assert.doesNotMatch(s,/fetch\(|setInterval\(|setTimeout\(|spotLight|directionalLight/)});
console.log(`PASS: ${n} V562 calibration regression tests`);
